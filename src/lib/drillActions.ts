// src/lib/drillActions.ts
import { supabase } from "./supabaseClient";
import { devLog, devError } from "./security";

export type PracticeDrillInput = {
  team_id: string;
  title: string;
  skills: string[];
  equipment: string[];
  time: string;
  instructions: string;
  additional_info?: string;
  benefits: string;
  difficulty: string;
  category: string;
  week_number?: number; // Optional since we provide default
  image_url?: string;
};

// Get all practice drills for a team
export async function getPracticeDrills(teamId: string) {
  try {
    devLog("Fetching practice drills for team:", teamId);

    const { data, error } = await supabase
      .from("practice_drills")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) {
      devError("Error fetching practice drills:", error);
      throw new Error(error.message);
    }

    devLog("Successfully fetched practice drills:", data?.length || 0);
    return data || [];
  } catch (err: unknown) {
    devError("Error in getPracticeDrills:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch practice drills";
    throw new Error(errorMessage);
  }
}

// Get all practice drills (for admin view)
export async function getAllPracticeDrills() {
  try {
    devLog("Fetching all practice drills");

    const { data, error } = await supabase
      .from("practice_drills")
      .select(
        `
        *,
        teams!practice_drills_team_id_fkey (
          id,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      devError("Error fetching all practice drills:", error);
      throw new Error(error.message);
    }

    devLog("Successfully fetched all practice drills:", data?.length || 0);
    return data || [];
  } catch (err: unknown) {
    devError("Error in getAllPracticeDrills:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch practice drills";
    throw new Error(errorMessage);
  }
}

// Create a new practice drill
export async function createPracticeDrill(
  drillData: PracticeDrillInput,
  userId: string
) {
  try {
    devLog("Creating practice drill:", drillData.title);

    // Validate required fields
    if (!drillData.title.trim()) {
      throw new Error("Title is required");
    }
    if (!drillData.skills.length) {
      throw new Error("At least one skill is required");
    }
    if (!drillData.equipment.length) {
      throw new Error("At least one equipment item is required");
    }
    if (!drillData.time.trim()) {
      throw new Error("Time is required");
    }
    if (!drillData.instructions.trim()) {
      throw new Error("Instructions are required");
    }
    if (!drillData.benefits.trim()) {
      throw new Error("Benefits are required");
    }
    if (!drillData.difficulty.trim()) {
      throw new Error("Difficulty is required");
    }
    if (!drillData.category.trim()) {
      throw new Error("Category is required");
    }

    const resp = await fetch("/api/drills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drillData, userId }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API create drill failed:", body);
      throw new Error(body.error || "Failed to create practice drill");
    }
    const data = await resp.json();

    devLog("Successfully created practice drill:", data.id);
    return data;
  } catch (err: unknown) {
    devError("Error in createPracticeDrill:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to create practice drill";
    throw new Error(errorMessage);
  }
}

// Update an existing practice drill
export async function updatePracticeDrill(
  drillId: string,
  drillData: Partial<PracticeDrillInput>,
  userId: string,
  isAdmin: boolean = false
) {
  try {
    devLog("Updating practice drill:", drillId);

    // Check if user has permission to update this drill
    const resp = await fetch("/api/drills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drillId, drillData, userId, isAdmin }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API update drill failed:", body);
      throw new Error(body.error || "Failed to update practice drill");
    }
    const data = await resp.json();

    devLog("Successfully updated practice drill:", drillId);
    return data;
  } catch (err: unknown) {
    devError("Error in updatePracticeDrill:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update practice drill";
    throw new Error(errorMessage);
  }
}

// Delete a practice drill (soft delete)
export async function deletePracticeDrill(
  drillId: string,
  userId: string,
  isAdmin: boolean = false
) {
  try {
    devLog("Deleting practice drill:", drillId);

    // Check if user has permission to delete this drill
    const resp = await fetch("/api/drills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drillId, userId, isAdmin }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API delete drill failed:", body);
      throw new Error(body.error || "Failed to delete practice drill");
    }

    devLog("Successfully deleted practice drill:", drillId);
  } catch (err: unknown) {
    devError("Error in deletePracticeDrill:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete practice drill";
    throw new Error(errorMessage);
  }
}

// Get practice drill by ID
export async function getPracticeDrillById(drillId: string) {
  try {
    devLog("Fetching practice drill by ID:", drillId);

    const { data, error } = await supabase
      .from("practice_drills")
      .select(
        `
        *,
        teams!practice_drills_team_id_fkey (
          id,
          name
        )
      `
      )
      .eq("id", drillId)
      .single();

    if (error) {
      devError("Error fetching practice drill:", error);
      throw new Error(error.message);
    }

    devLog("Successfully fetched practice drill:", data.id);
    return data;
  } catch (err: unknown) {
    devError("Error in getPracticeDrillById:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch practice drill";
    throw new Error(errorMessage);
  }
}
