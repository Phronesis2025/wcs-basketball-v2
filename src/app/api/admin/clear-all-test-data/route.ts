import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Database connection unavailable" },
        { status: 500 }
      );
    }

    devLog(
      "clear-all-test-data: Starting deletion of all players and payments"
    );

    // Delete all players (payments will be cascade deleted automatically)
    const { error: deleteError, count } = await supabaseAdmin
      .from("players")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (deleteError) {
      devError("clear-all-test-data: Error deleting players", deleteError);
      return NextResponse.json(
        { error: "Failed to delete test data" },
        { status: 500 }
      );
    }

    devLog("clear-all-test-data: Successfully deleted all players", { count });

    // Payments were automatically deleted due to CASCADE constraint
    return NextResponse.json({
      success: true,
      message: "All test data cleared successfully",
    });
  } catch (e) {
    devError("clear-all-test-data exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
