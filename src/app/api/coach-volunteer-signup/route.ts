import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError, validateInput } from "@/lib/security";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      zip,
      role,
      has_child_on_team,
      child_name,
      child_team_id,
      experience,
      availability,
      why_interested,
      background_check_consent,
    } = body || {};

    // Validate required fields
    if (!first_name || !last_name || !email || !role || !background_check_consent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate profanity in all text fields
    const profanityErrors: string[] = [];
    const fieldsToCheck = [
      { value: first_name, field: "first_name" },
      { value: last_name, field: "last_name" },
      { value: child_name, field: "child_name" },
      { value: experience, field: "experience" },
      { value: availability, field: "availability" },
      { value: why_interested, field: "why_interested" },
      { value: city, field: "city" },
      { value: address_line1, field: "address_line1" },
      { value: address_line2, field: "address_line2" },
    ];

    fieldsToCheck.forEach(({ value, field }) => {
      if (value && typeof value === "string" && value.trim()) {
        const validation = validateInput(value.trim(), field);
        if (!validation.isValid) {
          profanityErrors.push(
            `The ${field.replace(/_/g, " ")} contains inappropriate language.`
          );
        }
      }
    });

    if (profanityErrors.length > 0) {
      devError("coach-volunteer-signup: profanity detected", {
        errors: profanityErrors,
        email,
      });
      return NextResponse.json(
        { error: profanityErrors.join(" ") },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    // Get team name if child_team_id is provided
    let teamName = null;
    if (child_team_id) {
      const { data: team } = await supabaseAdmin
        .from("teams")
        .select("name, age_group, gender")
        .eq("id", child_team_id)
        .single();
      
      if (team) {
        teamName = `${team.name}${team.age_group ? ` (${team.age_group})` : ""}${team.gender ? ` - ${team.gender}` : ""}`;
      }
    }

    // Insert application into database
    const { data: application, error: insertError } = await supabaseAdmin
      .from("coach_volunteer_applications")
      .insert([
        {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
          address_line1: address_line1?.trim() || null,
          address_line2: address_line2?.trim() || null,
          city: city?.trim() || null,
          state: state?.trim() || null,
          zip: zip?.trim() || null,
          role,
          has_child_on_team: has_child_on_team || false,
          child_name: has_child_on_team ? child_name?.trim() || null : null,
          child_team_id: has_child_on_team ? child_team_id || null : null,
          experience: experience?.trim() || null,
          availability: availability?.trim() || null,
          why_interested: why_interested?.trim() || null,
          background_check_consent,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (insertError) {
      devError("coach-volunteer-signup: database insert error", insertError);
      return NextResponse.json(
        { error: "Failed to save application" },
        { status: 500 }
      );
    }

    devLog("coach-volunteer-signup: application saved", {
      id: application.id,
      email: application.email,
      role: application.role,
    });

    // Send email to admin(s)
    const adminEmailString = process.env.ADMIN_NOTIFICATIONS_TO;
    if (adminEmailString) {
      const adminEmails = adminEmailString
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (adminEmails.length > 0) {
        // Build email HTML
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New ${role === "coach" ? "Coach" : "Volunteer"} Application</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #1a1a2e; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #e50914; margin: 0; font-size: 24px; font-weight: bold;">
                New ${role === "coach" ? "Coach" : "Volunteer"} Application
              </h1>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1a1a2e; margin-top: 0; border-bottom: 2px solid #e50914; padding-bottom: 10px;">
                Application Details
              </h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
                  <td style="padding: 8px 0;">${first_name} ${last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;"><a href="tel:${phone}">${phone}</a></td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Role:</td>
                  <td style="padding: 8px 0; text-transform: capitalize;">${role}</td>
                </tr>
                ${address_line1 || city || state || zip ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Address:</td>
                  <td style="padding: 8px 0;">
                    ${address_line1 || ""}<br>
                    ${address_line2 ? address_line2 + "<br>" : ""}
                    ${city || ""}${city && state ? ", " : ""}${state || ""} ${zip || ""}
                  </td>
                </tr>
                ` : ""}
                ${has_child_on_team ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Child on Team:</td>
                  <td style="padding: 8px 0;">Yes</td>
                </tr>
                ${child_name ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Child's Name:</td>
                  <td style="padding: 8px 0;">${child_name}</td>
                </tr>
                ` : ""}
                ${teamName ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Child's Team:</td>
                  <td style="padding: 8px 0;">${teamName}</td>
                </tr>
                ` : ""}
                ` : `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Child on Team:</td>
                  <td style="padding: 8px 0;">No</td>
                </tr>
                `}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Background Check Consent:</td>
                  <td style="padding: 8px 0;">${background_check_consent ? "✓ Yes" : "✗ No"}</td>
                </tr>
              </table>
            </div>
            
            ${experience || availability || why_interested ? `
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1a1a2e; margin-top: 0; border-bottom: 2px solid #e50914; padding-bottom: 10px;">
                Additional Information
              </h2>
              
              ${experience ? `
              <div style="margin-bottom: 15px;">
                <h3 style="color: #1a1a2e; margin-top: 0; margin-bottom: 5px; font-size: 16px;">Experience:</h3>
                <p style="margin: 0; white-space: pre-wrap;">${experience}</p>
              </div>
              ` : ""}
              
              ${availability ? `
              <div style="margin-bottom: 15px;">
                <h3 style="color: #1a1a2e; margin-top: 0; margin-bottom: 5px; font-size: 16px;">Availability:</h3>
                <p style="margin: 0; white-space: pre-wrap;">${availability}</p>
              </div>
              ` : ""}
              
              ${why_interested ? `
              <div style="margin-bottom: 15px;">
                <h3 style="color: #1a1a2e; margin-top: 0; margin-bottom: 5px; font-size: 16px;">Why Interested:</h3>
                <p style="margin: 0; white-space: pre-wrap;">${why_interested}</p>
              </div>
              ` : ""}
            </div>
            ` : ""}
            
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; border-left: 4px solid #e50914;">
              <p style="margin: 0; font-size: 14px;">
                <strong>Next Steps:</strong><br>
                Please review this application and contact the applicant to discuss next steps, including scheduling a background check.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p style="margin: 0;">
                Application ID: ${application.id}<br>
                Submitted: ${new Date().toLocaleString()}
              </p>
            </div>
          </body>
          </html>
        `;

        const subject = `New ${role === "coach" ? "Coach" : "Volunteer"} Application: ${first_name} ${last_name}`;

        // Send email to admin(s)
        // If only one admin: sends directly to that email
        // If multiple admins: sends to first email, BCC to others
        await sendEmail(adminEmails[0], subject, emailHtml, {
          bcc: adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
        });

        devLog("coach-volunteer-signup: admin notification sent", {
          to: adminEmails[0],
          bcc: adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
          totalAdmins: adminEmails.length,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      id: application.id,
    });
  } catch (error) {
    devError("coach-volunteer-signup: unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

