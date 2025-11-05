// src/app/api/admin/import/execute/route.ts
// API endpoint to execute the import (upsert players, parents, teams)

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";
import { ParsedPlayerRow } from "@/lib/excel-parser";

async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId || !supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

interface ImportResult {
  rowNumber: number;
  status: "success" | "error";
  playerId?: string;
  errors?: string[];
}

interface ImportSummary {
  total: number;
  success: number;
  errors: number;
  created: {
    players: number;
    parents: number;
    teams: number;
  };
  updated: {
    players: number;
    parents: number;
    teams: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check admin role
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { rows } = await request.json() as { rows: ParsedPlayerRow[] };

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const results: ImportResult[] = [];
    const summary: ImportSummary = {
      total: rows.length,
      success: 0,
      errors: 0,
      created: { players: 0, parents: 0, teams: 0 },
      updated: { players: 0, parents: 0, teams: 0 },
    };

    // Process rows in batches of 100
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);

      for (const row of batch) {
        const errors: string[] = [];
        let playerId: string | undefined;

        try {
          // Step 1: Upsert Team
          const teamName = row.team_name.trim();
          const season = row.season.trim();

          let teamId: string;

          // First, try to find team by name + season
          let { data: existingTeam } = await supabaseAdmin!
            .from("teams")
            .select("id, season")
            .eq("name", teamName)
            .eq("season", season)
            .maybeSingle();

          // If not found by name+season, try by name only (since name is unique)
          if (!existingTeam) {
            const { data: teamByName } = await supabaseAdmin!
              .from("teams")
              .select("id, season")
              .eq("name", teamName)
              .maybeSingle();

            if (teamByName) {
              existingTeam = teamByName;
              // Team exists with different season - update season if provided
              if (season && teamByName.season !== season) {
                const { error: updateError } = await supabaseAdmin!
                  .from("teams")
                  .update({ season: season })
                  .eq("id", teamByName.id);

                if (updateError) {
                  devError(`Failed to update team season: ${updateError.message}`);
                  // Continue anyway - use existing team
                } else {
                  devLog(`Updated team ${teamName} season to ${season}`);
                }
              }
            }
          }

          if (existingTeam) {
            teamId = existingTeam.id;
            devLog(`Team exists: ${teamName} (${season || existingTeam.season || 'no season'})`);
          } else {
            // Create new team
            // Note: teams.name is UNIQUE, so we must ensure the name doesn't already exist
            const { data: newTeam, error: teamError } = await supabaseAdmin!
              .from("teams")
              .insert([
                {
                  name: teamName, // Must be unique
                  season: season || null,
                  is_active: true,
                  is_deleted: false,
                  // coach_email is required - use admin email or a placeholder
                  // Admin should update this after import
                  coach_email: process.env.ADMIN_NOTIFICATIONS_TO || "admin@wcsbasketball.com",
                },
              ])
              .select("id")
              .single();

            if (teamError || !newTeam) {
              // Check if it's a duplicate key error
              if (teamError?.code === "23505" || teamError?.message?.includes("unique")) {
                // Team name already exists - try to find it again (race condition)
                const { data: raceTeam } = await supabaseAdmin!
                  .from("teams")
                  .select("id")
                  .eq("name", teamName)
                  .maybeSingle();

                if (raceTeam) {
                  teamId = raceTeam.id;
                  devLog(`Team ${teamName} was created by another process, using existing team`);
                } else {
                  errors.push(`Team "${teamName}" already exists with a different configuration`);
                  throw new Error(`Team "${teamName}" already exists`);
                }
              } else {
                errors.push(`Failed to create team: ${teamError?.message || "Unknown error"}`);
                throw new Error(`Team creation failed: ${teamError?.message}`);
              }
            } else {
              teamId = newTeam.id;
              summary.created.teams++;
              devLog(`Created team: ${teamName} (${season || 'no season'})`);
            }
          }

          // Step 2: Upsert Parent 1
          const parent1Email = row.parent1_email.trim().toLowerCase();
          let parent1Id: string;

          const { data: existingParent1 } = await supabaseAdmin!
            .from("parents")
            .select("id, first_name, last_name, phone")
            .eq("email", parent1Email)
            .maybeSingle();

          if (existingParent1) {
            parent1Id = existingParent1.id;
            // Update parent info if needed
            const updates: any = {};
            if (row.parent1_first_name?.trim()) {
              updates.first_name = row.parent1_first_name.trim();
            }
            if (row.parent1_last_name?.trim()) {
              updates.last_name = row.parent1_last_name.trim();
            }
            if (row.parent1_phone?.trim()) {
              updates.phone = row.parent1_phone.trim();
            }
            if (row.parent1_address_line1?.trim()) {
              updates.address_line1 = row.parent1_address_line1.trim();
            }
            if (row.parent1_address_line2?.trim()) {
              updates.address_line2 = row.parent1_address_line2.trim();
            }
            if (row.parent1_city?.trim()) {
              updates.city = row.parent1_city.trim();
            }
            if (row.parent1_state?.trim()) {
              updates.state = row.parent1_state.trim();
            }
            if (row.parent1_zip?.trim()) {
              updates.zip = row.parent1_zip.trim();
            }
            if (row.parent1_emergency_contact?.trim()) {
              updates.emergency_contact = row.parent1_emergency_contact.trim();
            }
            if (row.parent1_emergency_phone?.trim()) {
              updates.emergency_phone = row.parent1_emergency_phone.trim();
            }
            if (row.medical_allergies?.trim()) {
              updates.medical_allergies = row.medical_allergies.trim();
            }
            if (row.medical_conditions?.trim()) {
              updates.medical_conditions = row.medical_conditions.trim();
            }
            if (row.medical_medications?.trim()) {
              updates.medical_medications = row.medical_medications.trim();
            }
            if (row.doctor_name?.trim()) {
              updates.doctor_name = row.doctor_name.trim();
            }
            if (row.doctor_phone?.trim()) {
              updates.doctor_phone = row.doctor_phone.trim();
            }

            if (Object.keys(updates).length > 0) {
              await supabaseAdmin!
                .from("parents")
                .update(updates)
                .eq("id", parent1Id);
              summary.updated.parents++;
            }
          } else {
            // Create new parent
            const { data: newParent1, error: parentError } = await supabaseAdmin!
              .from("parents")
              .insert([
                {
                  email: parent1Email,
                  first_name: row.parent1_first_name.trim(),
                  last_name: row.parent1_last_name.trim(),
                  phone: row.parent1_phone?.trim() || null,
                  address_line1: row.parent1_address_line1?.trim() || null,
                  address_line2: row.parent1_address_line2?.trim() || null,
                  city: row.parent1_city?.trim() || null,
                  state: row.parent1_state?.trim() || null,
                  zip: row.parent1_zip?.trim() || null,
                  emergency_contact: row.parent1_emergency_contact?.trim() || null,
                  emergency_phone: row.parent1_emergency_phone?.trim() || null,
                  medical_allergies: row.medical_allergies?.trim() || null,
                  medical_conditions: row.medical_conditions?.trim() || null,
                  medical_medications: row.medical_medications?.trim() || null,
                  doctor_name: row.doctor_name?.trim() || null,
                  doctor_phone: row.doctor_phone?.trim() || null,
                },
              ])
              .select("id")
              .single();

            if (parentError || !newParent1) {
              errors.push(`Failed to create parent 1: ${parentError?.message || "Unknown error"}`);
              throw new Error(`Parent 1 creation failed: ${parentError?.message}`);
            }

            parent1Id = newParent1.id;
            summary.created.parents++;
            devLog(`Created parent 1: ${parent1Email}`);

            // Send invite email to new parent
            try {
              // Determine base URL for redirect
              let baseUrl: string;
              if (process.env.VERCEL) {
                if (process.env.NEXT_PUBLIC_BASE_URL) {
                  const url = process.env.NEXT_PUBLIC_BASE_URL.trim();
                  baseUrl = url.startsWith("http://") || url.startsWith("https://")
                    ? url.replace(/\/+$/, "")
                    : `https://${url.replace(/\/+$/, "")}`;
                } else if (process.env.VERCEL_URL) {
                  baseUrl = `https://${process.env.VERCEL_URL}`;
                } else {
                  baseUrl = "https://wcs-basketball-v2.vercel.app";
                }
              } else {
                baseUrl = "http://localhost:3000";
              }

              // Invite parent via Supabase Auth
              const { data: inviteData, error: inviteError } = await supabaseAdmin!
                .auth.admin.inviteUserByEmail(parent1Email, {
                  data: {
                    parentFirstName: row.parent1_first_name.trim(),
                    parentLastName: row.parent1_last_name.trim(),
                    importedFromExcel: true,
                  },
                  redirectTo: `${baseUrl}/parent/profile`,
                });

              if (inviteError) {
                devError(`Failed to send invite to ${parent1Email}:`, inviteError);
                // Don't fail the import if invite fails
              } else {
                devLog(`Invite sent to new parent: ${parent1Email}`, {
                  userId: inviteData.user?.id,
                });
              }
            } catch (inviteError) {
              devError(`Exception sending invite to ${parent1Email}:`, inviteError);
              // Don't fail the import if invite fails
            }
          }

          // Step 3: Upsert Parent 2 (if provided)
          // Note: Currently players only have one parent_id, so we'll link parent1
          // Parent 2 can be stored but won't be linked to the player record
          // This is a limitation of the current schema
          if (row.parent2_email?.trim()) {
            const parent2Email = row.parent2_email.trim().toLowerCase();
            const { data: existingParent2 } = await supabaseAdmin!
              .from("parents")
              .select("id")
              .eq("email", parent2Email)
              .maybeSingle();

            if (!existingParent2) {
              // Create parent 2
              const { data: newParent2, error: parent2Error } = await supabaseAdmin!
                .from("parents")
                .insert([
                  {
                    email: parent2Email,
                    first_name: row.parent2_first_name?.trim() || "",
                    last_name: row.parent2_last_name?.trim() || "",
                    phone: row.parent2_phone?.trim() || null,
                    address_line1: row.parent2_address_line1?.trim() || null,
                    address_line2: row.parent2_address_line2?.trim() || null,
                    city: row.parent2_city?.trim() || null,
                    state: row.parent2_state?.trim() || null,
                    zip: row.parent2_zip?.trim() || null,
                    emergency_contact: row.parent2_emergency_contact?.trim() || null,
                    emergency_phone: row.parent2_emergency_phone?.trim() || null,
                  },
                ])
                .select("id")
                .single();

              if (!parent2Error && newParent2) {
                summary.created.parents++;
                devLog(`Created parent 2: ${parent2Email}`);

                // Send invite email to parent 2 (only if email is valid)
                // Skip example.com and other test domains that Supabase rejects
                const emailDomain = parent2Email.split("@")[1]?.toLowerCase();
                const isTestEmail = emailDomain === "example.com" || 
                                   emailDomain === "test.com" || 
                                   emailDomain?.endsWith(".example");
                
                if (!isTestEmail) {
                  try {
                    let baseUrl: string;
                    if (process.env.VERCEL) {
                      if (process.env.NEXT_PUBLIC_BASE_URL) {
                        const url = process.env.NEXT_PUBLIC_BASE_URL.trim();
                        baseUrl = url.startsWith("http://") || url.startsWith("https://")
                          ? url.replace(/\/+$/, "")
                          : `https://${url.replace(/\/+$/, "")}`;
                      } else if (process.env.VERCEL_URL) {
                        baseUrl = `https://${process.env.VERCEL_URL}`;
                      } else {
                        baseUrl = "https://wcs-basketball-v2.vercel.app";
                      }
                    } else {
                      baseUrl = "http://localhost:3000";
                    }

                    const { data: inviteData, error: inviteError } = await supabaseAdmin!
                      .auth.admin.inviteUserByEmail(parent2Email, {
                        data: {
                          parentFirstName: row.parent2_first_name?.trim() || "",
                          parentLastName: row.parent2_last_name?.trim() || "",
                          importedFromExcel: true,
                        },
                        redirectTo: `${baseUrl}/parent/profile`,
                      });

                    if (inviteError) {
                      // Check if it's an invalid email error
                      if (inviteError.code === "email_address_invalid" || inviteError.message?.includes("invalid")) {
                        devLog(`Skipping invite for parent 2 ${parent2Email} - invalid email address (likely test/example domain)`);
                      } else {
                        devError(`Failed to send invite to parent 2 ${parent2Email}:`, inviteError);
                      }
                    } else {
                      devLog(`Invite sent to new parent 2: ${parent2Email}`, {
                        userId: inviteData.user?.id,
                      });
                    }
                  } catch (inviteError) {
                    devError(`Exception sending invite to parent 2 ${parent2Email}:`, inviteError);
                  }
                } else {
                  devLog(`Skipping invite for parent 2 ${parent2Email} - test/example email domain`);
                }
              }
            }
          }

          // Step 4: Upsert Player
          const playerName = `${row.player_first_name.trim()} ${row.player_last_name.trim()}`;
          const dob = row.player_dob.trim();

          // Find existing player: try external_id first, then name + dob
          let existingPlayer = null;

          if (row.player_external_id?.trim()) {
            const { data: playerByExternalId } = await supabaseAdmin!
              .from("players")
              .select("id, name, date_of_birth, external_id")
              .eq("external_id", row.player_external_id.trim())
              .maybeSingle();

            if (playerByExternalId) {
              existingPlayer = playerByExternalId;
            }
          }

          // Fallback to name + dob matching if external_id didn't match
          if (!existingPlayer) {
            const { data: existingPlayers } = await supabaseAdmin!
              .from("players")
              .select("id, name, date_of_birth, external_id")
              .eq("date_of_birth", dob)
              .ilike("name", playerName);

            existingPlayer = existingPlayers?.find(
              (p) => p.name.toLowerCase() === playerName.toLowerCase()
            ) || null;
          }

          const playerData: any = {
            name: playerName,
            date_of_birth: dob,
            gender: row.player_gender.trim().toUpperCase(),
            team_id: teamId,
            parent_id: parent1Id,
            is_active: true,
            is_deleted: false,
            status: "active", // Set to active since admin is importing
          };

          if (row.jersey_number?.trim()) {
            playerData.jersey_number = parseInt(row.jersey_number.trim());
          }

          // Add external_id if provided
          if (row.player_external_id?.trim()) {
            playerData.external_id = row.player_external_id.trim();
          }

          // Add player detail fields
          if (row.grade?.trim()) {
            playerData.grade = row.grade.trim();
          }
          if (row.school_name?.trim()) {
            playerData.school_name = row.school_name.trim();
          }
          if (row.shirt_size?.trim()) {
            playerData.shirt_size = row.shirt_size.trim();
          }
          if (row.position_preference?.trim()) {
            playerData.position_preference = row.position_preference.trim();
          }
          if (row.previous_experience?.trim()) {
            playerData.previous_experience = row.previous_experience.trim();
          }
          if (row.emergency_contact?.trim()) {
            playerData.emergency_contact = row.emergency_contact.trim();
          }
          if (row.emergency_phone?.trim()) {
            playerData.emergency_phone = row.emergency_phone.trim();
          }

          // Add parent address fields to players table (for backward compatibility)
          if (row.parent1_address_line1?.trim()) {
            playerData.parent_address_line1 = row.parent1_address_line1.trim();
          }
          if (row.parent1_address_line2?.trim()) {
            playerData.parent_address_line2 = row.parent1_address_line2.trim();
          }
          if (row.parent1_city?.trim()) {
            playerData.parent_city = row.parent1_city.trim();
          }
          if (row.parent1_state?.trim()) {
            playerData.parent_state = row.parent1_state.trim();
          }
          if (row.parent1_zip?.trim()) {
            playerData.parent_zip = row.parent1_zip.trim();
          }

          if (existingPlayer) {
            // Update existing player
            const { data: updatedPlayer, error: updateError } = await supabaseAdmin!
              .from("players")
              .update(playerData)
              .eq("id", existingPlayer.id)
              .select("id")
              .single();

            if (updateError || !updatedPlayer) {
              errors.push(`Failed to update player: ${updateError?.message || "Unknown error"}`);
              throw new Error(`Player update failed: ${updateError?.message}`);
            }

            playerId = updatedPlayer.id;
            summary.updated.players++;
            devLog(`Updated player: ${playerName}`);
          } else {
            // Create new player
            const { data: newPlayer, error: playerError } = await supabaseAdmin!
              .from("players")
              .insert([playerData])
              .select("id")
              .single();

            if (playerError || !newPlayer) {
              errors.push(`Failed to create player: ${playerError?.message || "Unknown error"}`);
              throw new Error(`Player creation failed: ${playerError?.message}`);
            }

            playerId = newPlayer.id;
            summary.created.players++;
            devLog(`Created player: ${playerName}`);
          }

          // Success
          results.push({
            rowNumber: row.rowNumber,
            status: "success",
            playerId,
          });
          summary.success++;
        } catch (error) {
          devError(`Import error for row ${row.rowNumber}:`, error);
          results.push({
            rowNumber: row.rowNumber,
            status: "error",
            errors: errors.length > 0 ? errors : [
              error instanceof Error ? error.message : "Unknown error",
            ],
          });
          summary.errors++;
        }
      }
    }

    // Log import job (if imports table exists)
    try {
      const { error: importLogError } = await supabaseAdmin!
        .from("imports")
        .insert([
          {
            status: summary.errors === 0 ? "completed" : "partial",
            created_by: userId,
            summary_json: summary,
            error_json: summary.errors > 0 ? results.filter((r) => r.status === "error") : null,
            started_at: new Date().toISOString(),
            finished_at: new Date().toISOString(),
          },
        ]);

      if (importLogError) {
        // Log but don't fail the import if logging fails
        devLog("Could not log import (imports table may not exist or migration not run):", importLogError.message);
      } else {
        devLog("Import logged successfully");
      }
    } catch (importLogError) {
      // Ignore if imports table doesn't exist
      devLog("Could not log import (imports table may not exist)");
    }

    return NextResponse.json({
      success: true,
      results,
      summary,
    });
  } catch (error) {
    devError("Import execution error:", error);
    return NextResponse.json(
      {
        error: "Failed to execute import",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

