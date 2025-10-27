import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// --- Env + Stripe setup ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const ADMIN_NOTIFICATIONS_TO = (process.env.ADMIN_NOTIFICATIONS_TO || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

// Helper to notify admins (safe no-op if list empty)
async function notifyAdmins(subject: string, html: string) {
  if (ADMIN_NOTIFICATIONS_TO.length === 0) return;
  try {
    await Promise.all(
      ADMIN_NOTIFICATIONS_TO.map((to) => sendEmail(to, subject, html))
    );
  } catch (err) {
    // keep logs consistent with project
    devError("notifyAdmins failed", err);
  }
}

export async function POST(req: Request) {
  let event: Stripe.Event;

  // Stripe requires the raw body for signature verification
  const signature = req.headers.get("stripe-signature") as string;
  const rawBody = await req.text();

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    devError("stripe-webhook signature verify error", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      /**
       * One-time payments and initial subscription checkout
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Find our pending row by Checkout Session id
        const { data: paymentRow, error: payFetchErr } = await supabaseAdmin!
          .from("payments")
          .select("id, player_id, payment_type")
          .eq("stripe_payment_id", session.id)
          .single();

        if (payFetchErr) {
          devError("webhook: fetch pending payment failed", payFetchErr);
        }

        if (paymentRow) {
          // Mark paid + activate player
          const amount = (session.amount_total ?? 0) / 100;

          const { error: payUpdErr } = await supabaseAdmin!
            .from("payments")
            .update({ status: "paid" })
            .eq("id", paymentRow.id);
          if (payUpdErr)
            devError("webhook: update payment paid failed", payUpdErr);

          const { error: playerUpdErr } = await supabaseAdmin!
            .from("players")
            .update({ status: "active" })
            .eq("id", paymentRow.player_id);
          if (playerUpdErr)
            devError("webhook: update player active failed", playerUpdErr);

          // Optional: notify admins
          try {
            const { data: player } = await supabaseAdmin!
              .from("players")
              .select("first_name, last_name, parent_email")
              .eq("id", paymentRow.player_id)
              .single();

            const subject = `WCS Payment received - $${amount.toFixed(2)}`;
            const html = `
              <p><strong>Payment received</strong></p>
              <p>Player: ${player?.first_name || ""} ${
              player?.last_name || ""
            }</p>
              <p>Parent: ${player?.parent_email || ""}</p>
              <p>Amount: $${amount.toFixed(2)}</p>
              <p>Type: ${paymentRow.payment_type}</p>
              <p>Session: ${session.id}</p>
            `;
            await notifyAdmins(subject, html);
          } catch (e) {
            devError("webhook: admin notify error", e);
          }
        } else {
          // If no pending payment row found (edge case), try to link by customer for subscriptions/custom flows
          devLog("webhook: no matching pending payment row", {
            session: session.id,
          });
        }

        break;
      }

      /**
       * Recurring subscription invoices (monthly renewals)
       */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const amount = (invoice.amount_paid ?? 0) / 100;
        const customerId = (invoice.customer as string) || null;

        if (!customerId) break;

        // Find the player by stored stripe_customer_id
        const { data: player, error: findPlayerErr } = await supabaseAdmin!
          .from("players")
          .select("id, first_name, last_name, parent_email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (findPlayerErr || !player) {
          devError("webhook: could not find player for invoice.customer", {
            findPlayerErr,
            customerId,
          });
          break;
        }

        // Insert a new paid payment record for the renewal
        const { error: insErr } = await supabaseAdmin!.from("payments").insert([
          {
            player_id: player.id,
            stripe_payment_id: invoice.id, // store invoice id
            amount,
            payment_type: "monthly",
            status: "paid",
          },
        ]);
        if (insErr) devError("webhook: insert renewal payment failed", insErr);

        // Ensure player remains active
        const { error: updErr } = await supabaseAdmin!
          .from("players")
          .update({ status: "active" })
          .eq("id", player.id);
        if (updErr)
          devError("webhook: set player active on renewal failed", updErr);

        // Notify admins on renewal
        const subject = `WCS Subscription renewal - $${amount.toFixed(2)}`;
        const html = `
          <p><strong>Subscription renewal paid</strong></p>
          <p>Player: ${player.first_name} ${player.last_name}</p>
          <p>Parent: ${player.parent_email}</p>
          <p>Amount: $${amount.toFixed(2)}</p>
          <p>Invoice: ${invoice.id}</p>
        `;
        await notifyAdmins(subject, html);

        break;
      }

      // You can add more cases as needed (payment_failed, etc.)
      default: {
        // no-op
        break;
      }
    }

    devLog("stripe-webhook handled", { type: event.type });
    return NextResponse.json({ received: true });
  } catch (e: any) {
    devError("stripe-webhook handler error", e);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}
