import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

export async function GET(_request: NextRequest) {
  try {
    // Try to fetch coaches with is_active column and role information first
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
        devError("Failed to fetch coaches:", fallbackError);
        return NextResponse.json(
          { error: "Failed to fetch coaches" },
          { status: 500 }
        );
      }

      // Add default is_active: true to all coaches
      coaches =
        coachesFallback?.map((coach) => ({ ...coach, is_active: true })) || [];
    } else if (error) {
      devError("Failed to fetch coaches:", error);
      return NextResponse.json(
        { error: "Failed to fetch coaches" },
        { status: 500 }
      );
    }

    // Transform the data to include role information
    const transformedCoaches = (coaches || []).map((coach: any) => ({
      id: coach.id,
      first_name: coach.first_name,
      last_name: coach.last_name,
      email: coach.email,
      is_active: coach.is_active,
      role: coach.users?.role || "coach",
    }));

    return NextResponse.json(transformedCoaches);
  } catch (error) {
    devError("Coaches GET API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch coaches",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
