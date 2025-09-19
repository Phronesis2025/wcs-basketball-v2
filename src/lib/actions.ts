import { supabase } from "@/lib/supabaseClient";
import * as Sentry from "@sentry/nextjs";
import { devError } from "@/lib/security";

/**
 * Fetches teams data from Supabase database
 * Includes coach information lookup and fallback team data
 *
 * @returns Promise containing teams data and error state
 */
export async function fetchTeams() {
  try {
    // Fetch teams from database for current season
    const { data, error } = await supabase
      .from("teams")
      .select(
        "id, name, age_group, gender, grade_level, logo_url, coaches_emails"
      )
      .eq("season", "2025-2026")
      .order("name");

    if (error) throw error;

    // Process each team to include coach information
    const teamsWithCoaches = await Promise.all(
      data.map(async (team) => {
        // Handle TBD teams with default values
        if (team.name.includes("TBD")) {
          return {
            ...team,
            coach_names: ["TBD"],
            logo_url: "/logos/logo2.png",
            video_url:
              team.gender === "Boys"
                ? "/video/boys-team.mp4"
                : "/video/girls-team.mp4",
          };
        }

        // Look up coach names for teams with coach emails
        if (team.coaches_emails && team.coaches_emails.length > 0) {
          const coachNames = await Promise.all(
            team.coaches_emails.map(async (email: string) => {
              const { data: userData, error: userError } = await supabase
                .from("users")
                .select("first_name, last_name")
                .eq("email", email)
                .single();

              if (userError) {
                Sentry.captureException(userError);
                return "TBD";
              }

              return userData
                ? `${userData.first_name} ${userData.last_name}`
                : "TBD";
            })
          );

          return {
            ...team,
            coach_names:
              coachNames.filter((name) => name !== "TBD").length > 0
                ? coachNames
                : ["TBD"],
            logo_url: team.logo_url || "/logos/logo2.png",
            video_url:
              team.gender === "Boys"
                ? "/video/boys-team.mp4"
                : "/video/girls-team.mp4",
          };
        }

        // Default team configuration
        return {
          ...team,
          coach_names: ["TBD"],
          logo_url: team.logo_url || "/logos/logo2.png",
          video_url:
            team.gender === "Boys"
              ? "/video/boys-team.mp4"
              : "/video/girls-team.mp4",
        };
      })
    );

    // Add fallback teams for missing grades
    const allTeams = [
      ...teamsWithCoaches,
      {
        id: "tbd-boys-3rd",
        name: "3rd Grade Boys TBD",
        age_group: "U8",
        gender: "Boys",
        grade_level: "3rd",
        logo_url: "/logos/logo2.png",
        coach_names: ["TBD"],
        video_url: "/video/boys-team.mp4",
      },
      {
        id: "tbd-girls-3rd",
        name: "3rd Grade Girls TBD",
        age_group: "U8",
        gender: "Girls",
        grade_level: "3rd",
        logo_url: "/logos/logo2.png",
        coach_names: ["TBD"],
        video_url: "/video/girls-team.mp4",
      },
    ];

    return { data: allTeams, error: null };
  } catch (error) {
    // Log error and return safe fallback
    Sentry.captureException(error);
    devError("Failed to fetch teams:", error);
    return { data: [], error: "Failed to load teams. Please try again later." };
  }
}
