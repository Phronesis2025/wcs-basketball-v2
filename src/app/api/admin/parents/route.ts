import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    devLog("Fetching all parents summary");

    // Get all unique parent emails and their children
    const { data: players, error: playersError } = await supabaseAdmin
      .from("players")
      .select("parent_email")
      .eq("is_deleted", false)
      .not("parent_email", "is", null);

    if (playersError) {
      devError("Error fetching players:", playersError);
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 }
      );
    }

    if (!players || players.length === 0) {
      return NextResponse.json([]);
    }

    // Get unique parent emails
    const uniqueEmails = Array.from(
      new Set(players.map((p: any) => p.parent_email))
    );

    // For each parent, get their children and payment summary
    const parentsSummary = await Promise.all(
      uniqueEmails.map(async (email: string) => {
        // Get children for this parent
        const { data: children } = await supabaseAdmin
          .from("players")
          .select("id")
          .eq("parent_email", email)
          .eq("is_deleted", false);

        const childrenIds = (children || []).map((c: any) => c.id);

        // Get payments for these children
        let totalPaid = 0;
        let hasPending = false;

        if (childrenIds.length > 0) {
          const { data: payments } = await supabaseAdmin
            .from("payments")
            .select("amount, status")
            .in("player_id", childrenIds);

          totalPaid = (payments || [])
            .filter((p: any) => p.status === "paid")
            .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

          hasPending = (payments || []).some(
            (p: any) => p.status === "pending"
          );
        }

        return {
          email,
          children_count: childrenIds.length,
          total_paid: totalPaid,
          has_pending_payments: hasPending,
        };
      })
    );

    return NextResponse.json(parentsSummary);
  } catch (error) {
    devError("Admin parents API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
