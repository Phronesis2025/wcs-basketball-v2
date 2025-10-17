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

    // Combine schedules and updates, converting updates to schedule format
    const allEvents = [
      ...(schedules || []),
      ...(updates || []).map((update) => ({
        id: update.id,
        event_type: "Update",
        date_time: update.date_time,
        title: update.title,
        location: "N/A",
        opponent: null,
        description: update.content,
        is_global: update.is_global || false,
        created_by: update.created_by,
        created_at: update.created_at,
        deleted_at: update.deleted_at,
      })),
    ];

    devLog("Successfully fetched schedules and updates:", allEvents.length);

    return NextResponse.json({ events: allEvents });
  } catch (error) {
    devError("Server-side schedules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
