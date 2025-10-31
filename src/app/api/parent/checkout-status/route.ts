import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const parentId = request.nextUrl.searchParams.get("parent_id");
    if (!parentId) {
      return NextResponse.json({ error: "parent_id required" }, { status: 400 });
    }

    const { data: parent, error } = await supabaseAdmin
      .from("parents")
      .select("checkout_completed")
      .eq("id", parentId)
      .single();

    if (error) {
      devError("Error fetching parent checkout status:", error);
      return NextResponse.json(
        { error: "Failed to fetch checkout status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_completed: parent?.checkout_completed || false,
    });
  } catch (error) {
    devError("Parent checkout status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

