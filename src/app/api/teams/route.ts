import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseClient";
import { devError } from "../../../lib/security";
import { DatabaseError, handleApiError, formatSuccessResponse } from "../../../lib/errorHandler";

export async function GET() {
  try {
    // Try to fetch teams with coach information and is_active column first
    const { data: teams, error } = await supabaseAdmin!
      .from("teams")
      .select(
        `
        id, 
        name, 
        age_group, 
        gender, 
        grade_level, 
        season, 
        logo_url,
        is_active,
        team_coaches(
          coaches(
            id,
            first_name,
            last_name,
            email,
            is_active
          )
        )
      `
      )
      .eq("is_deleted", false)
      .eq("is_active", true)
      .order("name", { ascending: true });

    // If is_active column doesn't exist, fall back to basic select
    if (error && error.message?.includes("is_active")) {
      const { data: teamsFallback, error: fallbackError } = await supabaseAdmin!
        .from("teams")
        .select(
          `
          id, 
          name, 
          age_group, 
          gender, 
          grade_level, 
          season,
          logo_url,
          team_coaches(
            coaches(
              id,
              first_name,
              last_name,
              email,
              is_active
            )
          )
        `
        )
        .eq("is_deleted", false)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (fallbackError) {
        throw new DatabaseError("Failed to fetch teams", fallbackError);
      }

      // Add default is_active: true to all teams
      teams =
        teamsFallback?.map((team) => ({ ...team, is_active: true })) || [];
    } else if (error) {
      throw new DatabaseError("Failed to fetch teams", error);
    }

    // Transform the data to include coach names, filtering out inactive coaches
    const transformedTeams = (teams || []).map((team: any) => {
      // Filter out inactive coaches
      const activeCoaches =
        team.team_coaches?.filter(
          (tc: any) => tc.coaches.is_active !== false
        ) || [];

      const coachNames = activeCoaches.map(
        (tc: any) => `${tc.coaches.first_name} ${tc.coaches.last_name}`
      );

      return {
        id: team.id,
        name: team.name,
        age_group: team.age_group,
        gender: team.gender,
        grade_level: team.grade_level,
        season: team.season,
        logo_url: team.logo_url,
        is_active: team.is_active,
        coach_names: coachNames,
        coaches: activeCoaches.map((tc: any) => tc.coaches),
      };
    });

    const response = formatSuccessResponse(transformedTeams);
    // Add cache headers
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
