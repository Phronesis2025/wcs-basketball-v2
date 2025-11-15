import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  devLog("🔐 [SERVER DEBUG] Login API called");

  try {
    const { email, password } = await request.json();
    devLog("🔐 [SERVER DEBUG] Email:", email);
    devLog("🔐 [SERVER DEBUG] Password length:", password?.length);

    if (!email || !password) {
      devLog("🔐 [SERVER DEBUG] ❌ Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use admin client to bypass CORS issues
    if (!supabaseAdmin) {
      devLog("🔐 [SERVER DEBUG] ❌ Supabase admin client not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    devLog("🔐 [SERVER DEBUG] Attempting Supabase authentication...");
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      devLog("🔐 [SERVER DEBUG] ❌ Supabase auth error:", error.message);
      
      // Check if user exists in users table but not in auth.users
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("id, email, role")
        .eq("email", email)
        .maybeSingle();

      if (userData && (userData.role === "admin" || userData.role === "coach")) {
        // Verify user doesn't exist in auth.users
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userData.id);
        
        if (!authUser?.user) {
          // Check by email as fallback
          const { data: usersByEmail } = await supabaseAdmin.auth.admin.listUsers();
          const userByEmail = usersByEmail?.users?.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
          );

          if (!userByEmail) {
            devLog("🔐 [SERVER DEBUG] User exists in users table but not in auth.users, creating auth user");
            // Create auth user with temporary password that requires reset
            const tempPassword = `WCS${Date.now()}${Math.random().toString(36).substring(7)}`;
            const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
              id: userData.id,
              email: userData.email,
              password: tempPassword,
              email_confirm: true,
            });

            if (!createError && newAuthUser?.user) {
              // Set password_reset flag
              await supabaseAdmin
                .from("users")
                .update({ password_reset: true })
                .eq("id", userData.id);

              devLog("🔐 [SERVER DEBUG] ✅ Created auth user, user must reset password");
              return NextResponse.json(
                { 
                  error: "Your account needs password setup. Please use 'Forgot Password' to set your password.",
                  requiresPasswordReset: true 
                },
                { status: 401 }
              );
            }
          }
        }
      }

      devError("Server-side login error:", error);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!data.user) {
      devLog("🔐 [SERVER DEBUG] ❌ No user data returned");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    devLog("🔐 [SERVER DEBUG] ✅ Login successful for user:", data.user.id);
    devLog("🔐 [SERVER DEBUG] User email:", data.user.email);
    devLog("🔐 [SERVER DEBUG] Session exists:", !!data.session);

    devLog("Server-side login successful for user:", data.user.id);

    // Track login event for analytics
    try {
      devLog("🔍 Login API - About to call trackLogin for user:", data.user.id);
      const { trackLogin } = await import("@/lib/analytics");
      devLog("🔍 Login API - trackLogin function imported successfully");
      await trackLogin(data.user.id, {
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        success: true,
      });
      devLog("🔍 Login API - trackLogin completed successfully");
    } catch (trackingError) {
      devError("❌ Login API - Failed to track login event:", trackingError);
      // Don't fail the login if tracking fails
    }

    // Return user data without sensitive information
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        user_metadata: data.user.user_metadata,
      },
      session: data.session,
    });
  } catch (error) {
    devLog("🔐 [SERVER DEBUG] ❌ Unexpected error:", error);
    devError("Server-side login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
