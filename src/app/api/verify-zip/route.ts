import { NextRequest, NextResponse } from "next/server";
import { verifyZipCodeInRadius } from "@/lib/zipCodeVerification";
import { ValidationError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zipCode } = body;

    if (!zipCode || typeof zipCode !== "string") {
      throw new ValidationError("Zip code is required", "zipCode");
    }

    const result = await verifyZipCodeInRadius(zipCode.trim());

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, request);
  }
}

