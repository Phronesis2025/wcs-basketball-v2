import { devError, devLog } from "@/lib/security";
import { validateEmail, validateEmails, type EmailValidationResult } from "@/lib/emailValidation";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_DEV_TO = process.env.RESEND_DEV_TO || "phronesis700@gmail.com"; // 👈 add this in .env.local

/**
 * Normalize the RESEND_FROM value to ensure it always uses "WCS Basketball" as the sender name
 * @param fromValue - The RESEND_FROM value from environment variable
 * @returns Normalized sender string with "WCS Basketball" as the name
 */
function normalizeSenderName(fromValue: string | undefined): string {
  const defaultFrom = "WCS Basketball <onboarding@resend.dev>";
  
  if (!fromValue) {
    return defaultFrom;
  }
  
  // If the value already includes "WCS Basketball", return as-is
  if (fromValue.includes("WCS Basketball")) {
    return fromValue;
  }
  
  // Extract email address from the value (format: "Name <email>" or just "email")
  const emailMatch = fromValue.match(/<([^>]+)>/) || fromValue.match(/([^\s<>]+@[^\s<>]+)/);
  const email = emailMatch ? emailMatch[1] : fromValue.trim();
  
  // Return normalized format with "WCS Basketball" as the sender name
  return `WCS Basketball <${email}>`;
}

// Ensure all emails come from "WCS Basketball" regardless of environment variable format
const RESEND_FROM = normalizeSenderName(process.env.RESEND_FROM);

/**
 * Send an email using Resend
 * @param to - Single email address or array of email addresses for the primary recipient(s)
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @param options - Optional parameters for CC, BCC, attachments, etc.
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: {
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
      filename: string;
      content: string; // base64 encoded content
    }>;
  }
) {
  if (!RESEND_API_KEY) {
    devLog("sendEmail: RESEND_API_KEY missing; skipping email");
    return;
  }

  // Normalize 'to' to an array
  const toArray = Array.isArray(to) ? to : [to];

  // Validate email addresses before sending
  try {
    const validationResults = await validateEmails(toArray, {
      skipDomainCheck: false, // Perform DNS lookup to verify domains
      timeout: 5000, // 5 second timeout for DNS lookups
    });

    // Check for validation errors
    const invalidEmails: string[] = [];
    const warnings: string[] = [];

    for (const [email, result] of validationResults.entries()) {
      if (!result.isValid) {
        invalidEmails.push(email);
        devError("sendEmail: Invalid email address", {
          email,
          errors: result.errors,
        });
      } else if (result.warnings.length > 0) {
        warnings.push(...result.warnings.map((w) => `${email}: ${w}`));
        devLog("sendEmail: Email validation warnings", {
          email,
          warnings: result.warnings,
        });
      }
    }

    // If any emails are invalid, throw error before sending
    if (invalidEmails.length > 0) {
      throw new Error(
        `Invalid email address(es): ${invalidEmails.join(", ")}. ${validationResults.get(invalidEmails[0])?.errors.join(", ")}`
      );
    }

    // Log warnings but continue (domain might exist but DNS propagation delay)
    if (warnings.length > 0) {
      devLog("sendEmail: Email validation warnings (continuing)", {
        warnings,
        note: "Domain verification warnings - email will still be sent, but may bounce if domain is invalid",
      });
    }
  } catch (validationError: any) {
    // If validation itself fails (e.g., DNS timeout), log but continue
    // This prevents validation from blocking legitimate emails due to network issues
    if (validationError.message?.includes("Invalid email address")) {
      // Format validation failed - don't send
      throw validationError;
    } else {
      // DNS lookup failed or timed out - log warning but continue
      devLog("sendEmail: Email validation check failed (continuing anyway)", {
        error: validationError.message,
        note: "DNS lookup failed or timed out - email will still be sent",
      });
    }
  }

  // Resend sandbox limitation: @resend.dev sender only allows sending to account owner email
  // Solution: Verify a domain in Resend and use that domain in RESEND_FROM
  const useSandboxSender = RESEND_FROM.includes("@resend.dev");
  const isDev = process.env.NODE_ENV !== "production";
  
  // Log the RESEND_FROM value for debugging (only in production to help troubleshoot)
  if (!isDev) {
    devLog("sendEmail: RESEND_FROM value", { 
      RESEND_FROM, 
      useSandboxSender,
      isProduction: !isDev 
    });
  }
  
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
  // Add attachments if provided
  if (options?.attachments && options.attachments.length > 0) {
    emailPayload.attachments = options.attachments;
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
      let errorData;
      try {
        errorData = JSON.parse(text || "{}");
      } catch {
        errorData = { message: text };
      }
      
      const errorMessage = errorData.message || errorData.name || text || "Unknown error";
      
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
        devError("sendEmail failed", {
          status: resp.status,
          statusText: resp.statusText,
          error: errorMessage,
          errorData,
          to: finalRecipients,
          subject,
        });
        // Throw error so caller can handle it
        throw new Error(`Resend API error: ${errorMessage} (Status: ${resp.status})`);
      }
    } else {
      const responseData = await resp.json().catch(() => ({}));
      devLog("sendEmail OK", {
        to: finalRecipients,
        cc: finalCc,
        bcc: finalBcc,
        subject,
        sandboxMode: useSandboxSender,
        emailId: responseData.id,
      });
    }
  } catch (e) {
    devError("sendEmail exception", {
      error: e,
      to: finalRecipients,
      subject,
    });
    // Re-throw so caller knows email failed
    throw e;
  }
}
