import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, AuthenticationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword) {
      throw new ValidationError("New password is required");
    }

    // Validate password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      throw new ValidationError(passwordErrors.join(". "), "newPassword");
    }

    // Get the current user from the session
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Authentication required");
    }

    const token = authHeader.substring(7);

    // Verify the token and get user info
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin!.auth.getUser(token);

    if (userError || !user) {
      throw new AuthenticationError("Invalid authentication token");
    }

    devLog("Updating password for user:", user.email);

    // Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin!.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (authError) {
      throw new ApiError("Failed to update password", 500, undefined, authError);
    }

    // Update password_reset status in users table
    const { error: updateError } = await supabaseAdmin!
      .from("users")
      .update({
        password_reset: false,
        last_password_reset: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      throw new DatabaseError("Password updated but failed to update account status", updateError);
    }

    devLog("Password updated successfully for user:", user.email);

    return formatSuccessResponse({
      message: "Password updated successfully",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
}
