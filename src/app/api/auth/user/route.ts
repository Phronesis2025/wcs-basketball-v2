import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { AuthenticationError, ApiError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Get the session token from the request headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("No authorization token provided");
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the token and get user information
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Check if token is expired - this is expected during sign-out
      const isExpiredToken = error?.message?.includes("expired") || 
                            error?.message?.includes("invalid claims");
      
      // Only log errors if it's not an expected expired token scenario
      // (during normal operation, expired tokens should be handled silently)
      if (!isExpiredToken) {
        devLog("Token received (first 50 chars):", token.substring(0, 50) + "...");
        devLog("Token length:", token.length);
        devError("User verification error:", error);
        devError("Token validation failed. Error details:", {
          error: error?.message,
          status: error?.status,
          name: error?.name,
        });
      }
      
      throw new AuthenticationError("Invalid or expired token");
    }

    devLog("User verified successfully:", user.id);

    return formatSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
