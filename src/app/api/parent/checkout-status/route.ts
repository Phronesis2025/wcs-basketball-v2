import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const parentId = request.nextUrl.searchParams.get("parent_id");
    if (!parentId) {
      throw new ValidationError("parent_id required");
    }

    const { data: parent, error } = await supabaseAdmin
      .from("parents")
      .select("checkout_completed")
      .eq("id", parentId)
      .single();

    if (error) {
      throw new DatabaseError("Failed to fetch checkout status", error);
    }

    return formatSuccessResponse({
      checkout_completed: parent?.checkout_completed || false,
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

