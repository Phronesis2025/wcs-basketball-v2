import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    // Determine base URL - properly handle Vercel vs localhost
    const getBaseUrl = () => {
      // Production on Vercel: Always use new custom domain
      if (process.env.VERCEL) {
        return "https://www.wcsbasketball.site";
      }
      
      // Development (local): detect from request or use localhost
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      
      // If origin header is present and contains localhost, use it
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return origin;
      }
      
      // If host header is present (no protocol), construct URL
      if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
        return `http://${host.includes(':') ? host : `${host}:3000`}`;
      }
      
      // Fallback to localhost for development
      return 'http://localhost:3000';
    };
    
    const baseUrl = getBaseUrl();
    devLog("magic-link: Using baseUrl", { 
      baseUrl, 
      nodeEnv: process.env.NODE_ENV, 
      isVercel: !!process.env.VERCEL,
      nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL 
    });
    
    const body = await request.json();
    const {
      parent_first_name,
      parent_last_name,
      parent_email,
      parent_zip,
      player_first_name,
      player_last_name,
      player_gender,
      player_birthdate,
      player_grade,
      player_experience,
    } = body;

    if (
      !parent_first_name ||
      !parent_last_name ||
      !parent_email ||
      !parent_zip ||
      !player_first_name ||
      !player_last_name ||
      !player_gender ||
      !player_birthdate
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
        devError("magic-link: Zip code verification error", err);
        throw new ApiError("Unable to verify location. Please try again.", 500, undefined, err);
      }
    }

    if (!supabaseAdmin) {
      throw new ApiError("Database connection unavailable", 500);
    }

    // Generate unique token
    const magicLinkToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

    // Store in pending_registrations table
    const { data: pendingReg, error: insertError } = await supabaseAdmin
      .from("pending_registrations")
      .insert([
        {
          email: parent_email,
          parent_first_name,
          parent_last_name,
          player_first_name,
          player_last_name,
          player_gender,
          player_birthdate,
          player_grade: player_grade || null,
          player_experience: player_experience || null,
          magic_link_token: magicLinkToken,
          magic_link_expires_at: expiresAt.toISOString(),
        },
      ])
      .select("*")
      .single();

    if (insertError) {
      // Check if it's a duplicate email error
      if (insertError.code === "23505") {
        // Update existing pending registration
        const { data: updated, error: updateError } = await supabaseAdmin
          .from("pending_registrations")
          .update({
            parent_first_name,
            parent_last_name,
            player_first_name,
            player_last_name,
            player_gender,
            player_birthdate,
            player_grade: player_grade || null,
            player_experience: player_experience || null,
            magic_link_token: magicLinkToken,
            magic_link_expires_at: expiresAt.toISOString(),
            merged_at: null, // Reset merged_at in case of resend
          })
          .eq("email", parent_email)
          .select("*")
          .single();

        if (updateError) {
          throw new DatabaseError("Failed to update registration", updateError);
        }

        // Use Supabase invitation for updated pending registration too
        // baseUrl already determined at top of function
        
        // Check if user already exists (but still send invitation for new player registration)
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find((u) => u.email === parent_email);

        if (existingUser) {
          devLog("magic-link: User already exists (updated pending reg), but sending invitation for new player", { 
            email: parent_email,
            userId: existingUser.id 
          });
        }

        // Invite user by email - sends Supabase confirmation email
        // Note: inviteUserByEmail works even if user exists - it sends an invitation/reset link
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
          parent_email,
          {
            data: {
              playerName: `${player_first_name} ${player_last_name}`,
              grade: player_grade || '',
              gender: player_gender,
              parentFirstName: parent_first_name,
              parentLastName: parent_last_name,
              magicLinkToken: magicLinkToken,
            },
            redirectTo: `${baseUrl}/auth/callback?magic_link_token=${magicLinkToken}&player=${encodeURIComponent(player_first_name)}`,
          }
        );

        if (inviteError || !inviteData) {
          throw new ApiError("Failed to send invitation email", 500, undefined, inviteError);
        }

        devLog("magic-link: Supabase invitation sent (updated pending reg)", {
          email: parent_email,
        });

        return formatSuccessResponse({
          message: "Magic link sent to your email",
        });
      }

      throw new DatabaseError("Failed to create registration", insertError);
    }

    // Use Supabase's invitation flow which sends confirmation email (our customized welcome email)
    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === parent_email);

    // baseUrl already determined at top of function

    // Even if user exists, we still want to send invitation to complete registration with new player
    // Supabase inviteUserByEmail will handle existing users and send them an invitation email
    if (existingUser) {
      devLog("magic-link: User already exists, but sending invitation for new player registration", { 
        email: parent_email,
        userId: existingUser.id 
      });
    }

    // Invite user by email - this sends Supabase's confirmation email with our customized template
    // Note: inviteUserByEmail works even if user exists - it sends an invitation/reset link
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      parent_email,
      {
        data: {
          playerName: `${player_first_name} ${player_last_name}`,
          grade: player_grade || '',
          gender: player_gender,
          parentFirstName: parent_first_name,
          parentLastName: parent_last_name,
          magicLinkToken: magicLinkToken, // Store token in metadata to link to pending_registration
        },
        redirectTo: `${baseUrl}/auth/callback?magic_link_token=${magicLinkToken}&player=${encodeURIComponent(player_first_name)}`,
      }
    );

    if (inviteError || !inviteData) {
      throw new ApiError("Failed to send invitation email", 500, undefined, inviteError);
    }

    // Supabase will automatically send the confirmation email with our customized template
    // No need to send custom email - Supabase handles it
    devLog("magic-link: Supabase invitation sent, confirmation email will be delivered", {
      email: parent_email,
      userId: inviteData.user?.id,
    });

    return formatSuccessResponse({
      message: "Magic link sent to your email",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

