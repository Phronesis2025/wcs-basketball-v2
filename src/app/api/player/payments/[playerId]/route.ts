import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";

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
      return NextResponse.json({ error: "playerId required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    return NextResponse.json({ payments: data || [] });
  } catch (e) {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}


