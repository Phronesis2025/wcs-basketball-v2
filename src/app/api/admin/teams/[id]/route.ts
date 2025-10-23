import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

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
      teamName,
      ageGroup,
      gender,
      gradeLevel,
      season,
      logoUrl,
      logo_url, // Support both naming conventions
      teamImageUrl,
      is_active,
      coachEmails, // Array of coach emails
    } = await request.json();

    if (!teamName || !ageGroup || !gender) {
      return NextResponse.json(
        { error: "Team name, age group, and gender are required" },
        { status: 400 }
      );
    }

    const { id: teamId } = await params;

    devLog("Updating team:", { teamId, teamName, ageGroup, gender });

    // Prepare update data
    const updateData: any = {
      name: teamName,
      age_group: ageGroup,
      gender,
      grade_level: gradeLevel || null,
      season: season || null,
      logo_url: logoUrl || logo_url || null,
      team_image: teamImageUrl || null,
    };

    // Only add is_active if it's provided and the column exists
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Update team
    const { data: team, error: teamError } = await supabaseAdmin!
      .from("teams")
      .update(updateData)
      .eq("id", teamId)
      .select()
      .single();

    if (teamError) {
      // If the error is about missing column, try without is_active
      if (teamError.message?.includes("is_active") && is_active !== undefined) {
        devLog("is_active column doesn't exist, updating without it");
        const { data: teamRetry, error: teamRetryError } = await supabaseAdmin!
          .from("teams")
          .update({
            name: teamName,
            age_group: ageGroup,
            gender,
            grade_level: gradeLevel || null,
            season: season || null,
            logo_url: logoUrl || null,
            team_image: teamImageUrl || null,
          })
          .eq("id", teamId)
          .select()
          .single();

        if (teamRetryError) {
          devError("Failed to update team:", teamRetryError);
          return NextResponse.json(
            { error: "Failed to update team" },
            { status: 500 }
          );
        }

        devLog("Team updated successfully (without is_active):", teamRetry.id);
        return NextResponse.json({
          success: true,
          message: "Team updated successfully",
          data: teamRetry,
        });
      }

      devError("Failed to update team:", teamError);
      return NextResponse.json(
        { error: "Failed to update team" },
        { status: 500 }
      );
    }

    // If team is being deactivated, mark all players as unassigned
    if (is_active === false) {
      devLog("Team is being deactivated, marking all players as unassigned");
      const { error: unassignPlayersError } = await supabaseAdmin!
        .from("players")
        .update({ team_id: null })
        .eq("team_id", teamId);

      if (unassignPlayersError) {
        devError("Failed to unassign players from team:", unassignPlayersError);
      } else {
        devLog("All players unassigned from team successfully");
      }
    }

    // Handle coach assignments if provided
    if (coachEmails && Array.isArray(coachEmails)) {
      // Remove existing coach assignments
      const { error: deleteError } = await supabaseAdmin!
        .from("team_coaches")
        .delete()
        .eq("team_id", teamId);

      if (deleteError) {
        devError("Failed to remove existing coach assignments:", deleteError);
        // Continue with team update even if coach assignment fails
      }

      // Add new coach assignments
      if (coachEmails.length > 0) {
        // Get coach IDs for the provided emails, filtering out inactive coaches
        const { data: coaches, error: coachesError } = await supabaseAdmin!
          .from("coaches")
          .select("id, email, is_active")
          .in("email", coachEmails);

        if (coachesError) {
          devError("Failed to fetch coaches:", coachesError);
        } else if (coaches && coaches.length > 0) {
          // Filter out inactive coaches
          const activeCoaches = coaches.filter(
            (coach) => coach.is_active !== false
          );

          if (activeCoaches.length === 0) {
            devLog("No active coaches found for team assignment");
          } else {
            // Create team_coaches relationships only for active coaches
            const teamCoachInserts = activeCoaches.map((coach) => ({
              team_id: teamId,
              coach_id: coach.id,
            }));

            const { error: insertError } = await supabaseAdmin!
              .from("team_coaches")
              .insert(teamCoachInserts);

            if (insertError) {
              devError("Failed to create coach assignments:", insertError);
            } else {
              devLog(
                `Coach assignments updated successfully for ${activeCoaches.length} active coaches`
              );
            }
          }
        }
      }
    }

    devLog("Team updated successfully:", team.id);

    return NextResponse.json({
      success: true,
      message: "Team updated successfully",
      data: team,
    });
  } catch (error) {
    devError("Update team API error:", error);
    return NextResponse.json(
      {
        error: "Failed to update team",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a team
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

    const { id: teamId } = await params;

    devLog("Deleting team:", teamId);

    // Soft delete team
    const { error: deleteTeamError } = await supabaseAdmin!
      .from("teams")
      .update({ is_deleted: true })
      .eq("id", teamId);

    if (deleteTeamError) {
      devError("Failed to delete team:", deleteTeamError);
      return NextResponse.json(
        { error: "Failed to delete team" },
        { status: 500 }
      );
    }

    devLog("Team deleted successfully:", teamId);

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    devError("Delete team API error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete team",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
