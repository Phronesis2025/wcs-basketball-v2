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

    const {
      teamName,
      ageGroup,
      gender,
      gradeLevel,
      season,
      coachEmails, // Changed from coachEmail to coachEmails array
      logoUrl,
      logo_url, // Support both naming conventions
      teamImageUrl,
      is_active,
    } = await request.json();

    // Validate required fields
    if (
      !teamName ||
      !ageGroup ||
      !gender ||
      !coachEmails ||
      !Array.isArray(coachEmails) ||
      coachEmails.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Team name, age group, gender, and at least one coach are required",
        },
        { status: 400 }
      );
    }

    // Validate age group
    const validAgeGroups = ["U10", "U12", "U14", "U16", "U18"];
    if (!validAgeGroups.includes(ageGroup)) {
      return NextResponse.json(
        { error: "Invalid age group. Must be U10, U12, U14, U16, or U18" },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ["Boys", "Girls"];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender. Must be Boys or Girls" },
        { status: 400 }
      );
    }

    devLog("Creating new team:", { teamName, ageGroup, gender, coachEmails });
    devLog("Full request data:", {
      teamName,
      ageGroup,
      gender,
      gradeLevel,
      season,
      coachEmails,
      logoUrl,
      teamImageUrl,
    });

    // Check if team name already exists (case-insensitive)
    const { data: existingTeam } = await supabaseAdmin!
      .from("teams")
      .select("id")
      .ilike("name", teamName)
      .maybeSingle();

    if (existingTeam) {
      return NextResponse.json(
        { error: "Team with this name already exists" },
        { status: 409 }
      );
    }

    // Find coaches by emails, including is_active status
    const { data: coaches, error: coachesError } = await supabaseAdmin!
      .from("coaches")
      .select("id, first_name, last_name, email, is_active")
      .in("email", coachEmails);

    if (coachesError || !coaches || coaches.length === 0) {
      return NextResponse.json(
        { error: "No coaches found with the provided emails" },
        { status: 404 }
      );
    }

    // Filter out inactive coaches
    const activeCoaches = coaches.filter((coach) => coach.is_active !== false);

    if (activeCoaches.length === 0) {
      return NextResponse.json(
        { error: "No active coaches found with the provided emails" },
        { status: 400 }
      );
    }

    // Check if all provided coach emails were found
    const foundEmails = coaches.map((coach) => coach.email);
    const missingEmails = coachEmails.filter(
      (email) => !foundEmails.includes(email)
    );
    if (missingEmails.length > 0) {
      return NextResponse.json(
        { error: `Coaches not found with emails: ${missingEmails.join(", ")}` },
        { status: 404 }
      );
    }

    // Warn if some coaches were inactive
    if (activeCoaches.length < coaches.length) {
      const inactiveCoaches = coaches.filter(
        (coach) => coach.is_active === false
      );
      devLog(
        `Warning: ${inactiveCoaches.length} coaches were inactive and excluded from team assignment`
      );
    }

    // Create team (include legacy coach_email for backward compatibility)
    const { data: team, error: teamError } = await supabaseAdmin!
      .from("teams")
      .insert({
        name: teamName,
        age_group: ageGroup,
        gender: gender,
        grade_level: gradeLevel || null,
        season: season || null,
        logo_url: logoUrl || logo_url || null,
        team_image: teamImageUrl || null,
        coach_email: activeCoaches[0]?.email || null,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (teamError) {
      devError("Failed to create team:", teamError);
      devError("Team creation data that failed:", {
        name: teamName,
        age_group: ageGroup,
        gender: gender,
        grade_level: gradeLevel || null,
        season: season || null,
        logo_url: logoUrl || null,
        team_image: teamImageUrl || null,
      });
      return NextResponse.json(
        {
          error: "Failed to create team",
          details: teamError.message,
          code: teamError.code,
        },
        { status: 500 }
      );
    }

    // Link active coaches to team via team_coaches junction table
    const teamCoachInserts = activeCoaches.map((coach) => ({
      team_id: team.id,
      coach_id: coach.id,
    }));

    const { error: linkError } = await supabaseAdmin!
      .from("team_coaches")
      .insert(teamCoachInserts);

    if (linkError) {
      devError("Failed to link coaches to team:", linkError);
      // Clean up team if linking fails
      await supabaseAdmin!.from("teams").delete().eq("id", team.id);
      return NextResponse.json(
        { error: "Failed to link coaches to team" },
        { status: 500 }
      );
    }

    devLog("Team created successfully:", team.id);

    return NextResponse.json({
      success: true,
      message: "Team created successfully",
      data: {
        teamId: team.id,
        teamName: team.name,
        ageGroup: team.age_group,
        gender: team.gender,
        coaches: activeCoaches.map((coach) => ({
          name: `${coach.first_name} ${coach.last_name}`,
          email: coach.email,
        })),
      },
    });
  } catch (error) {
    devError("Create team API error:", error);
    return NextResponse.json(
      {
        error: "Failed to create team",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
