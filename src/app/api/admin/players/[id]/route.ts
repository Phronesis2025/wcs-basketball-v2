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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
      teamId,
      name,
      jerseyNumber,
      grade,
      dateOfBirth,
      gender,
      parentName,
      parentEmail,
      parentPhone,
      emergencyContact,
      emergencyPhone,
      is_active,
    } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    const { id: playerId } = await params;

    devLog("Updating player:", { playerId, name, teamId, dateOfBirth });

    // Prepare update data
    const age = calculateAge(dateOfBirth ?? null);

    const updateData: any = {
      team_id: teamId || null,
      name,
      jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      grade: grade || null,
      date_of_birth: dateOfBirth || null,
      age: age,
      gender: gender || null,
      parent_name: parentName || null,
      parent_email: parentEmail || null,
      parent_phone: parentPhone || null,
      emergency_contact: emergencyContact || null,
      emergency_phone: emergencyPhone || null,
    };

    // Only add is_active if it's provided and the column exists
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Update player
    const { data: player, error: playerError } = await supabaseAdmin!
      .from("players")
      .update(updateData)
      .eq("id", playerId)
      .select()
      .single();

    if (playerError) {
      // If the error is about missing column, try without is_active
      if (
        playerError.message?.includes("is_active") &&
        is_active !== undefined
      ) {
        devLog("is_active column doesn't exist, updating without it");
        const { data: playerRetry, error: playerRetryError } =
          await supabaseAdmin!
            .from("players")
            .update({
              team_id: teamId || null,
              name,
              jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
              grade: grade || null,
              date_of_birth: dateOfBirth || null,
              age: age,
              gender: gender || null,
              parent_name: parentName || null,
              parent_email: parentEmail || null,
              parent_phone: parentPhone || null,
              emergency_contact: emergencyContact || null,
              emergency_phone: emergencyPhone || null,
            })
            .eq("id", playerId)
            .select()
            .single();

        if (playerRetryError) {
          devError("Failed to update player:", playerRetryError);
          return NextResponse.json(
            { error: "Failed to update player" },
            { status: 500 }
          );
        }

        devLog(
          "Player updated successfully (without is_active):",
          playerRetry.id
        );
        return NextResponse.json({
          success: true,
          message: "Player updated successfully",
          data: playerRetry,
        });
      }

      devError("Failed to update player:", playerError);
      return NextResponse.json(
        { error: "Failed to update player" },
        { status: 500 }
      );
    }

    devLog("Player updated successfully:", player.id);

    return NextResponse.json({
      success: true,
      message: "Player updated successfully",
      data: player,
    });
  } catch (error) {
    devError("Update player API error:", error);
    return NextResponse.json(
      {
        error: "Failed to update player",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a player
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id: playerId } = await params;

    devLog("Deleting player:", playerId);

    // Soft delete player
    const { error: deletePlayerError } = await supabaseAdmin!
      .from("players")
      .update({ is_deleted: true })
      .eq("id", playerId);

    if (deletePlayerError) {
      devError("Failed to delete player:", deletePlayerError);
      return NextResponse.json(
        { error: "Failed to delete player" },
        { status: 500 }
      );
    }

    devLog("Player deleted successfully:", playerId);

    return NextResponse.json({
      success: true,
      message: "Player deleted successfully",
    });
  } catch (error) {
    devError("Delete player API error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete player",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
