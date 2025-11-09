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
      "clear-all-test-data: Starting deletion of pending_registrations, parents, and players tables"
    );

    // 1) Delete all pending_registrations
    const { error: pendingRegError, count: pendingRegDeleted } = await supabaseAdmin
      .from("pending_registrations")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (pendingRegError) {
      devError("clear-all-test-data: Error deleting pending_registrations", pendingRegError);
      return NextResponse.json(
        { error: "Failed to delete pending registrations" },
        { status: 500 }
      );
    }

    devLog("clear-all-test-data: Deleted pending_registrations", { count: pendingRegDeleted });

    // 2) Delete all parents
    const { error: parentsDeleteErr, count: parentsDeleted } = await supabaseAdmin
      .from("parents")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (parentsDeleteErr) {
      devError("clear-all-test-data: Error deleting parents", parentsDeleteErr);
      return NextResponse.json(
        { error: "Failed to delete parents" },
        { status: 500 }
      );
    }

    devLog("clear-all-test-data: Deleted parents", { parentsDeleted });

    // 3) Delete all players (payments will be cascade deleted automatically)
    const { error: deleteError, count: playersDeleted } = await supabaseAdmin
      .from("players")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (deleteError) {
      devError("clear-all-test-data: Error deleting players", deleteError);
      return NextResponse.json(
        { error: "Failed to delete players" },
        { status: 500 }
      );
    }

    devLog("clear-all-test-data: Deleted players (payments cascade)", { count: playersDeleted });

    return NextResponse.json({
      success: true,
      message: "All test data cleared successfully (pending_registrations, parents, and players). Note: auth.users must be deleted manually.",
      details: {
        pendingRegistrationsDeleted: pendingRegDeleted || 0,
        parentsDeleted: parentsDeleted || 0,
        playersDeleted: playersDeleted || 0,
      },
    });
  } catch (e) {
    devError("clear-all-test-data exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
