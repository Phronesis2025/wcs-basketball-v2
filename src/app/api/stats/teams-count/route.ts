import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";

export async function GET() {
  try {
    // Get count of active teams
    const { count, error } = await supabaseAdmin
      .from("teams")
      .select("*", { count: "exact", head: true })
      .eq("is_deleted", false)
      .eq("is_active", true);

    if (error) {
      devError("Error fetching team count:", error);
      return NextResponse.json(
        { error: "Failed to fetch team count", details: error.message },
        { status: 500 }
      );
    }

    const teamCount = count || 0;
    devLog(`Team count: ${teamCount}`);

    return NextResponse.json(
      { count: teamCount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    devError("Error fetching team count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

