import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";
import { devError } from "../../../../lib/security";
import { DatabaseError, ApiError, handleApiError, formatSuccessResponse } from "../../../../lib/errorHandler";

export async function GET() {
  try {
    // Fetch all coaches (including inactive) for admin management
    const { data: coaches, error } = await supabaseAdmin!
      .from("coaches")
      .select(
        `
        id, 
        first_name, 
        last_name, 
        email, 
        image_url,
        bio,
        quote,
        is_active,
        users!inner(role)
      `
      )
      .eq("is_deleted", false)
      .order("first_name", { ascending: true });

    // If is_active column doesn't exist, fall back to basic select
    if (error && error.message?.includes("is_active")) {
      const { data: coachesFallback, error: fallbackError } =
        await supabaseAdmin!
          .from("coaches")
          .select(
            `
          id, 
          first_name, 
          last_name, 
          email,
          image_url,
          bio,
          quote,
          users!inner(role)
        `
          )
          .eq("is_deleted", false)
          .order("first_name", { ascending: true });

      if (fallbackError) {
        throw new DatabaseError("Failed to fetch coaches", fallbackError);
      }

      return formatSuccessResponse(coachesFallback || []);
    }

    if (error) {
      throw new DatabaseError("Failed to fetch coaches", error);
    }

    return formatSuccessResponse(coaches || []);
  } catch (error) {
    return handleApiError(error);
  }
}
