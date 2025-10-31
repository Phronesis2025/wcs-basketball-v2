import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";
import { getPlayerApprovalEmail } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player_id, team_id } = body || {};
    if (!player_id || !team_id) {
      return NextResponse.json(
        { error: "player_id and team_id required" },
        { status: 400 }
      );
    }

    // Approve + assign - get player and team info
    const { data: updated, error } = await supabaseAdmin!
      .from("players")
      .update({ team_id, status: "approved" })
      .eq("id", player_id)
      .select("id, name, parent_email, team_id")
      .single();

    if (error || !updated) {
      devError("approve-player update error", error);
      return NextResponse.json(
        { error: "Failed to approve player" },
        { status: 500 }
      );
    }

    const payLink = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/payment/${
      updated.id
    }`;

    if (!updated.parent_email) {
      devError("approve-player: parent_email missing", {
        player_id: updated.id,
      });
    } else {
      // Get team name for email
      const { data: team } = await supabaseAdmin!
        .from("teams")
        .select("name")
        .eq("id", updated.team_id)
        .single();

      devLog("approve-player: sending approval email", {
        to: updated.parent_email,
      });

      // Use professional email template
      const approvalEmailData = getPlayerApprovalEmail({
        playerName: updated.name,
        teamName: team?.name,
        paymentLink: payLink,
      });

      await sendEmail(
        updated.parent_email,
        approvalEmailData.subject,
        approvalEmailData.html
      );
    }

    devLog("approve-player OK", { player_id });
    return NextResponse.json({
      success: true,
      debug: { sent_to: updated.parent_email, pay_link: payLink },
    });
  } catch (e) {
    devError("approve-player exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
