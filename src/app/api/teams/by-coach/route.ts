import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      throw new ValidationError("Missing userId");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
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
          team_image,
          is_active
        ),
        coaches!inner(user_id)
      `
      )
      .eq("coaches.user_id", userId)
      .eq("teams.is_active", true)
      .eq("teams.is_deleted", false);

    if (error) {
      throw new DatabaseError("Failed to fetch teams for coach", error);
    }

    const teams = (data || []).map((item) => {
      const t = (
        item as unknown as {
          teams: {
            id: string;
            name: string;
            age_group: string;
            gender: string;
            grade_level: string;
            logo_url: string | null;
            season: string;
            team_image: string | null;
          };
        }
      ).teams;
      return { ...t, coach_names: [] as string[] };
    });

    // Remove duplicates based on team ID
    const uniqueTeams = teams.filter(
      (team, index, self) => index === self.findIndex((t) => t.id === team.id)
    );

    return formatSuccessResponse(uniqueTeams);
  } catch (err) {
    return handleApiError(err, request);
  }
}
