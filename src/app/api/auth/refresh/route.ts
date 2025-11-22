import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, AuthenticationError, ApiError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const { refresh_token } = await request.json();

    if (!refresh_token) {
      throw new ValidationError("Refresh token required");
    }

    devLog("Refreshing token...");

    // Use Supabase to refresh the session
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      throw new AuthenticationError("Failed to refresh token");
    }

    if (!data.session) {
      throw new AuthenticationError("No session returned from refresh");
    }

    devLog("Token refreshed successfully");

    return formatSuccessResponse({
      session: data.session,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
