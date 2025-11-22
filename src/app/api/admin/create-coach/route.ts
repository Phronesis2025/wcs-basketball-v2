import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { AuthenticationError, AuthorizationError, ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware or auth)
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabaseAdmin!
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (userError || !userData || userData.role !== "admin") {
      throw new AuthorizationError("Admin access required");
    }

    const { firstName, lastName, email, bio, imageUrl, quote } =
      await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email) {
      throw new ValidationError("First name, last name, and email are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format", "email");
    }

    devLog("Creating new coach:", { firstName, lastName, email });

    // Check if coach already exists
    const { data: existingCoach } = await supabaseAdmin!
      .from("coaches")
      .select("id")
      .eq("email", email)
      .single();

    if (existingCoach) {
      throw new ApiError("Coach with this email already exists", 409);
    }

    // Create auth user with default password
    const { data: authUser, error: authError } =
      await supabaseAdmin!.auth.admin.createUser({
        email,
        password: "WCS2025",
        email_confirm: true,
      });

    if (authError) {
      throw new ApiError("Failed to create user account", 500, undefined, authError);
    }

    if (!authUser.user) {
      throw new ApiError("Failed to create user account", 500);
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
      // Clean up auth user if user table insert fails
      await supabaseAdmin!.auth.admin.deleteUser(authUserId);
      throw new DatabaseError("Failed to create user profile", userInsertError);
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
      // Clean up auth user and user entry if coach insert fails
      await supabaseAdmin!.auth.admin.deleteUser(authUserId);
      await supabaseAdmin!.from("users").delete().eq("id", authUserId);
      throw new DatabaseError("Failed to create coach profile", coachError);
    }

    devLog("Coach created successfully:", coach.id);

    return formatSuccessResponse({
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
    return handleApiError(error, request);
  }
}
