import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  console.log("🔐 [SERVER DEBUG] Login API called");
  
  try {
    const { email, password } = await request.json();
    console.log("🔐 [SERVER DEBUG] Email:", email);
    console.log("🔐 [SERVER DEBUG] Password length:", password?.length);

    if (!email || !password) {
      console.log("🔐 [SERVER DEBUG] ❌ Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Use admin client to bypass CORS issues
    if (!supabaseAdmin) {
      console.log("🔐 [SERVER DEBUG] ❌ Supabase admin client not available");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("🔐 [SERVER DEBUG] Attempting Supabase authentication...");
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("🔐 [SERVER DEBUG] ❌ Supabase auth error:", error.message);
      devError("Server-side login error:", error);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!data.user) {
      console.log("🔐 [SERVER DEBUG] ❌ No user data returned");
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    console.log("🔐 [SERVER DEBUG] ✅ Login successful for user:", data.user.id);
    console.log("🔐 [SERVER DEBUG] User email:", data.user.email);
    console.log("🔐 [SERVER DEBUG] Session exists:", !!data.session);

    devLog("Server-side login successful for user:", data.user.id);

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
    console.log("🔐 [SERVER DEBUG] ❌ Unexpected error:", error);
    devError("Server-side login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
