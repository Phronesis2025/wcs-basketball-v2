import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Determine base URL - properly handle Vercel vs localhost
    const getBaseUrl = () => {
      // Production on Vercel: prioritize NEXT_PUBLIC_BASE_URL, then VERCEL_URL
      if (process.env.VERCEL) {
        // Vercel provides VERCEL_URL automatically, but prefer explicit NEXT_PUBLIC_BASE_URL
        if (process.env.NEXT_PUBLIC_BASE_URL) {
          const url = process.env.NEXT_PUBLIC_BASE_URL.trim();
          // Ensure it has protocol
          if (url.startsWith("http://") || url.startsWith("https://")) {
            return url.replace(/\/+$/, ""); // Remove trailing slashes
          }
          return `https://${url.replace(/\/+$/, "")}`;
        }
        // Fallback to VERCEL_URL (provided by Vercel automatically)
        if (process.env.VERCEL_URL) {
          return `https://${process.env.VERCEL_URL}`;
        }
        // Final fallback to new custom domain (primary production URL)
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
      !player_first_name ||
      !player_last_name ||
      !player_gender ||
      !player_birthdate
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
          devError("magic-link: Update pending registration error", updateError);
          return NextResponse.json(
            { error: "Failed to update registration" },
            { status: 500 }
          );
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
          devError("magic-link: Failed to invite user (updated pending reg)", inviteError);
          return NextResponse.json(
            { error: "Failed to send invitation email" },
            { status: 500 }
          );
        }

        devLog("magic-link: Supabase invitation sent (updated pending reg)", {
          email: parent_email,
        });

        return NextResponse.json({
          success: true,
          message: "Magic link sent to your email",
        });
      }

      devError("magic-link: Insert pending registration error", insertError);
      return NextResponse.json(
        { error: "Failed to create registration" },
        { status: 500 }
      );
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
      devError("magic-link: Failed to invite user via Supabase", inviteError);
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    // Supabase will automatically send the confirmation email with our customized template
    // No need to send custom email - Supabase handles it
    devLog("magic-link: Supabase invitation sent, confirmation email will be delivered", {
      email: parent_email,
      userId: inviteData.user?.id,
    });

    return NextResponse.json({
      success: true,
      message: "Magic link sent to your email",
    });
  } catch (error) {
    devError("magic-link: Exception", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

