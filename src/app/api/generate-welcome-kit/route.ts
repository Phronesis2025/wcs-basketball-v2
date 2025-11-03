import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { generateWelcomeKitPDF } from "@/lib/pdf/welcomeKit";
import { devLog, devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = searchParams.get("player_id");

    if (!playerId) {
      return NextResponse.json(
        { error: "player_id is required" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
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
      devError("generate-welcome-kit: Player fetch error", playerError);
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
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
    devError("generate-welcome-kit: Exception", error);
    return NextResponse.json(
      { error: "Failed to generate welcome kit" },
      { status: 500 }
    );
  }
}

