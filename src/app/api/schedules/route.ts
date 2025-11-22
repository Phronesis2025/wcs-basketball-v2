import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Fetch schedules
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .is("deleted_at", null)
      .order("date_time", { ascending: true });

    if (schedulesError) {
      throw new DatabaseError("Failed to fetch schedules", schedulesError);
    }

    // Fetch updates with date_time
    const { data: updates, error: updatesError } = await supabaseAdmin
      .from("team_updates")
      .select("*")
      .not("date_time", "is", null)
      .is("deleted_at", null)
      .order("date_time", { ascending: true });

    if (updatesError) {
      throw new DatabaseError("Failed to fetch updates", updatesError);
    }

    // Fetch teams for team name lookup
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("id, name");

    if (teamsError) {
      throw new DatabaseError("Failed to fetch teams", teamsError);
    }

    // Combine schedules and updates, converting updates to schedule format
    const allEvents = [
      ...(schedules || []),
      ...(updates || []).map((update) => {
        // Get team name for the title
        let teamName = "All Teams";
        // Show specific team name if team_id exists and it's not a global update
        if (update.team_id && !(update.is_global === true)) {
          const foundTeam = teams?.find((t) => t.id === update.team_id);
          teamName = foundTeam?.name || "Team";

          // Remove "WCS" prefix if present
          teamName = teamName.replace(/^\s*WCS\s*/i, "").trim();
        }

        return {
          id: update.id,
          team_id: update.team_id, // Preserve team_id for the modal
          event_type: "Update",
          date_time: update.date_time,
          end_date_time: null,
          title: `${teamName}: ${update.title}`,
          location: "N/A",
          opponent: null,
          description: update.content,
          is_global: update.is_global || false,
          recurring_group_id: null,
          created_by: update.created_by,
          created_at: update.created_at,
          deleted_at: update.deleted_at,
        };
      }),
    ];

    devLog("Successfully fetched schedules and updates:", allEvents.length);

    return new NextResponse(
      JSON.stringify({ events: allEvents }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Cache for 30 seconds, then revalidate in background
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
