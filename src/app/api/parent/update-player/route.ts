import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

const calculateAge = (dateOfBirth: string | null): number | null => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const body = await request.json();
    const {
      player_id,
      name,
      grade,
      date_of_birth,
      gender,
      jersey_number,
      shirt_size,
      position_preference,
      previous_experience,
      school_name,
    } = body;

    if (!player_id) {
      throw new ValidationError("Player ID required");
    }

    if (!name) {
      throw new ValidationError("Player name is required");
    }

    devLog("Updating player info for parent:", { player_id, name });

    // Calculate age if date of birth is provided
    const age = calculateAge(date_of_birth || null);

    // Build update object
    const updateData: any = {
      name,
      grade: grade || null,
      date_of_birth: date_of_birth || null,
      age: age,
      gender: gender || null,
      jersey_number: jersey_number ? parseInt(jersey_number) : null,
      shirt_size: shirt_size || null,
      position_preference: position_preference || null,
      previous_experience: previous_experience || null,
      school_name: school_name || null,
    };

    // Update player record
    const { data: updatedPlayer, error } = await supabaseAdmin
      .from("players")
      .update(updateData)
      .eq("id", player_id)
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to update player information", error);
    }

    devLog("Player info updated successfully:", player_id);

    return formatSuccessResponse({
      player: updatedPlayer,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

