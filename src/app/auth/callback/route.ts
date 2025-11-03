import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");
    const player = requestUrl.searchParams.get("player");
    const magic_link_token = requestUrl.searchParams.get("magic_link_token");
    const code = requestUrl.searchParams.get("code"); // OAuth code exchange
    const session_setup = requestUrl.searchParams.get("session_setup"); // Flag for session setup
    
    devLog("Auth callback received", { 
      token_hash: !!token_hash, 
      type, 
      player,
      has_magic_token: !!magic_link_token,
      has_oauth_code: !!code,
      session_setup
    });

    if (!supabaseAdmin) {
      devError("Auth callback: Supabase admin client unavailable");
      return NextResponse.redirect(
        new URL("/register?error=server_error", requestUrl.origin)
      );
    }

    // Handle Supabase OTP confirmation (token_hash) - Supabase handles session automatically
    // This happens when user clicks Supabase's confirmation email (signup, invite, magiclink, recovery)
    // Supabase sets session cookies automatically via the token_hash, client will pick it up
    if (token_hash && (type === "magiclink" || type === "recovery" || type === "invite" || type === "signup" || type === "email")) {
      devLog("Auth callback: Processing Supabase OTP confirmation (token_hash)", { type });
      
      // Extract player name from URL params
      const playerNameParam = requestUrl.searchParams.get("player");
      const customToken = requestUrl.searchParams.get("magic_link_token");
      
      // If we have a magic_link_token, this came from our registration flow
      // Merge pending registration and redirect to registration-success
      if (customToken) {
        // Merge will happen automatically via the profile page merge logic
        // Redirect to registration-success with player name
        const redirectUrl = new URL("/registration-success", requestUrl.origin);
        if (playerNameParam) {
          redirectUrl.searchParams.set("player", playerNameParam);
        }
        return NextResponse.redirect(redirectUrl);
      }
      
      // Standard Supabase confirmation (signup/invite) - redirect to registration success if we have player name
      if (playerNameParam && (type === "signup" || type === "invite" || type === "email")) {
        const redirectUrl = new URL("/registration-success", requestUrl.origin);
        redirectUrl.searchParams.set("player", playerNameParam);
        return NextResponse.redirect(redirectUrl);
      }
      
      // Fallback: redirect to profile for other confirmation types
      return NextResponse.redirect(
        new URL("/parent/profile?registered=true", requestUrl.origin)
      );
    }

    // Handle custom magic link token (guest signup flow - fallback)
    if (magic_link_token) {
      devLog("Auth callback: Processing magic link token");
      
      // Verify token and get pending registration
      const { data: pendingReg, error: pendingError } = await supabaseAdmin
        .from("pending_registrations")
        .select("*")
        .eq("magic_link_token", magic_link_token)
        .single();

      if (pendingError || !pendingReg) {
        devError("Auth callback: Invalid magic link token", pendingError);
        return NextResponse.redirect(
          new URL("/register?error=invalid_token", requestUrl.origin)
        );
      }

      // Check expiration
      if (pendingReg.magic_link_expires_at && new Date(pendingReg.magic_link_expires_at) < new Date()) {
        devError("Auth callback: Magic link expired");
        return NextResponse.redirect(
          new URL("/register?error=token_expired", requestUrl.origin)
        );
      }

      // Check if already merged
      if (pendingReg.merged_at) {
        devLog("Auth callback: Pending registration already merged, redirecting to profile");
        return NextResponse.redirect(
          new URL("/parent/profile", requestUrl.origin)
        );
      }

      // Create user account directly via Admin API (since we have custom token, not Supabase OTP)
      let user;
      
      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === pendingReg.email);

      if (existingUser) {
        user = existingUser;
        devLog("Auth callback: User already exists", { userId: user.id });
      } else {
        // Create new user via Admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: pendingReg.email,
          email_confirm: true, // Auto-confirm email since they clicked the magic link
          user_metadata: {
            full_name: `${pendingReg.parent_first_name} ${pendingReg.parent_last_name}`,
            guest: false,
          },
        });

        if (createError || !newUser) {
          devError("Auth callback: Failed to create user from magic link", createError);
          return NextResponse.redirect(
            new URL("/register?error=auth_failed", requestUrl.origin)
          );
        }

        user = newUser.user;
        devLog("Auth callback: Created new user", { userId: user.id });
      }

      // Merge pending registration into parents/players (before session setup)
      try {
        // Create or get parent record
        const { data: existingParent } = await supabaseAdmin
          .from("parents")
          .select("*")
          .eq("email", pendingReg.email)
          .maybeSingle();

        let parentId: string;

        if (existingParent) {
          parentId = existingParent.id;
          // Update parent with user_id if not set
          if (!existingParent.user_id) {
            await supabaseAdmin
              .from("parents")
              .update({ user_id: user.id })
              .eq("id", parentId);
          }
        } else {
          // Create new parent record
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
            devError("Auth callback: Failed to create parent", parentError);
            throw parentError;
          }

          parentId = newParent.id;
        }

        // Create player record
        const { data: player, error: playerError } = await supabaseAdmin
          .from("players")
          .insert([{
            parent_id: parentId,
            name: `${pendingReg.player_first_name} ${pendingReg.player_last_name}`,
            date_of_birth: pendingReg.player_birthdate,
            grade: pendingReg.player_grade,
            gender: pendingReg.player_gender,
            previous_experience: pendingReg.player_experience,
            status: "pending",
            waiver_signed: false,
          }])
          .select("*")
          .single();

        if (playerError) {
          devError("Auth callback: Failed to create player", playerError);
          throw playerError;
        }

        // Mark pending registration as merged
        await supabaseAdmin
          .from("pending_registrations")
          .update({ merged_at: new Date().toISOString() })
          .eq("id", pendingReg.id);

        devLog("Auth callback: Successfully merged guest registration", {
          parentId,
          playerId: player.id,
        });

        // Set guest flag in user metadata
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: { guest: false }, // No longer a guest after merge
        });

        // Generate a Supabase magic link that will establish a session
        // This uses Supabase's proper auth flow
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: pendingReg.email,
          options: {
            redirectTo: `${requestUrl.origin}/parent/profile?registered=true`,
          },
        });

        if (linkError) {
          devError("Auth callback: Failed to generate session link", linkError);
          // Fallback: Redirect to setup session page
          return NextResponse.redirect(
            new URL(`/auth/setup-session?email=${encodeURIComponent(pendingReg.email)}&registered=true`, requestUrl.origin)
          );
        }

        if (linkData?.properties?.action_link) {
          // Redirect to Supabase's generated link which will establish session automatically
          devLog("Auth callback: Redirecting to Supabase magic link for session", {
            hasActionLink: !!linkData.properties.action_link,
          });
          return NextResponse.redirect(linkData.properties.action_link);
        }

        // Final fallback
        return NextResponse.redirect(
          new URL(`/auth/setup-session?email=${encodeURIComponent(pendingReg.email)}&registered=true`, requestUrl.origin)
        );
      } catch (mergeError) {
        devError("Auth callback: Error merging pending registration", mergeError);
        return NextResponse.redirect(
          new URL("/register?error=merge_failed", requestUrl.origin)
        );
      }
    }

    // Handle Google OAuth callback
    if (code) {
      devLog("Auth callback: Processing Google OAuth code exchange");
      
      // Supabase automatically exchanges the code, but we need to handle post-auth logic
      // The session should be set by Supabase, so we check for pending registrations
      
      // Get the current user (session should be established by Supabase)
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser();
      
      if (userError || !user) {
        devError("Auth callback: Failed to get user after OAuth", userError);
        // Still redirect - Supabase will handle session
        return NextResponse.redirect(
          new URL("/register?oauth=success", requestUrl.origin)
        );
      }

      // Check for pending registration by email
      const { data: pendingReg } = await supabaseAdmin
        .from("pending_registrations")
        .select("*")
        .eq("email", user.email!)
        .is("merged_at", null)
        .maybeSingle();

      if (pendingReg && !pendingReg.merged_at) {
        devLog("Auth callback: Found unmerged pending registration for Google user, merging");
        
        // Merge logic (similar to magic link above)
        try {
          const { data: existingParent } = await supabaseAdmin
            .from("parents")
            .select("*")
            .eq("email", pendingReg.email)
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
              throw parentError;
            }
            parentId = newParent.id;
          }

          const { data: player } = await supabaseAdmin
            .from("players")
            .insert([{
              parent_id: parentId,
              name: `${pendingReg.player_first_name} ${pendingReg.player_last_name}`,
              date_of_birth: pendingReg.player_birthdate,
              grade: pendingReg.player_grade,
              gender: pendingReg.player_gender,
              previous_experience: pendingReg.player_experience,
              status: "pending",
              waiver_signed: false,
            }])
            .select("*")
            .single();

          if (player) {
            await supabaseAdmin
              .from("pending_registrations")
              .update({ merged_at: new Date().toISOString() })
              .eq("id", pendingReg.id);

            devLog("Auth callback: Successfully merged pending registration for Google user");
            return NextResponse.redirect(
              new URL("/parent/profile?registered=true", requestUrl.origin)
            );
          }
        } catch (mergeError) {
          devError("Auth callback: Error merging pending registration for Google user", mergeError);
        }
      }

      // No pending registration, check if user has existing profile
      const { data: existingParent } = await supabaseAdmin
        .from("parents")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingParent) {
        devLog("Auth callback: Existing parent found, redirecting to profile");
        return NextResponse.redirect(
          new URL("/parent/profile", requestUrl.origin)
        );
      }

      // New Google user with no pending registration - redirect to register to complete signup
      devLog("Auth callback: New Google user, redirecting to register");
      return NextResponse.redirect(
        new URL("/register?oauth=success&email=" + encodeURIComponent(user.email || ""), requestUrl.origin)
      );
    }

    // Handle email confirmation (existing flow)
    if (token_hash && type === "email") {
      devLog("Auth callback: Email confirmation token received");
      
      // Extract player name from URL params if provided
      const playerName = player || "your player";
      
      // Redirect to registration success page
      const redirectUrl = new URL("/registration-success", requestUrl.origin);
      if (player) {
        redirectUrl.searchParams.set("player", player);
      }
      
      devLog("Redirecting to registration success", { url: redirectUrl.toString() });
      return NextResponse.redirect(redirectUrl);
    }

    // Default redirect if no specific handler
    devLog("Auth callback: No specific handler, redirecting to register");
    return NextResponse.redirect(
      new URL("/register", requestUrl.origin)
    );
  } catch (error) {
    devError("Auth callback error", error);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL("/register?error=confirmation_failed", requestUrl.origin)
    );
  }
}
