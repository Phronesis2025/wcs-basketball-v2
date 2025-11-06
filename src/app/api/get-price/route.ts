import { NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICE_QUARTERLY = process.env.STRIPE_PRICE_QUARTERLY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "quarterly") {
      if (!PRICE_QUARTERLY) {
        return NextResponse.json(
          { error: "Quarterly price not configured" },
          { status: 404 }
        );
      }

      // Fetch the price from Stripe
      const price = await stripe.prices.retrieve(PRICE_QUARTERLY);
      
      // Convert from cents to dollars
      const amount = (price.unit_amount || 0) / 100;

      return NextResponse.json({ amount });
    }

    return NextResponse.json(
      { error: "Invalid price type" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch price" },
      { status: 500 }
    );
  }
}

