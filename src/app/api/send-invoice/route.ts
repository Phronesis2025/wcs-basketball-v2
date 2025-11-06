import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { generateInvoicePDF } from "@/lib/pdf/invoice";
import { fetchTeamById } from "@/lib/actions";

// Helper functions for email template (matching emailTemplates.ts pattern)
function getEmailBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    const url = process.env.NEXT_PUBLIC_BASE_URL.trim();
    const withProtocol =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    if (!/localhost|127\.0\.0\.1/i.test(withProtocol)) {
      return withProtocol.replace(/\/+$/, "");
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://wcs-basketball-v2.vercel.app";
}

function getLogoUrl(): string {
  const baseUrl = getEmailBaseUrl();
  if (!/localhost|127\.0\.0\.1/i.test(baseUrl)) {
    return `${baseUrl}/apple-touch-icon.png`;
  }
  return `https://wcs-basketball-v2.vercel.app/apple-touch-icon.png`;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "WCS Basketball <onboarding@resend.dev>";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    devLog("send-invoice: Generating invoice for player", { playerId });

    // Fetch player data
    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (playerError || !player) {
      devError("send-invoice: Failed to fetch player", playerError);
      return NextResponse.json(
        { error: "Failed to fetch player data" },
        { status: 404 }
      );
    }

    // Fetch parent data
    let parent = null;
    if (player.parent_id) {
      const { data: parentData, error: parentError } = await supabaseAdmin
        .from("parents")
        .select("*")
        .eq("id", player.parent_id)
        .single();

      if (!parentError && parentData) {
        parent = parentData;
      }
    }

    // Fetch team data
    let teamName = "Not Assigned Yet";
    let teamLogoUrl = null;
    if (player.team_id) {
      try {
        const team = await fetchTeamById(player.team_id);
        if (team?.name) teamName = team.name;
        if (team?.logo_url) teamLogoUrl = team.logo_url;
      } catch (err) {
        devError("send-invoice: Failed to fetch team", err);
      }
    }

    // Fetch payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });

    if (paymentsError) {
      devError("send-invoice: Failed to fetch payments", paymentsError);
    }

    // Filter paid payments
    const isPaid = (status: string | null | undefined) => {
      const s = (status || "").toString().toLowerCase();
      return s === "paid" || s === "succeeded" || s.includes("paid");
    };

    const paidPayments = (payments || []).filter((p) => isPaid(p.status));
    const totalPaid = paidPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const annualFee = Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360);
    const totalAmount = totalPaid > 0 ? totalPaid : annualFee;

    // Format parent address
    const parentAddressParts = [];
    if (parent?.address_line1) parentAddressParts.push(parent.address_line1);
    if (parent?.address_line2) parentAddressParts.push(parent.address_line2);
    if (parent?.city || parent?.state || parent?.zip) {
      parentAddressParts.push([parent?.city, parent?.state, parent?.zip].filter(Boolean).join(", "));
    }
    const parentAddress = parentAddressParts.join(", ") || "";

    // Format invoice data
    const invoiceDate = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    });
    const invoiceNumber = (payments?.[0]?.id || playerId).toString().slice(0, 8);

    const monthlyFee = 30;
    const invoiceItems = paidPayments.length > 0
      ? paidPayments.map((p) => {
          const paymentDate = new Date(p.created_at);
          const paymentType = (p.payment_type || "annual").toLowerCase();
          const isAnnual = paymentType === "annual";
          
          // Format description: "Player Name - Annual/Monthly - Year/Month"
          const year = paymentDate.getFullYear();
          const month = paymentDate.toLocaleDateString("en-US", { month: "long" });
          const typeLabel = isAnnual ? "Annual" : "Monthly";
          const periodLabel = isAnnual ? year.toString() : `${month} ${year}`;
          const description = `${player.name} - ${typeLabel} - ${periodLabel}`;
          
          // Price: Monthly or Annual amount
          const priceAmount = isAnnual ? annualFee : monthlyFee;
          const priceLabel = isAnnual ? `Annual ($${annualFee.toFixed(2)})` : `Monthly ($${monthlyFee.toFixed(2)})`;
          
          // Qty: 12 for annual, 1 for monthly
          const quantity = isAnnual ? 12 : 1;
          
          // Amount: how much was actually paid
          const amountPaid = Number(p.amount) || 0;
          
          return {
            date: paymentDate.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric"
            }),
            description,
            priceLabel,
            priceAmount,
            quantity,
            amountPaid,
          };
        })
      : [];

    const isPaidInFull = totalPaid >= annualFee && totalPaid > 0;
    const remaining = Math.max(annualFee - totalPaid, 0);

    const invoiceData = {
      invoiceDate,
      invoiceNumber,
      parentName: parent ? `${parent.first_name || ""} ${parent.last_name || ""}`.trim() || "N/A" : "N/A",
      parentAddress: parentAddress || "N/A",
      playerName: player.name || "—",
      teamName,
      teamLogoUrl,
      email: player.parent_email || parent?.email || "—",
      items: invoiceItems,
      subtotal: totalPaid,
      totalAmount: annualFee,
      remaining,
      isPaidInFull,
    };

    // Generate PDF
    const pdfBytes = await generateInvoicePDF(invoiceData);

    // Send email via Resend
    if (!RESEND_API_KEY) {
      devError("send-invoice: RESEND_API_KEY missing");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const recipientEmail = player.parent_email || parent?.email;
    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No email address found for parent" },
        { status: 400 }
      );
    }

    // Convert PDF to base64 for email attachment
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
    
    // Log PDF size for debugging
    const pdfSizeKB = (pdfBytes.length / 1024).toFixed(2);
    const base64SizeKB = (pdfBase64.length / 1024).toFixed(2);
    devLog(`send-invoice: PDF generated`, {
      pdfSize: `${pdfSizeKB} KB`,
      base64Size: `${base64SizeKB} KB`,
      playerId,
    });

    const emailSubject = `Invoice ${invoiceNumber} - WCS Basketball`;
    const logoUrl = getLogoUrl();
    const parentGreeting = invoiceData.parentName !== "N/A" 
      ? `Hi ${invoiceData.parentName},` 
      : "Hello,";
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937 !important;
            background-color: #f3f4f6 !important;
            padding: 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff !important;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
            color: #000 !important;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%);
          }
          .logo-container {
            margin-bottom: 20px;
          }
          .logo {
            max-width: 70px;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 15px 0 8px 0;
            letter-spacing: -0.5px;
            color: #000000 !important;
          }
          .header-subtitle {
            font-size: 16px;
            color: #404041 !important;
            font-weight: 500;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
            background: #ffffff !important;
            color: #111827 !important;
          }
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 20px;
          }
          .intro-text {
            font-size: 16px;
            color: #1f2937 !important;
            margin-bottom: 25px;
          }
          .invoice-info-box {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #16a34a;
            padding-top: 15px;
          }
          .info-label {
            color: #6b7280;
            font-weight: 600;
          }
          .info-value {
            font-weight: 600;
            color: #111827;
          }
          .status-badge {
            display: inline-block;
            background: ${invoiceData.isPaidInFull ? '#f0fdf4' : '#fef3c7'};
            color: ${invoiceData.isPaidInFull ? '#065f46' : '#92400e'};
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-left: 10px;
          }
          .closing-text {
            color: #1f2937 !important;
            font-size: 15px;
            margin: 25px 0;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 12px 12px;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
          }
          @media (prefers-color-scheme: dark) {
            body { background-color: #f3f4f6 !important; color: #1f2937 !important; }
            .email-container, .content { background: #ffffff !important; color: #111827 !important; }
          }
          @media only screen and (max-width: 600px) {
            body { padding: 10px; }
            .content { padding: 25px 20px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 26px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <img src="${logoUrl}" alt="WCS Basketball Logo" class="logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto; width: 80px;">
            </div>
            <h1>Invoice</h1>
            <p class="header-subtitle">WCS Basketball</p>
          </div>

          <div class="content">
            <div class="greeting">${parentGreeting}</div>
            
            <p class="intro-text">
              Please find attached your invoice for <strong>${player.name}</strong>. 
              ${invoiceData.isPaidInFull 
                ? 'This invoice has been paid in full.' 
                : `There is a remaining balance of $${invoiceData.remaining.toFixed(2)}.`}
            </p>

            <div class="invoice-info-box">
              <div class="info-row">
                <span class="info-label">Invoice #:</span>
                <span class="info-value">${invoiceNumber}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${invoiceDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Player:</span>
                <span class="info-value">${player.name}</span>
              </div>
              ${invoiceData.teamName !== "Not Assigned Yet" 
                ? `<div class="info-row">
                    <span class="info-label">Team:</span>
                    <span class="info-value">${invoiceData.teamName}</span>
                   </div>`
                : ''}
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                  ${invoiceData.isPaidInFull ? 'Paid in Full' : 'Payment Due'}
                  <span class="status-badge">${invoiceData.isPaidInFull ? '✓ PAID' : 'DUE'}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Subtotal:</span>
                <span class="info-value">$${invoiceData.subtotal.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Amount:</span>
                <span class="info-value">$${invoiceData.totalAmount.toFixed(2)}</span>
              </div>
              ${!invoiceData.isPaidInFull 
                ? `<div class="info-row">
                    <span class="info-label">Remaining Balance:</span>
                    <span class="info-value">$${invoiceData.remaining.toFixed(2)}</span>
                   </div>`
                : ''}
            </div>

            <p class="closing-text">
              ${invoiceData.isPaidInFull 
                ? 'Thank you for your payment! We appreciate your commitment to WCS Basketball.' 
                : 'If you have any questions about this invoice or need to make a payment, please don\'t hesitate to contact us.'}
            </p>
            
            <p class="closing-text">
              Thank you for being part of the WCS Basketball family!
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">
              <strong>WCS Basketball</strong><br>
              Where Champions Start<br>
              <br>
              For questions about this invoice, please contact us at info@wcsbasketball.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Helper function to send email with retry logic
    const sendEmailWithRetry = async (maxRetries = 3, retryDelay = 2000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // Create AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: RESEND_FROM,
              to: [recipientEmail],
              subject: emailSubject,
              html: emailHtml,
              attachments: [
                {
                  filename: `invoice-${invoiceNumber}.pdf`,
                  content: pdfBase64,
                },
              ],
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            devError(`send-invoice: Failed to send email (attempt ${attempt}/${maxRetries})`, errorText);
            
            // If it's a server error (5xx) and we have retries left, retry
            if (emailResponse.status >= 500 && attempt < maxRetries) {
              devLog(`send-invoice: Retrying in ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            
            throw new Error(`Resend API error: ${emailResponse.status} - ${errorText}`);
          }

          return emailResponse;
        } catch (error: any) {
          // Handle timeout or connection errors
          if (error.name === 'AbortError') {
            devError(`send-invoice: Request timeout (attempt ${attempt}/${maxRetries})`);
          } else if (error.code === 'UND_ERR_SOCKET' || error.message?.includes('fetch failed')) {
            devError(`send-invoice: Connection error (attempt ${attempt}/${maxRetries})`, error.message);
          } else {
            devError(`send-invoice: Error (attempt ${attempt}/${maxRetries})`, error);
          }

          // If this is the last attempt, throw the error
          if (attempt === maxRetries) {
            throw error;
          }

          // Wait before retrying
          devLog(`send-invoice: Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Exponential backoff: increase delay for subsequent retries
          retryDelay *= 1.5;
        }
      }
    };

    const emailResponse = await sendEmailWithRetry();

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      devError("send-invoice: Failed to send email after retries", errorText);
      return NextResponse.json(
        { error: "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    const emailData = await emailResponse.json();
    devLog("send-invoice: Invoice sent successfully", {
      playerId,
      email: recipientEmail,
      resendId: emailData.id,
    });

    return NextResponse.json({
      success: true,
      message: "Invoice sent successfully",
      email: recipientEmail,
    });
  } catch (error: any) {
    devError("send-invoice: Exception", error);
    
    // Provide more specific error messages based on error type
    let errorMessage = "Failed to send invoice";
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMessage = "Request timed out. The email service may be experiencing delays. Please try again later.";
    } else if (error.code === 'UND_ERR_SOCKET' || error.message?.includes('fetch failed')) {
      errorMessage = "Connection error. Please check your internet connection and try again.";
    } else if (error.message?.includes('Resend API error')) {
      errorMessage = "Email service error. Please try again later.";
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

