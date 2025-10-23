import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string | null) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
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

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const {
      name,
      jerseyNumber,
      grade,
      dateOfBirth,
      gender,
      teamId,
      parentName,
      parentEmail,
      parentPhone,
      emergencyContact,
      emergencyPhone,
      is_active,
    } = await request.json();

    // Validate required fields
    if (!name || !dateOfBirth || !gender) {
      return NextResponse.json(
        { error: "Player name, date of birth, and gender are required" },
        { status: 400 }
      );
    }

    // Calculate age
    const age = calculateAge(dateOfBirth);

    // Prepare player data
    const playerData: any = {
      name: name.trim(),
      jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      grade: grade || null,
      date_of_birth: dateOfBirth,
      age: age,
      gender: gender,
      team_id: teamId || null,
      parent_name: parentName || null,
      parent_email: parentEmail || null,
      parent_phone: parentPhone || null,
      emergency_contact: emergencyContact || null,
      emergency_phone: emergencyPhone || null,
    };

    // Only add is_active if it's provided and the column exists
    if (is_active !== undefined) {
      playerData.is_active = is_active;
    }

    devLog("Creating player:", { name, teamId, gender, age });

    // Create player
    const { data: player, error: playerError } = await supabaseAdmin!
      .from("players")
      .insert([playerData])
      .select()
      .single();

    if (playerError) {
      // If the error is about missing column, try without is_active
      if (
        playerError.message?.includes("is_active") &&
        is_active !== undefined
      ) {
        devLog("is_active column doesn't exist, creating without it");
        const { data: playerRetry, error: playerRetryError } =
          await supabaseAdmin!
            .from("players")
            .insert([
              {
                name: name.trim(),
                jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
                grade: grade || null,
                date_of_birth: dateOfBirth,
                age: age,
                gender: gender,
                team_id: teamId || null,
                parent_name: parentName || null,
                parent_email: parentEmail || null,
                parent_phone: parentPhone || null,
                emergency_contact: emergencyContact || null,
                emergency_phone: emergencyPhone || null,
              },
            ])
            .select()
            .single();

        if (playerRetryError) {
          devError("Failed to create player (retry):", playerRetryError);
          return NextResponse.json(
            { error: "Failed to create player" },
            { status: 500 }
          );
        }

        devLog(
          "Player created successfully (without is_active):",
          playerRetry.id
        );
        return NextResponse.json({
          success: true,
          message: "Player created successfully",
          player: playerRetry,
        });
      }

      devError("Failed to create player:", playerError);
      return NextResponse.json(
        { error: "Failed to create player" },
        { status: 500 }
      );
    }

    devLog("Player created successfully:", player.id);

    return NextResponse.json({
      success: true,
      message: "Player created successfully",
      player: player,
    });
  } catch (error) {
    devError("Create player API error:", error);
    return NextResponse.json(
      {
        error: "Failed to create player",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
