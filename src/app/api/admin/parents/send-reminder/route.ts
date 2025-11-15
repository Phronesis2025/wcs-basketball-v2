import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { getUserRole } from "@/lib/actions";
import { sendEmail } from "@/lib/email";
import { ValidationError, AuthenticationError, AuthorizationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // Check if user is admin
    const userData = await getUserRole(userId);
    if (!userData || userData.role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const { email } = await request.json();

    if (!email) {
      throw new ValidationError("Email is required");
    }

    devLog("Sending payment reminder to:", email);

    // Get parent information
    const { data: parent, error: parentError } = await supabaseAdmin
      .from("parents")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (parentError) {
      throw new DatabaseError("Failed to fetch parent information", parentError);
    }

    // Get all children for this parent
    const { data: children, error: childrenError } = await supabaseAdmin
      .from("players")
      .select("id, name, status")
      .eq("is_deleted", false)
      .or(
        parent?.id
          ? `parent_id.eq.${parent.id},parent_email.eq.${email}`
          : `parent_email.eq.${email}`
      );

    if (childrenError) {
      throw new DatabaseError("Failed to fetch children information", childrenError);
    }

    const childrenList = children || [];
    const approvedChildren = childrenList.filter(
      (c: any) => c.status === "approved" || c.status === "active"
    );

    // Get all payments for these children
    const childIds = childrenList.map((c: any) => c.id);
    let totalPaid = 0;
    let pendingAmount = 0;
    const annualFee = Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360);
    const totalDue = approvedChildren.length * annualFee;

    if (childIds.length > 0) {
      const { data: payments, error: paymentsError } = await supabaseAdmin
        .from("payments")
        .select("amount, status")
        .in("player_id", childIds);

      if (paymentsError) {
        devError("Error fetching payments:", paymentsError);
      } else {
        (payments || []).forEach((p: any) => {
          if (p.status === "paid" || p.status === "succeeded") {
            totalPaid += Number(p.amount) || 0;
          }
        });
        pendingAmount = Math.max(0, totalDue - totalPaid);
      }
    }

    // Format parent name
    const parentName = parent
      ? `${parent.first_name || ""} ${parent.last_name || ""}`.trim() || email
      : email;

    // Format children names
    const childrenNames = approvedChildren
      .map((c: any) => c.name)
      .join(", ");

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(amount);
    };

    // Create email HTML
    const emailSubject = `Payment Reminder - WCS Basketball`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
              WCS Basketball
            </h1>
            <p style="color: #cccccc; margin: 5px 0 0 0; font-size: 14px;">
              Where Champions Start
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">
              Payment Reminder
            </h2>

            <p style="color: #333333; line-height: 1.6; font-size: 16px;">
              Hello ${parentName},
            </p>

            <p style="color: #333333; line-height: 1.6; font-size: 16px;">
              This is a friendly reminder that you have a pending payment balance for your child${approvedChildren.length > 1 ? "ren" : ""}'s participation in WCS Basketball.
            </p>

            ${approvedChildren.length > 0 ? `
            <div style="background-color: #f9f9f9; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #1a1a1a; font-size: 14px;">
                Player${approvedChildren.length > 1 ? "s" : ""}:
              </p>
              <p style="margin: 0; color: #333333; font-size: 14px;">
                ${childrenNames}
              </p>
            </div>
            ` : ""}

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                    <strong>Total Amount Due:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-size: 16px; font-weight: bold;">
                    ${formatCurrency(totalDue)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                    <strong>Amount Paid:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 14px;">
                    ${formatCurrency(totalPaid)}
                  </td>
                </tr>
                <tr style="border-top: 2px solid #333333;">
                  <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                    <strong>Pending Balance:</strong>
                  </td>
                  <td style="padding: 8px 0; text-align: right; color: #dc2626; font-size: 18px; font-weight: bold;">
                    ${formatCurrency(pendingAmount)}
                  </td>
                </tr>
              </table>
            </div>

            <p style="color: #333333; line-height: 1.6; font-size: 16px;">
              To complete your payment, please log in to your parent account and navigate to the payment section. If you have any questions or need assistance, please don't hesitate to contact us.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.wcsbasketball.site/parent/profile" 
                 style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Make Payment
              </a>
            </div>

            <p style="color: #666666; line-height: 1.6; font-size: 14px; margin-top: 30px;">
              Thank you for being part of the WCS Basketball family!
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
            <p style="color: #cccccc; margin: 0; font-size: 12px; line-height: 1.6;">
              <strong>WCS Basketball</strong><br>
              Where Champions Start<br>
              <br>
              For questions about payments, please contact us at info@wcsbasketball.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    try {
      await sendEmail(email, emailSubject, emailHtml);
      devLog("Payment reminder sent successfully to:", email, {
        totalDue,
        totalPaid,
        pendingAmount,
        childrenCount: approvedChildren.length,
      });

      return formatSuccessResponse({
        message: "Payment reminder sent successfully",
        email,
        pendingAmount,
      });
    } catch (error) {
      throw new ApiError("Failed to send payment reminder email. Please try again later.", 500, undefined, error);
    }
  } catch (error) {
    return handleApiError(error, request);
  }
}

