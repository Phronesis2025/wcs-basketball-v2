import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ValidationError, ApiError, NotFoundError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

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
        throw new NotFoundError("Quarterly price not configured");
      }

      // Fetch the price from Stripe
      const price = await stripe.prices.retrieve(PRICE_QUARTERLY);
      
      // Convert from cents to dollars
      const amount = (price.unit_amount || 0) / 100;

      return formatSuccessResponse({ amount });
    }

    throw new ValidationError("Invalid price type. Use 'quarterly'.");
  } catch (error) {
    return handleApiError(error);
  }
}

