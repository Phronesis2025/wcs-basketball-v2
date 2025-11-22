import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";
import { AuthenticationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

// Type for Supabase PostgREST error
interface PostgRESTError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

// Update the user's last_active_at timestamp. This captures site activity beyond just logins.
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError("Authentication required");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
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
    // If column is missing, avoid throwing 500; return non-fatal success
    if (readErr && (readErr as PostgRESTError)?.code === "PGRST204") {
      devError("heartbeat: last_active_at column missing on users", readErr);
      return formatSuccessResponse({ updated: false, reason: "column_missing" });
    }
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
        // Handle missing column gracefully
        if ((error as PostgRESTError)?.code === "PGRST204") {
          devError("heartbeat: last_active_at column missing on users (update)", error);
          return formatSuccessResponse({ updated: false, reason: "column_missing" });
        }
        throw new DatabaseError("Failed to record activity", error);
      }
      devLog("heartbeat updated last_active_at", { userId, nowIso });
      return formatSuccessResponse({ last_active_at: nowIso, updated: true });
    }

    return formatSuccessResponse({ last_active_at: lastActive, updated: false });
  } catch (e) {
    return handleApiError(e, request);
  }
}


