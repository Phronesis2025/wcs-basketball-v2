import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sendEmail } from "@/lib/email";

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

    // Approve + assign without referencing non-existent columns
    const { data: updated, error } = await supabaseAdmin!
      .from("players")
      .update({ team_id, status: "approved" })
      .eq("id", player_id)
      .select("id, parent_email") // <- only what we need
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
      devLog("approve-player: sending approval email", {
        to: updated.parent_email,
      });
      await sendEmail(
        updated.parent_email,
        "WCS Approval: Complete your payment",
        `<p>Your player has been assigned to a team!</p>
         <p>Please complete payment here:</p>
         <p><a href="${payLink}">${payLink}</a></p>`
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
