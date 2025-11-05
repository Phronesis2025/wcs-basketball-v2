import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";

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
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      devError("update-player-medical: supabaseAdmin not initialized");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
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
      devError("update-player-medical: Database error", error);
      return NextResponse.json(
        { error: "Failed to update medical information" },
        { status: 500 }
      );
    }

    devLog("update-player-medical: Successfully updated", {
      player_id,
      has_allergies: !!medical_allergies,
      has_conditions: !!medical_conditions,
      has_medications: !!medical_medications,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    devError("update-player-medical: Exception", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

