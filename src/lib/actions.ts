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

type TeamWithCoaches = {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  grade_level: string;
  logo_url: string | null;
  season: string;
  team_image: string | null;
  team_coaches?: Array<{
    coaches: {
      first_name: string;
      last_name: string;
    }[];
  }>;
};

// Fetch teams
export async function fetchTeams(): Promise<Team[]> {
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

  if (error) throw new Error(error.message);

  return (
    data?.map((team: TeamWithCoaches) => ({
      ...team,
      coach_names:
        team.team_coaches
          ?.map((tc) =>
            tc.coaches
              .map((coach) => `${coach.first_name} ${coach.last_name}`)
              .join(", ")
          )
          .flat() || [],
    })) || []
  );
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
      devLog("Fetch team error:", error);
      throw new Error(error.message);
    }
    devLog("Fetched team data:", data);
    return data
      ? {
          ...data,
          coach_names:
            data.team_coaches
              ?.map((tc) =>
                tc.coaches
                  .map((coach) => `${coach.first_name} ${coach.last_name}`)
                  .join(", ")
              )
              .flat() || [],
        }
      : null;
  } catch (err: unknown) {
    devError("Fetch team by ID error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch team data";
    throw new Error(errorMessage);
  }
}

// Fetch coaches by team ID
export async function fetchCoachesByTeamId(teamId: string): Promise<Coach[]> {
  const { data, error } = await supabase
    .from("team_coaches")
    .select("coaches(id, first_name, last_name, email, bio, image_url, quote)")
    .eq("team_id", teamId);
  if (error) throw new Error(error.message);
  return data?.map((item: TeamCoachRelation) => item.coaches).flat() || [];
}

// Fetch schedules by team ID
export async function fetchSchedulesByTeamId(
  teamId: string
): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("team_id", teamId)
    .is("deleted_at", null)
    .order("date_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

// Fetch practice drills
export async function fetchPracticeDrills(
  teamId?: string
): Promise<PracticeDrill[]> {
  let query = supabase.from("practice_drills").select("*");
  if (teamId) query = query.eq("team_id", teamId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

// Fetch team updates
export async function fetchTeamUpdates(teamId: string): Promise<TeamUpdate[]> {
  const { data, error } = await supabase
    .from("team_updates")
    .select("*")
    .eq("team_id", teamId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw new Error(error.message);
  return data || [];
}

// Fetch news
export async function fetchNews(teamId: string): Promise<News[]> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("team_id", teamId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw new Error(error.message);
  return data || [];
}

// Add schedule
export async function addSchedule(
  data: {
    event_type: string;
    date_time: string;
    location: string;
    team_id: string;
    opponent?: string;
    description?: string;
  },
  userId: string
): Promise<Schedule> {
  // Validate date_time
  if (
    !data.date_time ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(data.date_time)
  ) {
    throw new Error("Invalid date/time format (use YYYY-MM-DDTHH:MM)");
  }
  devLog("Add schedule input:", { data, userId }); // Debug: Log input
  if (!supabaseAdmin) throw new Error("Supabase admin client not available");
  const { data: result, error } = await supabaseAdmin // Bypass RLS
    .from("schedules")
    .insert({ ...data, created_by: userId })
    .select()
    .single();
  if (error) {
    devLog("Add schedule error:", error);
    throw new Error(error.message);
  }
  return result;
}

// Update schedule
export async function updateSchedule(
  id: string,
  data: {
    event_type?: string;
    date_time?: string;
    location?: string;
    opponent?: string;
    description?: string;
  }
): Promise<Schedule> {
  if (
    data.date_time &&
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?([+-]\d{2}:\d{2}|Z)?$/.test(
      data.date_time
    )
  ) {
    throw new Error(
      "Invalid date/time format (use YYYY-MM-DDTHH:MM or datetime-local format)"
    );
  }
  devLog("Update schedule input:", { id, data }); // Debug: Log input
  if (!supabaseAdmin) throw new Error("Supabase admin client not available");
  const { data: result, error } = await supabaseAdmin // Bypass RLS
    .from("schedules")
    .update(data)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  if (error) {
    devLog("Update schedule error:", error);
    throw new Error(error.message);
  }
  return result;
}

// Delete schedule
export async function deleteSchedule(id: string): Promise<void> {
  devLog("Delete schedule input:", { id }); // Debug: Log input
  if (!supabaseAdmin) throw new Error("Supabase admin client not available");
  const { error } = await supabaseAdmin // Bypass RLS
    .from("schedules")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    devLog("Delete schedule error:", error);
    throw new Error(error.message);
  }
}

// Add drill
export async function addDrill(
  data: Omit<
    PracticeDrill,
    "id" | "created_at" | "created_by" | "image_url"
  > & { image?: File },
  userId: string
): Promise<PracticeDrill> {
  let imagePath: string | undefined;
  if (data.image) {
    const fileName = `${Date.now()}-${data.image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("drills")
      .upload(fileName, data.image);
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = supabase.storage
      .from("drills")
      .getPublicUrl(fileName);
    imagePath = urlData.publicUrl;
  }
  const { data: result, error } = await supabase
    .from("practice_drills")
    .insert({ ...data, created_by: userId, image_url: imagePath })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

// Add update
export async function addUpdate(
  data: Omit<TeamUpdate, "id" | "created_at" | "created_by" | "image_url"> & {
    image?: File;
  },
  userId: string
): Promise<TeamUpdate> {
  let imagePath: string | undefined;
  if (data.image) {
    const fileName = `${Date.now()}-${data.image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("updates")
      .upload(fileName, data.image);
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = supabase.storage
      .from("updates")
      .getPublicUrl(fileName);
    imagePath = urlData.publicUrl;
  }
  const { data: result, error } = await supabase
    .from("team_updates")
    .insert({ ...data, created_by: userId, image_url: imagePath })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

// Update update
export async function updateUpdate(
  id: string,
  data: {
    title?: string;
    content?: string;
    image?: File;
  }
): Promise<TeamUpdate> {
  let imagePath: string | undefined;
  if (data.image) {
    const fileName = `${Date.now()}-${data.image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("updates")
      .upload(fileName, data.image);
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = supabase.storage
      .from("updates")
      .getPublicUrl(fileName);
    imagePath = urlData.publicUrl;
  }
  const updateData = { ...data, image_url: imagePath };
  const { data: result, error } = await supabase
    .from("team_updates")
    .update(updateData)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

// Delete update
export async function deleteUpdate(id: string): Promise<void> {
  const { error } = await supabase
    .from("team_updates")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// Add news
export async function addNews(
  data: {
    title: string;
    content: string;
    team_id: string;
    image?: File;
  },
  userId: string
): Promise<News> {
  let imagePath: string | undefined;
  if (data.image) {
    const fileName = `${Date.now()}-${data.image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("news")
      .upload(fileName, data.image);
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = supabase.storage
      .from("news")
      .getPublicUrl(fileName);
    imagePath = urlData.publicUrl;
  }
  const { data: result, error } = await supabase
    .from("news")
    .insert({ ...data, created_by: userId, image_url: imagePath })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

// Update news
export async function updateNews(
  id: string,
  data: {
    title?: string;
    content?: string;
    image?: File;
  }
): Promise<News> {
  let imagePath: string | undefined;
  if (data.image) {
    const fileName = `${Date.now()}-${data.image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("news")
      .upload(fileName, data.image);
    if (uploadError) throw new Error(uploadError.message);
    const { data: urlData } = supabase.storage
      .from("news")
      .getPublicUrl(fileName);
    imagePath = urlData.publicUrl;
  }
  const updateData = { ...data, image_url: imagePath };
  const { data: result, error } = await supabase
    .from("news")
    .update(updateData)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

// Delete news
export async function deleteNews(id: string): Promise<void> {
  const { error } = await supabase
    .from("news")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// Role check
export async function getUserRole(userId: string) {
  try {
    if (!supabaseAdmin) throw new Error("Supabase admin client not available");
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("role, password_reset")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err: unknown) {
    devError("Role check error:", err);
    throw err;
  }
}

// Password reset
export async function updatePasswordReset(userId: string) {
  try {
    if (!supabaseAdmin) throw new Error("Supabase admin client not available");
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        password_reset: false,
        last_password_reset: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      throw new Error(error.message);
    }
  } catch (err: unknown) {
    devError("Password reset DB update error:", err);
    throw err;
  }
}
