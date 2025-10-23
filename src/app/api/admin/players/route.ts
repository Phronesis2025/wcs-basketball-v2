import { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";
import { devError } from "../../../../lib/security";
import {
  checkRateLimit,
  createSecureResponse,
  createErrorResponse,
} from "../../../../lib/securityMiddleware";

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
      return createErrorResponse("Authentication required", 401);
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return createErrorResponse("Admin access required", 403);
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
        devError("Error fetching players:", fallbackError);
        return createErrorResponse("Failed to fetch players", 500);
      }

      return createSecureResponse(playersFallback || []);
    }

    if (error) {
      devError("Error fetching players:", error);
      return createErrorResponse("Failed to fetch players", 500);
    }

    return createSecureResponse(players || []);
  } catch (error) {
    devError("Unexpected error in /api/admin/players:", error);
    return createErrorResponse("Failed to fetch players", 500);
  }
}
