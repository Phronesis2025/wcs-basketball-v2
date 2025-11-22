import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";
import { ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

// Returns summarized payment metrics based on the payments table, which is
// synchronized via Stripe webhooks. Values represent what actually cleared.
export async function GET(_req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Sum of successful payments (membership fees) and capture unique player_ids
    const { data: paidRows, error: paidErr } = await supabaseAdmin
      .from("payments")
      .select("amount, status, player_id")
      .eq("status", "paid");

    if (paidErr) {
      throw new DatabaseError("Failed to fetch paid payments", paidErr);
    }

    const membershipFees = (paidRows || []).reduce(
      (sum: number, r: any) => sum + (Number(r.amount) || 0),
      0
    );
    const uniquePaidPlayerIds = new Set((paidRows || []).map((r: any) => r.player_id));

    // Pending dues = annual fee for players not yet approved
    const { data: pendingPlayers, error: pendingPlayersErr } = await supabaseAdmin
      .from("players")
      .select("id, status")
      .eq("is_deleted", false)
      .eq("status", "pending");

    if (pendingPlayersErr) {
      throw new DatabaseError("Failed to fetch pending players", pendingPlayersErr);
    }

    // From the pending players list, exclude those who have already PAID
    const pendingIds = (pendingPlayers || []).map((p: any) => p.id);
    let paidPendingCount = 0;
    if (pendingIds.length > 0) {
      const { data: paidForPending, error: paidForPendingErr } = await supabaseAdmin
        .from("payments")
        .select("player_id, status")
        .in("player_id", pendingIds)
        .eq("status", "paid");

      if (paidForPendingErr) {
        devError("metrics: failed to fetch paid payments for pending players", paidForPendingErr);
      } else {
        const uniquePaidIds = new Set((paidForPending || []).map((r: any) => r.player_id));
        paidPendingCount = uniquePaidIds.size;
      }
    }

    // Annual fee (fallback to $360 if no env specified)
    const annualFeeUsd = Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360);
    const pendingCountNet = Math.max(0, (pendingPlayers?.length || 0) - paidPendingCount);
    const pendingDues = pendingCountNet * annualFeeUsd;

    // Paid and Pending counts for the registration card
    const paidPlayersCount = uniquePaidPlayerIds.size;
    const pendingPlayersCount = pendingCountNet; // pending & not paid yet

    // Placeholders to be implemented later
    const tournamentFees = 0;
    const merch = 0;
    const totalRevenue = membershipFees + tournamentFees + merch;

    devLog("payments metrics", {
      membershipFees,
      tournamentFees,
      merch,
      totalRevenue,
      pendingDues,
    });

    return formatSuccessResponse({
      membershipFees,
      tournamentFees,
      merch,
      totalRevenue,
      pendingDues,
      paidPlayersCount,
      pendingPlayersCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


