import { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";
import { devError } from "../../../../lib/security";
import {
  checkRateLimit,
  createSecureResponse,
  createErrorResponse,
} from "../../../../lib/securityMiddleware";
import { AuthenticationError, AuthorizationError, DatabaseError, handleApiError } from "../../../../lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = checkRateLimit(ip);

    if (!success) {
      return createErrorResponse(
        "Rate limit exceeded. Please try again later.",
        429,
        {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
        }
      );
    }

    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    // Fetch all players (including inactive) for admin management
    const query = supabaseAdmin!
      .from("players")
      .select(
        `
        *,
        teams(name, age_group, gender)
      `
      )
      .eq("is_deleted", false)
      .order("name", { ascending: true });

    const { data: players, error } = await query;

    // If is_active column doesn't exist, try without it
    if (error && error.message?.includes("is_active")) {
      const fallbackQuery = supabaseAdmin!
        .from("players")
        .select(
          `
          *,
          teams(name, age_group, gender)
        `
        )
        .eq("is_deleted", false)
        .order("name", { ascending: true });

      const { data: playersFallback, error: fallbackError } =
        await fallbackQuery;

      if (fallbackError) {
        throw new DatabaseError("Failed to fetch players", fallbackError);
      }

      return createSecureResponse(playersFallback || []);
    }

    if (error) {
      throw new DatabaseError("Failed to fetch players", error);
    }

    return createSecureResponse(players || []);
  } catch (error) {
    // For rate limiting, use createErrorResponse to maintain security headers
    // For other errors, use centralized handler but wrap with security headers
    const errorResponse = handleApiError(error, request);
    // Add security headers to the error response
    Object.entries({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    }).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    return errorResponse;
  }
}
