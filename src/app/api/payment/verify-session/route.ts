import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import { getAdminPaymentConfirmationEmail } from "@/lib/emailTemplates";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const ADMIN_NOTIFICATIONS_TO = (process.env.ADMIN_NOTIFICATIONS_TO || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Helper function to split full name into first and last name
function splitFullName(fullName?: string | null) {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts.shift()!;
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

// Helper to notify admins using BCC (maintains privacy)
// If only one admin: sends directly to that email
// If multiple admins: sends to first email, BCC to others
async function notifyAdmins(
  subject: string,
  html: string,
  options?: { bcc?: string[] }
) {
  if (ADMIN_NOTIFICATIONS_TO.length === 0) return;
  try {
    const firstAdmin = ADMIN_NOTIFICATIONS_TO[0];
    const otherAdmins =
      ADMIN_NOTIFICATIONS_TO.length > 1
        ? ADMIN_NOTIFICATIONS_TO.slice(1)
        : undefined;
    
    // Merge any additional BCC from options
    const bcc = options?.bcc
      ? [...(otherAdmins || []), ...options.bcc]
      : otherAdmins;

    await sendEmail(firstAdmin, subject, html, {
      bcc: bcc && bcc.length > 0 ? bcc : undefined,
    });

    devLog("verify-session: admin notification sent", {
      to: firstAdmin,
      bcc: bcc,
      totalAdmins: ADMIN_NOTIFICATIONS_TO.length,
    });
  } catch (err) {
    devError("verify-session: notifyAdmins failed", err);
  }
}

/**
 * Verify Stripe checkout session and update payment status
 * This allows localhost testing where webhooks don't reach the server
 * 
 * GET /api/payment/verify-session?session_id=cs_test_xxx&player_id=xxx
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const playerId = searchParams.get("player_id");

    if (!sessionId && !playerId) {
      return NextResponse.json(
        { error: "Either session_id or player_id is required" },
        { status: 400 }
      );
    }

    let paymentRow;
    let sessionIdToVerify: string;

    // If we have a player_id but no session_id, find the latest payment for that player
    if (playerId && !sessionId) {
      const { data: payment, error: payErr } = await supabaseAdmin!
        .from("payments")
        .select("id, player_id, stripe_payment_id, status, payment_type")
        .eq("player_id", playerId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (payErr) {
        devError("verify-session: payment lookup error", payErr);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!payment || !payment.stripe_payment_id) {
        return NextResponse.json(
          { error: "No pending payment found for this player" },
          { status: 404 }
        );
      }

      paymentRow = payment;
      sessionIdToVerify = payment.stripe_payment_id;
    } else if (sessionId) {
      // Find payment by session_id
      const { data: payment, error: payErr } = await supabaseAdmin!
        .from("payments")
        .select("id, player_id, stripe_payment_id, status, payment_type")
        .eq("stripe_payment_id", sessionId)
        .maybeSingle();

      if (payErr) {
        devError("verify-session: payment lookup error", payErr);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!payment) {
        return NextResponse.json(
          { error: "No payment found with this session ID" },
          { status: 404 }
        );
      }

      paymentRow = payment;
      sessionIdToVerify = sessionId;
    } else {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // If already paid, return success
    if (paymentRow.status === "paid") {
      return NextResponse.json({
        success: true,
        already_updated: true,
        payment_id: paymentRow.id,
        player_id: paymentRow.player_id,
      });
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionIdToVerify);

    devLog("verify-session: Stripe session retrieved", {
      sessionId: session.id,
      status: session.payment_status,
      amount: session.amount_total,
    });

    // Check if payment was successful
    if (session.payment_status === "paid" && session.status === "complete") {
      // Update payment status
      const amount = (session.amount_total ?? 0) / 100;

      const { error: payUpdErr } = await supabaseAdmin!
        .from("payments")
        .update({ status: "paid" })
        .eq("id", paymentRow.id);

      if (payUpdErr) {
        devError("verify-session: update payment failed", payUpdErr);
        return NextResponse.json(
          { error: "Failed to update payment status" },
          { status: 500 }
        );
      }

      // Update player status to active
      const { error: playerUpdErr } = await supabaseAdmin!
        .from("players")
        .update({ status: "active" })
        .eq("id", paymentRow.player_id);

      if (playerUpdErr) {
        devError("verify-session: update player failed", playerUpdErr);
        // Don't fail the whole request if player update fails
      }

      devLog("verify-session: Payment and player status updated", {
        payment_id: paymentRow.id,
        player_id: paymentRow.player_id,
      });

      // Send admin payment confirmation email (same logic as webhook handler)
      if (ADMIN_NOTIFICATIONS_TO.length > 0) {
        try {
          // Fetch player data for admin email
          const { data: player, error: playerErr } = await supabaseAdmin!
            .from("players")
            .select(
              "id, name, parent_email, parent_first_name, parent_last_name, parent_id, team_id, teams(name)"
            )
            .eq("id", paymentRow.player_id)
            .single();

          if (!playerErr && player) {
            const { firstName: playerFirstName, lastName: playerLastName } =
              splitFullName(player.name);

            // Get parent name for admin email
            let parentName = "";
            try {
              if (player.parent_id) {
                const { data: parent } = await supabaseAdmin
                  .from("parents")
                  .select("first_name, last_name")
                  .eq("id", player.parent_id)
                  .single();
                if (parent) {
                  parentName = `${parent.first_name || ""} ${parent.last_name || ""}`.trim() || player.parent_email || "Parent";
                }
              }
            } catch (e) {
              devError("verify-session: error fetching parent name for admin email", e);
              parentName = player.parent_email || "Parent";
            }

            const adminEmailData = getAdminPaymentConfirmationEmail({
              playerFirstName,
              playerLastName,
              parentName: parentName || player.parent_email || "Parent",
              parentEmail: player.parent_email || "",
              teamName: player.teams?.name || undefined,
              amount: amount,
              paymentType: paymentRow.payment_type || "annual",
              paymentDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              playerId: player.id,
              paymentId: paymentRow.id,
            });

            await notifyAdmins(
              adminEmailData.subject,
              adminEmailData.html
            );
            devLog("verify-session: admin payment confirmation email sent");
          } else if (playerErr) {
            devError("verify-session: failed to fetch player for admin email", playerErr);
          }
        } catch (adminEmailErr) {
          devError("verify-session: failed to send admin payment notification", adminEmailErr);
        }
      }

      return NextResponse.json({
        success: true,
        updated: true,
        payment_id: paymentRow.id,
        player_id: paymentRow.player_id,
        amount,
      });
    } else {
      // Payment not completed yet
      return NextResponse.json({
        success: false,
        payment_status: session.payment_status,
        session_status: session.status,
        message: "Payment not completed yet",
      });
    }
  } catch (error: any) {
    devError("verify-session: exception", error);
    return NextResponse.json(
      { error: "Server error verifying session", details: error.message },
      { status: 500 }
    );
  }
}

