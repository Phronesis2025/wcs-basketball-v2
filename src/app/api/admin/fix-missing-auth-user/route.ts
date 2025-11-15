import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, AuthenticationError, AuthorizationError, NotFoundError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId || !supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server misconfigured", 500);
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      throw new AuthorizationError("Admin access required");
    }

    const { email } = await request.json();

    if (!email) {
      throw new ValidationError("Email is required");
    }

    // Check if user exists in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .maybeSingle();

    if (userError || !userData) {
      throw new NotFoundError("User not found in users table");
    }

    // Check if auth user exists
    const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(
      userData.id
    );

    if (!getUserError && authUser?.user) {
      return formatSuccessResponse({
        message: "Auth user already exists",
        authUserId: authUser.user.id,
      });
    }

    // Check by email as fallback
    const { data: usersByEmail } = await supabaseAdmin.auth.admin.listUsers();
    const userByEmail = usersByEmail?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (userByEmail) {
      // Update users table with correct auth user ID
      await supabaseAdmin
        .from("users")
        .update({ id: userByEmail.id })
        .eq("id", userData.id);

      return formatSuccessResponse({
        message: "Found existing auth user by email, updated users table",
        authUserId: userByEmail.id,
      });
    }

    // Create auth user with temporary password
    const tempPassword = `WCS${Date.now()}`; // Temporary password
    const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      id: userData.id, // Use the same ID from users table
      email: userData.email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError || !newAuthUser?.user) {
      throw new DatabaseError("Failed to create auth user", createError);
    }

    // Update password_reset flag
    await supabaseAdmin
      .from("users")
      .update({ password_reset: true })
      .eq("id", userData.id);

    devLog("Created auth user for:", email);

    return formatSuccessResponse({
      message: "Auth user created successfully. User must reset password.",
      authUserId: newAuthUser.user.id,
      requiresPasswordReset: true,
    });
  } catch (err) {
    return handleApiError(err, request);
  }
}

