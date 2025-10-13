import { NextResponse } from "next/server";
import { fetchTeams } from "../../../lib/actions";
import { devError } from "../../../lib/security";

export async function GET() {
  try {
    const teams = await fetchTeams();
    return NextResponse.json(teams);
  } catch (error) {
    devError("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
