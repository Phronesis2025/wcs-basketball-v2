import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import {
  getPlayerRegistrationEmail,
  getAdminPlayerRegistrationEmail,
} from "@/lib/emailTemplates";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const token_hash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type");
    const player = requestUrl.searchParams.get("player");
    const magic_link_token = requestUrl.searchParams.get("magic_link_token");
    const code = requestUrl.searchParams.get("code"); // OAuth code exchange
    const session_setup = requestUrl.searchParams.get("session_setup"); // Flag for session setup

    // Check if this is a redirect from a checkout magic link
    // Supabase magic links with redirectTo include the redirect in the callback URL
    const redirectTo = requestUrl.searchParams.get("redirect_to");
    const next = requestUrl.searchParams.get("next"); // Alternative parameter name
    
    devLog("Auth callback received", {
      token_hash: !!token_hash,
      type,
      player,
      has_magic_token: !!magic_link_token,
      has_oauth_code: !!code,
      session_setup,
      redirect_to: redirectTo,
      next,
      full_url: requestUrl.toString(),
    });

    if (!supabaseAdmin) {
      devError("Auth callback: Supabase admin client unavailable");
      return NextResponse.redirect(
        new URL("/register?error=server_error", requestUrl.origin)
      );
    }

    // Handle Supabase OTP confirmation (token_hash)
    // This happens when user clicks Supabase's confirmation email (signup, invite, magiclink, recovery)
    // IMPORTANT: The server-side redirect loses hash fragments, so we need to generate a new magic link
    // that will establish the session with proper hash fragments when the client processes it
    if (
      token_hash &&
      (type === "magiclink" ||
        type === "recovery" ||
        type === "invite" ||
        type === "signup" ||
        type === "email")
    ) {
      devLog(
        "Auth callback: Processing Supabase OTP confirmation (token_hash)",
        { type }
      );

      // Extract player name from URL params
      const playerNameParam = requestUrl.searchParams.get("player");
      const customToken = requestUrl.searchParams.get("magic_link_token");

      // First, verify the OTP to get the user email
      // We need to create a server-side client to verify the token
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
        },
      });

      // Verify the OTP token to get the session
      const { data: verifyData, error: verifyError } =
        await supabaseServer.auth.verifyOtp({
          token_hash,
          type: type as any,
        });

      if (verifyError) {
        devError("Auth callback: Failed to verify OTP", verifyError);
        return NextResponse.redirect(
          new URL("/register?error=confirmation_failed", requestUrl.origin)
        );
      }

      if (verifyData?.session) {
        devLog("Auth callback: OTP verified, session obtained", {
          userId: verifyData.user?.id,
          email: verifyData.user?.email,
        });

        // Determine the final redirect URL
        // Check multiple possible parameter names for redirect URL
        const redirectParam = redirectTo || next || requestUrl.searchParams.get("redirectTo");
        
        let finalRedirectPath: string;
        if (redirectParam) {
          // Use the redirect parameter from the magic link (e.g., /checkout/[playerId])
          try {
            // redirectParam might be a full URL or a path
            let redirectPath: string;
            if (redirectParam.startsWith("http://") || redirectParam.startsWith("https://")) {
              const redirectUrlObj = new URL(redirectParam);
              redirectPath = redirectUrlObj.pathname + redirectUrlObj.search;
            } else {
              // It's already a path
              redirectPath = redirectParam.startsWith("/") ? redirectParam : `/${redirectParam}`;
            }
            finalRedirectPath = redirectPath;
            devLog("Auth callback: Using redirect parameter from magic link", {
              redirectPath: finalRedirectPath,
              originalParam: redirectParam,
            });
          } catch (e) {
            // If redirect is invalid, fall back to default
            devError("Auth callback: Invalid redirect parameter, using default", e);
            finalRedirectPath = "/registration-success";
            if (playerNameParam) {
              finalRedirectPath += `?player=${encodeURIComponent(playerNameParam)}`;
            }
          }
        } else {
          // Default to registration-success for registration flows
          finalRedirectPath = "/registration-success";
          if (playerNameParam) {
            finalRedirectPath += `?player=${encodeURIComponent(playerNameParam)}`;
          }
        }

        // Build redirect URL with session tokens in hash fragment
        const redirectUrl = new URL(finalRedirectPath, requestUrl.origin);

        // Add session tokens as hash fragments so the client can pick them up
        const hashParams = new URLSearchParams();
        hashParams.set("access_token", verifyData.session.access_token);
        hashParams.set("refresh_token", verifyData.session.refresh_token);
        hashParams.set(
          "expires_in",
          String(verifyData.session.expires_in || 3600)
        );
        hashParams.set("token_type", "bearer");
        hashParams.set("type", "magiclink");

        const finalUrl = `${redirectUrl.toString()}#${hashParams.toString()}`;
        devLog("Auth callback: Redirecting with session tokens", {
          url: redirectUrl.toString(),
          hasTokens: true,
          redirectPath: finalRedirectPath,
        });

        return NextResponse.redirect(finalUrl);
      }

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

      // For invite/email type from registration flow, check for pending registration and merge
      if ((type === "invite" || type === "email") && playerNameParam) {
        // Get user from session (Supabase should have set it)
        const {
          data: { user },
          error: userError,
        } = await supabaseAdmin.auth.getUser();

        if (!userError && user?.email) {
          // Check for pending registration
          const { data: pendingReg } = await supabaseAdmin
            .from("pending_registrations")
            .select("*")
            .eq("email", user.email)
            .is("merged_at", null)
            .maybeSingle();

          if (pendingReg && !pendingReg.merged_at) {
            devLog(
              "Auth callback: Found pending registration, merging after Supabase confirmation"
            );

            try {
              // Create or get parent record
              const { data: existingParent } = await supabaseAdmin
                .from("parents")
                .select("*")
                .eq("email", user.email)
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
                const { data: newParent, error: parentError } =
                  await supabaseAdmin
                    .from("parents")
                    .insert([
                      {
                        user_id: user.id,
                        first_name: pendingReg.parent_first_name,
                        last_name: pendingReg.parent_last_name,
                        email: pendingReg.email,
                        checkout_completed: false,
                      },
                    ])
                    .select("*")
                    .single();

                if (parentError || !newParent) {
                  devError(
                    "Auth callback: Failed to create parent",
                    parentError
                  );
                  throw parentError;
                }
                parentId = newParent.id;
              }

              // Create player record
              const { data: player, error: playerError } = await supabaseAdmin
                .from("players")
                .insert([
                  {
                    parent_id: parentId,
                    name: `${pendingReg.player_first_name} ${pendingReg.player_last_name}`,
                    date_of_birth: pendingReg.player_birthdate,
                    grade: pendingReg.player_grade,
                    gender: pendingReg.player_gender,
                    previous_experience: pendingReg.player_experience,
                    status: "pending",
                    waiver_signed: false,
                    parent_email: pendingReg.email, // Required for Stripe checkout
                  },
                ])
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

              devLog(
                "Auth callback: Successfully merged pending registration",
                {
                  parentId,
                  playerId: player.id,
                }
              );

              // Send parent confirmation email
              try {
                const parentEmailData = getPlayerRegistrationEmail({
                  playerFirstName: pendingReg.player_first_name,
                  playerLastName: pendingReg.player_last_name,
                  parentFirstName: pendingReg.parent_first_name,
                  parentLastName: pendingReg.parent_last_name,
                  grade: pendingReg.player_grade || "",
                  gender: pendingReg.player_gender || "",
                });

                await sendEmail(
                  pendingReg.email,
                  parentEmailData.subject,
                  parentEmailData.html
                );

                devLog("Auth callback: Parent confirmation email sent", {
                  to: pendingReg.email,
                });
              } catch (emailError) {
                devError(
                  "Auth callback: Failed to send parent confirmation email",
                  emailError
                );
              }

              // Send admin notification
              const adminEmailString = process.env.ADMIN_NOTIFICATIONS_TO;
              if (adminEmailString) {
                try {
                  const adminEmails = adminEmailString
                    .split(",")
                    .map((email) => email.trim())
                    .filter((email) => email.length > 0);

                  if (adminEmails.length > 0) {
                    const adminEmailData = getAdminPlayerRegistrationEmail({
                      playerFirstName: pendingReg.player_first_name,
                      playerLastName: pendingReg.player_last_name,
                      parentName:
                        `${pendingReg.parent_first_name} ${pendingReg.parent_last_name}`.trim(),
                      parentEmail: pendingReg.email,
                      parentPhone: "",
                      grade: pendingReg.player_grade || "",
                      gender: pendingReg.player_gender || "",
                      playerId: player.id,
                    });

                    await sendEmail(
                      adminEmails[0],
                      adminEmailData.subject,
                      adminEmailData.html,
                      {
                        bcc:
                          adminEmails.length > 1
                            ? adminEmails.slice(1)
                            : undefined,
                      }
                    );

                    devLog("Auth callback: Admin notification sent", {
                      to: adminEmails[0],
                      totalAdmins: adminEmails.length,
                    });
                  }
                } catch (adminEmailError) {
                  devError(
                    "Auth callback: Failed to send admin notification",
                    adminEmailError
                  );
                }
              }
            } catch (mergeError) {
              devError(
                "Auth callback: Error merging pending registration",
                mergeError
              );
              // Continue with redirect even if merge fails
            }
          }
        }

        // Redirect to registration success
        const redirectUrl = new URL("/registration-success", requestUrl.origin);
        redirectUrl.searchParams.set("player", playerNameParam);
        return NextResponse.redirect(redirectUrl);
      }

      // Fallback: redirect to profile for other confirmation types
      // Remove hash fragment if present
      const profileUrl = new URL(
        "/parent/profile?registered=true",
        requestUrl.origin
      );
      return NextResponse.redirect(profileUrl);
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
      if (
        pendingReg.magic_link_expires_at &&
        new Date(pendingReg.magic_link_expires_at) < new Date()
      ) {
        devError("Auth callback: Magic link expired");
        return NextResponse.redirect(
          new URL("/register?error=token_expired", requestUrl.origin)
        );
      }

      // Check if already merged
      if (pendingReg.merged_at) {
        devLog(
          "Auth callback: Pending registration already merged, redirecting to profile"
        );
        return NextResponse.redirect(
          new URL("/parent/profile", requestUrl.origin)
        );
      }

      // Create user account directly via Admin API (since we have custom token, not Supabase OTP)
      let user;

      // Check if user already exists
      const { data: existingUsers } =
        await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === pendingReg.email
      );

      if (existingUser) {
        user = existingUser;
        devLog("Auth callback: User already exists", { userId: user.id });
      } else {
        // Create new user via Admin API
        const { data: newUser, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email: pendingReg.email,
            email_confirm: true, // Auto-confirm email since they clicked the magic link
            user_metadata: {
              full_name: `${pendingReg.parent_first_name} ${pendingReg.parent_last_name}`,
              guest: false,
            },
          });

        if (createError || !newUser) {
          devError(
            "Auth callback: Failed to create user from magic link",
            createError
          );
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
            .insert([
              {
                user_id: user.id,
                first_name: pendingReg.parent_first_name,
                last_name: pendingReg.parent_last_name,
                email: pendingReg.email,
              },
            ])
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
          .insert([
            {
              parent_id: parentId,
              name: `${pendingReg.player_first_name} ${pendingReg.player_last_name}`,
              date_of_birth: pendingReg.player_birthdate,
              grade: pendingReg.player_grade,
              gender: pendingReg.player_gender,
              previous_experience: pendingReg.player_experience,
              status: "pending",
              waiver_signed: false,
              parent_email: pendingReg.email, // Required for Stripe checkout
            },
          ])
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

        // DISABLED: Parent confirmation email now sent via Supabase email template
        // The Supabase "Invite User" email template includes player registration details
        // from user_metadata (playerName, grade, gender, parentFirstName, etc.)
        // This Resend email is kept here in case we need to re-enable it
        /*
        try {
          const parentEmailData = getPlayerRegistrationEmail({
            playerFirstName: pendingReg.player_first_name,
            playerLastName: pendingReg.player_last_name,
            parentFirstName: pendingReg.parent_first_name,
            parentLastName: pendingReg.parent_last_name,
            grade: pendingReg.player_grade || "",
            gender: pendingReg.player_gender || "",
          });
          
          await sendEmail(
            pendingReg.email,
            parentEmailData.subject,
            parentEmailData.html
          );
          
          devLog("Auth callback: Parent confirmation email sent", {
            to: pendingReg.email,
          });
        } catch (emailError) {
          devError("Auth callback: Failed to send parent confirmation email", emailError);
        }
        */

        // Send admin notification
        const adminEmailString = process.env.ADMIN_NOTIFICATIONS_TO;
        if (adminEmailString) {
          try {
            const adminEmails = adminEmailString
              .split(",")
              .map((email) => email.trim())
              .filter((email) => email.length > 0);

            if (adminEmails.length > 0) {
              const adminEmailData = getAdminPlayerRegistrationEmail({
                playerFirstName: pendingReg.player_first_name,
                playerLastName: pendingReg.player_last_name,
                parentName:
                  `${pendingReg.parent_first_name} ${pendingReg.parent_last_name}`.trim(),
                parentEmail: pendingReg.email,
                parentPhone: "",
                grade: pendingReg.player_grade || "",
                gender: pendingReg.player_gender || "",
                playerId: player.id,
              });

              await sendEmail(
                adminEmails[0],
                adminEmailData.subject,
                adminEmailData.html,
                {
                  bcc:
                    adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
                }
              );

              devLog("Auth callback: Admin notification sent", {
                to: adminEmails[0],
                totalAdmins: adminEmails.length,
              });
            }
          } catch (adminEmailError) {
            devError(
              "Auth callback: Failed to send admin notification",
              adminEmailError
            );
          }
        }

        // Set guest flag in user metadata
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: { guest: false }, // No longer a guest after merge
        });

        // Generate a Supabase magic link that will establish a session
        // This uses Supabase's proper auth flow
        // Use registration-success instead of profile to avoid hash issues
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: pendingReg.email,
            options: {
              redirectTo: `${
                requestUrl.origin
              }/registration-success?player=${encodeURIComponent(
                pendingReg.player_first_name
              )}`,
            },
          });

        if (linkError) {
          devError("Auth callback: Failed to generate session link", linkError);
          // Fallback: Redirect to registration success directly
          return NextResponse.redirect(
            new URL(
              `/registration-success?player=${encodeURIComponent(
                pendingReg.player_first_name
              )}`,
              requestUrl.origin
            )
          );
        }

        if (linkData?.properties?.action_link) {
          // Redirect to Supabase's generated link which will establish session automatically
          // Remove hash fragment if present
          const actionLink = new URL(linkData.properties.action_link);
          actionLink.hash = ""; // Remove hash fragment
          devLog(
            "Auth callback: Redirecting to Supabase magic link for session",
            {
              hasActionLink: !!linkData.properties.action_link,
            }
          );
          return NextResponse.redirect(actionLink.toString());
        }

        // Final fallback: redirect to registration success
        return NextResponse.redirect(
          new URL(
            `/registration-success?player=${encodeURIComponent(
              pendingReg.player_first_name
            )}`,
            requestUrl.origin
          )
        );
      } catch (mergeError) {
        devError(
          "Auth callback: Error merging pending registration",
          mergeError
        );
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
      const {
        data: { user },
        error: userError,
      } = await supabaseAdmin.auth.getUser();

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
        devLog(
          "Auth callback: Found unmerged pending registration for Google user, merging"
        );

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
              .insert([
                {
                  user_id: user.id,
                  first_name: pendingReg.parent_first_name,
                  last_name: pendingReg.parent_last_name,
                  email: pendingReg.email,
                },
              ])
              .select("*")
              .single();

            if (parentError || !newParent) {
              throw parentError;
            }
            parentId = newParent.id;
          }

          const { data: player } = await supabaseAdmin
            .from("players")
            .insert([
              {
                parent_id: parentId,
                name: `${pendingReg.player_first_name} ${pendingReg.player_last_name}`,
                date_of_birth: pendingReg.player_birthdate,
                grade: pendingReg.player_grade,
                gender: pendingReg.player_gender,
                previous_experience: pendingReg.player_experience,
                status: "pending",
                waiver_signed: false,
              },
            ])
            .select("*")
            .single();

          if (player) {
            await supabaseAdmin
              .from("pending_registrations")
              .update({ merged_at: new Date().toISOString() })
              .eq("id", pendingReg.id);

            devLog(
              "Auth callback: Successfully merged pending registration for Google user"
            );

            // DISABLED: Parent welcome email now sent via Supabase email template
            // The Supabase "Invite User" email template includes player registration details
            // from user_metadata (playerName, grade, gender, parentFirstName, etc.)
            // This Resend email is kept here in case we need to re-enable it
            /*
            const parentEmailAddress = user.email || pendingReg.email;
            
            if (!parentEmailAddress) {
              devError("Auth callback: No email address available for welcome email", {
                userEmail: user.email,
                pendingRegEmail: pendingReg.email,
              });
            } else {
              try {
                const parentEmailData = getPlayerRegistrationEmail({
                  playerFirstName: pendingReg.player_first_name,
                  playerLastName: pendingReg.player_last_name,
                  parentFirstName: pendingReg.parent_first_name,
                  parentLastName: pendingReg.parent_last_name,
                  grade: pendingReg.player_grade || undefined,
                  gender: pendingReg.player_gender || undefined,
                });

                devLog("Auth callback: Sending welcome email", {
                  to: parentEmailAddress,
                  userEmail: user.email,
                  pendingRegEmail: pendingReg.email,
                });

                await sendEmail(
                  parentEmailAddress,
                  parentEmailData.subject,
                  parentEmailData.html
                );

                devLog("Auth callback: Welcome email sent to parent", {
                  to: parentEmailAddress,
                });
              } catch (emailError) {
                // Log but don't block the redirect
                devError("Auth callback: Failed to send welcome email", {
                  error: emailError,
                  attemptedEmail: parentEmailAddress,
                });
              }
            }
            */

            // Send admin notification email
            const adminEmailString = process.env.ADMIN_NOTIFICATIONS_TO;
            if (adminEmailString) {
              try {
                const adminEmails = adminEmailString
                  .split(",")
                  .map((email) => email.trim())
                  .filter((email) => email.length > 0);

                if (adminEmails.length > 0) {
                  // Use Google OAuth email (user.email) for admin notification - the actual Gmail account
                  const parentEmailForAdmin = user.email || pendingReg.email;

                  const adminEmailData = getAdminPlayerRegistrationEmail({
                    playerFirstName: pendingReg.player_first_name,
                    playerLastName: pendingReg.player_last_name,
                    parentName:
                      `${pendingReg.parent_first_name} ${pendingReg.parent_last_name}`.trim(),
                    parentEmail: parentEmailForAdmin,
                    parentPhone: "", // Pending registration doesn't store phone
                    grade: pendingReg.player_grade || "",
                    gender: pendingReg.player_gender || "",
                    playerId: player.id,
                  });

                  // Send email to admin(s)
                  // If only one admin: sends directly to that email
                  // If multiple admins: sends to first email, BCC to others
                  await sendEmail(
                    adminEmails[0],
                    adminEmailData.subject,
                    adminEmailData.html,
                    {
                      bcc:
                        adminEmails.length > 1
                          ? adminEmails.slice(1)
                          : undefined,
                    }
                  );

                  devLog("Auth callback: Admin notification sent", {
                    to: adminEmails[0],
                    bcc:
                      adminEmails.length > 1 ? adminEmails.slice(1) : undefined,
                    totalAdmins: adminEmails.length,
                  });
                }
              } catch (adminEmailError) {
                // Log but don't block the redirect
                devError(
                  "Auth callback: Failed to send admin notification",
                  adminEmailError
                );
              }
            }

            return NextResponse.redirect(
              new URL("/parent/profile?registered=true", requestUrl.origin)
            );
          }
        } catch (mergeError) {
          devError(
            "Auth callback: Error merging pending registration for Google user",
            mergeError
          );
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
        new URL(
          "/register?oauth=success&email=" +
            encodeURIComponent(user.email || ""),
          requestUrl.origin
        )
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

      devLog("Redirecting to registration success", {
        url: redirectUrl.toString(),
      });
      return NextResponse.redirect(redirectUrl);
    }

    // Default redirect if no specific handler
    devLog("Auth callback: No specific handler, redirecting to register");
    return NextResponse.redirect(new URL("/register", requestUrl.origin));
  } catch (error) {
    devError("Auth callback error", error);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      new URL("/register?error=confirmation_failed", requestUrl.origin)
    );
  }
}
