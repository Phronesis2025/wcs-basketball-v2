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
      "clear-all-test-data: Starting deletion of players, payments, parents, and related auth.users"
    );

    // 1) Delete all players (payments will be cascade deleted automatically)
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

    devLog("clear-all-test-data: Deleted players (payments cascade)", { count });

    // 2) Get all parent user_ids before deleting parents
    const { data: parentRows, error: parentsFetchErr } = await supabaseAdmin
      .from("parents")
      .select("id, user_id, email");

    if (parentsFetchErr) {
      devError("clear-all-test-data: Error fetching parents prior to delete", parentsFetchErr);
      return NextResponse.json(
        { error: "Failed to fetch parents for deletion" },
        { status: 500 }
      );
    }

    const parentUserIds = (parentRows || [])
      .map((p: any) => p.user_id)
      .filter((v: string | null) => !!v) as string[];
    const uniqueUserIds = Array.from(new Set(parentUserIds));

    // 3) Delete all parents
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

    // 4) Delete corresponding auth.users (if any)
    let authDeleted = 0;
    if (uniqueUserIds.length > 0) {
      for (const uid of uniqueUserIds) {
        try {
          // Requires service role key
          const resp = await (supabaseAdmin as any).auth.admin.deleteUser(uid);
          if ((resp as any)?.error) {
            devError("clear-all-test-data: auth.admin.deleteUser error", { uid, error: (resp as any).error });
          } else {
            authDeleted += 1;
          }
        } catch (e) {
          devError("clear-all-test-data: Exception deleting auth user", { uid, e });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "All test data cleared successfully",
      details: {
        playersDeleted: count || 0,
        parentsDeleted: parentsDeleted || 0,
        authUsersDeleted: authDeleted,
      },
    });
  } catch (e) {
    devError("clear-all-test-data exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
