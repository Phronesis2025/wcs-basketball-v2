# Supabase Email Template - Player Registration Confirmation

## Template to Use: "Invite User" (or "Confirm Signup" if using signUp flow)

**Location:** Supabase Dashboard → Authentication → Email Templates → **Invite User**

## Subject Line

```
🏀 Welcome to WCS Basketball! Registration Received
```

## HTML Template

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          "Helvetica Neue", Arial, sans-serif;
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
        content: "";
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
        background: #fff3cd !important;
        border: 2px solid #f59e0b !important;
        color: #7c2d12 !important;
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
      .confirm-button-container {
        text-align: center;
        margin: 30px 0;
      }
      .confirm-button {
        display: inline-block;
        background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
        color: white !important;
        padding: 14px 32px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 16px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.3);
      }
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #f3f4f6 !important;
          color: #1f2937 !important;
        }
        .email-container,
        .content,
        .player-card {
          background: #ffffff !important;
          color: #111827 !important;
        }
        .info-label {
          color: #374151 !important;
        }
        .info-value {
          color: #111827 !important;
        }
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
          <img
            src="https://www.wcsbasketball.site/apple-touch-icon.png"
            alt="WCS Basketball Logo"
            class="logo"
            style="max-width: 80px; height: auto; display: block; margin: 0 auto; width: 80px;"
          />
        </div>
        <h1>WCS Basketball</h1>
        <p class="header-subtitle">Registration Confirmation</p>
      </div>

      <div class="content">
        {{ if .Data.parentFirstName }}
        <div class="greeting">Hi {{ .Data.parentFirstName }},</div>
        {{ else }}
        <div class="greeting">Hello,</div>
        {{ end }}

        <p class="intro-text">
          Thank you for registering your child with
          <strong>WCS Basketball</strong>! We're excited to have them join our
          championship development program.
        </p>

        <div class="success-banner">
          <div class="success-banner-title">
            <span>✅</span>
            <span>Registration Received Successfully</span>
          </div>
          <p class="success-banner-text">
            We've received your registration and it's currently being reviewed
            by our team.
          </p>
        </div>

        {{ if .Data.playerName }}
        <div class="player-card">
          <h2 class="player-card-title">Player Information</h2>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ .Data.playerName }}</span>
          </div>
          {{ if .Data.grade }}
          <div class="info-row">
            <span class="info-label">Grade:</span>
            <span class="info-value">{{ .Data.grade }}</span>
          </div>
          {{ end }} {{ if .Data.gender }}
          <div class="info-row">
            <span class="info-label">Gender:</span>
            <span class="info-value">{{ .Data.gender }}</span>
          </div>
          {{ end }}
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="status-badge">Pending Team Assignment</span>
          </div>
        </div>
        {{ end }}

        <h2 class="section-title">What Happens Next?</h2>

        <div class="steps-container">
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width: 100%; margin-bottom: 20px;"
          >
            <tr>
              <td
                style="width: 36px; vertical-align: top; padding-right: 15px;"
              >
                <div
                  style="width: 36px; height: 36px; border-radius: 50%; background: #0f172a; color: white; text-align: center; line-height: 36px; font-weight: 700; font-size: 16px;"
                >
                  1
                </div>
              </td>
              <td style="vertical-align: top;">
                <div class="step-title">Email Confirmation</div>
                <p class="step-description">
                  Confirm your email address by clicking the button below. Once
                  confirmed, you'll be automatically signed in and taken to your
                  profile.
                </p>
              </td>
            </tr>
          </table>

          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width: 100%; margin-bottom: 20px;"
          >
            <tr>
              <td
                style="width: 36px; vertical-align: top; padding-right: 15px;"
              >
                <div
                  style="width: 36px; height: 36px; border-radius: 50%; background: #0f172a; color: white; text-align: center; line-height: 36px; font-weight: 700; font-size: 16px;"
                >
                  2
                </div>
              </td>
              <td style="vertical-align: top;">
                <div class="step-title">Team Assignment</div>
                <p class="step-description">
                  Our coaches will review the registration{{ if .Data.playerName
                  }} and assign {{ .Data.playerName }}{{ end }} to an
                  appropriate team based on age and skill level.
                </p>
              </td>
            </tr>
          </table>

          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width: 100%; margin-bottom: 20px;"
          >
            <tr>
              <td
                style="width: 36px; vertical-align: top; padding-right: 15px;"
              >
                <div
                  style="width: 36px; height: 36px; border-radius: 50%; background: #0f172a; color: white; text-align: center; line-height: 36px; font-weight: 700; font-size: 16px;"
                >
                  3
                </div>
              </td>
              <td style="vertical-align: top;">
                <div class="step-title">Email Notification</div>
                <p class="step-description">
                  You'll receive an email with team details and a link to
                  complete payment.
                </p>
              </td>
            </tr>
          </table>

          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width: 100%; margin-bottom: 20px;"
          >
            <tr>
              <td
                style="width: 36px; vertical-align: top; padding-right: 15px;"
              >
                <div
                  style="width: 36px; height: 36px; border-radius: 50%; background: #0f172a; color: white; text-align: center; line-height: 36px; font-weight: 700; font-size: 16px;"
                >
                  4
                </div>
              </td>
              <td style="vertical-align: top;">
                <div class="step-title">Complete Payment</div>
                <p class="step-description">
                  After payment is received{{ if .Data.playerName }}, {{
                  .Data.playerName }}{{ end }} will be officially enrolled and
                  ready to start!
                </p>
              </td>
            </tr>
          </table>
        </div>

        <div class="timeline-box">
          <strong>⏱️ Timeline:</strong> Team assignments are typically completed
          within <strong>1-2 business days</strong>.
        </div>

        <div class="confirm-button-container">
          <a href="{{ .ConfirmationURL }}" class="confirm-button"
            >Confirm Your Account</a
          >
        </div>

        <p class="intro-text" style="text-align: center; margin-top: 20px;">
          <strong
            >Please click the button above to confirm your email address and
            activate your account.</strong
          >
        </p>

        <p class="closing-text">
          If you have any questions or concerns in the meantime, please don't
          hesitate to reach out to us.
        </p>

        <div class="signature">
          <div class="signature-title">Where Champions Start!</div>
          <div class="signature-team">The WCS Basketball Team</div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-title">WCS Basketball - Where Champions Start</div>

        <div class="social-links">
          <a href="https://facebook.com/wcsbasketball" class="social-link"
            >Facebook</a
          >
          <span class="divider">|</span>
          <a href="https://instagram.com/wcsbasketball" class="social-link"
            >Instagram</a
          >
          <span class="divider">|</span>
          <a href="https://twitter.com/wcsbasketball" class="social-link"
            >Twitter</a
          >
          <span class="divider">|</span>
          <a href="https://youtube.com/wcsbasketball" class="social-link"
            >YouTube</a
          >
        </div>

        <p class="contact-text">
          Questions? Contact us at
          <a href="mailto:info@wcsbasketball.com" class="contact-link"
            >info@wcsbasketball.com</a
          >
        </p>
        <p class="disclaimer">
          This is an automated message from WCS Basketball registration system.
        </p>
      </div>
    </div>
  </body>
</html>
```

## Template Variables Used

The template uses the following variables from `user_metadata` (stored when `inviteUserByEmail` is called):

- `{{ .Data.parentFirstName }}` - Parent's first name
- `{{ .Data.parentLastName }}` - Parent's last name
- `{{ .Data.playerName }}` - Player's full name (e.g., "John Doe")
- `{{ .Data.grade }}` - Player's grade (optional)
- `{{ .Data.gender }}` - Player's gender (optional)
- `{{ .ConfirmationURL }}` - The confirmation link (required)

## How to Apply

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **Email Templates**
2. Select **"Invite User"** template (or "Confirm Signup" if using signUp flow)
3. Copy the HTML template above into the template editor
4. Update the **Subject** field to: `🏀 Welcome to WCS Basketball! Registration Received`
5. Click **Save**

## Notes

- The template uses conditional rendering (`{{ if .Data.playerName }}`) to handle cases where metadata might be missing
- The logo URL is hardcoded to the production domain for maximum email client compatibility
- All styling is inline or in `<style>` tags for maximum email client compatibility
- The template matches the design of the Resend email template for consistency
