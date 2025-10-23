import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware or auth)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { firstName, lastName, email, bio, imageUrl, quote } =
      await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    devLog("Creating new coach:", { firstName, lastName, email });

    // Check if coach already exists
    const { data: existingCoach } = await supabaseAdmin!
      .from("coaches")
      .select("id")
      .eq("email", email)
      .single();

    if (existingCoach) {
      return NextResponse.json(
        { error: "Coach with this email already exists" },
        { status: 409 }
      );
    }

    // Create auth user with default password
    const { data: authUser, error: authError } =
      await supabaseAdmin!.auth.admin.createUser({
        email,
        password: "WCS2025",
        email_confirm: true,
      });

    if (authError) {
      devError("Failed to create auth user:", authError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    const authUserId = authUser.user.id;

    // Create user entry in users table
    const { error: userInsertError } = await supabaseAdmin!
      .from("users")
      .insert({
        id: authUserId,
        email,
        role: "coach",
        password_reset: true,
        created_at: new Date().toISOString(),
      });

    if (userInsertError) {
      devError("Failed to create user entry:", userInsertError);
      // Clean up auth user if user table insert fails
      await supabaseAdmin!.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Create coach entry
    const { data: coach, error: coachError } = await supabaseAdmin!
      .from("coaches")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        bio: bio || null,
        image_url:
          imageUrl ||
          "https://htgkddahhgugesktujds.supabase.co/storage/v1/object/public/images/coaches/goofy_coach.png",
        quote: quote || null,
        user_id: authUserId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (coachError) {
      devError("Failed to create coach entry:", coachError);
      // Clean up auth user and user entry if coach insert fails
      await supabaseAdmin!.auth.admin.deleteUser(authUserId);
      await supabaseAdmin!.from("users").delete().eq("id", authUserId);
      return NextResponse.json(
        { error: "Failed to create coach profile" },
        { status: 500 }
      );
    }

    devLog("Coach created successfully:", coach.id);

    return NextResponse.json({
      success: true,
      message: "Coach created successfully",
      data: {
        coachId: coach.id,
        userId: authUserId,
        email,
        password: "WCS2025",
        credentials: {
          email,
          password: "WCS2025",
        },
      },
    });
  } catch (error) {
    devError("Create coach API error:", error);
    return NextResponse.json(
      {
        error: "Failed to create coach",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
