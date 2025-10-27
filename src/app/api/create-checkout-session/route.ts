import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

// --- Env + Stripe setup ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL; // price_... (one-time $360)
const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY; // price_... (recurring $30/mo)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Validate that an env var looks like a Stripe Price ID
function ensurePriceId(name: string, val?: string | null) {
  if (!val) throw new Error(`${name} missing`);
  if (!val.startsWith("price_")) {
    throw new Error(
      `${name} must be a Stripe Price ID (starts with "price_"), not "${val}"`
    );
  }
}

ensurePriceId("STRIPE_PRICE_ANNUAL", PRICE_ANNUAL!);
ensurePriceId("STRIPE_PRICE_MONTHLY", PRICE_MONTHLY!);

// ---- POST: Create Checkout Session ----
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player_id, payment_type, custom_amount } = body || {};

    if (!player_id || !payment_type) {
      return NextResponse.json(
        { error: "player_id and payment_type are required" },
        { status: 400 }
      );
    }

    // Fetch player (only fields we actually use)
    const { data: player, error: playerErr } = await supabaseAdmin
      .from("players")
      .select("id, parent_email, stripe_customer_id")
      .eq("id", player_id)
      .single();

    if (playerErr || !player) {
      devError("create-checkout-session: player fetch error", playerErr);
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (!player.parent_email) {
      return NextResponse.json(
        { error: "Player is missing parent_email" },
        { status: 400 }
      );
    }

    // Create or reuse Stripe Customer (ensures Stripe can send receipts/invoices)
    const customerId = player.stripe_customer_id
      ? player.stripe_customer_id
      : (await stripe.customers.create({ email: player.parent_email })).id;

    if (!player.stripe_customer_id) {
      await supabaseAdmin
        .from("players")
        .update({ stripe_customer_id: customerId })
        .eq("id", player_id);
    }

    // Redirect URLs
    const successUrl = `${BASE_URL}/payment/success?player=${player_id}`;
    const cancelUrl = `${BASE_URL}/payment/${player_id}?canceled=1`;

    // Build session based on payment_type
    let session: Stripe.Checkout.Session;

    if (payment_type === "annual") {
      // One-time payment
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: [{ price: PRICE_ANNUAL!, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_intent_data: {
          receipt_email: player.parent_email,
        },
      });
    } else if (payment_type === "monthly") {
      // Subscription (Stripe sends invoices per email settings)
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: PRICE_MONTHLY!, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else if (payment_type === "custom") {
      const cents = Math.round(Number(custom_amount || 0) * 100);
      if (!cents || cents < 50) {
        return NextResponse.json(
          { error: "custom_amount must be at least $0.50" },
          { status: 400 }
        );
      }

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              product_data: { name: "Custom Payment" },
              unit_amount: cents,
            },
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_intent_data: {
          receipt_email: player.parent_email,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid payment_type. Use 'annual' | 'monthly' | 'custom'." },
        { status: 400 }
      );
    }

    // Record pending payment
    await supabaseAdmin.from("payments").insert([
      {
        player_id,
        stripe_payment_id: session.id, // track Checkout Session id
        amount:
          payment_type === "annual"
            ? 360
            : payment_type === "monthly"
            ? 30
            : Number(custom_amount || 0),
        payment_type,
        status: "pending",
      },
    ]);

    devLog("create-checkout-session OK", {
      player_id,
      payment_type,
      session: session.id,
    });
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    devError("create-checkout-session exception", e);
    return NextResponse.json(
      { error: "Server error creating checkout session" },
      { status: 500 }
    );
  }
}
