// src/lib/actions.ts
"use server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import {
  Team,
  Coach,
  Schedule,
  PracticeDrill,
  TeamUpdate,
  News,
} from "@/types/supabase";
import { devLog, devError } from "@/lib/security";

// Type definitions for Supabase query results
type TeamCoachRelation = {
  coaches: Coach[];
};

type TeamCoachData = {
  coaches: {
    first_name: string;
    last_name: string;
  }[];
};

type TeamWithCoaches = {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  grade_level: string;
  logo_url: string | null;
  season: string;
  team_image: string | null;
  team_coaches?: TeamCoachData[];
};

// Fetch teams
export async function fetchTeams(): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        age_group,
        gender,
        grade_level,
        logo_url,
        season,
        team_image,
        team_coaches(coaches(first_name, last_name))
      `
      )
      .order("name", { ascending: true });

    if (error) {
      devError("Supabase teams fetch error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      devLog("No teams data returned from Supabase");
      return [];
    }

    return (
      data?.map((team: TeamWithCoaches) => ({
        ...team,
        coach_names:
          team.team_coaches
            ?.map((tc: TeamCoachData) => {
              if (!tc.coaches || !Array.isArray(tc.coaches)) {
                return [];
              }
              return tc.coaches
                .map(
                  (coach: { first_name: string; last_name: string }) =>
                    `${coach.first_name} ${coach.last_name}`
                )
                .join(", ");
            })
            .flat() || [],
      })) || []
    );
  } catch (err: unknown) {
    devError("Fetch teams error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch teams";
    throw new Error(errorMessage);
  }
}

// Fetch team by ID
export async function fetchTeamById(id: string): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        age_group,
        gender,
        grade_level,
        logo_url,
        season,
        team_image,
        team_coaches(coaches(first_name, last_name))
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      devError("Supabase team fetch error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      devLog("No team data returned for ID:", id);
      return null;
    }

    return {
      ...data,
      coach_names:
        data.team_coaches
          ?.map((tc: TeamCoachData) => {
            if (!tc.coaches || !Array.isArray(tc.coaches)) {
              return [];
            }
            return tc.coaches
              .map(
                (coach: { first_name: string; last_name: string }) =>
                  `${coach.first_name} ${coach.last_name}`
              )
              .join(", ");
          })
          .flat() || [],
    };
  } catch (err: unknown) {
    devError("Fetch team error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch team";
    throw new Error(errorMessage);
  }
}

// Fetch coaches by team ID
export async function fetchCoachesByTeamId(teamId: string): Promise<Coach[]> {
  try {
    const { data, error } = await supabase
      .from("team_coaches")
      .select("coaches(*)")
      .eq("team_id", teamId);

    if (error) {
      devError("Supabase coaches fetch error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      devLog("No coaches data returned for team ID:", teamId);
      return [];
    }

    return data.map((item: TeamCoachRelation) => item.coaches).flat();
  } catch (err: unknown) {
    devError("Fetch coaches error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch coaches";
    throw new Error(errorMessage);
  }
}

// Fetch schedules by team ID
export async function fetchSchedulesByTeamId(
  teamId: string
): Promise<Schedule[]> {
  try {
    let query = supabase.from("schedules").select("*").is("deleted_at", null);

    if (teamId === "__GLOBAL__") {
      query = query.eq("is_global", true);
    } else {
      query = query.or(`team_id.eq.${teamId},is_global.eq.true`);
    }

    const { data, error } = await query.order("date_time", { ascending: true });

    if (error) {
      devError("Supabase schedules fetch error:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err: unknown) {
    devError("Fetch schedules error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch schedules";
    throw new Error(errorMessage);
  }
}

// Fetch team updates
export async function fetchTeamUpdates(teamId: string): Promise<TeamUpdate[]> {
  try {
    // Return team-specific updates plus any program-wide updates (is_global=true)
    const orFilter =
      teamId === "__GLOBAL__"
        ? `is_global.eq.true`
        : `team_id.eq.${teamId},is_global.eq.true`;
    const { data, error } = await supabase
      .from("team_updates")
      .select("*")
      .or(orFilter)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      devError("Supabase team updates fetch error:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err: unknown) {
    devError("Fetch team updates error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch team updates";
    throw new Error(errorMessage);
  }
}

// Fetch news
export async function fetchNews(teamId?: string): Promise<News[]> {
  try {
    let query = supabase
      .from("news")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (teamId) {
      query = query.eq("team_id", teamId);
    }

    const { data, error } = await query;

    if (error) {
      devError("Supabase news fetch error:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err: unknown) {
    devError("Fetch news error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch news";
    throw new Error(errorMessage);
  }
}

// Fetch practice drills
export async function fetchPracticeDrills(): Promise<PracticeDrill[]> {
  try {
    const { data, error } = await supabase
      .from("practice_drills")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      devError("Supabase practice drills fetch error:", error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (err: unknown) {
    devError("Fetch practice drills error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch practice drills";
    throw new Error(errorMessage);
  }
}

// Add schedule
export async function addSchedule(data: {
  team_id: string;
  event_type: "Game" | "Practice" | "Tournament" | "Meeting";
  date_time: string;
  location: string;
  opponent?: string;
  description?: string;
  is_global?: boolean;
}): Promise<Schedule> {
  try {
    const { data: result, error } = await supabase
      .from("schedules")
      .insert(data)
      .select()
      .single();

    if (error) {
      devError("Supabase schedule insert error:", error);
      throw new Error(error.message);
    }

    return result;
  } catch (err: unknown) {
    devError("Add schedule error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to add schedule";
    throw new Error(errorMessage);
  }
}

// Update schedule
export async function updateSchedule(
  id: string,
  data: {
    event_type: "Game" | "Practice" | "Tournament" | "Meeting";
    date_time: string;
    location: string;
    opponent?: string;
    description?: string;
  }
): Promise<Schedule> {
  try {
    const { data: result, error } = await supabase
      .from("schedules")
      .update(data)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      devError("Supabase schedule update error:", error);
      throw new Error(error.message);
    }

    return result;
  } catch (err: unknown) {
    devError("Update schedule error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update schedule";
    throw new Error(errorMessage);
  }
}

// Delete schedule
export async function deleteSchedule(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("schedules")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      devError("Supabase schedule delete error:", error);
      throw new Error(error.message);
    }
  } catch (err: unknown) {
    devError("Delete schedule error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete schedule";
    throw new Error(errorMessage);
  }
}

// Add team update
export async function addUpdate(data: {
  team_id: string;
  title: string;
  content: string;
  image_url?: string;
  is_global?: boolean;
  created_by: string;
}): Promise<TeamUpdate> {
  try {
    devLog("Adding team update:", { ...data, created_by: "***" });

    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const insertData = {
      ...data,
      created_by: data.created_by,
    };

    const { data: result, error } = await supabaseAdmin
      .from("team_updates")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      devError("Team update insert error:", error);
      throw new Error(error.message);
    }
    return result;
  } catch (err: unknown) {
    devError("Add team update error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to add team update";
    throw new Error(errorMessage);
  }
}

// Update team update
export async function updateUpdate(
  id: string,
  data: {
    title?: string;
    content?: string;
    image_url?: string;
    updated_by: string;
  }
): Promise<TeamUpdate> {
  try {
    devLog("Updating team update:", { id, data });

    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabaseAdmin
      .from("team_updates")
      .update(updateData)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      devError("Team update update error:", error);
      throw new Error(error.message);
    }
    return result;
  } catch (err: unknown) {
    devError("Update team update error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update team update";
    throw new Error(errorMessage);
  }
}

// Delete team update
export async function deleteUpdate(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("team_updates")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      devError("Supabase team update delete error:", error);
      throw new Error(error.message);
    }
  } catch (err: unknown) {
    devError("Delete team update error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete team update";
    throw new Error(errorMessage);
  }
}

// Add news
export async function addNews(data: {
  team_id: string;
  title: string;
  content: string;
  image_url?: string;
}): Promise<News> {
  try {
    const insertData = { ...data };
    const { data: result, error } = await supabase
      .from("news")
      .insert(insertData)
      .select()
      .single();
    if (error) {
      devError("Supabase news insert error:", error);
      throw new Error(error.message);
    }
    return result;
  } catch (err: unknown) {
    devError("Add news error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to add news";
    throw new Error(errorMessage);
  }
}

// Update news
export async function updateNews(
  id: string,
  data: {
    title?: string;
    content?: string;
    image_url?: string;
  }
): Promise<News> {
  try {
    const updateData = { ...data };
    const { data: result, error } = await supabase
      .from("news")
      .update(updateData)
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .single();
    if (error) {
      devError("Supabase news update error:", error);
      throw new Error(error.message);
    }
    return result;
  } catch (err: unknown) {
    devError("Update news error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update news";
    throw new Error(errorMessage);
  }
}

// Delete news
export async function deleteNews(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("news")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      devError("Supabase news delete error:", error);
      throw new Error(error.message);
    }
  } catch (err: unknown) {
    devError("Delete news error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete news";
    throw new Error(errorMessage);
  }
}

// Role check
export async function getUserRole(userId: string) {
  try {
    // Try admin client first (preferred method)
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("users")
        .select("role, password_reset")
        .eq("id", userId)
        .single();

      if (error) {
        devError("Supabase user role fetch error:", error);
        throw new Error(error.message);
      }

      return data;
    }

    // Fallback: Use regular client with RLS (less secure but works without service key)
    devLog("Using fallback method for user role check");
    const { data, error } = await supabase
      .from("users")
      .select("role, password_reset")
      .eq("id", userId)
      .single();

    if (error) {
      devError("Supabase user role fetch error (fallback):", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err: unknown) {
    devError("Role check error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to check user role";
    throw new Error(errorMessage);
  }
}

// Password reset
export async function updatePasswordReset(userId: string) {
  try {
    if (!supabaseAdmin) {
      devLog("Admin client not available, skipping password reset update");
      return { success: true };
    }
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        password_reset: false,
        last_password_reset: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      devError("Supabase password reset update error:", error);
      throw new Error(error.message);
    }
  } catch (err: unknown) {
    devError("Password reset DB update error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update password reset";
    throw new Error(errorMessage);
  }
}
