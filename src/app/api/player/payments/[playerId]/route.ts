import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ playerId: string }> } | { params: { playerId: string } }
) {
  try {
    // Next.js 15 may provide params as a Promise in Route Handlers
    const resolved = (context.params as any)?.then
      ? await (context.params as Promise<{ playerId: string }>)
      : (context.params as { playerId: string });
    const playerId = resolved?.playerId;
    if (!playerId) {
      throw new ValidationError("playerId required");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError("Failed to fetch payments", error);
    }

    return formatSuccessResponse({ payments: data || [] });
  } catch (e) {
    return handleApiError(e, _req);
  }
}


