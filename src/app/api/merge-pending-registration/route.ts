import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import { getAdminPlayerRegistrationEmail } from "@/lib/emailTemplates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    // Get pending registration
    const { data: pendingReg, error: pendingError } = await supabaseAdmin
      .from("pending_registrations")
      .select("*")
      .eq("email", email)
      .is("merged_at", null)
      .maybeSingle();

    if (pendingError) {
      devError("merge-pending-registration: Error fetching pending registration", pendingError);
      return NextResponse.json(
        { error: "Failed to fetch pending registration" },
        { status: 500 }
      );
    }

    if (!pendingReg || pendingReg.merged_at) {
      // No pending registration or already merged
      return NextResponse.json({ success: true, message: "No pending registration to merge" });
    }

    // Get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser();
    if (userError || !user) {
      devError("merge-pending-registration: Failed to get user", userError);
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Create or get parent record
    const { data: existingParent } = await supabaseAdmin
      .from("parents")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    let parentId: string;

    if (existingParent) {
      parentId = existingParent.id;
      if (!existingParent.user_id) {
        await supabaseAdmin
          .from("parents")
          .update({ user_id: user.id })
          .eq("id", parentId);
      }
    } else {
      const { data: newParent, error: parentError } = await supabaseAdmin
        .from("parents")
        .insert([{
          user_id: user.id,
          first_name: pendingReg.parent_first_name,
          last_name: pendingReg.parent_last_name,
          email: pendingReg.email,
        }])
        .select("*")
        .single();

      if (parentError || !newParent) {
        devError("merge-pending-registration: Failed to create parent", parentError);
        return NextResponse.json(
          { error: "Failed to create parent record" },
          { status: 500 }
        );
      }

      parentId = newParent.id;
    }

    // Create player record
    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .insert([{
        parent_id: parentId,
        name: `${pendingReg.player_first_name} ${pendingReg.player_last_name}`,
        first_name: pendingReg.player_first_name,
        last_name: pendingReg.player_last_name,
        date_of_birth: pendingReg.player_birthdate,
        grade: pendingReg.player_grade,
        gender: pendingReg.player_gender,
        previous_experience: pendingReg.player_experience,
        status: "pending",
        parent_email: pendingReg.email, // Required for Stripe checkout
      }])
      .select("*")
      .single();

    if (playerError) {
      devError("merge-pending-registration: Failed to create player", playerError);
      return NextResponse.json(
        { error: "Failed to create player record" },
        { status: 500 }
      );
    }

    // Mark as merged
    await supabaseAdmin
      .from("pending_registrations")
      .update({ merged_at: new Date().toISOString() })
      .eq("id", pendingReg.id);

    // Notify admin(s) about new registration (same as register-player API)
    const adminEmail = process.env.ADMIN_NOTIFICATIONS_TO;
    if (adminEmail) {
      const adminEmailData = getAdminPlayerRegistrationEmail({
        playerFirstName: pendingReg.player_first_name,
        playerLastName: pendingReg.player_last_name,
        parentName: `${pendingReg.parent_first_name} ${pendingReg.parent_last_name}`.trim(),
        parentEmail: pendingReg.email,
        parentPhone: "", // Pending registration doesn't store phone
        grade: pendingReg.player_grade || "",
        gender: pendingReg.player_gender || "",
        playerId: player.id,
      });

      await sendEmail(adminEmail, adminEmailData.subject, adminEmailData.html);

      devLog("merge-pending-registration: admin notification sent", { to: adminEmail });
    }

    devLog("merge-pending-registration: Successfully merged", {
      parentId,
      playerId: player.id,
    });

    return NextResponse.json({
      success: true,
      message: "Pending registration merged successfully",
      parentId,
      playerId: player.id,
    });
  } catch (error) {
    devError("merge-pending-registration: Exception", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

