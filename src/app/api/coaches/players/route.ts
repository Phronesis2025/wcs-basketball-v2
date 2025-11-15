import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";
import { AuthenticationError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

// GET - Fetch players for a coach's assigned teams
export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // First, get the coach's ID from the coaches table using the user_id
    const { data: coachRows, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (coachError) {
      throw new DatabaseError("Failed to fetch coach data", coachError);
    }

    const coachData = Array.isArray(coachRows) ? coachRows[0] : coachRows;
    if (!coachData) {
      devLog("Coach not found for user:", userId);
      return formatSuccessResponse([]);
    }

    const coachId = coachData.id;
    devLog("Found coach ID:", coachId, "for user:", userId);

    // Now get the coach's assigned teams using the coach_id
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
      .eq("coach_id", coachId);

    if (teamCoachesError) {
      throw new DatabaseError("Failed to fetch coach teams", teamCoachesError);
    }

    if (!teamCoaches || teamCoaches.length === 0) {
      devLog("Coach has no assigned teams");
      return formatSuccessResponse([]);
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
        throw new DatabaseError("Failed to fetch players", fallbackError);
      }

      // Add default is_active: true to all players
      players =
        playersFallback?.map((player) => ({ ...player, is_active: true })) ||
        [];
    } else if (playersError) {
      throw new DatabaseError("Failed to fetch players", playersError);
    }

    devLog(`Found ${players?.length || 0} players for coach's teams`);
    return formatSuccessResponse(players || []);
  } catch (error) {
    return handleApiError(error, request);
  }
}
