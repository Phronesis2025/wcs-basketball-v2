import { NextResponse } from "next/server";
import { fetchAllTeamUpdates } from "../../../lib/actions";
import { devError } from "../../../lib/security";

export async function GET() {
  try {
    const updates = await fetchAllTeamUpdates();
    return NextResponse.json(updates);
  } catch (error) {
    devError("Error fetching team updates:", error);
    return NextResponse.json(
      { error: "Failed to fetch team updates" },
      { status: 500 }
    );
  }
}
