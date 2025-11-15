import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
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

    // Check if file exists
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list(path.split("/").slice(0, -1).join("/") || "", {
        search: path.split("/").pop() || "",
      });

    if (error) {
      throw new DatabaseError("Failed to check file existence", error);
    }

    const fileName = path.split("/").pop() || "";
    const fileExists = data?.some((file) => file.name === fileName) || false;

    return formatSuccessResponse({
      exists: fileExists,
      path,
      bucket,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

