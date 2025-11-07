import { devError, devLog } from "@/lib/security";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM || "WCS Basketball <onboarding@resend.dev>";
const RESEND_DEV_TO = process.env.RESEND_DEV_TO || "phronesis700@gmail.com"; // 👈 add this in .env.local

/**
 * Send an email using Resend
 * @param to - Single email address or array of email addresses for the primary recipient(s)
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @param options - Optional parameters for CC, BCC, etc.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: {
    cc?: string | string[];
    bcc?: string | string[];
  }
) {
  if (!RESEND_API_KEY) {
    devLog("sendEmail: RESEND_API_KEY missing; skipping email");
    return;
  }

  // Normalize 'to' to an array
  const toArray = Array.isArray(to) ? to : [to];

  // Resend sandbox limitation: @resend.dev sender only allows sending to account owner email
  // Solution: Verify a domain in Resend and use that domain in RESEND_FROM
  const useSandboxSender = RESEND_FROM.includes("@resend.dev");
  const isDev = process.env.NODE_ENV !== "production";
  
  // If using sandbox sender (@resend.dev), ALL emails must go to dev inbox
  // This applies to both dev and production until domain is verified
  let finalRecipients: string[];
  let finalCc: string[] | undefined;
  let finalBcc: string[] | undefined;
  
  if (useSandboxSender) {
    // Sandbox mode: ALL emails go to dev email (Resend requirement)
    // This applies in both dev and production until domain is verified
    finalRecipients = [RESEND_DEV_TO];
    const originalRecipients = [
      ...toArray,
      ...(options?.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : []),
      ...(options?.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : []),
    ].join(", ");
    
    // Include the original intended recipients in the body for context
    const wrappedHtml = `<p style="font-size:12px;color:#666;background:#fff3cd;padding:8px;border-left:3px solid #ffc107;margin-bottom:16px;"><strong>[SANDBOX MODE]</strong> Domain not verified. Intended recipients: ${originalRecipients}<br>To send to real recipients, verify a domain in Resend and update RESEND_FROM. See docs/RESEND_DOMAIN_VERIFICATION_GUIDE.md</p>${html}`;
    html = wrappedHtml;
  } else {
    // Verified domain mode: use actual recipients
    // This works in both dev and production once domain is verified
    finalRecipients = toArray;
    finalCc = options?.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined;
    finalBcc = options?.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined;
  }

  // Build the email payload
  const emailPayload: any = {
    from: RESEND_FROM,
    to: finalRecipients,
    subject,
    html,
  };

  // Add CC and BCC if provided
  if (finalCc && finalCc.length > 0) {
    emailPayload.cc = finalCc;
  }
  if (finalBcc && finalBcc.length > 0) {
    emailPayload.bcc = finalBcc;
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      const errorData = JSON.parse(text || "{}");
      
      // If it's a validation error about sandbox, log it but don't fail completely
      // The email routing should have already handled this, but just in case
      if (errorData.name === "validation_error" && errorData.message?.includes("testing emails")) {
        devError("sendEmail: Resend sandbox limitation - emails must go to account owner", {
          error: errorData.message,
          attemptedRecipients: toArray,
          routedTo: finalRecipients,
          suggestion: "Verify a domain in Resend and update RESEND_FROM to use verified domain",
        });
        // Don't throw - email routing should have already redirected to dev inbox
      } else {
        devError("sendEmail failed", text);
      }
    } else {
      devLog("sendEmail OK", {
        to: finalRecipients,
        cc: finalCc,
        bcc: finalBcc,
        subject,
        sandboxMode: useSandboxSender,
      });
    }
  } catch (e) {
    devError("sendEmail exception", e);
  }
}
