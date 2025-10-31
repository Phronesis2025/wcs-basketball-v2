// Email Templates for WCS Basketball
// This file contains all email templates used throughout the application

import { readFileSync } from "fs";
import { join } from "path";

/**
 * Helper function to get the base URL for email assets (images, links, etc.)
 * This works in both client and server contexts
 */
function getEmailBaseUrl(): string {
  // Try NEXT_PUBLIC_BASE_URL first (works in both client and server)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    const url = process.env.NEXT_PUBLIC_BASE_URL.trim();
    // Ensure it has protocol
    const withProtocol =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    // Do NOT use localhost for email asset URLs
    if (/localhost|127\.0\.0\.1/i.test(withProtocol)) {
      // fall through to VERCEL_URL or hardcoded prod
    } else {
      return withProtocol.replace(/\/+$/, ""); // Remove trailing slashes
    }
  }
  // Try VERCEL_URL (available in Vercel deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback to production URL
  return "https://wcs-basketball-v2.vercel.app";
}

/**
 * Load logo as base64 data URI at module load time
 * This ensures it's embedded in emails and works even when external images are blocked
 */
function getLogoDataUri(): string {
  try {
    // Read the logo file from public folder
    const logoPath = join(process.cwd(), "public", "apple-touch-icon.png");
    const logoBuffer = readFileSync(logoPath);
    const base64 = logoBuffer.toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    // Fallback to URL if file read fails
    const baseUrl = getEmailBaseUrl();
    return `${baseUrl}/apple-touch-icon.png`;
  }
}

// Pre-load the logo data URI (kept as a fallback, not primary for emails)
const LOGO_DATA_URI = getLogoDataUri();

/**
 * Prefer absolute HTTPS URL for maximum email client compatibility.
 * Many clients (e.g., Gmail) ignore data URIs. We keep base64 as a fallback.
 */
function getLogoUrl(): string {
  const baseUrl = getEmailBaseUrl();
  // If baseUrl is production-like, use it
  if (!/localhost|127\.0\.0\.1/i.test(baseUrl)) {
    return `${baseUrl}/apple-touch-icon.png`;
  }
  // Fallback to prod domain
  return `https://wcs-basketball-v2.vercel.app/apple-touch-icon.png`;
}

/**
 * Email template for new player registration confirmation
 * Sent to parents after they register their child
 */
export function getPlayerRegistrationEmail(data: {
  playerFirstName: string;
  playerLastName: string;
  parentFirstName?: string;
  parentLastName?: string;
  grade?: string;
  gender?: string;
}): { subject: string; html: string } {
  const { playerFirstName, playerLastName, parentFirstName, grade, gender } =
    data;

  const parentGreeting = parentFirstName ? `Hi ${parentFirstName},` : "Hello,";

  const subject = "🏀 Welcome to WCS Basketball! Registration Received";

  const baseUrl = getEmailBaseUrl();
  const logoUrl = getLogoUrl();

  const html = `
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
      color: #000000 !important; /* ensure title stays white on mobile/dark mode */
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
    .success-banner {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      border-left: 4px solid #10b981;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .success-banner-title {
      color: #065f46;
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .success-banner-text {
      color: #047857;
      font-size: 14px;
      margin: 0;
    }
    .player-card {
      background: #ffffff !important;
      border: 1px solid #e2e8f0;
      padding: 25px;
      border-radius: 12px;
      margin: 30px 0;
    }
    .player-card-title {
      color: #0f172a !important;
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 15px 0;
    }
    .info-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #374151 !important;
      min-width: 100px;
    }
    .info-value {
      color: #111827 !important;
    }
    .status-badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    .section-title {
      color: #0f172a !important;
      font-size: 20px;
      font-weight: 700;
      margin: 35px 0 20px 0;
    }
    .steps-container {
      margin: 25px 0;
    }
    .step {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      align-items: start;
    }
    .step-number {
      background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      text-align: center;
      line-height: 36px;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      display: block;
    }
    .step-content {
      flex: 1;
      padding-top: 2px;
    }
    .step-title {
      font-weight: 700;
      color: #0f172a !important;
      font-size: 16px;
      margin-bottom: 5px;
    }
    .step-description {
      color: #1f2937 !important;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
    }
    .timeline-box {
      background: #fff3cd !important; /* lighter solid background for better legibility */
      border: 2px solid #f59e0b !important;
      color: #7c2d12 !important; /* readable warning text color */
      padding: 20px;
      border-radius: 10px;
      margin: 30px 0;
      text-align: center;
    }
    .timeline-box strong {
      color: #7c2d12 !important;
      font-size: 16px;
    }
    .closing-text {
      color: #1f2937 !important;
      font-size: 15px;
      margin: 25px 0;
    }
    .signature {
      margin-top: 35px;
      padding-top: 25px;
      border-top: 2px solid #e2e8f0;
    }
    .signature-title {
      font-weight: 700;
      color: #0f172a !important;
      font-size: 16px;
      margin-bottom: 4px;
    }
    .signature-team {
      color: #1f2937 !important;
      font-size: 15px;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    @media (prefers-color-scheme: dark) {
      body { background-color: #f3f4f6 !important; color: #1f2937 !important; }
      .email-container, .content, .player-card { background: #ffffff !important; color: #111827 !important; }
      .info-label { color: #374151 !important; }
      .info-value { color: #111827 !important; }
    }
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px;
      }
      .content {
        padding: 25px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 26px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo-container">
        <img src="${logoUrl}" alt="WCS Basketball Logo" class="logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto; width: 80px;">
      </div>
      <h1>WCS Basketball</h1>
      <p class="header-subtitle">Registration Confirmation</p>
    </div>

    <div class="content">
      <div class="greeting">${parentGreeting}</div>

      <p class="intro-text">Thank you for registering your child with <strong>WCS Basketball</strong>! We're excited to have them join our championship development program.</p>

      <div class="success-banner">
        <div class="success-banner-title">
          <span>✅</span>
          <span>Registration Received Successfully</span>
        </div>
        <p class="success-banner-text">We've received your registration and it's currently being reviewed by our team.</p>
      </div>

      <div class="player-card">
        <h2 class="player-card-title">Player Information</h2>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${playerFirstName} ${playerLastName}</span>
        </div>
        ${
          grade
            ? `<div class="info-row">
          <span class="info-label">Grade:</span>
          <span class="info-value">${grade}</span>
        </div>`
            : ""
        }
        ${
          gender
            ? `<div class="info-row">
          <span class="info-label">Gender:</span>
          <span class="info-value">${gender}</span>
        </div>`
            : ""
        }
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="status-badge">Pending Team Assignment</span>
        </div>
      </div>

      <h2 class="section-title">What Happens Next?</h2>
      
      <div class="steps-container">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="width: 36px; vertical-align: top; padding-right: 15px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #0f172a; color: white; text-align: center; line-height: 36px; font-weight: 700; font-size: 16px;">1</div>
            </td>
            <td style="vertical-align: top;">
              <div class="step-title">Team Assignment</div>
              <p class="step-description">Our coaches will review the registration and assign ${playerFirstName} to an appropriate team based on age and skill level.</p>
            </td>
          </tr>
        </table>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="width: 36px; vertical-align: top; padding-right: 15px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #0f172a; color: white; text-align: center; line-height: 36px; font-weight: 700; font-size: 16px;">2</div>
            </td>
            <td style="vertical-align: top;">
              <div class="step-title">Email Notification</div>
              <p class="step-description">You'll receive an email with team details and a link to complete payment.</p>
            </td>
          </tr>
        </table>

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="width: 36px; vertical-align: top; padding-right: 15px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #0f172a; color: white; text-align: center; line-height: 36px; font-weight: 700; font-size: 16px;">3</div>
            </td>
            <td style="vertical-align: top;">
              <div class="step-title">Complete Payment</div>
              <p class="step-description">After payment is received, ${playerFirstName} will be officially enrolled and ready to start!</p>
            </td>
          </tr>
        </table>
      </div>

      <div class="timeline-box">
        <strong>⏱️ Timeline:</strong> Team assignments are typically completed within <strong>1-2 business days</strong>.
      </div>

      <p class="closing-text">If you have any questions or concerns in the meantime, please don't hesitate to reach out to us.</p>

      <div class="signature">
        <div class="signature-title">Where Champions Start!</div>
        <div class="signature-team">The WCS Basketball Team</div>
      </div>
    </div>

    <div class="footer">
      <div class="footer-title">WCS Basketball - Where Champions Start</div>
      
      <div class="social-links">
        <a href="https://facebook.com/wcsbasketball" class="social-link">Facebook</a>
        <span class="divider">|</span>
        <a href="https://instagram.com/wcsbasketball" class="social-link">Instagram</a>
        <span class="divider">|</span>
        <a href="https://twitter.com/wcsbasketball" class="social-link">Twitter</a>
        <span class="divider">|</span>
        <a href="https://youtube.com/wcsbasketball" class="social-link">YouTube</a>
      </div>
      
      <p class="contact-text">Questions? Contact us at <a href="mailto:info@wcsbasketball.com" class="contact-link">info@wcsbasketball.com</a></p>
      <p class="disclaimer">This is an automated message from WCS Basketball registration system.</p>
    </div>
  </div>
</body>
</html>

  `;

  return { subject, html };
}

/**
 * Email template for player approval notification
 * Sent to parents when their child is assigned to a team
 */
export function getPlayerApprovalEmail(data: {
  playerName: string;
  teamName?: string;
  paymentLink: string;
}): { subject: string; html: string } {
  const { playerName, teamName, paymentLink } = data;

  const subject = "🎉 Player Approved! Complete Your Payment";

  const baseUrl = getEmailBaseUrl();
  const logoUrl = getLogoUrl();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }
        .success-box {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
          text-align: center;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
          font-size: 16px;
        }
        .button:hover {
          background: #2563eb;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" alt="WCS Basketball" style="max-width: 80px; height: auto; display: block; margin: 0 auto 15px auto; width: 80px;">
        <h1 style="margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Your Player Has Been Approved</p>
      </div>

      <div class="content">
        <div class="success-box">
          <h2 style="margin: 0 0 10px 0; color: #16a34a;">✅ Team Assignment Complete</h2>
          <p style="margin: 0; font-size: 18px;"><strong>${playerName}</strong> has been assigned${
    teamName ? ` to <strong>${teamName}</strong>` : ""
  }!</p>
        </div>

        <h3 style="color: #1e40af;">Next Step: Complete Payment</h3>
        <p>To finalize ${playerName}'s enrollment and secure their spot on the team, please complete the payment using the secure link below.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentLink}" class="button">Complete Payment Now →</a>
        </div>

        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin: 25px 0;">
          <h4 style="margin: 0 0 10px 0; color: #92400e;">⏰ Important Payment Information</h4>
          <ul style="margin: 10px 0; padding-left: 20px; color: #92400e;">
            <li><strong>Deadline:</strong> Complete payment within <strong>7 days</strong> to secure ${playerName}'s spot</li>
            <li><strong>Payment Methods:</strong> Credit card, debit card, or PayPal accepted</li>
            <li><strong>Security:</strong> All payments are processed securely through Stripe</li>
            <li><strong>Receipt:</strong> You'll receive an email confirmation after payment</li>
          </ul>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
          <h4 style="margin: 0 0 15px 0; color: #1e40af;">📋 What You'll Receive After Payment</h4>
          <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
            <li><strong>Practice Schedule:</strong> Weekly practice times and locations</li>
            <li><strong>Coach Information:</strong> Direct contact details for your team's coach</li>
            <li><strong>Team Roster:</strong> Meet your teammates and their families</li>
            <li><strong>Game Schedule:</strong> Upcoming games and tournaments</li>
            <li><strong>Equipment List:</strong> What ${playerName} needs to bring</li>
            <li><strong>Parent Handbook:</strong> Important policies and procedures</li>
          </ul>
        </div>

        <p style="margin-top: 30px;">
          <strong>Thank you for joining WCS Basketball!</strong><br>
          We look forward to developing ${playerName} into a champion on and off the court!
        </p>
      </div>

      <div class="footer">
        <p style="margin: 5px 0;"><strong>WCS Basketball - Where Champions Start</strong></p>
        <p style="margin: 15px 0;">
          <a href="https://facebook.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Facebook</a>
          |
          <a href="https://instagram.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Instagram</a>
          |
          <a href="https://twitter.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Twitter</a>
          |
          <a href="https://youtube.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">YouTube</a>
        </p>
        <p style="margin: 5px 0;">Questions? Contact us at <a href="mailto:info@wcsbasketball.com" style="color: #3b82f6;">info@wcsbasketball.com</a></p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Email template for admin notifications when a new player registers
 * Sent to admin email address(es)
 */
export function getAdminPlayerRegistrationEmail(data: {
  playerFirstName: string;
  playerLastName: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  grade?: string;
  gender?: string;
  playerId: string;
}): { subject: string; html: string } {
  const {
    playerFirstName,
    playerLastName,
    parentName,
    parentEmail,
    parentPhone,
    grade,
    gender,
    playerId,
  } = data;

  const subject = `🏀 WCS Basketball - New Player Registration: ${playerFirstName} ${playerLastName}`;

  const baseUrl = getEmailBaseUrl();
  const logoUrl = getLogoUrl();
  const dashboardLink = `${baseUrl}/admin/club-management`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #1e40af;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 25px;
          border: 1px solid #e5e7eb;
        }
        .info-grid {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          width: 150px;
          color: #6b7280;
        }
        .info-value {
          flex: 1;
          color: #111827;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 15px 0;
          font-weight: 600;
        }
        .alert-box {
          background: #fef3c7;
          border: 2px solid #fbbf24;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 600;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" alt="WCS Basketball" style="max-width: 60px; height: auto; display: block; margin: 0 auto 10px auto; width: 60px;">
        <h2 style="margin: 0;">🏀 WCS Basketball - New Player Registration</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Action Required: Team Assignment</p>
      </div>

      <div class="content">
        <div class="alert-box">
          ⏱️ Please review and assign this player to a team
        </div>

        <h3 style="color: #1e40af; margin-top: 25px;">Player Details</h3>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Player Name:</div>
            <div class="info-value"><strong>${playerFirstName} ${playerLastName}</strong></div>
          </div>
          ${
            grade
              ? `
          <div class="info-row">
            <div class="info-label">Grade:</div>
            <div class="info-value">${grade}</div>
          </div>
          `
              : ""
          }
          ${
            gender
              ? `
          <div class="info-row">
            <div class="info-label">Gender:</div>
            <div class="info-value">${gender}</div>
          </div>
          `
              : ""
          }
          <div class="info-row">
            <div class="info-label">Player ID:</div>
            <div class="info-value"><code>${playerId}</code></div>
          </div>
        </div>

        <h3 style="color: #1e40af;">Parent/Guardian Information</h3>
        <div class="info-grid">
          <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value">${parentName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value"><a href="mailto:${parentEmail}">${parentEmail}</a></div>
          </div>
          ${
            parentPhone
              ? `
          <div class="info-row">
            <div class="info-label">Phone:</div>
            <div class="info-value"><a href="tel:${parentPhone}">${parentPhone}</a></div>
          </div>
          `
              : ""
          }
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardLink}" class="button">Go to Admin Dashboard →</a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
          <strong>Next Steps:</strong>
        </p>
        <ol style="color: #6b7280; font-size: 14px;">
          <li>Review player information</li>
          <li>Assign to appropriate team</li>
          <li>Parent will receive automatic approval email with payment link</li>
        </ol>
      </div>

      <div class="footer" style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="margin: 5px 0;"><strong>WCS Basketball - Where Champions Start</strong></p>
        <p style="margin: 15px 0;">
          <a href="https://facebook.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Facebook</a>
          |
          <a href="https://instagram.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Instagram</a>
          |
          <a href="https://twitter.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Twitter</a>
          |
          <a href="https://youtube.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">YouTube</a>
        </p>
        <p style="margin: 5px 0;">Questions? Contact us at <a href="mailto:info@wcsbasketball.com" style="color: #3b82f6;">info@wcsbasketball.com</a></p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

/**
 * Email template for payment confirmation
 * Sent to parents after they complete payment
 */
export function getPaymentConfirmationEmail(data: {
  playerFirstName: string;
  playerLastName: string;
  parentFirstName?: string;
  parentLastName?: string;
  teamName?: string;
  amount: number;
  paymentType: string;
  paymentDate?: string;
  teamInfo?: {
    teamId: string;
    teamName: string;
    practices: Array<{
      date_time: string;
      location: string | null;
      title?: string | null;
      description?: string | null;
    }>;
    games: Array<{
      date_time: string;
      location: string | null;
      opponent?: string | null;
      title?: string | null;
      description?: string | null;
      event_type?: string | null;
    }>;
    coaches: Array<{
      first_name: string;
      last_name: string;
      email: string;
      phone?: string | null;
    }>;
  };
}): { subject: string; html: string } {
  const {
    playerFirstName,
    playerLastName,
    parentFirstName,
    teamName,
    amount,
    paymentType,
    paymentDate,
    teamInfo,
  } = data;

  const parentGreeting = parentFirstName ? `Hi ${parentFirstName},` : "Hello,";
  const formattedAmount = `$${amount.toFixed(2)}`;
  const formattedDate =
    paymentDate ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const baseUrl = getEmailBaseUrl();
  const logoUrl = getLogoUrl();

  const subject = `✅ Payment Received - ${playerFirstName} ${playerLastName} is Now Active!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
        }
        .success-box {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
          text-align: center;
        }
        .success-box h2 {
          margin: 0 0 10px 0;
          color: #16a34a;
        }
        .receipt-box {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .receipt-row:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #16a34a;
          padding-top: 15px;
        }
        .receipt-label {
          color: #6b7280;
        }
        .receipt-value {
          font-weight: 600;
          color: #111827;
        }
        .next-steps {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .next-steps h3 {
          margin: 0 0 15px 0;
          color: #1e40af;
        }
        .next-steps ul {
          margin: 0;
          padding-left: 20px;
        }
        .next-steps li {
          margin: 8px 0;
          color: #1e40af;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
          font-size: 16px;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e5e7eb;
          border-top: none;
          font-size: 14px;
          color: #6b7280;
        }
        .checkmark {
          width: 60px;
          height: 60px;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 32px;
        }
        .section {
          margin: 28px 0;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
        }
        .section h3 {
          margin: 0 0 12px 0;
          color: #1e40af;
        }
        .list {
          margin: 0;
          padding-left: 18px;
        }
        .coach-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
          background: #f9fafb;
        }
        .muted { color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" alt="WCS Basketball" style="max-width: 80px; height: auto; display: block; margin: 0 auto 15px auto; width: 80px;">
        <h1>✅ Payment Received!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Your child is now officially enrolled</p>
      </div>

      <div class="content">
        <p style="font-size: 18px; margin-bottom: 20px;">${parentGreeting}</p>

        <div class="success-box">
          <div class="checkmark">✓</div>
          <h2>Thank You for Your Payment!</h2>
          <p style="margin: 10px 0 0 0; font-size: 16px;">
            <strong>${playerFirstName} ${playerLastName}</strong> is now <strong style="color: #16a34a;">ACTIVE</strong> and ready to start playing!
          </p>
        </div>

        <h3 style="color: #1e40af; margin-top: 30px;">Payment Receipt</h3>
        <div class="receipt-box">
          <div class="receipt-row">
            <span class="receipt-label">Player Name:</span>
            <span class="receipt-value">${playerFirstName} ${playerLastName}</span>
          </div>
          ${
            teamName
              ? `
          <div class="receipt-row">
            <span class="receipt-label">Team:</span>
            <span class="receipt-value">${teamName}</span>
          </div>
          `
              : ""
          }
          <div class="receipt-row">
            <span class="receipt-label">Payment Type:</span>
            <span class="receipt-value">${
              paymentType === "annual"
                ? "Annual Registration"
                : paymentType === "monthly"
                ? "Monthly Subscription"
                : paymentType.charAt(0).toUpperCase() + paymentType.slice(1)
            }</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Payment Date:</span>
            <span class="receipt-value">${formattedDate}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-label">Amount Paid:</span>
            <span class="receipt-value" style="color: #16a34a;">${formattedAmount}</span>
          </div>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border: 1px solid #fbbf24; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>📧 Receipt Confirmation:</strong> A separate payment receipt has also been sent to your email by our payment processor (Stripe).
          </p>
        </div>

        <div class="next-steps">
          <h3>🎉 What Happens Next?</h3>
          <ul>
            <li><strong>Check Your Dashboard:</strong> Log in to view ${playerFirstName}'s practice schedule, game times, and team information</li>
            <li><strong>Meet the Coach:</strong> Your team coach will reach out with welcome information and any pre-season requirements</li>
            <li><strong>Team Communication:</strong> You'll receive updates about practices, games, and important announcements</li>
            ${
              paymentType === "monthly"
                ? "<li><strong>Monthly Billing:</strong> Your subscription will automatically renew each month. You'll receive a receipt for each payment.</li>"
                : ""
            }
          </ul>
        </div>

        ${
          teamInfo
            ? `
        <div class="section">
          <h3>📅 Practice Schedule (Next 2 Weeks)</h3>
          ${
            teamInfo.practices.length
              ? `<ul class="list">${teamInfo.practices
                  .map(
                    (p) =>
                      `<li><strong>${new Date(p.date_time).toLocaleString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )}</strong> — ${p.location || "TBD"}</li>`
                  )
                  .join("\n")}</ul>`
              : `<p class="muted">No practices scheduled for the next 2 weeks.</p>`
          }
        </div>

        <div class="section">
          <h3>🏀 Games & Tournaments (Next 2 Weeks)</h3>
          ${
            teamInfo.games.length
              ? `<ul class="list">${teamInfo.games
                  .map((g) => {
                    const when = new Date(g.date_time).toLocaleString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    const label =
                      g.event_type === "Tournament"
                        ? g.title || "Tournament"
                        : `Game vs ${g.opponent || "TBD"}`;
                    return `<li><strong>${when}</strong> — ${label} — ${
                      g.location || "TBD"
                    }</li>`;
                  })
                  .join("\n")}</ul>`
              : `<p class="muted">No games scheduled for the next 2 weeks.</p>`
          }
        </div>

        <div class="section">
          <h3>👤 Coach Information</h3>
          ${
            teamInfo.coaches.length
              ? teamInfo.coaches
                  .map(
                    (c) => `
            <div class="coach-card">
              <div><strong>${c.first_name} ${c.last_name}</strong></div>
              <div>Email: <a href="mailto:${c.email}">${c.email}</a></div>
              ${
                c.phone
                  ? `<div>Phone: <a href="tel:${c.phone}">${c.phone}</a></div>`
                  : ""
              }
            </div>
            `
                  )
                  .join("")
              : `<p class="muted">Coach information will be updated soon.</p>`
          }
        </div>


        <div class="section">
          <h3>🎒 Equipment List</h3>
          <p><strong>What ${playerFirstName} needs to bring:</strong></p>
          <ul class="list">
            <li>Basketball shoes</li>
            <li>Water bottle</li>
            <li>Athletic wear (shorts and t-shirt)</li>
            <li>Basketball (optional)</li>
          </ul>
        </div>

        <div class="section" style="text-align: center;">
          <a href="${baseUrl}/teams/${
                teamInfo.teamId
              }" class="button">View Full Team Roster →</a>
        </div>

        <div class="section" style="text-align: center;">
          <a href="${
            process.env.NEXT_PUBLIC_BASE_URL ||
            "https://wcs-basketball-v2.vercel.app"
          }/parent-handbook" class="button">View Parent Handbook →</a>
        </div>
        `
            : ""
        }

        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            process.env.NEXT_PUBLIC_BASE_URL ||
            "https://wcs-basketball-v2.vercel.app"
          }/parent/dashboard" class="button">Go to Parent Dashboard →</a>
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">📞 Need Help?</h4>
          <p style="margin: 0; color: #1e40af;">
            If you have any questions or need assistance, please contact us at 
            <a href="mailto:info@wcsbasketball.com" style="color: #3b82f6;">info@wcsbasketball.com</a>
          </p>
        </div>

        <p style="margin-top: 30px; font-size: 16px;">
          <strong>Thank you for choosing WCS Basketball!</strong><br>
          We're excited to help ${playerFirstName} grow both on and off the court!
        </p>

        <p style="margin-top: 20px;">
          <strong>Where Champions Start!</strong><br>
          The WCS Basketball Team
        </p>
      </div>

      <div class="footer">
        <p style="margin: 5px 0;"><strong>WCS Basketball - Where Champions Start</strong></p>
        <p style="margin: 15px 0;">
          <a href="https://facebook.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Facebook</a>
          |
          <a href="https://instagram.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Instagram</a>
          |
          <a href="https://twitter.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">Twitter</a>
          |
          <a href="https://youtube.com/wcsbasketball" style="margin: 0 8px; color: #3b82f6; text-decoration: none;">YouTube</a>
        </p>
        <p style="margin: 5px 0;">Questions? Contact us at <a href="mailto:info@wcsbasketball.com" style="color: #3b82f6;">info@wcsbasketball.com</a></p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
