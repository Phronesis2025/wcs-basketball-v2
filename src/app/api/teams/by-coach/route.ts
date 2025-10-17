import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("team_coaches")
      .select(
        `
        teams(
          id,
          name,
          age_group,
          gender,
          grade_level,
          logo_url,
          season,
          team_image
        ),
        coaches!inner(user_id)
      `
      )
      .eq("coaches.user_id", userId);

    if (error) {
      devError("API teams/by-coach fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const teams = (data || []).map((item: any) => ({
      ...item.teams,
      coach_names: [],
    }));

    return NextResponse.json(teams);
  } catch (err) {
    devError("Unexpected error in /api/teams/by-coach:", err);
    return NextResponse.json(
      { error: "Failed to fetch teams for coach" },
      { status: 500 }
    );
  }
}


