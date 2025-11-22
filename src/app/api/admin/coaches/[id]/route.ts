import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { AuthenticationError, AuthorizationError, ValidationError, DatabaseError, NotFoundError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

// PUT - Update a coach
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    const requestData = await request.json();
    devLog("Received coach update data:", requestData);

    const { firstName, lastName, email, bio, imageUrl, quote, is_active } =
      requestData;

    if (!firstName || !lastName || !email) {
      throw new ValidationError("First name, last name, and email are required");
    }

    const { id: coachId } = await params;

    devLog("Updating coach:", { coachId, firstName, lastName, email });

    // Prepare update data
    const updateData: any = {
      first_name: firstName,
      last_name: lastName,
      email,
      bio: bio || null,
      image_url: imageUrl || null,
      quote: quote || null,
    };

    // Only add is_active if it's provided and the column exists
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    // Update coach
    const { data: coach, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .update(updateData)
      .eq("id", coachId)
      .select()
      .single();

    if (coachError) {
      // If the error is about missing column, try without is_active
      if (
        coachError.message?.includes("is_active") &&
        is_active !== undefined
      ) {
        devLog("is_active column doesn't exist, updating without it");
        const { data: coachRetry, error: coachRetryError } =
          await supabaseAdmin!
            .from("coaches")
            .update({
              first_name: firstName,
              last_name: lastName,
              email,
              bio: bio || null,
              image_url: imageUrl || null,
              quote: quote || null,
            })
            .eq("id", coachId)
            .select()
            .single();

        if (coachRetryError) {
          throw new DatabaseError("Failed to update coach", coachRetryError);
        }

        devLog(
          "Coach updated successfully (without is_active):",
          coachRetry.id
        );
        return formatSuccessResponse({
          message: "Coach updated successfully",
          data: coachRetry,
        });
      }

      throw new DatabaseError("Failed to update coach", coachError);
    }

    // Update user email if it changed
    const { error: userUpdateError } = await supabaseAdmin!
      .from("users")
      .update({ email })
      .eq("id", coach.user_id);

    if (userUpdateError) {
      devError("Failed to update user email:", userUpdateError);
    }

    // If coach is being deactivated, remove them from all teams
    if (is_active === false) {
      devLog("Coach is being deactivated, removing from all teams");
      const { error: removeFromTeamsError } = await supabaseAdmin!
        .from("team_coaches")
        .delete()
        .eq("coach_id", coachId);

      if (removeFromTeamsError) {
        devError("Failed to remove coach from teams:", removeFromTeamsError);
      } else {
        devLog("Coach removed from all teams successfully");
      }
    }

    devLog("Coach updated successfully:", coach.id);

    return formatSuccessResponse({
      message: "Coach updated successfully",
      data: coach,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

// DELETE - Delete a coach
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    const { id: coachId } = await params;

    devLog("Deleting coach:", coachId);

    // Get coach info first
    const { data: coach, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("user_id")
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      throw new NotFoundError("Coach not found");
    }

    // Soft delete coach
    const { error: deleteCoachError } = await supabaseAdmin!
      .from("coaches")
      .update({ is_deleted: true })
      .eq("id", coachId);

    if (deleteCoachError) {
      throw new DatabaseError("Failed to delete coach", deleteCoachError);
    }

    devLog("Coach deleted successfully:", coachId);

    return formatSuccessResponse({
      message: "Coach deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
