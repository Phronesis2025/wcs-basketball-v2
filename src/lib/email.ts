import { devError, devLog } from "@/lib/security";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM || "WCS Basketball <onboarding@resend.dev>";
const RESEND_DEV_TO = process.env.RESEND_DEV_TO || "phronesis700@gmail.com"; // 👈 add this in .env.local

export async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    devLog("sendEmail: RESEND_API_KEY missing; skipping email");
    return;
  }

  // In dev with resend.dev sender → force to your inbox
  const isDev = process.env.NODE_ENV !== "production";
  const useSandboxSender = RESEND_FROM.includes("@resend.dev");
  const finalRecipient = isDev && useSandboxSender ? RESEND_DEV_TO : to;

  // Include the original intended recipient in the body for context (dev only)
  const wrappedHtml =
    isDev && useSandboxSender
      ? `<p style="font-size:12px;color:#666">[DEV] Intended recipient: ${to}</p>${html}`
      : html;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [finalRecipient],
        subject,
        html: wrappedHtml,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      devError("sendEmail failed", text); // matches your logging style:contentReference[oaicite:0]{index=0}
    } else {
      devLog("sendEmail OK", { to: finalRecipient, subject }); // matches your logging style:contentReference[oaicite:1]{index=1}
    }
  } catch (e) {
    devError("sendEmail exception", e); // matches your logging style:contentReference[oaicite:2]{index=2}
  }
}
