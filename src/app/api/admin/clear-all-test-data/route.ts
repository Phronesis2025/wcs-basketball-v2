import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Database connection unavailable", 500);
    }

    devLog(
      "clear-all-test-data: Starting deletion of pending_registrations, players, and parents tables"
    );

    // 1) Delete all pending_registrations
    const { error: pendingRegError, count: pendingRegDeleted } = await supabaseAdmin
      .from("pending_registrations")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (pendingRegError) {
      throw new DatabaseError("Failed to delete pending registrations", pendingRegError);
    }

    devLog("clear-all-test-data: Deleted pending_registrations", { count: pendingRegDeleted });

    // 2) Delete all players FIRST (before parents, since players reference parents)
    // Payments will be cascade deleted automatically
    const { error: deleteError, count: playersDeleted } = await supabaseAdmin
      .from("players")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all records

    if (deleteError) {
      throw new DatabaseError("Failed to delete players", deleteError);
    }

    devLog("clear-all-test-data: Deleted players (payments cascade)", { count: playersDeleted });

    // 3) Delete all parents (after players, since players reference parents via foreign key)
    const { error: parentsDeleteErr, count: parentsDeleted } = await supabaseAdmin
      .from("parents")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (parentsDeleteErr) {
      throw new DatabaseError("Failed to delete parents", parentsDeleteErr);
    }

    devLog("clear-all-test-data: Deleted parents", { parentsDeleted });

    return formatSuccessResponse({
      message: "All test data cleared successfully (pending_registrations, parents, and players). Note: auth.users must be deleted manually.",
      details: {
        pendingRegistrationsDeleted: pendingRegDeleted || 0,
        parentsDeleted: parentsDeleted || 0,
        playersDeleted: playersDeleted || 0,
      },
    });
  } catch (e) {
    return handleApiError(e, req);
  }
}
