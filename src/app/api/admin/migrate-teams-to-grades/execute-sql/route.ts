import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { AuthenticationError, AuthorizationError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

/**
 * API route to execute the SQL migration for converting age groups to grade levels
 * 
 * NOTE: Supabase's JavaScript client doesn't support DDL operations (ALTER TABLE, etc.)
 * directly. This route will:
 * 1. First migrate existing data (UPDATE statements)
 * 2. Provide instructions for manually updating the constraint in Supabase SQL Editor
 * 
 * The constraint update MUST be done manually in Supabase Dashboard > SQL Editor
 * because DDL operations require direct database access.
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers
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

    // Age group to grade level mapping
    const ageGroupToGrade: Record<string, string> = {
      U8: "2nd Grade",
      U10: "3rd Grade",
      U12: "4th Grade",
      U14: "5th Grade",
      U16: "6th Grade",
      U18: "U18 (High School)",
    };

    // Step 1: Migrate existing data (this can be done via the client)
    const { data: teams, error: fetchError } = await supabaseAdmin!
      .from("teams")
      .select("id, name, age_group")
      .in("age_group", Object.keys(ageGroupToGrade));

    if (fetchError) {
      throw new DatabaseError("Failed to fetch teams for migration", fetchError);
    }

    if (!teams || teams.length === 0) {
      return formatSuccessResponse({
        message: "No teams found with old age group values to migrate",
        migrated: 0,
        note: "You still need to update the CHECK constraint in Supabase SQL Editor",
      });
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

      // Try to update - this might fail if the constraint is still in place
      const { error: updateError } = await supabaseAdmin!
        .from("teams")
        .update({ age_group: newGradeLevel })
        .eq("id", team.id);

      if (updateError) {
        // If update fails due to constraint, that's expected
        const isConstraintError = updateError.message?.includes("check constraint") || 
                                  updateError.message?.includes("violates check constraint");
        
        if (isConstraintError) {
          migrationResults.push({
            teamId: team.id,
            teamName: team.name,
            oldAgeGroup: team.age_group,
            newGradeLevel,
            success: false,
            error: "Constraint not yet updated - run SQL migration in Supabase SQL Editor first",
          });
        } else {
          devError(`Failed to migrate team ${team.name}:`, updateError);
          migrationResults.push({
            teamId: team.id,
            teamName: team.name,
            oldAgeGroup: team.age_group,
            newGradeLevel,
            success: false,
            error: updateError.message,
          });
        }
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

    return formatSuccessResponse({
      message: `Data migration completed: ${successful} successful, ${failed} failed`,
      total: teams.length,
      successful,
      failed,
      results: migrationResults,
      nextStep: failed > 0 
        ? "Update the CHECK constraint in Supabase SQL Editor, then re-run this migration"
        : "All data migrated successfully",
      sqlToRun: `
-- Run this in Supabase SQL Editor to update the constraint:
ALTER TABLE public.teams 
DROP CONSTRAINT IF EXISTS teams_age_group_check;

ALTER TABLE public.teams 
ADD CONSTRAINT teams_age_group_check 
CHECK (age_group = ANY (ARRAY[
  '2nd Grade'::text, 
  '3rd Grade'::text, 
  '4th Grade'::text, 
  '5th Grade'::text, 
  '6th Grade'::text, 
  '7th Grade'::text, 
  '8th Grade'::text, 
  'U18 (High School)'::text
]));
      `.trim(),
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}


