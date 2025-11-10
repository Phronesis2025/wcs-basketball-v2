import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

/**
 * Migration API to convert existing team age groups (U8-U18) to grade levels
 * 
 * Mapping:
 * - U8 -> 2nd Grade
 * - U10 -> 3rd Grade
 * - U12 -> 4th Grade
 * - U14 -> 5th Grade
 * - U16 -> 6th Grade
 * - U18 -> U18 (High School)
 * 
 * NOTE: This migration updates the age_group field in the teams table.
 * The database CHECK constraint on age_group will need to be updated separately
 * in Supabase to allow the new grade level values.
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers
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

    // Age group to grade level mapping
    const ageGroupToGrade: Record<string, string> = {
      U8: "2nd Grade",
      U10: "3rd Grade",
      U12: "4th Grade",
      U14: "5th Grade",
      U16: "6th Grade",
      U18: "U18 (High School)",
    };

    // Fetch all teams with old age groups
    const { data: teams, error: fetchError } = await supabaseAdmin!
      .from("teams")
      .select("id, name, age_group")
      .in("age_group", Object.keys(ageGroupToGrade));

    if (fetchError) {
      devError("Failed to fetch teams for migration:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch teams", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!teams || teams.length === 0) {
      return NextResponse.json(
        { 
          message: "No teams found with old age group values to migrate",
          migrated: 0 
        },
        { status: 200 }
      );
    }

    devLog(`Found ${teams.length} teams to migrate`);

    // Migrate each team
    const migrationResults: Array<{
      teamId: string;
      teamName: string;
      oldAgeGroup: string;
      newGradeLevel: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const team of teams) {
      const newGradeLevel = ageGroupToGrade[team.age_group];
      
      if (!newGradeLevel) {
        migrationResults.push({
          teamId: team.id,
          teamName: team.name,
          oldAgeGroup: team.age_group,
          newGradeLevel: "",
          success: false,
          error: `No mapping found for age group: ${team.age_group}`,
        });
        continue;
      }

      const { error: updateError } = await supabaseAdmin!
        .from("teams")
        .update({ age_group: newGradeLevel })
        .eq("id", team.id);

      if (updateError) {
        devError(`Failed to migrate team ${team.name}:`, updateError);
        migrationResults.push({
          teamId: team.id,
          teamName: team.name,
          oldAgeGroup: team.age_group,
          newGradeLevel,
          success: false,
          error: updateError.message,
        });
      } else {
        devLog(`Migrated team ${team.name}: ${team.age_group} -> ${newGradeLevel}`);
        migrationResults.push({
          teamId: team.id,
          teamName: team.name,
          oldAgeGroup: team.age_group,
          newGradeLevel,
          success: true,
        });
      }
    }

    const successful = migrationResults.filter((r) => r.success).length;
    const failed = migrationResults.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        message: `Migration completed: ${successful} successful, ${failed} failed`,
        total: teams.length,
        successful,
        failed,
        results: migrationResults,
      },
      { status: 200 }
    );
  } catch (error) {
    devError("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

