import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";
import { ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

/**
 * GET /api/basketball-facts
 * Returns random basketball facts from the database
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Fetch all basketball facts
    const { data: facts, error } = await supabaseAdmin
      .from("basketball_facts")
      .select("emoji, fact_text")
      .order("created_at", { ascending: true });

    if (error) {
      throw new DatabaseError("Failed to fetch facts", error);
    }

    if (!facts || facts.length === 0) {
      return formatSuccessResponse({ facts: [] });
    }

    // Shuffle the facts array for random order
    const shuffled = [...facts].sort(() => Math.random() - 0.5);

    return formatSuccessResponse({ facts: shuffled });
  } catch (error) {
    return handleApiError(error);
  }
}

