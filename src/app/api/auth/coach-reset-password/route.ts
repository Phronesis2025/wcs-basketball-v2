import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { coachResetTokens } from "@/lib/coachResetTokens";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // Validate password requirements
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character" },
        { status: 400 }
      );
    }

    devLog("Coach password reset request for token:", token.substring(0, 10) + "...");

    // Verify token
    const tokenData = coachResetTokens.get(token);
    if (!tokenData) {
      devError("Invalid or expired reset token");
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new password reset." },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      devError("Supabase admin client not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Update password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.userId,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      devError("Failed to update password:", updateError);
      return NextResponse.json(
        { error: "Failed to reset password. Please try again." },
        { status: 500 }
      );
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

    // Delete used token
    coachResetTokens.delete(token);

    devLog("Password reset successful for user:", tokenData.userId);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    devError("Unexpected error in coach password reset:", err);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

