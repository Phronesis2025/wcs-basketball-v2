import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";

// GET - Fetch players for a coach's assigned teams
export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // First, get the coach's assigned teams
    const { data: teamCoaches, error: teamCoachesError } = await supabaseAdmin!
      .from("team_coaches")
      .select(
        `
        team_id,
        teams!inner(
          id,
          name
        )
      `
      )
      .eq("coach_id", userId);

    if (teamCoachesError) {
      devError("Failed to fetch coach teams:", teamCoachesError);
      return NextResponse.json(
        { error: "Failed to fetch coach teams" },
        { status: 500 }
      );
    }

    if (!teamCoaches || teamCoaches.length === 0) {
      devLog("Coach has no assigned teams");
      return NextResponse.json([]);
    }

    const teamIds = teamCoaches.map((tc) => tc.team_id);
    devLog("Coach team IDs:", teamIds);

    // Fetch players for the coach's teams
    const { data: players, error: playersError } = await supabaseAdmin!
      .from("players")
      .select(
        `
        *,
        teams(name, age_group, gender)
      `
      )
      .in("team_id", teamIds)
      .eq("is_deleted", false)
      .order("name", { ascending: true });

    // If is_active column doesn't exist, try without it
    if (playersError && playersError.message?.includes("is_active")) {
      devLog(
        "is_active column doesn't exist in players table, fetching without it"
      );

      const { data: playersFallback, error: fallbackError } =
        await supabaseAdmin!
          .from("players")
          .select(
            `
          *,
          teams(name, age_group, gender)
        `
          )
          .in("team_id", teamIds)
          .eq("is_deleted", false)
          .order("name", { ascending: true });

      if (fallbackError) {
        devError("Failed to fetch players:", fallbackError);
        return NextResponse.json(
          { error: "Failed to fetch players" },
          { status: 500 }
        );
      }

      // Add default is_active: true to all players
      players =
        playersFallback?.map((player) => ({ ...player, is_active: true })) ||
        [];
    } else if (playersError) {
      devError("Failed to fetch players:", playersError);
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 }
      );
    }

    devLog(`Found ${players?.length || 0} players for coach's teams`);
    return NextResponse.json(players || []);
  } catch (error) {
    devError("Coach players GET API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch players",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
