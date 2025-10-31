import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import {
  getPlayerRegistrationEmail,
  getAdminPlayerRegistrationEmail,
} from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      parent_user_id,
      parent_name,
      parent_email,
      parent_phone,
      parent_first_name,
      parent_last_name,
      player: { first_name, last_name, birthdate, grade, gender },
      waiver_signed,
    } = body || {};

    if (
      !parent_user_id ||
      !parent_email ||
      !first_name ||
      !last_name ||
      !birthdate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    // Step 1: Create or get parent record with basic info only
    let parentRecord;
    const { data: existingParent } = await supabaseAdmin
      .from("parents")
      .select("*")
      .eq("email", parent_email)
      .maybeSingle();

    // Track whether this is an existing parent; used later to decide email behavior
    const isExistingParent = !!existingParent;

    if (existingParent) {
      // Parent exists, update basic info if needed
      parentRecord = existingParent;
      const updates: any = {};
      if (parent_first_name && !existingParent.first_name) {
        updates.first_name = parent_first_name;
      }
      if (parent_last_name && !existingParent.last_name) {
        updates.last_name = parent_last_name;
      }
      if (parent_phone && !existingParent.phone) {
        updates.phone = parent_phone;
      }
      if (parent_user_id && !existingParent.user_id) {
        updates.user_id = parent_user_id;
      }
      
      if (Object.keys(updates).length > 0) {
        const { data: updatedParent, error: updateError } = await supabaseAdmin
          .from("parents")
          .update(updates)
          .eq("id", existingParent.id)
          .select("*")
          .single();
        
        if (updateError) {
          devError("register-player parent update error", updateError);
        } else if (updatedParent) {
          parentRecord = updatedParent;
        }
      }
    } else {
      // Create new parent record with basic info only
      const { data: newParent, error: parentError } = await supabaseAdmin
        .from("parents")
        .insert([
          {
            user_id: parent_user_id,
            first_name: parent_first_name || parent_name?.split(" ")[0] || "",
            last_name: parent_last_name || parent_name?.split(" ").slice(1).join(" ") || "",
            email: parent_email,
            phone: parent_phone || null,
          },
        ])
        .select("*")
        .single();

      if (parentError) {
        devError("register-player parent create error", parentError);
        return NextResponse.json(
          { error: "Failed to create parent record" },
          { status: 500 }
        );
      }
      parentRecord = newParent;
    }

    if (!parentRecord?.id) {
      return NextResponse.json(
        { error: "Failed to create or retrieve parent record" },
        { status: 500 }
      );
    }

    // Step 2: Create player with parent_id foreign key
    const { data: player, error } = await supabaseAdmin
      .from("players")
      .insert([
        {
          parent_id: parentRecord.id,
          name: `${first_name} ${last_name}`, // Combine first and last name
          date_of_birth: birthdate, // Use actual DB field name
          grade, // Use actual DB field name (not grade_level)
          gender,
          waiver_signed: !!waiver_signed,
          status: "pending",
          is_deleted: false,
        },
      ])
      .select("*")
      .single();

    if (error) {
      devError("register-player insert error", error);
      return NextResponse.json(
        { error: "Failed to register player" },
        { status: 500 }
      );
    }

    // Email behavior:
    // - New parent signups receive Supabase's confirm email (handled by auth flow).
    // - Existing parents adding another child should still receive a registration confirmation from us.
    if (isExistingParent) {
      const parentEmailData = getPlayerRegistrationEmail({
        playerFirstName: first_name,
        playerLastName: last_name,
        parentFirstName: body.parent_first_name,
        parentLastName: body.parent_last_name,
        grade,
        gender,
      });

      await sendEmail(
        parent_email,
        parentEmailData.subject,
        parentEmailData.html
      );

      devLog("register-player: parent confirmation sent for existing parent", {
        to: parent_email,
      });
    }

    // Notify admin(s) about new registration
    const adminEmail = process.env.ADMIN_NOTIFICATIONS_TO;
    if (adminEmail) {
      const adminEmailData = getAdminPlayerRegistrationEmail({
        playerFirstName: first_name,
        playerLastName: last_name,
        parentName: `${parentRecord.first_name} ${parentRecord.last_name}`.trim(),
        parentEmail: parent_email,
        parentPhone: parent_phone || "",
        grade,
        gender,
        playerId: player.id,
      });

      await sendEmail(adminEmail, adminEmailData.subject, adminEmailData.html);

      devLog("register-player: admin notification sent", { to: adminEmail });
    }

    devLog("register-player OK", { player_id: player.id });
    return NextResponse.json({ success: true, player });
  } catch (e) {
    devError("register-player exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
