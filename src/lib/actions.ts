// src/lib/actions.ts
"use server";
import { supabase, supabaseAdmin } from "../lib/supabaseClient";
import {
  Team,
  Coach,
  Schedule,
  PracticeDrill,
  TeamUpdate,
  News,
} from "../types/supabase";
import { devLog, devError } from "../lib/security";

// File upload utility function
export async function uploadFileToStorage(
  file: File,
  bucket: string,
  folder: string
): Promise<string> {
  try {
    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    // Log file details for debugging
    devLog("Uploading file:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
      bucket,
      folder,
    });

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(
        `File size (${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB) exceeds the maximum allowed size of 5MB`
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${file.name.replace(
      /[^a-zA-Z0-9.-]/g,
      "-"
    )}`;
    const filePath = `${folder}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      devError("File upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    devLog("File uploaded successfully:", {
      filePath,
      publicUrl: urlData.publicUrl,
    });
    return urlData.publicUrl;
  } catch (err: unknown) {
    devError("Upload file error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to upload file";
    throw new Error(errorMessage);
  }
}

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
  is_active?: boolean;
};

// Soft delete functions
export async function softDeleteCoach(coachId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("coaches")
      .update({ is_deleted: true })
      .eq("id", coachId);

    if (error) {
      devError("Soft delete coach error:", error);
      throw new Error("Failed to delete coach");
    }
  } catch (err: unknown) {
    devError("Soft delete coach error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete coach";
    throw new Error(errorMessage);
  }
}

export async function softDeleteTeam(teamId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("teams")
      .update({ is_deleted: true })
      .eq("id", teamId);

    if (error) {
      devError("Soft delete team error:", error);
      throw new Error("Failed to delete team");
    }
  } catch (err: unknown) {
    devError("Soft delete team error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete team";
    throw new Error(errorMessage);
  }
}

export async function softDeletePlayer(playerId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("players")
      .update({ is_deleted: true })
      .eq("id", playerId);

    if (error) {
      devError("Soft delete player error:", error);
      throw new Error("Failed to delete player");
    }
  } catch (err: unknown) {
    devError("Soft delete player error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete player";
    throw new Error(errorMessage);
  }
}

// Fetch all teams (including inactive) for management purposes
export async function fetchAllTeams(): Promise<Team[]> {
  try {
    // Prefer admin client (bypasses RLS) when available
    const client = supabaseAdmin || supabase;
    // Get all teams (including inactive)
    const { data: teams, error: teamsError } = await client
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
        is_active
      `
      )
      .eq("is_deleted", false)
      .order("name", { ascending: true });

    if (teamsError) {
      devError("Supabase teams fetch error:", teamsError);
      throw new Error(teamsError.message);
    }

    if (!teams) {
      devLog("No teams data returned from Supabase");
      return [];
    }

    // Then get coach names for each team
    const teamsWithCoaches = await Promise.all(
      teams.map(async (team) => {
        const { data: coachData } = await client
          .from("team_coaches")
          .select(
            `
                coaches!inner(
                  first_name,
                  last_name
                )
              `
          )
          .eq("team_id", team.id);

        const coachNames =
          coachData
            ?.map((tc: any) => {
              if (!tc.coaches) {
                return null;
              }
              return `${tc.coaches.first_name} ${tc.coaches.last_name}`;
            })
            .filter(Boolean) || [];

        return {
          ...team,
          coach_names: coachNames,
        };
      })
    );

    return teamsWithCoaches;
  } catch (err: unknown) {
    devError("Fetch all teams error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch teams";
    throw new Error(errorMessage);
  }
}

// Fetch teams (only active) for public use
export async function fetchTeams(): Promise<Team[]> {
  try {
    // Prefer admin client (bypasses RLS) when available
    const client = supabaseAdmin || supabase;
    // First get all teams
    const { data: teams, error: teamsError } = await client
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
        is_active
      `
      )
      .eq("is_deleted", false)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (teamsError) {
      devError("Supabase teams fetch error:", teamsError);
      throw new Error(teamsError.message);
    }

    if (!teams) {
      devLog("No teams data returned from Supabase");
      return [];
    }

    // Then get coach names for each team
    const teamsWithCoaches = await Promise.all(
      teams.map(async (team) => {
        const { data: coachData } = await client
          .from("team_coaches")
          .select(
            `
                coaches!inner(
                  first_name,
                  last_name
                )
              `
          )
          .eq("team_id", team.id);

        const coachNames =
          coachData
            ?.map((tc: any) => {
              if (!tc.coaches) {
                return null;
              }
              return `${tc.coaches.first_name} ${tc.coaches.last_name}`;
            })
            .filter(Boolean) || [];

        return {
          ...team,
          is_active: true,
          coach_names: coachNames,
        };
      })
    );

    return teamsWithCoaches;
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
    const client = supabaseAdmin || supabase;

    // First get the team data
    const { data: team, error: teamError } = await client
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
        team_image
      `
      )
      .eq("id", id)
      .eq("is_deleted", false)
      .single();

    if (teamError) {
      devError("Supabase team fetch error:", teamError);
      throw new Error(teamError.message);
    }

    if (!team) {
      devLog("No team data returned for ID:", id);
      return null;
    }

    // Debug team image fetch
    console.log("🔍 fetchTeamById - Image Debug:", {
      teamId: id,
      teamName: team.name,
      teamImageUrl: team.team_image,
      logoUrl: team.logo_url,
      timestamp: new Date().toISOString(),
    });

    // Then get coach names
    const { data: coachData } = await client
      .from("team_coaches")
      .select(
        `
        coaches!inner(
          first_name,
          last_name
        )
      `
      )
      .eq("team_id", id);

    const coachNames =
      coachData
        ?.map((tc: any) => {
          if (!tc.coaches) {
            return null;
          }
          return `${tc.coaches.first_name} ${tc.coaches.last_name}`;
        })
        .filter(Boolean) || [];

    return {
      ...team,
      is_active: true,
      coach_names: coachNames,
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
    // Use admin client to bypass RLS (since this is a public read operation)
    const client = supabaseAdmin || supabase;

    const { data, error } = await client
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

    devLog("Raw coaches data:", data);

    // Extract coaches from the nested structure
    // The data structure is: [{ coaches: { id, first_name, last_name, ... } }]
    const coaches = data
      .map((item: any) => item.coaches)
      .filter((coach: any) => coach !== null && coach !== undefined);

    const activeCoaches = coaches.filter(
      (coach: Coach) => coach.is_active !== false
    );

    devLog(
      `Found ${coaches.length} coaches, ${activeCoaches.length} active for team ${teamId}`
    );
    return activeCoaches;
  } catch (err: unknown) {
    devError("Fetch coaches error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch coaches";
    throw new Error(errorMessage);
  }
}

// Fetch teams by coach ID (for coaches to see only their assigned teams)
export async function fetchTeamsByCoachId(
  coachUserId: string
): Promise<Team[]> {
  try {
    const { data, error } = await supabase
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
      .eq("coaches.user_id", coachUserId)
      .eq("teams.is_active", true)
      .eq("teams.is_deleted", false);

    if (error) {
      devError("Supabase teams by coach fetch error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      devLog("No teams data returned for coach user ID:", coachUserId);
      return [];
    }

    // Transform the data to match the Team type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((item: any) => ({
      ...item.teams,
      coach_names: [], // Will be populated separately if needed
    }));
  } catch (err: unknown) {
    devError("Fetch teams by coach error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch teams for coach";
    throw new Error(errorMessage);
  }
}

// Fetch schedules by team ID
export async function fetchSchedulesByTeamId(
  teamId: string
): Promise<Schedule[]> {
  try {
    let query = supabaseAdmin
      .from("schedules")
      .select("*")
      .is("deleted_at", null);

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
    const { data, error } = await supabaseAdmin
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

// Fetch ALL team updates from every team
export async function fetchAllTeamUpdates(): Promise<TeamUpdate[]> {
  try {
    // Use admin client to bypass RLS for public team updates
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from("team_updates")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      devError("Supabase all team updates fetch error:", error);
      throw new Error(error.message);
    }

    devLog("Fetched all team updates:", { count: data?.length || 0 });
    return data || [];
  } catch (err: unknown) {
    devError("All team updates fetch error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch all team updates";
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
  team_id: string | null; // Allow null for globals
  event_type: "Game" | "Practice" | "Tournament" | "Meeting" | "Update";
  date_time: string;
  title?: string | null;
  location: string;
  opponent?: string;
  description?: string;
  is_global?: boolean;
  created_by?: string; // Allow passing user ID from client
}): Promise<Schedule> {
  try {
    // Handle "__GLOBAL__" case - convert to null and set is_global
    const insertData = { ...data };
    if (data.team_id === "__GLOBAL__" || data.is_global) {
      insertData.team_id = null; // Override to null for program-wide
      insertData.is_global = true;
    }

    // Use admin client to bypass RLS (since server actions don't have user context)
    const client = supabaseAdmin || supabase;

    // Insert into Supabase
    const { data: result, error } = await client
      .from("schedules")
      .insert(insertData)
      .select()
      .single();

    // Handle errors
    if (error) {
      devError("Supabase schedule insert error:", error);
      throw new Error(error.message);
    }

    // Return the result
    return result;
  } catch (err: unknown) {
    devError("Add schedule error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to add schedule";
    throw new Error(errorMessage);
  }
}

// Add recurring practice schedules
export async function addRecurringPractice(data: {
  team_id: string | null;
  event_type: "Practice";
  date_time: string;
  title?: string | null;
  location: string;
  description?: string;
  is_global?: boolean;
  recurringType: "count" | "date";
  recurringCount: number;
  recurringEndDate?: string;
  selectedDays: number[]; // Array of weekday numbers (0=Sunday, 1=Monday, etc.)
  recurringGroupId?: string; // Optional: for grouping related recurring events
}): Promise<Schedule[]> {
  try {
    const startDate = new Date(data.date_time);
    const schedules: Schedule[] = [];

    // Calculate end date based on recurring type
    let endDate: Date;
    if (data.recurringType === "date" && data.recurringEndDate) {
      endDate = new Date(data.recurringEndDate);
    } else {
      // For count type, calculate end date based on recurring count
      const weeksToAdd = Math.ceil(
        data.recurringCount / data.selectedDays.length
      );
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + weeksToAdd * 7);
    }

    // Generate all recurring dates
    const currentDate = new Date(startDate);
    const generatedDates: Date[] = [];

    // Start from the beginning of the week containing the start date
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    let weekStart = new Date(startOfWeek);

    while (weekStart <= endDate) {
      // For each selected day of the week
      for (const dayOfWeek of data.selectedDays) {
        const eventDate = new Date(weekStart);
        eventDate.setDate(weekStart.getDate() + dayOfWeek);

        // Only include dates that are >= start date and <= end date
        if (eventDate >= startDate && eventDate <= endDate) {
          generatedDates.push(new Date(eventDate));
        }
      }
      // Move to next week
      weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    // Limit to the specified count if using count type
    const finalDates =
      data.recurringType === "count"
        ? generatedDates.slice(0, data.recurringCount)
        : generatedDates;

    devLog(`Creating ${finalDates.length} recurring practice schedules`);

    // Generate a unique group ID for this recurring series
    const groupId =
      data.recurringGroupId ||
      `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Use admin client to bypass RLS (since server actions don't have user context)
    const client = supabaseAdmin || supabase;

    // Create all schedule entries
    for (const eventDate of finalDates) {
      const insertData = {
        team_id: data.is_global ? null : data.team_id,
        event_type: data.event_type,
        date_time: eventDate.toISOString(),
        title: data.title,
        location: data.location,
        description: data.description,
        is_global: data.is_global,
        recurring_group_id: groupId, // Store group ID for future reference
      };

      const { data: result, error } = await client
        .from("schedules")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        devError("Supabase recurring schedule insert error:", error);
        throw new Error(
          `Failed to create recurring schedule: ${error.message}`
        );
      }

      schedules.push(result);
    }

    devLog(
      `Successfully created ${schedules.length} recurring practice schedules`
    );
    return schedules;
  } catch (err: unknown) {
    devError("Add recurring practice error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to add recurring practice";
    throw new Error(errorMessage);
  }
}

// Delete recurring practice group
export async function deleteRecurringPracticeGroup(
  recurringGroupId: string
): Promise<void> {
  try {
    devLog("Deleting recurring practice group:", recurringGroupId);

    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("recurring_group_id", recurringGroupId);

    if (error) {
      devError("Supabase delete recurring group error:", error);
      throw new Error(error.message);
    }

    devLog("Successfully deleted recurring practice group");
  } catch (err: unknown) {
    devError("Delete recurring practice group error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Failed to delete recurring practice group";
    throw new Error(errorMessage);
  }
}

// Update recurring practice (delete old group, create new group)
export async function updateRecurringPractice(
  recurringGroupId: string,
  data: {
    team_id: string | null;
    event_type: "Practice";
    date_time: string;
    title?: string | null;
    location: string;
    description?: string;
    is_global?: boolean;
    recurringType: "count" | "date";
    recurringCount: number;
    recurringEndDate?: string;
    selectedDays: number[];
  }
): Promise<Schedule[]> {
  try {
    devLog("Updating recurring practice group:", recurringGroupId);

    // Delete existing recurring group
    await deleteRecurringPracticeGroup(recurringGroupId);

    // Create new recurring group with same ID
    const newSchedules = await addRecurringPractice({
      ...data,
      recurringGroupId: recurringGroupId, // Keep the same group ID
    });

    devLog(
      `Successfully updated recurring practice group with ${newSchedules.length} schedules`
    );
    return newSchedules;
  } catch (err: unknown) {
    devError("Update recurring practice error:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Failed to update recurring practice";
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
    devLog("Updating schedule:", { id, data });
    const { data: result, error } = await supabaseAdmin
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
export async function deleteSchedule(
  id: string,
  userId: string,
  isAdmin: boolean = false
): Promise<void> {
  try {
    // Check if user has permission to delete this schedule
    const { data: existingSchedule, error: fetchError } = await supabaseAdmin
      .from("schedules")
      .select("created_by")
      .eq("id", id)
      .single();

    if (fetchError) {
      devError("Error fetching schedule for deletion:", fetchError);
      throw new Error("Schedule not found");
    }

    if (!isAdmin && existingSchedule.created_by !== userId) {
      throw new Error("You can only delete schedules you created");
    }

    const { error } = await supabaseAdmin
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

// Bulk delete schedules (for coaches to delete all practices for their team)
export async function bulkDeleteSchedules(
  scheduleIds: string[],
  teamId: string
): Promise<void> {
  try {
    devLog("Bulk deleting schedules:", { count: scheduleIds.length, teamId });

    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    // Verify all schedules belong to the specified team
    const { data: schedules, error: fetchError } = await supabaseAdmin
      .from("schedules")
      .select("id, team_id, event_type")
      .in("id", scheduleIds);

    if (fetchError) {
      devError("Error fetching schedules for bulk deletion:", fetchError);
      throw new Error("Failed to fetch schedules");
    }

    // Verify all schedules belong to the team and are practices
    const invalidSchedules = schedules.filter(
      (s) => s.team_id !== teamId || s.event_type !== "Practice"
    );

    if (invalidSchedules.length > 0) {
      throw new Error(
        "Some schedules don't belong to the specified team or aren't practices"
      );
    }

    // Bulk delete all schedules
    const { error } = await supabaseAdmin
      .from("schedules")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", scheduleIds);

    if (error) {
      devError("Supabase bulk schedule delete error:", error);
      throw new Error(error.message);
    }

    devLog(`Successfully bulk deleted ${scheduleIds.length} schedules`);
  } catch (err: unknown) {
    devError("Bulk delete schedules error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to bulk delete schedules";
    throw new Error(errorMessage);
  }
}

// Add team update
export async function addUpdate(data: {
  team_id: string | null; // Allow null for global updates
  title: string;
  content: string;
  date_time?: string | null;
  image_url?: string;
  is_global?: boolean;
  created_by: string;
}): Promise<TeamUpdate> {
  try {
    devLog("Adding team update:", { ...data, created_by: "***" });

    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    // Handle "__GLOBAL__" case - convert to null and set is_global
    const insertData = { ...data };
    if (data.team_id === "__GLOBAL__" || data.is_global) {
      devLog(
        "Converting __GLOBAL__ to global update (team_id=null, is_global=true)"
      );
      insertData.team_id = null; // Override to null for program-wide
      insertData.is_global = true;
    }

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
    date_time?: string | null;
  }
): Promise<TeamUpdate> {
  try {
    devLog("Updating team update:", { id, data });

    if (!supabaseAdmin) {
      throw new Error("Admin client not available");
    }

    const updateData = {
      ...data,
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
export async function deleteUpdate(
  id: string,
  userId: string,
  isAdmin: boolean = false
): Promise<void> {
  try {
    // Check if user has permission to delete this update
    const { data: existingUpdate, error: fetchError } = await supabaseAdmin
      .from("team_updates")
      .select("created_by")
      .eq("id", id)
      .single();

    if (fetchError) {
      devError("Error fetching update for deletion:", fetchError);
      throw new Error("Update not found");
    }

    if (!isAdmin && existingUpdate.created_by !== userId) {
      throw new Error("You can only delete updates you created");
    }

    const { error } = await supabaseAdmin
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
