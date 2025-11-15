import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Get user ID from headers (for logging, but allow both admins and coaches)
    const userId = request.headers.get("x-user-id");

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (!bucket || !path) {
      throw new ValidationError("Bucket and path parameters are required");
    }

    // Validate bucket name (security check)
    const allowedBuckets = ["resources", "images"];
    if (!allowedBuckets.includes(bucket)) {
      throw new ValidationError("Invalid bucket name");
    }

    // Get public URL for download
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    devLog("Download URL generated:", {
      bucket,
      path,
      userId: userId || "unknown",
    });

    return formatSuccessResponse({
      url: urlData.publicUrl,
      bucket,
      path,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

