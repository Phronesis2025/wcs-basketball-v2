import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: "New password is required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: passwordErrors.join(". ") },
        { status: 400 }
      );
    }

    // Get the current user from the session
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the token and get user info
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin!.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    devLog("Updating password for user:", user.email);

    // Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin!.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (authError) {
      devError("Failed to update password:", authError);
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
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
      devError("Failed to update password reset status:", updateError);
      return NextResponse.json(
        { error: "Password updated but failed to update account status" },
        { status: 500 }
      );
    }

    devLog("Password updated successfully for user:", user.email);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    devError("Update password API error:", error);
    return NextResponse.json(
      {
        error: "Failed to update password",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
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
