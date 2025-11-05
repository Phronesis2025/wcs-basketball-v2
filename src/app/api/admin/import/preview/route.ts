// src/app/api/admin/import/preview/route.ts
// API endpoint to preview import changes (compare with existing data)

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

interface PreviewRow {
  rowNumber: number;
  status: "new" | "update" | "no_change" | "error";
  player?: {
    existing?: any;
    proposed: {
      name: string;
      date_of_birth: string;
      gender: string;
      jersey_number?: number;
      external_id?: string;
    };
  };
  team?: {
    existing?: any;
    proposed: {
      name: string;
      season: string;
    };
  };
  parent1?: {
    existing?: any;
    proposed: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
    };
  };
  parent2?: {
    existing?: any;
    proposed: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
    };
  };
  errors?: string[];
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

    const previewRows: PreviewRow[] = [];

    // Process each row
    for (const row of rows) {
      const previewRow: PreviewRow = {
        rowNumber: row.rowNumber,
        status: "new",
      };

      const errors: string[] = [];

      try {
        // 1. Find or create team
        const teamName = row.team_name.trim();
        const season = row.season.trim();

        const { data: existingTeam } = await supabaseAdmin!
          .from("teams")
          .select("id, name, season")
          .eq("name", teamName)
          .eq("season", season)
          .maybeSingle();

        previewRow.team = {
          existing: existingTeam || undefined,
          proposed: { name: teamName, season },
        };

        // 2. Find or create parent1
        const parent1Email = row.parent1_email.trim().toLowerCase();
        const { data: existingParent1 } = await supabaseAdmin!
          .from("parents")
          .select("id, email, first_name, last_name, phone")
          .eq("email", parent1Email)
          .maybeSingle();

        previewRow.parent1 = {
          existing: existingParent1 || undefined,
          proposed: {
            email: parent1Email,
            first_name: row.parent1_first_name.trim(),
            last_name: row.parent1_last_name.trim(),
            phone: row.parent1_phone?.trim() || undefined,
          },
        };

        // 3. Find or create parent2 (if provided)
        if (row.parent2_email?.trim()) {
          const parent2Email = row.parent2_email.trim().toLowerCase();
          const { data: existingParent2 } = await supabaseAdmin!
            .from("parents")
            .select("id, email, first_name, last_name, phone")
            .eq("email", parent2Email)
            .maybeSingle();

          previewRow.parent2 = {
            existing: existingParent2 || undefined,
            proposed: {
              email: parent2Email,
              first_name: row.parent2_first_name?.trim() || "",
              last_name: row.parent2_last_name?.trim() || "",
              phone: row.parent2_phone?.trim() || undefined,
            },
          };
        }

        // 4. Find existing player
        // Try by external_id first, then by name + dob
        let existingPlayer = null;

        if (row.player_external_id?.trim()) {
          // Note: external_id column doesn't exist yet - we'll need to add it
          // For now, match by name + dob
        }

        // Match by name + dob (case-insensitive)
        const playerName = `${row.player_first_name.trim()} ${row.player_last_name.trim()}`;
        const dob = row.player_dob.trim();

        const { data: playersByName } = await supabaseAdmin!
          .from("players")
          .select("id, name, date_of_birth, gender, jersey_number, team_id, parent_id")
          .eq("date_of_birth", dob)
          .ilike("name", playerName);

        // Find exact match (case-insensitive name match)
        existingPlayer = playersByName?.find(
          (p) => p.name.toLowerCase() === playerName.toLowerCase()
        ) || null;

        previewRow.player = {
          existing: existingPlayer || undefined,
          proposed: {
            name: playerName,
            date_of_birth: dob,
            gender: row.player_gender.trim().toUpperCase(),
            jersey_number: row.jersey_number ? parseInt(row.jersey_number) : undefined,
            external_id: row.player_external_id?.trim() || undefined,
          },
        };

        // Determine status
        if (existingPlayer) {
          // Check if anything changed
          const nameChanged = existingPlayer.name !== playerName;
          const dobChanged = existingPlayer.date_of_birth !== dob;
          const genderChanged = existingPlayer.gender?.toUpperCase() !== row.player_gender.trim().toUpperCase();
          const jerseyChanged = existingPlayer.jersey_number?.toString() !== row.jersey_number?.trim();

          // Check team assignment
          const teamChanged = existingPlayer.team_id !== existingTeam?.id;

          // Check parent assignment (use parent1 as primary)
          const parentChanged = existingPlayer.parent_id !== existingParent1?.id;

          if (nameChanged || dobChanged || genderChanged || jerseyChanged || teamChanged || parentChanged) {
            previewRow.status = "update";
          } else {
            previewRow.status = "no_change";
          }
        } else {
          previewRow.status = "new";
        }
      } catch (error) {
        devError(`Preview error for row ${row.rowNumber}:`, error);
        previewRow.status = "error";
        errors.push(
          error instanceof Error ? error.message : "Unknown error during preview"
        );
      }

      if (errors.length > 0) {
        previewRow.errors = errors;
      }

      previewRows.push(previewRow);
    }

    return NextResponse.json({
      success: true,
      preview: previewRows,
      summary: {
        total: previewRows.length,
        new: previewRows.filter((r) => r.status === "new").length,
        update: previewRows.filter((r) => r.status === "update").length,
        no_change: previewRows.filter((r) => r.status === "no_change").length,
        error: previewRows.filter((r) => r.status === "error").length,
      },
    });
  } catch (error) {
    devError("Preview error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate preview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

