import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    devLog("Fetching profile data for user:", userId);

    // Fetch coach data (handle cases where multiple rows exist for the same user)
    const { data: coachRows, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (coachError) {
      throw new DatabaseError("Failed to fetch coach data", coachError);
    }

    const coachData = Array.isArray(coachRows) ? coachRows[0] : coachRows;
    if (!coachData) {
      throw new NotFoundError("Coach not found for this user");
    }

    // Fetch login stats from login_logs (authoritative source)
    const { data: loginLogs, error: loginError } = await supabaseAdmin!
      .from("login_logs")
      .select("login_at, success")
      .eq("user_id", userId)
      .eq("success", true)
      .order("login_at", { ascending: false });

    if (loginError) {
      devError("Error fetching login logs:", loginError);
    }

    const login_count = loginLogs?.length || 0;
    const last_login_at = loginLogs && loginLogs.length > 0 ? loginLogs[0].login_at : null;

    // Fetch last_active_at from users table (may be null if not yet recorded)
    let last_active_at: string | null = null;
    const { data: ua, error: uaErr } = await supabaseAdmin!
      .from("users")
      .select("last_active_at")
      .eq("id", userId)
      .limit(1);
    if (!uaErr && ua && Array.isArray(ua) && ua[0]) {
      last_active_at = ua[0].last_active_at ?? null;
    }
    // Note: created_at kept null here; can be added from auth if needed

    // Fetch associated teams
    const { data: teamsData, error: teamsError } = await supabaseAdmin!
      .from("team_coaches")
      .select(
        `
        teams (
          id,
          name,
          logo_url,
          age_group,
          gender
        )
      `
      )
      .eq("coach_id", coachData.id);

    if (teamsError) {
      devError("Error fetching teams data:", teamsError);
      // Don't fail the request if teams can't be fetched
    }

    const teams = teamsData?.map((tc: any) => tc.teams) || [];

    // Fetch activity metrics
    const [schedulesResult, updatesResult, drillsResult, messagesResult] =
      await Promise.all([
        // Count schedules created by this coach
        supabaseAdmin!
          .from("schedules")
          .select("id", { count: "exact" })
          .eq("created_by", userId)
          .is("deleted_at", null),

        // Count team updates created by this coach
        supabaseAdmin!
          .from("team_updates")
          .select("id", { count: "exact" })
          .eq("created_by", userId)
          .is("deleted_at", null),

        // Count practice drills created by this coach
        supabaseAdmin!
          .from("practice_drills")
          .select("id", { count: "exact" })
          .eq("created_by", userId),

        // Count coach messages (posts and replies)
        supabaseAdmin!
          .from("coach_messages")
          .select("id", { count: "exact" })
          .eq("author_id", userId)
          .is("deleted_at", null),
      ]);

    // Get coach message replies (messages where this coach is the author of a reply)
    const { count: messageReplies } = await supabaseAdmin!
      .from("coach_message_replies")
      .select("id", { count: "exact" })
      .eq("author_id", userId)
      .is("deleted_at", null);

    const profileData = {
      ...coachData,
      login_count,
      last_login_at,
      last_active_at,
      teams,
      schedules_created: schedulesResult.count || 0,
      updates_created: updatesResult.count || 0,
      drills_created: drillsResult.count || 0,
      messages_posts: messagesResult.count || 0,
      messages_replies: messageReplies || 0,
    };

    devLog("Profile data fetched successfully");

    return formatSuccessResponse(profileData);
  } catch (error) {
    return handleApiError(error, request);
  }
}
