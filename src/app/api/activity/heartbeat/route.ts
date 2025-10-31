import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";

// Update the user's last_active_at timestamp. This captures site activity beyond just logins.
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // Fetch current last_active_at
    let lastActive: string | null = null;
    const { data: ua, error: readErr } = await supabaseAdmin
      .from("users")
      .select("last_active_at")
      .eq("id", userId)
      .limit(1);
    if (!readErr && ua && Array.isArray(ua) && ua[0]) {
      lastActive = ua[0].last_active_at ?? null;
    }

    // Throttle: update only if more than 5 minutes since last activity
    let shouldUpdate = true;
    if (lastActive) {
      const last = new Date(lastActive);
      const diffMs = now.getTime() - last.getTime();
      if (diffMs < 5 * 60 * 1000) {
        shouldUpdate = false;
      }
    }

    if (shouldUpdate) {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ last_active_at: nowIso })
        .eq("id", userId);

      if (error) {
        devError("heartbeat: failed to update last_active_at", error);
        return NextResponse.json({ error: "Failed to record activity" }, { status: 500 });
      }
      devLog("heartbeat updated last_active_at", { userId, nowIso });
      return NextResponse.json({ success: true, last_active_at: nowIso, updated: true });
    }

    return NextResponse.json({ success: true, last_active_at: lastActive, updated: false });
  } catch (e) {
    devError("heartbeat unexpected error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


