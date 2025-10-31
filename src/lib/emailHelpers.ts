import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

export type TeamEmailCoach = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
};

export type TeamEmailPractice = {
  date_time: string;
  location: string | null;
  title?: string | null;
  description?: string | null;
};

export type TeamEmailGame = {
  date_time: string;
  location: string | null;
  opponent?: string | null;
  title?: string | null;
  description?: string | null;
  event_type?: string | null;
};

export type TeamEmailData = {
  teamId: string;
  teamName: string;
  practices: TeamEmailPractice[];
  games: TeamEmailGame[];
  coaches: TeamEmailCoach[];
};

export async function fetchTeamDataForEmail(
  teamId: string
): Promise<TeamEmailData | null> {
  try {
    if (!supabaseAdmin) return null;

    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [{ data: team }, { data: practices }, { data: games }, { data: tc }] = await Promise.all([
      supabaseAdmin
        .from("teams")
        .select("name")
        .eq("id", teamId)
        .single(),
      supabaseAdmin
        .from("schedules")
        .select("date_time, location, title, description")
        .eq("team_id", teamId)
        .eq("event_type", "Practice")
        .is("deleted_at", null)
        .gte("date_time", now.toISOString())
        .lte("date_time", twoWeeksFromNow.toISOString())
        .order("date_time", { ascending: true }),
      supabaseAdmin
        .from("schedules")
        .select("date_time, location, opponent, title, description, event_type")
        .eq("team_id", teamId)
        .in("event_type", ["Game", "Tournament"])
        .is("deleted_at", null)
        .gte("date_time", now.toISOString())
        .lte("date_time", twoWeeksFromNow.toISOString())
        .order("date_time", { ascending: true }),
      supabaseAdmin
        .from("team_coaches")
        .select(
          `
          coaches (
            first_name,
            last_name,
            email,
            phone
          )
        `
        )
        .eq("team_id", teamId),
    ]);

    const coaches = (tc || [])
      .map((row: any) => row.coaches)
      .filter(Boolean) as TeamEmailCoach[];

    return {
      teamId: teamId,
      teamName: team?.name || "",
      practices: (practices || []) as TeamEmailPractice[],
      games: (games || []) as TeamEmailGame[],
      coaches,
    };
  } catch (e) {
    devError("fetchTeamDataForEmail error", e);
    return null;
  }
}

export function formatScheduleDate(dateTime: string): string {
  try {
    const d = new Date(dateTime);
    return d.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateTime;
  }
}

export const STANDARD_EQUIPMENT: string[] = [
  "Basketball shoes",
  "Water bottle",
  "Athletic wear (shorts and t-shirt)",
  "Basketball (optional)",
];


