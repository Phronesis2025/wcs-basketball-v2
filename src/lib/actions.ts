import { supabase } from "@/lib/supabaseClient";
import * as Sentry from "@sentry/nextjs";
import { devError } from "@/lib/security";

// Type for the team data from Supabase
interface TeamData {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  grade_level: string;
  logo_url: string | null;
  coaches_emails: string | null;
}

/**
 * Fetches teams data from Supabase database
 * Includes coach information lookup and fallback team data
 *
 * @returns Promise containing teams data and error state
 */
export async function fetchTeams() {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 5000)
    );

    // Fetch teams from database for current season
    const teamsPromise = supabase
      .from("teams")
      .select(
        "id, name, age_group, gender, grade_level, logo_url, coaches_emails"
      )
      .eq("season", "2025-2026")
      .order("name");

    const { data, error } = (await Promise.race([
      teamsPromise,
      timeoutPromise,
    ])) as { data: TeamData[] | null; error: Error | null };

    if (error) throw error;

    // Handle case where data is null
    if (!data) {
      return { data: [], error: "No teams data available" };
    }

    // Process each team to include coach information
    const teamsWithCoaches = await Promise.all(
      data.map(async (team: TeamData) => {
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
          // Parse coaches_emails string as array
          const emails = team.coaches_emails
            .split(",")
            .map((email) => email.trim());
          const coachNames = await Promise.all(
            emails.map(async (email: string) => {
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
