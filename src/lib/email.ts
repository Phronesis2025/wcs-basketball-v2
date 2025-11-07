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

  // In dev with resend.dev sender → ALL emails must go to dev inbox (Resend sandbox limitation)
  // Resend sandbox only allows sending to the account owner's email (phronesis700@gmail.com)
  const isDev = process.env.NODE_ENV !== "production";
  const useSandboxSender = RESEND_FROM.includes("@resend.dev");
  
  // For dev mode with sandbox sender, redirect ALL emails to dev inbox
  // This is required because Resend sandbox only allows sending to verified account email
  let finalRecipients: string[];
  let finalCc: string[] | undefined;
  let finalBcc: string[] | undefined;
  
  if (isDev && useSandboxSender) {
    // In dev mode with sandbox, ALL emails go to dev email (Resend requirement)
    finalRecipients = [RESEND_DEV_TO];
    const originalRecipients = [
      ...toArray,
      ...(options?.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : []),
      ...(options?.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : []),
    ].join(", ");
    
    // Include the original intended recipients in the body for context (dev only)
    const wrappedHtml = `<p style="font-size:12px;color:#666;background:#fff3cd;padding:8px;border-left:3px solid #ffc107;margin-bottom:16px;"><strong>[DEV MODE]</strong> Intended recipients: ${originalRecipients}</p>${html}`;
    html = wrappedHtml;
  } else {
    // Production mode - use actual recipients
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
      devError("sendEmail failed", text);
    } else {
      devLog("sendEmail OK", {
        to: finalRecipients,
        cc: finalCc,
        bcc: finalBcc,
        subject,
      });
    }
  } catch (e) {
    devError("sendEmail exception", e);
  }
}
