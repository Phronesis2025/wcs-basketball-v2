import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { coachResetTokens } from "@/lib/coachResetTokens";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      throw new ValidationError("Token and new password are required");
    }

    // Validate password requirements
    const passwordErrors: string[] = [];
    if (newPassword.length < 8) {
      passwordErrors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(newPassword)) {
      passwordErrors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(newPassword)) {
      passwordErrors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(newPassword)) {
      passwordErrors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      passwordErrors.push("Password must contain at least one special character");
    }
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors.join(". "), "newPassword");
    }

    devLog("Coach password reset request for token:", token.substring(0, 10) + "...");

    // Verify token from database
    const tokenData = await coachResetTokens.get(token);
    if (!tokenData) {
      throw new ValidationError("Invalid or expired reset token. Please request a new password reset.", "token");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Verify user exists in auth.users before updating password
    const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(
      tokenData.userId
    );

    if (getUserError || !authUser?.user) {
      devLog("User not found in auth.users by ID, checking by email:", tokenData.email);
      // Try to find user by email as fallback
      const { data: usersByEmail } = await supabaseAdmin.auth.admin.listUsers();
      const userByEmail = usersByEmail?.users?.find(
        (u) => u.email?.toLowerCase() === tokenData.email.toLowerCase()
      );

      if (userByEmail) {
        devLog("Found user by email, updating password with correct user ID:", userByEmail.id);
        // Update password with the correct user ID
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userByEmail.id,
          {
            password: newPassword,
          }
        );

        if (updateError) {
          throw new ApiError("Failed to reset password. Please try again.", 500, undefined, updateError);
        }

        // Update the users table with the correct ID if it's different
        if (userByEmail.id !== tokenData.userId) {
          devLog("Updating users table with correct auth user ID");
          await supabaseAdmin
            .from("users")
            .update({ id: userByEmail.id })
            .eq("id", tokenData.userId);
        }

        // Update token data to use correct user ID
        tokenData.userId = userByEmail.id;
      } else {
        // User doesn't exist in auth.users - create them with the new password
        devLog("User not found in auth.users, creating new auth user with reset password");
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          id: tokenData.userId, // Use the same ID from users table
          email: tokenData.email,
          password: newPassword,
          email_confirm: true,
        });

        if (createError || !newAuthUser?.user) {
          throw new ApiError("Failed to reset password. Please contact an administrator.", 500, undefined, createError);
        }

        devLog("Created new auth user for password reset:", newAuthUser.user.id);
      }
    } else {
      // User exists, update password normally
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        tokenData.userId,
        {
          password: newPassword,
        }
      );

      if (updateError) {
        throw new ApiError("Failed to reset password. Please try again.", 500, undefined, updateError);
      }
    }

    // Update password_reset flag in users table
    const { error: userUpdateError } = await supabaseAdmin
      .from("users")
      .update({
        password_reset: false,
        last_password_reset: new Date().toISOString(),
      })
      .eq("id", tokenData.userId);

    if (userUpdateError) {
      devError("Failed to update user password_reset flag:", userUpdateError);
      // Don't fail the request, password was updated successfully
    }

    // Mark token as used
    await coachResetTokens.delete(token);

    devLog("Password reset successful for user:", tokenData.userId);

    return formatSuccessResponse({
      message: "Password reset successfully",
    });
  } catch (err) {
    return handleApiError(err, request);
  }
}

