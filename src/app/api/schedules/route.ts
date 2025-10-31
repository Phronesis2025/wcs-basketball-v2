import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Fetch schedules
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from("schedules")
      .select("*")
      .is("deleted_at", null)
      .order("date_time", { ascending: true });

    if (schedulesError) {
      devError("Schedules fetch error:", schedulesError);
      return NextResponse.json(
        { error: "Failed to fetch schedules" },
        { status: 500 }
      );
    }

    // Fetch updates with date_time
    const { data: updates, error: updatesError } = await supabaseAdmin
      .from("team_updates")
      .select("*")
      .not("date_time", "is", null)
      .is("deleted_at", null)
      .order("date_time", { ascending: true });

    if (updatesError) {
      devError("Updates fetch error:", updatesError);
      return NextResponse.json(
        { error: "Failed to fetch updates" },
        { status: 500 }
      );
    }

    // Fetch teams for team name lookup
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from("teams")
      .select("id, name");

    if (teamsError) {
      devError("Teams fetch error:", teamsError);
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 }
      );
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
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          SurrogateControl: "no-store",
        },
      }
    );
  } catch (error) {
    devError("Server-side schedules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
