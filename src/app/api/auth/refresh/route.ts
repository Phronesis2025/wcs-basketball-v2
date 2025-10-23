import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token required" },
        { status: 400 }
      );
    }

    devLog("Refreshing token...");

    // Use Supabase to refresh the session
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      devError("Token refresh failed:", error);
      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: "No session returned from refresh" },
        { status: 401 }
      );
    }

    devLog("Token refreshed successfully");

    return NextResponse.json({
      session: data.session,
    });
  } catch (error) {
    devError("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
