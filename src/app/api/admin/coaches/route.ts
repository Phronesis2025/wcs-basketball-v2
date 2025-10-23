import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseClient";
import { devError } from "../../../../lib/security";

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
          users!inner(role)
        `
          )
          .eq("is_deleted", false)
          .order("first_name", { ascending: true });

      if (fallbackError) {
        devError("Error fetching coaches:", fallbackError);
        return NextResponse.json(
          { error: "Failed to fetch coaches" },
          { status: 500 }
        );
      }

      return NextResponse.json(coachesFallback || []);
    }

    if (error) {
      devError("Error fetching coaches:", error);
      return NextResponse.json(
        { error: "Failed to fetch coaches" },
        { status: 500 }
      );
    }

    return NextResponse.json(coaches || []);
  } catch (error) {
    devError("Unexpected error in /api/admin/coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}
