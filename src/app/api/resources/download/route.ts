import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get user ID from headers (for logging, but allow both admins and coaches)
    const userId = request.headers.get("x-user-id");

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Bucket and path parameters are required" },
        { status: 400 }
      );
    }

    // Validate bucket name (security check)
    const allowedBuckets = ["resources", "images"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        { error: "Invalid bucket name" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      bucket,
      path,
    });
  } catch (error) {
    devError("Download file API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate download URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

