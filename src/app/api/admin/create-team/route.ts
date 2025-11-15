import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { AuthenticationError, AuthorizationError, ValidationError, ApiError, DatabaseError, NotFoundError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

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

    const {
      teamName,
      ageGroup,
      gender,
      gradeLevel,
      season,
      coachEmails, // Changed from coachEmail to coachEmails array
      coach_id, // Single coach ID
      coach_ids, // Array of coach IDs (from Manage tab)
      logoUrl,
      logo_url, // Support both naming conventions
      teamImageUrl,
      is_active,
    } = await request.json();

    // Validate required fields
    if (!teamName || !ageGroup || !gender) {
      throw new ValidationError("Team name, age group, and gender are required");
    }

    // Validate coach assignment (either coach_id, coach_ids array, or coachEmails)
    if (
      !coach_id &&
      (!coach_ids || !Array.isArray(coach_ids) || coach_ids.length === 0) &&
      (!coachEmails || !Array.isArray(coachEmails) || coachEmails.length === 0)
    ) {
      throw new ValidationError("Either a coach ID, coach IDs array, or coach emails are required");
    }

    // Validate grade level (stored in age_group field)
    const validGradeLevels = [
      "2nd Grade",
      "3rd Grade",
      "4th Grade",
      "5th Grade",
      "6th Grade",
      "7th Grade",
      "8th Grade",
      "U18 (High School)",
    ];
    if (!validGradeLevels.includes(ageGroup)) {
      throw new ValidationError(`Invalid grade level. Must be one of: ${validGradeLevels.join(", ")}`, "ageGroup");
    }

    // Validate gender
    const validGenders = ["Boys", "Girls"];
    if (!validGenders.includes(gender)) {
      throw new ValidationError("Invalid gender. Must be Boys or Girls", "gender");
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
      throw new ApiError("Team with this name already exists", 409);
    }

    let activeCoaches: any[] = [];

    // Handle coach assignment - prioritize coach_ids array (from Manage tab), then coach_id, then coachEmails
    if (coach_ids && Array.isArray(coach_ids) && coach_ids.length > 0) {
      // Find coaches by IDs (from Manage tab checkboxes)
      const { data: coaches, error: coachesError } = await supabaseAdmin!
        .from("coaches")
        .select("id, first_name, last_name, email, is_active")
        .in("id", coach_ids);

      if (coachesError || !coaches || coaches.length === 0) {
        throw new NotFoundError("No coaches found with the provided IDs");
      }

      // Filter out inactive coaches
      activeCoaches = coaches.filter((coach) => coach.is_active !== false);
      
      // Check if some coaches were inactive
      if (activeCoaches.length < coaches.length) {
        const inactiveCoaches = coaches.filter((coach) => coach.is_active === false);
        devLog(
          `Warning: ${inactiveCoaches.length} coaches were inactive and excluded from team assignment`
        );
      }
    } else if (coach_id) {
      // Get the specific coach
      const { data: coach, error: coachError } = await supabaseAdmin!
        .from("coaches")
        .select("id, first_name, last_name, email, is_active")
        .eq("id", coach_id)
        .single();

      if (coachError || !coach) {
        throw new NotFoundError("Coach not found with the provided ID");
      }

      if (coach.is_active === false) {
        throw new ValidationError("The selected coach is inactive", "coach_id");
      }

      activeCoaches = [coach];
    } else if (coachEmails && Array.isArray(coachEmails) && coachEmails.length > 0) {
      // Find coaches by emails, including is_active status
      const { data: coaches, error: coachesError } = await supabaseAdmin!
        .from("coaches")
        .select("id, first_name, last_name, email, is_active")
        .in("email", coachEmails);

      if (coachesError || !coaches || coaches.length === 0) {
        throw new NotFoundError("No coaches found with the provided emails");
      }

      // Filter out inactive coaches
      activeCoaches = coaches.filter((coach) => coach.is_active !== false);
    }

    if (activeCoaches.length === 0) {
      throw new ValidationError("No active coaches found");
    }

    // Check if all provided coach emails were found (only for coachEmails)
    if (!coach_id && !coach_ids && coachEmails) {
      const foundEmails = activeCoaches.map((coach) => coach.email);
      const missingEmails = coachEmails.filter(
        (email) => !foundEmails.includes(email)
      );
      if (missingEmails.length > 0) {
        throw new NotFoundError(`Coaches not found with emails: ${missingEmails.join(", ")}`);
      }

      // Warn if some coaches were inactive
      const allCoaches = await supabaseAdmin!
        .from("coaches")
        .select("id, is_active")
        .in("email", coachEmails);

      if (allCoaches.data && activeCoaches.length < allCoaches.data.length) {
        const inactiveCoaches = allCoaches.data.filter(
          (coach) => coach.is_active === false
        );
        devLog(
          `Warning: ${inactiveCoaches.length} coaches were inactive and excluded from team assignment`
        );
      }
    }
    
    // Check if all provided coach IDs were found (only for coach_ids array)
    if (coach_ids && Array.isArray(coach_ids) && coach_ids.length > 0) {
      const foundIds = activeCoaches.map((coach) => coach.id);
      const missingIds = coach_ids.filter(
        (id) => !foundIds.includes(id)
      );
      if (missingIds.length > 0) {
        throw new NotFoundError(`Coaches not found with IDs: ${missingIds.join(", ")}`);
      }
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
      devError("Team creation data that failed:", {
        name: teamName,
        age_group: ageGroup,
        gender: gender,
        grade_level: gradeLevel || null,
        season: season || null,
        logo_url: logoUrl || null,
        team_image: teamImageUrl || null,
      });
      throw new DatabaseError("Failed to create team", teamError);
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
      // Clean up team if linking fails
      await supabaseAdmin!.from("teams").delete().eq("id", team.id);
      throw new DatabaseError("Failed to link coaches to team", linkError);
    }

    devLog("Team created successfully:", team.id);

    return formatSuccessResponse({
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
    return handleApiError(error, request);
  }
}
