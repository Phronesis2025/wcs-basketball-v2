import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }

    devLog("Updating profile for user:", userId, "with updates:", updates);

    // Get the coach record first
    const { data: coachData, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (coachError) {
      devError("Error fetching coach data:", coachError);
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
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
        devError("Error updating email in auth:", authError);
        return NextResponse.json(
          { error: "Failed to update email" },
          { status: 500 }
        );
      }
    }

    // Update coaches table if there are coach updates
    if (Object.keys(coachUpdates).length > 0) {
      const { error: updateCoachError } = await supabaseAdmin!
        .from("coaches")
        .update(coachUpdates)
        .eq("id", coachData.id);

      if (updateCoachError) {
        devError("Error updating coach data:", updateCoachError);
        return NextResponse.json(
          { error: "Failed to update coach information" },
          { status: 500 }
        );
      }
    }

    // Update users table if there are user updates
    if (Object.keys(userUpdates).length > 0) {
      const { error: updateUserError } = await supabaseAdmin!
        .from("users")
        .update(userUpdates)
        .eq("id", userId);

      if (updateUserError) {
        devError("Error updating user data:", updateUserError);
        return NextResponse.json(
          { error: "Failed to update user information" },
          { status: 500 }
        );
      }
    }

    devLog("Profile updated successfully for user:", userId);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    devError("Update profile API error:", error);
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
