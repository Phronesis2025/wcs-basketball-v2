import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

// PUT - Update a coach
export async function PUT(
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

    const { firstName, lastName, email, bio, imageUrl, quote, is_active } =
      await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
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
          devError("Failed to update coach:", coachRetryError);
          return NextResponse.json(
            { error: "Failed to update coach" },
            { status: 500 }
          );
        }

        devLog(
          "Coach updated successfully (without is_active):",
          coachRetry.id
        );
        return NextResponse.json({
          success: true,
          message: "Coach updated successfully",
          data: coachRetry,
        });
      }

      devError("Failed to update coach:", coachError);
      return NextResponse.json(
        { error: "Failed to update coach" },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      message: "Coach updated successfully",
      data: coach,
    });
  } catch (error) {
    devError("Update coach API error:", error);
    return NextResponse.json(
      {
        error: "Failed to update coach",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
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

    const { id: coachId } = await params;

    devLog("Deleting coach:", coachId);

    // Get coach info first
    const { data: coach, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .select("user_id")
      .eq("id", coachId)
      .single();

    if (coachError || !coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    // Soft delete coach
    const { error: deleteCoachError } = await supabaseAdmin!
      .from("coaches")
      .update({ is_deleted: true })
      .eq("id", coachId);

    if (deleteCoachError) {
      devError("Failed to delete coach:", deleteCoachError);
      return NextResponse.json(
        { error: "Failed to delete coach" },
        { status: 500 }
      );
    }

    devLog("Coach deleted successfully:", coachId);

    return NextResponse.json({
      success: true,
      message: "Coach deleted successfully",
    });
  } catch (error) {
    devError("Delete coach API error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete coach",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
