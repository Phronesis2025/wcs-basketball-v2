import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { generateWelcomeKitPDF } from "@/lib/pdf/welcomeKit";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, handleApiError } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get("player_id");

    if (!playerId) {
      throw new ValidationError("player_id is required");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Database connection unavailable", 500);
    }

    // Fetch player and parent data
    const { data: player, error: playerError } = await supabaseAdmin
      .from("players")
      .select(`
        id,
        name,
        team_id,
        parent_id,
        parents (
          id,
          first_name,
          last_name,
          email
        ),
        teams (
          id,
          name
        )
      `)
      .eq("id", playerId)
      .single();

    if (playerError || !player) {
      throw new NotFoundError("Player not found");
    }

    // Get team coach information if available
    let coachName: string | undefined;
    let coachEmail: string | undefined;

    if (player.team_id) {
      const { data: coaches } = await supabaseAdmin
        .from("coaches")
        .select("name, email")
        .eq("team_id", player.team_id)
        .maybeSingle();

      if (coaches) {
        coachName = coaches.name;
        coachEmail = coaches.email;
      }
    }

    // Prepare welcome kit data
    const welcomeKitData = {
      playerName: player.name,
      teamName: (player.teams as any)?.name,
      parentName: player.parents
        ? `${(player.parents as any).first_name} ${(player.parents as any).last_name}`
        : "Parent",
      parentEmail: (player.parents as any)?.email || "",
      season: new Date().getFullYear().toString(),
      coachName,
      coachEmail,
      practiceSchedule: "Practice schedule will be shared by your coach",
      gameSchedule: "Game schedule will be available soon",
    };

    // Generate PDF
    const pdfBytes = await generateWelcomeKitPDF(welcomeKitData);

    devLog("generate-welcome-kit: PDF generated successfully", { playerId });

    // Return PDF as response
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="WCS-Basketball-Welcome-Kit-${playerId}.pdf"`,
      },
    });
  } catch (error) {
    // For PDF generation errors, we need to return a JSON error response
    // since we can't return a PDF error response
    const errorResponse = handleApiError(error, request);
    return errorResponse;
  }
}

