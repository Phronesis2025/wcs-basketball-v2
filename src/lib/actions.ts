import { supabase } from "@/lib/supabaseClient";
import * as Sentry from "@sentry/nextjs";

export async function fetchTeams() {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, age_group, gender, coach_email, grade_level, logo_url")
      .eq("season", "2025-2026")
      .order("name");
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    Sentry.captureException(error);
    console.error("Failed to fetch teams:", error);
    return { data: [], error: "Failed to load teams. Please try again later." };
  }
}
