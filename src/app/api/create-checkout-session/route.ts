import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, NotFoundError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

// --- Env + Stripe setup ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL; // price_... (one-time $360)
const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY; // price_... (recurring $30/mo)
const PRICE_QUARTERLY = process.env.STRIPE_PRICE_QUARTERLY; // price_... (quarterly payment)

// Determine base URL - always use custom domain in production
function getBaseUrl(): string {
  // In production, always use the custom domain (never use Vercel URLs)
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
  
  if (isProduction) {
    // In production, always use the custom domain
    return "https://www.wcsbasketball.site";
  }
  
  // Development: use NEXT_PUBLIC_BASE_URL or localhost
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

const BASE_URL = getBaseUrl();

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
// Quarterly price is optional - only validate if provided
if (PRICE_QUARTERLY) {
  ensurePriceId("STRIPE_PRICE_QUARTERLY", PRICE_QUARTERLY);
}

// ---- POST: Create Checkout Session ----
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player_id, payment_type, custom_amount, from } = body || {};

    if (!player_id || !payment_type) {
      throw new ValidationError("player_id and payment_type are required");
    }

    // Fetch player (only fields we actually use)
    const { data: player, error: playerErr } = await supabaseAdmin
      .from("players")
      .select("id, parent_email, stripe_customer_id")
      .eq("id", player_id)
      .single();

    if (playerErr || !player) {
      throw new NotFoundError("Player not found");
    }

    if (!player.parent_email) {
      throw new ValidationError("Player is missing parent_email", "parent_email");
    }

    // Create or reuse Stripe Customer
    // Note: We do NOT use Stripe's receipt/invoice emails - we send via Resend in webhook
    let customerId = player.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: player.parent_email,
      });
      customerId = customer.id;
    }

    if (!player.stripe_customer_id) {
      await supabaseAdmin
        .from("players")
        .update({ stripe_customer_id: customerId })
        .eq("id", player_id);
    }

    // Redirect URLs
    const successUrl = `${BASE_URL}/payment/success?player=${player_id}${from ? `&from=${encodeURIComponent(from)}` : ""}`;
    const cancelUrl = `${BASE_URL}/payment/${player_id}?canceled=1`;

    // Build session based on payment_type
    let session: Stripe.Checkout.Session;

    if (payment_type === "annual") {
      // One-time payment
      // Note: We do NOT set receipt_email - we send emails via Resend in the webhook
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: [{ price: PRICE_ANNUAL!, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        // receipt_email removed - we use Resend instead
      });
    } else if (payment_type === "monthly") {
      // Subscription
      // Note: Stripe will send invoice emails automatically for subscriptions
      // To disable: Go to Stripe Dashboard → Settings → Billing → Customer emails
      // OR update subscription after creation to disable emails
      // We also send our own email via Resend in the webhook
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: PRICE_MONTHLY!, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } else if (payment_type === "quarterly") {
      // Quarterly payment - check if price is configured
      if (!PRICE_QUARTERLY) {
        throw new ApiError("Quarterly payment option is not configured", 400);
      }
      // Check if quarterly is a subscription or one-time payment
      // We'll fetch the price to determine this
      const price = await stripe.prices.retrieve(PRICE_QUARTERLY);
      const isSubscription = price.type === "recurring";
      
      // Note: We do NOT set receipt_email - we send emails via Resend in the webhook
      // For subscriptions, Stripe will send invoice emails automatically unless disabled in Dashboard
      session = await stripe.checkout.sessions.create({
        mode: isSubscription ? "subscription" : "payment",
        customer: customerId,
        line_items: [{ price: PRICE_QUARTERLY, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        // receipt_email removed - we use Resend instead
      });
    } else if (payment_type === "custom") {
      const cents = Math.round(Number(custom_amount || 0) * 100);
      if (!cents || cents < 50) {
        throw new ValidationError("custom_amount must be at least $0.50", "custom_amount");
      }

      // Note: We do NOT set receipt_email - we send emails via Resend in the webhook
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
        // receipt_email removed - we use Resend instead
      });
    } else {
      throw new ValidationError("Invalid payment_type. Use 'annual' | 'monthly' | 'quarterly' | 'custom'.", "payment_type");
    }

    // Record pending payment
    // For quarterly, fetch the actual amount from Stripe
    let amount = 0;
    if (payment_type === "annual") {
      amount = 360;
    } else if (payment_type === "monthly") {
      amount = 30;
    } else if (payment_type === "quarterly") {
      // Fetch the actual quarterly price amount from Stripe
      if (PRICE_QUARTERLY) {
        try {
          const price = await stripe.prices.retrieve(PRICE_QUARTERLY);
          amount = (price.unit_amount || 0) / 100; // Convert from cents to dollars
        } catch (e) {
          devError("create-checkout-session: failed to fetch quarterly price", e);
          amount = 90; // Fallback default
        }
      } else {
        amount = 90; // Fallback default
      }
    } else {
      amount = Number(custom_amount || 0);
    }

    await supabaseAdmin.from("payments").insert([
      {
        player_id,
        stripe_payment_id: session.id, // track Checkout Session id
        amount,
        payment_type,
        status: "pending",
      },
    ]);

    devLog("create-checkout-session OK", {
      player_id,
      payment_type,
      session: session.id,
    });
    return formatSuccessResponse({ url: session.url });
  } catch (e: any) {
    return handleApiError(e);
  }
}
