import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

/**
 * GET /api/basketball-facts
 * Returns random basketball facts from the database
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Fetch all basketball facts
    const { data: facts, error } = await supabaseAdmin
      .from("basketball_facts")
      .select("emoji, fact_text")
      .order("created_at", { ascending: true });

    if (error) {
      devError("Failed to fetch basketball facts", error);
      return NextResponse.json(
        { error: "Failed to fetch facts" },
        { status: 500 }
      );
    }

    if (!facts || facts.length === 0) {
      return NextResponse.json({ facts: [] });
    }

    // Shuffle the facts array for random order
    const shuffled = [...facts].sort(() => Math.random() - 0.5);

    return NextResponse.json({ facts: shuffled });
  } catch (error) {
    devError("Error in basketball-facts API", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

