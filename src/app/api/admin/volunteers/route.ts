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

    // Fetch all pending volunteer applications
    // Join with teams table to get child team name if applicable
    const { data: volunteers, error } = await supabaseAdmin!
      .from("coach_volunteer_applications")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        zip,
        role,
        has_child_on_team,
        child_name,
        child_team_id,
        experience,
        availability,
        why_interested,
        background_check_consent,
        notes,
        status,
        created_at,
        updated_at,
        teams(name, age_group, gender)
      `
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      devError("Error fetching volunteers:", error);
      return createErrorResponse("Failed to fetch volunteers", 500);
    }

    return createSecureResponse(volunteers || []);
  } catch (error) {
    devError("Unexpected error in /api/admin/volunteers:", error);
    return createErrorResponse("Failed to fetch volunteers", 500);
  }
}

