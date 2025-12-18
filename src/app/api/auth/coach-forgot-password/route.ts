import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { coachResetTokens } from "@/lib/coachResetTokens";
import crypto from "crypto";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      throw new ValidationError("Username is required");
    }

    devLog("Coach/Admin forgot password request for username:", username);

    // Look up the email from the username in the users table
    // The username is stored as email in auth.users and users table
    // Allow both coaches and admins to reset passwords
    // Use case-insensitive matching by converting to lowercase
    const normalizedUsername = username.toLowerCase().trim();
    
    // First try exact match, then try case-insensitive
    let { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, role")
      .eq("email", username)
      .in("role", ["coach", "admin"])
      .maybeSingle();

    // If not found, try case-insensitive search
    if (userError || !userData) {
      devLog("Exact match not found, trying case-insensitive search");
      const { data: allUsers, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, email, role")
        .in("role", ["coach", "admin"]);

      if (usersError || !allUsers) {
        devLog("User not found or not a coach/admin:", usersError);
        // Don't reveal if user exists or not (security best practice)
        return NextResponse.json({
          success: true,
          message: "If that username exists, a password reset email has been sent.",
        });
      }

      // Find matching user (case-insensitive)
      userData = allUsers.find(
        (u) => u.email.toLowerCase().trim() === normalizedUsername
      );

      if (!userData) {
        devLog("User not found (case-insensitive search also failed)");
        // Don't reveal if user exists or not (security best practice)
        return NextResponse.json({
          success: true,
          message: "If that username exists, a password reset email has been sent.",
        });
      }
    }

    devLog("Found user:", { id: userData.id, email: userData.email, role: userData.role });

    // Generate a secure reset token (instead of sending email)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Store token in database
    await coachResetTokens.set(resetToken, {
      userId: userData.id,
      email: userData.email,
      expiresAt: expiresAt,
    });

    devLog("Reset token generated for user:", userData.id);

    // Return token to redirect user to reset page
    const baseUrl = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    return formatSuccessResponse({
      token: resetToken,
      redirectUrl: `${baseUrl}/coaches/reset-password?token=${resetToken}`,
    });
  } catch (err) {
    // Special handling: Don't reveal if user exists (security best practice)
    // If it's a validation error, we can still return success message
    if (err instanceof ValidationError) {
      return formatSuccessResponse({
        message: "If that username exists, a password reset email has been sent.",
      });
    }
    return handleApiError(err, request);
  }
}

