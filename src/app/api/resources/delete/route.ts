import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId || !supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check if user is admin
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    const adminCheck = await isAdmin(userId);
    if (!adminCheck) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (!bucket || !path) {
      return NextResponse.json(
        { error: "Bucket and path parameters are required" },
        { status: 400 }
      );
    }

    // Validate bucket name
    const allowedBuckets = ["resources", "images"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        { error: "Invalid bucket name" },
        { status: 400 }
      );
    }

    // Delete the file
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      devError("Failed to delete file:", error);
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 }
      );
    }

    devLog("Successfully deleted file:", { bucket, path });

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    devError("Delete file API error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

