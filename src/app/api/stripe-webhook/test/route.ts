import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export const dynamic = "force-dynamic";

function splitFullName(fullName?: string | null) {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  const firstName = parts.shift()!;
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

/**
 * Test endpoint to verify webhook setup and payment lookup
 * GET /api/stripe-webhook/test?session_id=cs_test_xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id query parameter required" },
        { status: 400 }
      );
    }

    devLog("Test webhook lookup", { sessionId });

    // Try to find the payment
    const { data: paymentRow, error: payFetchErr } = await supabaseAdmin!
      .from("payments")
      .select("id, player_id, payment_type, status, amount")
      .eq("stripe_payment_id", sessionId)
      .maybeSingle();

    if (payFetchErr) {
      return NextResponse.json(
        {
          error: "Database query failed",
          details: payFetchErr,
        },
        { status: 500 }
      );
    }

    if (!paymentRow) {
      return NextResponse.json(
        {
          found: false,
          message: "No payment found with this session ID",
          sessionId,
        },
        { status: 404 }
      );
    }

    // Get player info
    const { data: player, error: playerErr } = await supabaseAdmin!
      .from("players")
      .select(
        "name, parent_email, parent_first_name, parent_last_name, team_id, status, teams(name)"
      )
      .eq("id", paymentRow.player_id)
      .single();

    if (playerErr) {
      return NextResponse.json(
        {
          error: "Player lookup failed",
          details: playerErr,
        },
        { status: 500 }
      );
    }

    const { firstName: playerFirstName, lastName: playerLastName } =
      splitFullName(player.name);

    return NextResponse.json({
      found: true,
      payment: {
        id: paymentRow.id,
        status: paymentRow.status,
        amount: paymentRow.amount,
        payment_type: paymentRow.payment_type,
        stripe_payment_id: sessionId,
      },
      player: {
        id: paymentRow.player_id,
        name: player.name || `${playerFirstName} ${playerLastName}`.trim(),
        parent_email: player.parent_email,
        parent_first_name: player.parent_first_name,
        parent_last_name: player.parent_last_name,
        team_name: player.teams?.name || "Not assigned",
        status: player.status,
      },
      message: "Payment record found - webhook should be able to process this",
    });
  } catch (e: any) {
    devError("Test endpoint error", e);
    return NextResponse.json(
      { error: "Test failed", details: e.message },
      { status: 500 }
    );
  }
}

