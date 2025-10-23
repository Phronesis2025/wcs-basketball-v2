import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get the user ID from the request headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    devLog("Checking user role for:", userId);

    // Get user role from database
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("role, password_reset")
      .eq("id", userId)
      .single();

    if (error) {
      devError("Failed to fetch user role:", error);
      return NextResponse.json(
        { error: "Failed to fetch user role" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      role: data.role,
      password_reset: data.password_reset,
    });
  } catch (error) {
    devError("Check role API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
