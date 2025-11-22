import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      player_id,
      medical_allergies,
      medical_conditions,
      medical_medications,
      doctor_name,
      doctor_phone,
    } = body;

    if (!player_id) {
      throw new ValidationError("Player ID is required");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Update player medical information
    const { data, error } = await supabaseAdmin
      .from("players")
      .update({
        medical_allergies: medical_allergies || null,
        medical_conditions: medical_conditions || null,
        medical_medications: medical_medications || null,
        doctor_name: doctor_name || null,
        doctor_phone: doctor_phone || null,
      })
      .eq("id", player_id)
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to update medical information", error);
    }

    devLog("update-player-medical: Successfully updated", {
      player_id,
      has_allergies: !!medical_allergies,
      has_conditions: !!medical_conditions,
      has_medications: !!medical_medications,
    });

    return formatSuccessResponse(data);
  } catch (error) {
    return handleApiError(error, request);
  }
}

