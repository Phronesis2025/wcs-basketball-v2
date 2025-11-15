import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import {
  getPlayerRegistrationEmail,
  getAdminPlayerRegistrationEmail,
  getWelcomePendingEmail,
} from "@/lib/emailTemplates";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

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
      parent_zip,
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
      throw new ValidationError("Missing required fields");
    }

    // Verify zip code is within service area
    if (parent_zip) {
      try {
        const { verifyZipCodeInRadius } = await import("@/lib/zipCodeVerification");
        const zipVerification = await verifyZipCodeInRadius(parent_zip);
        
        if (!zipVerification.allowed) {
          throw new ValidationError(
            zipVerification.error ||
            "Registration is currently limited to residents within 50 miles of Salina, Kansas.",
            "parent_zip"
          );
        }
      } catch (err) {
        devError("register-player: Zip code verification error", err);
        throw new ApiError("Unable to verify location. Please try again.", 500, undefined, err);
      }
    }

    if (!supabaseAdmin) {
      throw new ApiError("Database connection unavailable", 500);
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
        throw new DatabaseError("Failed to create parent record", parentError);
      }
      parentRecord = newParent;
    }

    if (!parentRecord?.id) {
      throw new DatabaseError("Failed to create or retrieve parent record");
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
      throw new DatabaseError("Failed to register player", error);
    }

    // Email behavior:
    // - New parent signups: Supabase sends confirmation email (handled by auth flow)
    // - We also send a registration confirmation email to the parent for all registrations
    // - Admin notifications are sent to all configured admin emails
    
    // Send parent confirmation email for all registrations
    // Note: New parents will also receive Supabase's confirmation email via the auth flow
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

    devLog("register-player: parent confirmation sent", {
      to: parent_email,
      isExistingParent,
    });

    // Notify admin(s) about new registration
    // Supports single email (for testing) or multiple emails (comma-separated)
    // For testing: ADMIN_NOTIFICATIONS_TO=your-email@example.com
    // For production: ADMIN_NOTIFICATIONS_TO=admin1@example.com,admin2@example.com,admin3@example.com
    const adminEmailString = process.env.ADMIN_NOTIFICATIONS_TO;
    if (adminEmailString) {
      // Split comma-separated emails and filter out empty strings
      const adminEmails = adminEmailString
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (adminEmails.length > 0) {
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

        // Send email to admin(s)
        // If only one admin: sends directly to that email
        // If multiple admins: sends to first email, BCC to others (so they don't see each other's emails)
        await sendEmail(adminEmails[0], adminEmailData.subject, adminEmailData.html, {
          bcc: adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
        });

        devLog("register-player: admin notification sent", {
          to: adminEmails[0],
          bcc: adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
          totalAdmins: adminEmails.length,
        });
      }
    }


    devLog("register-player OK", { player_id: player.id });
    return formatSuccessResponse({ player });
  } catch (e) {
    return handleApiError(e);
  }
}
