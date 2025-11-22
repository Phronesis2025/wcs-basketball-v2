import { NextResponse } from "next/server";
import { fetchAllTeamUpdates } from "../../../lib/actions";
import { devError } from "../../../lib/security";
import { ApiError, handleApiError, formatSuccessResponse } from "../../../lib/errorHandler";

export async function GET() {
  try {
    const updates = await fetchAllTeamUpdates();
    return formatSuccessResponse(updates);
  } catch (error) {
    return handleApiError(error);
  }
}
