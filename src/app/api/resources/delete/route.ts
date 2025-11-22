import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, AuthenticationError, AuthorizationError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

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
      throw new ApiError("Server configuration error", 500);
    }

    // Check if user is admin
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError("User ID required");
    }

    const adminCheck = await isAdmin(userId);
    if (!adminCheck) {
      throw new AuthorizationError("Unauthorized - Admin access required");
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");
    const path = searchParams.get("path");

    if (!bucket || !path) {
      throw new ValidationError("Bucket and path parameters are required");
    }

    // Validate bucket name
    const allowedBuckets = ["resources", "images"];
    if (!allowedBuckets.includes(bucket)) {
      throw new ValidationError("Invalid bucket name");
    }

    // Delete the file
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new DatabaseError("Failed to delete file", error);
    }

    devLog("Successfully deleted file:", { bucket, path });

    return formatSuccessResponse({
      message: "File deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

