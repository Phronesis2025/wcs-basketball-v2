import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

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
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .maybeSingle();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found in users table" },
        { status: 404 }
      );
    }

    // Check if auth user exists
    const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(
      userData.id
    );

    if (!getUserError && authUser?.user) {
      return NextResponse.json({
        success: true,
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

      return NextResponse.json({
        success: true,
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
      devError("Failed to create auth user:", createError);
      return NextResponse.json(
        { error: "Failed to create auth user", details: createError?.message },
        { status: 500 }
      );
    }

    // Update password_reset flag
    await supabaseAdmin
      .from("users")
      .update({ password_reset: true })
      .eq("id", userData.id);

    devLog("Created auth user for:", email);

    return NextResponse.json({
      success: true,
      message: "Auth user created successfully. User must reset password.",
      authUserId: newAuthUser.user.id,
      requiresPasswordReset: true,
    });
  } catch (err) {
    devError("Unexpected error in fix-missing-auth-user:", err);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

