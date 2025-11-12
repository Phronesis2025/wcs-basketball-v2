import { NextRequest, NextResponse } from "next/server";
import { verifyZipCodeInRadius } from "@/lib/zipCodeVerification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCode } = body;

    if (!zipCode || typeof zipCode !== "string") {
      return NextResponse.json(
        { error: "Zip code is required" },
        { status: 400 }
      );
    }

    const result = await verifyZipCodeInRadius(zipCode.trim());

    return NextResponse.json(result);
  } catch (error) {
    console.error("Zip code verification API error:", error);
    return NextResponse.json(
      {
        allowed: false,
        error: "Unable to verify location. Please try again.",
      },
      { status: 500 }
    );
  }
}

