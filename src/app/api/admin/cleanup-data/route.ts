import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

// Type for cleanup result from RPC function
interface CleanupResult {
  deleted_count?: number;
  freed_bytes?: number;
  error?: string;
}

// POST endpoint to run data cleanup functions
// Should be called via cron job or manually by admins
export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    // Verify cron secret for scheduled calls
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      devError("cleanup-data: CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run cleanup functions
    const results: Record<string, CleanupResult> = {};

    // Cleanup old audit logs (12+ months)
    const { data: auditResult, error: auditError } = await supabaseAdmin.rpc(
      "cleanup_old_audit_logs"
    );
    if (auditError) {
      devError("cleanup-data: audit_logs cleanup error", auditError);
      results.audit_logs = { error: auditError.message };
    } else {
      results.audit_logs = auditResult?.[0] || {};
    }

    // Cleanup old login logs (90+ days)
    const { data: loginResult, error: loginError } = await supabaseAdmin.rpc(
      "cleanup_old_login_logs"
    );
    if (loginError) {
      devError("cleanup-data: login_logs cleanup error", loginError);
      results.login_logs = { error: loginError.message };
    } else {
      results.login_logs = loginResult?.[0] || {};
    }

    // Cleanup resolved error logs (3+ months)
    const { data: errorResult, error: errorCleanupError } =
      await supabaseAdmin.rpc("cleanup_resolved_error_logs");
    if (errorCleanupError) {
      devError("cleanup-data: error_logs cleanup error", errorCleanupError);
      results.error_logs = { error: errorCleanupError.message };
    } else {
      results.error_logs = errorResult?.[0] || {};
    }

    // Calculate total freed space
    const totalFreedBytes =
      (results.audit_logs?.freed_bytes || 0) +
      (results.login_logs?.freed_bytes || 0) +
      (results.error_logs?.freed_bytes || 0);

    const totalDeletedRows =
      (results.audit_logs?.deleted_count || 0) +
      (results.login_logs?.deleted_count || 0) +
      (results.error_logs?.deleted_count || 0);

    devLog("cleanup-data: Cleanup completed", {
      total_deleted_rows: totalDeletedRows,
      total_freed_bytes: totalFreedBytes,
    });

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total_deleted_rows: totalDeletedRows,
        total_freed_bytes: totalFreedBytes,
        total_freed_formatted: `${(totalFreedBytes / 1024).toFixed(2)} KB`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    devError("cleanup-data exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

