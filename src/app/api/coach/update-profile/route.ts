import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new ValidationError("No updates provided");
    }

    devLog("Updating profile for user:", userId, "with updates:", updates);

    // Get the coach record first
    const { data: coachData, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (coachError) {
      throw new NotFoundError("Coach not found");
    }

    // Prepare updates for coaches table
    const coachUpdates: any = {};
    const userUpdates: any = {};

    // Map the updates to the correct tables
    if (updates.first_name !== undefined)
      coachUpdates.first_name = updates.first_name;
    if (updates.last_name !== undefined)
      coachUpdates.last_name = updates.last_name;
    if (updates.phone !== undefined) coachUpdates.phone = updates.phone;
    if (updates.bio !== undefined) coachUpdates.bio = updates.bio;
    if (updates.quote !== undefined) coachUpdates.quote = updates.quote;
    if (updates.image_url !== undefined)
      coachUpdates.image_url = updates.image_url;

    // Handle email updates (requires updating auth.users as well)
    if (updates.email !== undefined) {
      userUpdates.email = updates.email;

      // Update email in auth.users
      const { error: authError } =
        await supabaseAdmin!.auth.admin.updateUserById(userId, {
          email: updates.email,
        });

      if (authError) {
        throw new ApiError("Failed to update email", 500, undefined, authError);
      }
    }

    // Update coaches table if there are coach updates
    if (Object.keys(coachUpdates).length > 0) {
      const { error: updateCoachError } = await supabaseAdmin!
        .from("coaches")
        .update(coachUpdates)
        .eq("id", coachData.id);

      if (updateCoachError) {
        throw new DatabaseError("Failed to update coach information", updateCoachError);
      }
    }

    // Update users table if there are user updates
    if (Object.keys(userUpdates).length > 0) {
      const { error: updateUserError } = await supabaseAdmin!
        .from("users")
        .update(userUpdates)
        .eq("id", userId);

      if (updateUserError) {
        throw new DatabaseError("Failed to update user information", updateUserError);
      }
    }

    devLog("Profile updated successfully for user:", userId);

    return formatSuccessResponse({
      message: "Profile updated successfully",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
