// src/lib/actions.ts
import { supabase } from "@/lib/supabaseClient";
import {
  Team,
  Coach,
  Schedule,
  PracticeDrill,
  TeamUpdate,
} from "@/types/supabase";

export async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  // Transform data to include required fields
  return (data || []).map((team) => ({
    ...team,
    coach_names: team.coach_names || [],
    video_url: team.video_url || null,
  }));
}

export async function fetchTeamById(id: string): Promise<Team | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("*, team_image") // Updated to include team_image
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  if (!data) return null;

  // Transform data to include required fields
  return {
    ...data,
    coach_names: data.coach_names || [],
    video_url: data.video_url || null,
  };
}

export async function fetchCoachesByTeamId(teamId: string): Promise<Coach[]> {
  const { data, error } = await supabase
    .from("team_coaches")
    .select("coaches(id, first_name, last_name, email, bio, image_url, quote)")
    .eq("team_id", teamId);
  if (error) throw new Error(error.message);
  return data?.map((item: any) => item.coaches) || [];
}

export async function fetchSchedulesByTeamId(
  teamId: string
): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("team_id", teamId)
    .order("date_time", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchPracticeDrills(
  teamId?: string
): Promise<PracticeDrill[]> {
  let query = supabase.from("practice_drills").select("*");
  if (teamId) query = query.eq("team_id", teamId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchTeamUpdates(teamId: string): Promise<TeamUpdate[]> {
  const { data, error } = await supabase
    .from("team_updates")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function addSchedule(
  data: {
    event_type: string;
    date_time: string;
    location: string;
    team_id: string;
  },
  userId: string
): Promise<Schedule> {
  const { data: result, error } = await supabase
    .from("schedules")
    .insert({ ...data, created_by: userId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return result;
}

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
