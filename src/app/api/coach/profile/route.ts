import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    devLog("Fetching profile data for user:", userId);

    // Fetch coach data
    const { data: coachData, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (coachError) {
      devError("Error fetching coach data:", coachError);
      return NextResponse.json(
        { error: "Failed to fetch coach data" },
        { status: 500 }
      );
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("login_count, last_login_at, last_password_reset, created_at")
      .eq("id", userId)
      .single();

    if (userError) {
      devError("Error fetching user data:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    // Debug login data
    devLog("🔍 Profile API - User login data:", {
      userId,
      login_count: userData?.login_count,
      last_login_at: userData?.last_login_at,
      created_at: userData?.created_at,
    });

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
      ...userData,
      teams,
      schedules_created: schedulesResult.count || 0,
      updates_created: updatesResult.count || 0,
      drills_created: drillsResult.count || 0,
      messages_posts: messagesResult.count || 0,
      messages_replies: messageReplies || 0,
    };

    devLog("Profile data fetched successfully");

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    devError("Profile API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch profile data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
