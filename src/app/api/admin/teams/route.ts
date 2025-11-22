import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";
import { devError } from "../../../../lib/security";
import { DatabaseError, handleApiError, formatSuccessResponse } from "../../../../lib/errorHandler";

export async function GET() {
  try {
    // Fetch all teams (including inactive) for admin management
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
        team_image,
        is_active,
        team_coaches(
          coaches(
            id,
            first_name,
            last_name,
            email,
            is_active
          )
        ),
        players(
          id,
          name,
          is_active,
          is_deleted
        )
      `
      )
      .eq("is_deleted", false)
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
          team_image,
          team_coaches(
            coaches(
              id,
              first_name,
              last_name,
              email
            )
          ),
          players(
            id,
            name,
            is_active,
            is_deleted
          )
        `
        )
        .eq("is_deleted", false)
        .order("name", { ascending: true });

      if (fallbackError) {
        throw new DatabaseError("Failed to fetch teams", fallbackError);
      }

      return formatSuccessResponse(teamsFallback || []);
    }

    if (error) {
      throw new DatabaseError("Failed to fetch teams", error);
    }

    return formatSuccessResponse(teams || []);
  } catch (error) {
    return handleApiError(error);
  }
}
