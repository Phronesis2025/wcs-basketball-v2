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
      console.log("🔍 Login API - About to call trackLogin for user:", data.user.id);
      const { trackLogin } = await import("@/lib/analytics");
      console.log("🔍 Login API - trackLogin function imported successfully");
      await trackLogin(data.user.id, {
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        success: true,
      });
      console.log("🔍 Login API - trackLogin completed successfully");
    } catch (trackingError) {
      console.error("❌ Login API - Failed to track login event:", trackingError);
      devError("Failed to track login event:", trackingError);
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
