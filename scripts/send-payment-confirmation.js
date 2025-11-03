require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "WCS Basketball <onboarding@resend.dev>";
const RESEND_DEV_TO = process.env.RESEND_DEV_TO || "phronesis700@gmail.com";

async function sendPaymentConfirmationEmail(playerId) {
  try {
    // Fetch player data
    const { data: player, error: playerErr } = await supabaseAdmin
      .from("players")
      .select(`
        id,
        name,
        parent_email,
        parent_first_name,
        parent_last_name,
        team_id,
        teams(name)
      `)
      .eq("id", playerId)
      .single();

    if (playerErr || !player) {
      console.error("Error fetching player:", playerErr);
      return;
    }

    if (!player.parent_email) {
      console.error("No parent email found for player:", playerId);
      return;
    }

    // Fetch payment data
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("payments")
      .select("amount, payment_type")
      .eq("player_id", playerId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (payErr || !payment) {
      console.error("Error fetching payment:", payErr);
      return;
    }

    const amount = parseFloat(payment.amount) || 360;
    const paymentType = payment.payment_type || "annual";

    // Split player name
    const parts = (player.name || "").trim().split(/\s+/);
    const playerFirstName = parts[0] || "";
    const playerLastName = parts.slice(1).join(" ") || "";

    // Get team info (simplified - just team name for now)
    const teamName = player.teams?.name || undefined;

    // Build email HTML (simplified version)
    const parentGreeting = player.parent_first_name ? `Hi ${player.parent_first_name},` : "Hello,";
    const formattedAmount = `$${amount.toFixed(2)}`;
    const paymentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const subject = `Payment Confirmation - ${playerFirstName} ${playerLastName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Payment Confirmation</h2>
        <p>${parentGreeting}</p>
        <p>We've successfully received your payment for <strong>${playerFirstName} ${playerLastName}</strong>'s registration.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>Payment Type:</strong> ${paymentType === "annual" ? "Annual Membership" : paymentType}</p>
          <p><strong>Date:</strong> ${paymentDate}</p>
          ${teamName ? `<p><strong>Team:</strong> ${teamName}</p>` : ""}
        </div>

        <p><strong>${playerFirstName}</strong> is now officially registered and ready to start their journey!</p>
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>WCS Basketball Team</p>
      </div>
    `;

    // Send email via Resend
    const isDev = process.env.NODE_ENV !== "production";
    const useSandboxSender = RESEND_FROM.includes("@resend.dev");
    const finalRecipient = isDev && useSandboxSender ? RESEND_DEV_TO : player.parent_email;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [finalRecipient],
        subject,
        html: isDev && useSandboxSender 
          ? `<p style="font-size:12px;color:#666">[DEV] Intended recipient: ${player.parent_email}</p>${html}`
          : html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Failed to send email:", text);
    } else {
      const data = await response.json();
      console.log("✅ Payment confirmation email sent successfully!");
      console.log("   To:", finalRecipient);
      console.log("   Subject:", subject);
      console.log("   Resend ID:", data.id);
    }
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
  }
}

// Get player ID from command line args
const playerId = process.argv[2];

if (!playerId) {
  console.error("Usage: node scripts/send-payment-confirmation.js <playerId>");
  process.exit(1);
}

sendPaymentConfirmationEmail(playerId);

