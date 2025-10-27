import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      email,
      parent_first_name,
      parent_last_name,
      parent_phone,
      emergency_contact,
      emergency_phone,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    devLog("Updating contact info for parent:", email);

    // Build update object with only provided fields
    const updateData: any = {
      parent_phone: parent_phone || null,
      emergency_contact: emergency_contact || null,
      emergency_phone: emergency_phone || null,
    };

    // Add parent name fields if provided
    if (parent_first_name !== undefined) {
      updateData.parent_first_name = parent_first_name || null;
    }
    if (parent_last_name !== undefined) {
      updateData.parent_last_name = parent_last_name || null;
    }

    // Update parent_name field with full name
    if (parent_first_name && parent_last_name) {
      updateData.parent_name =
        `${parent_first_name} ${parent_last_name}`.trim();
    }

    // Update all player records with this parent_email
    const { data, error } = await supabaseAdmin
      .from("players")
      .update(updateData)
      .eq("parent_email", email)
      .eq("is_deleted", false)
      .select();

    if (error) {
      devError("Error updating contact info:", error);
      return NextResponse.json(
        { error: "Failed to update contact information" },
        { status: 500 }
      );
    }

    devLog("Contact info updated for", data?.length || 0, "player(s)");

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
    });
  } catch (error) {
    devError("Update contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
