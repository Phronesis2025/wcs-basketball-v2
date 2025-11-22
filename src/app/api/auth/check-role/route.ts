import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Get the user ID from the request headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ValidationError("User ID required");
    }

    devLog("Checking user role for:", userId);

    // Get user role from database
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("role, password_reset")
      .eq("id", userId)
      .single();

    // If no data (e.g., parent users not in users table), return null role
    if (error || !data) {
      if (error) {
        devLog("User not in users table (may be a parent user)", error.message);
      }
      // Return null role for users not in the users table (like parent users)
      return formatSuccessResponse({
        role: null,
        password_reset: null,
      });
    }

    return formatSuccessResponse({
      role: data.role,
      password_reset: data.password_reset,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
