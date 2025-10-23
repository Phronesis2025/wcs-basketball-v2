import { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseClient";
import { devError } from "../../../../../../lib/security";
import { checkRateLimit, createSecureResponse, createErrorResponse } from "../../../../../../lib/securityMiddleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const coachId = params.id;

    // Get coach information
    const { data: coach, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("id, email, first_name, last_name")
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      return createErrorResponse("Coach not found", 404);
    }

    // Get login statistics for this coach
    const { data: loginStats, error: loginError } = await supabaseAdmin!
      .from("login_statistics")
      .select("*")
      .eq("email", coach.email)
      .single();

    if (loginError && loginError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is acceptable
      devError("Error fetching login statistics:", loginError);
      return createErrorResponse("Failed to fetch login statistics", 500);
    }

    // If no login statistics found, return default values
    const defaultStats = {
      total_logins: 0,
      last_login_at: null,
      first_login_at: null,
      is_active: true,
    };

    const stats = loginStats || defaultStats;

    return createSecureResponse({
      coach: {
        id: coach.id,
        email: coach.email,
        first_name: coach.first_name,
        last_name: coach.last_name,
      },
      loginStats: stats,
    });
  } catch (error) {
    devError("Unexpected error in /api/admin/coaches/[id]/login-stats:", error);
    return createErrorResponse("Failed to fetch coach login statistics", 500);
  }
}
