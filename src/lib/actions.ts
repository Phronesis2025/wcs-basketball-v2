import { supabase } from "@/lib/supabaseClient";
import { devLog } from "@/lib/security";

export async function fetchTeams() {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select("id, name, age_group, gender, grade_level, logo_url")
      .eq("season", "2025-2026")
      .order("name");

    if (error) {
      devLog("Supabase teams query error:", error);
      return { data: [], error: null }; // Return empty data instead of error to prevent retries
    }

    return { data: data || [], error: null };
  } catch (error) {
    devLog("Failed to fetch teams:", error);
    return { data: [], error: null }; // Return empty data instead of error to prevent retries
  }
}

export async function fetchCoaches() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name, role, email")
      .eq("role", "coach")
      .order("last_name");

    if (error) {
      devLog("Supabase coaches query error:", error);
      return { data: [], error: null }; // Return empty data instead of error to prevent retries
    }

    return { data: data || [], error: null };
  } catch (error) {
    devLog("Failed to fetch coaches:", error);
    return { data: [], error: null }; // Return empty data instead of error to prevent retries
  }
}
