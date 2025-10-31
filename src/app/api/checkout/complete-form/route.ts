import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      player_id,
      is_new_player,
      player,
      user_email, // User email to find parent
      school_name,
      shirt_size,
      position_preference,
      previous_experience,
      address_line1,
      address_line2,
      city,
      state,
      zip,
      guardian_relationship,
      emergency_contact,
      emergency_phone,
      medical_allergies,
      medical_conditions,
      medical_medications,
      doctor_name,
      doctor_phone,
      consent_photo_release,
      consent_medical_treatment,
      consent_participation,
    } = body || {};

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    // Step 1: Get parent record
    let parentRecord;

    if (is_new_player && user_email) {
      // New player - find parent by email
      const { data: parent, error: parentError } = await supabaseAdmin
        .from("parents")
        .select("*")
        .eq("email", user_email)
        .maybeSingle();

      if (parentError) {
        devError("checkout complete-form parent lookup error", parentError);
        return NextResponse.json(
          { error: "Failed to find parent record" },
          { status: 500 }
        );
      }

      if (!parent) {
        return NextResponse.json(
          { error: "Parent record not found. Please complete initial registration first." },
          { status: 404 }
        );
      }

      parentRecord = parent;
    } else if (player_id) {
      // Existing player - get parent from player
      const { data: existingPlayer } = await supabaseAdmin
        .from("players")
        .select("parent_id")
        .eq("id", player_id)
        .single();

      if (!existingPlayer || !existingPlayer.parent_id) {
        return NextResponse.json(
          { error: "Player not found or has no parent" },
          { status: 404 }
        );
      }

      const { data: parent } = await supabaseAdmin
        .from("parents")
        .select("*")
        .eq("id", existingPlayer.parent_id)
        .single();

      if (!parent) {
        return NextResponse.json(
          { error: "Parent not found" },
          { status: 404 }
        );
      }

      parentRecord = parent;
    } else {
      return NextResponse.json(
        { error: "Missing player_id or user_email" },
        { status: 400 }
      );
    }

    if (!parentRecord) {
      return NextResponse.json(
        { error: "Could not find parent record" },
        { status: 404 }
      );
    }

    // Step 2: Update parent record with detailed information
    const { data: updatedParent, error: parentUpdateError } = await supabaseAdmin
      .from("parents")
      .update({
        address_line1: address_line1 || null,
        address_line2: address_line2 || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        guardian_relationship: guardian_relationship || null,
        emergency_contact: emergency_contact || null,
        emergency_phone: emergency_phone || null,
        medical_allergies: medical_allergies || null,
        medical_conditions: medical_conditions || null,
        medical_medications: medical_medications || null,
        doctor_name: doctor_name || null,
        doctor_phone: doctor_phone || null,
        consent_photo_release: !!consent_photo_release,
        consent_medical_treatment: !!consent_medical_treatment,
        consent_participation: !!consent_participation,
        checkout_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parentRecord.id)
      .select("*")
      .single();

    if (parentUpdateError) {
      devError("checkout complete-form parent update error", parentUpdateError);
      return NextResponse.json(
        { error: "Failed to update parent information" },
        { status: 500 }
      );
    }

    // Step 3: Create new player OR update existing player
    let finalPlayerId = player_id;

    if (is_new_player && player) {
      // Create new player
      const { data: newPlayer, error: playerCreateError } = await supabaseAdmin
        .from("players")
        .insert([
          {
            parent_id: parentRecord.id,
            name: `${player.first_name} ${player.last_name}`,
            date_of_birth: player.birthdate,
            grade: player.grade,
            gender: player.gender,
            school_name: school_name || null,
            shirt_size: shirt_size || null,
            position_preference: position_preference || null,
            previous_experience: previous_experience || null,
            status: "pending",
            is_deleted: false,
            waiver_signed: false, // Will be signed at registration
          },
        ])
        .select("*")
        .single();

      if (playerCreateError) {
        devError("checkout complete-form player create error", playerCreateError);
        return NextResponse.json(
          { error: "Failed to create player" },
          { status: 500 }
        );
      }

      finalPlayerId = newPlayer.id;
      devLog("checkout complete-form: new player created", { player_id: finalPlayerId });
    } else if (player_id) {
      // Update existing player with player details
      const updateData: any = {};
      if (school_name !== undefined) updateData.school_name = school_name || null;
      if (shirt_size !== undefined) updateData.shirt_size = shirt_size || null;
      if (position_preference !== undefined) updateData.position_preference = position_preference || null;
      if (previous_experience !== undefined) updateData.previous_experience = previous_experience || null;

      if (Object.keys(updateData).length > 0) {
        const { error: playerUpdateError } = await supabaseAdmin
          .from("players")
          .update(updateData)
          .eq("id", player_id);

        if (playerUpdateError) {
          devError("checkout complete-form player update error", playerUpdateError);
          return NextResponse.json(
            { error: "Failed to update player information" },
            { status: 500 }
          );
        }
      }

      devLog("checkout complete-form: player updated", { player_id });
    }

    return NextResponse.json({
      success: true,
      player_id: finalPlayerId,
      parent_id: parentRecord.id,
    });
  } catch (e) {
    devError("checkout complete-form exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

