import { NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseClient";
import { devError } from "../../../../../../lib/security";
import {
  checkRateLimit,
  createSecureResponse,
  createErrorResponse,
} from "../../../../../../lib/securityMiddleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Await params in Next.js 15
    const { id: coachId } = await params;

    // Get coach information including user_id
    const { data: coach, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("id, email, first_name, last_name, user_id")
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      return createErrorResponse("Coach not found", 404);
    }

    if (!coach.user_id) {
      return createErrorResponse("Coach not linked to user account", 404);
    }

    // Get login statistics for this coach using the user_id
    const { data: loginLogs, error: loginError } = await supabaseAdmin!
      .from("login_logs")
      .select("login_at, success")
      .eq("user_id", coach.user_id)
      .eq("success", true)
      .order("login_at", { ascending: false });

    if (loginError) {
      devError("Error fetching login statistics:", loginError);
      return createErrorResponse("Failed to fetch login statistics", 500);
    }

    // Calculate statistics from the login logs
    const totalLogins = loginLogs?.length || 0;
    const lastLogin =
      loginLogs && loginLogs.length > 0 ? loginLogs[0].login_at : null;
    const firstLogin =
      loginLogs && loginLogs.length > 0
        ? loginLogs[loginLogs.length - 1].login_at
        : null;

    const stats = {
      total_logins: totalLogins,
      last_login_at: lastLogin,
      first_login_at: firstLogin,
      is_active: totalLogins > 0,
    };

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
