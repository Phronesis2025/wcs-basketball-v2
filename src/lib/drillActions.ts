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

    const { data, error } = await supabase
      .from("practice_drills")
      .insert({
        team_id: drillData.team_id,
        title: drillData.title.trim(),
        skills: drillData.skills,
        equipment: drillData.equipment,
        time: drillData.time.trim(),
        instructions: drillData.instructions.trim(),
        additional_info: drillData.additional_info?.trim() || null,
        benefits: drillData.benefits.trim(),
        difficulty: drillData.difficulty.trim(),
        category: drillData.category.trim(),
        week_number: 1, // Default week number since we removed the field
        image_url: drillData.image_url || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      devError("Error creating practice drill:", error);
      throw new Error(error.message);
    }

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
    const { data: existingDrill, error: fetchError } = await supabase
      .from("practice_drills")
      .select("created_by, team_id")
      .eq("id", drillId)
      .single();

    if (fetchError) {
      devError("Error fetching drill for update:", fetchError);
      throw new Error("Drill not found");
    }

    if (!isAdmin && existingDrill.created_by !== userId) {
      throw new Error("You can only update drills you created");
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (drillData.title !== undefined)
      updateData.title = drillData.title.trim();
    if (drillData.skills !== undefined) updateData.skills = drillData.skills;
    if (drillData.equipment !== undefined)
      updateData.equipment = drillData.equipment;
    if (drillData.time !== undefined) updateData.time = drillData.time.trim();
    if (drillData.instructions !== undefined)
      updateData.instructions = drillData.instructions.trim();
    if (drillData.additional_info !== undefined)
      updateData.additional_info = drillData.additional_info?.trim() || null;
    if (drillData.benefits !== undefined)
      updateData.benefits = drillData.benefits.trim();
    if (drillData.difficulty !== undefined)
      updateData.difficulty = drillData.difficulty.trim();
    if (drillData.category !== undefined)
      updateData.category = drillData.category.trim();
    if (drillData.image_url !== undefined)
      updateData.image_url = drillData.image_url;

    const { data, error } = await supabase
      .from("practice_drills")
      .update(updateData)
      .eq("id", drillId)
      .select()
      .single();

    if (error) {
      devError("Error updating practice drill:", error);
      throw new Error(error.message);
    }

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
    const { data: existingDrill, error: fetchError } = await supabase
      .from("practice_drills")
      .select("created_by")
      .eq("id", drillId)
      .single();

    if (fetchError) {
      devError("Error fetching drill for deletion:", fetchError);
      throw new Error("Drill not found");
    }

    if (!isAdmin && existingDrill.created_by !== userId) {
      throw new Error("You can only delete drills you created");
    }

    const { error } = await supabase
      .from("practice_drills")
      .delete()
      .eq("id", drillId);

    if (error) {
      devError("Error deleting practice drill:", error);
      throw new Error(error.message);
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
