import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";

// GET endpoint to check database size and alerts
// Can be called manually or via cron job
export async function GET(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    // Optional: Verify cron secret for scheduled calls
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow unauthenticated calls for manual checks, but log
      devLog("database-monitor: Unauthenticated access", {
        hasAuthHeader: !!authHeader,
      });
    }

    // Get database metrics
    const { data: metrics, error: metricsError } = await supabaseAdmin.rpc(
      "get_database_size_metrics"
    );

    if (metricsError) {
      devError("database-monitor: metrics error", metricsError);
      return NextResponse.json(
        { error: "Failed to get metrics" },
        { status: 500 }
      );
    }

    // Check alert status
    const { data: alerts, error: alertsError } = await supabaseAdmin.rpc(
      "check_database_size_alerts"
    );

    if (alertsError) {
      devError("database-monitor: alerts error", alertsError);
    }

    const alert = alerts?.[0];
    const metric = metrics?.[0];

    // Send email alert if critical or warning
    if (
      alert &&
      (alert.alert_level === "CRITICAL" || alert.alert_level === "WARNING")
    ) {
      const adminEmail = process.env.ADMIN_NOTIFICATIONS_TO;
      if (adminEmail) {
        try {
          await sendEmail(
            adminEmail,
            `⚠️ Database Size Alert: ${alert.alert_level}`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2 style="color: ${alert.alert_level === "CRITICAL" ? "#dc2626" : "#f59e0b"};">
                Database Size ${alert.alert_level}
              </h2>
              
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p><strong>Alert Level:</strong> <span style="color: ${alert.alert_level === "CRITICAL" ? "#dc2626" : "#f59e0b"}; font-weight: bold;">${alert.alert_level}</span></p>
                <p><strong>Current Size:</strong> ${alert.current_size_formatted}</p>
                <p><strong>Usage:</strong> ${alert.usage_percentage}% of 500 MB free tier</p>
                <p><strong>Remaining:</strong> ${metric?.remaining_formatted || "N/A"}</p>
              </div>

              <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3>Largest Table</h3>
                <p><strong>Table:</strong> ${metric?.largest_table || "N/A"}</p>
                <p><strong>Size:</strong> ${metric?.largest_table_size_formatted || "N/A"}</p>
                <p><strong>Rows:</strong> ${metric?.largest_table_rows || "N/A"}</p>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <p><strong>Message:</strong></p>
                <p>${alert.message}</p>
              </div>

              ${alert.alert_level === "CRITICAL"
                ? `<div style="background-color: #fee2e2; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #dc2626;">
                    <p style="margin: 0;"><strong>⚠️ Action Required:</strong> Database is approaching the free tier limit. Consider upgrading or implementing aggressive data retention policies immediately.</p>
                  </div>`
                : ""
              }

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                <p>This is an automated alert from WCS v2.0 Database Monitor.</p>
                <p>View metrics in Supabase Dashboard or call /api/admin/database-monitor</p>
              </div>
            </div>
            `
          );

          devLog("database-monitor: Alert email sent", {
            to: adminEmail,
            alert_level: alert.alert_level,
          });
        } catch (emailError) {
          devError("database-monitor: Email send failed", emailError);
          // Continue even if email fails
        }
      }
    }

    devLog("database-monitor: Metrics retrieved", {
      usage_percentage: metric?.used_percentage,
      alert_level: alert?.alert_level,
    });

    return NextResponse.json({
      success: true,
      metrics: metric,
      alert: alert,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    devError("database-monitor exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

