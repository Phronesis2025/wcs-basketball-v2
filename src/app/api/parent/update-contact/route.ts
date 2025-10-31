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

    // Build update object with only basic contact fields (not detailed checkout fields)
    const updateData: any = {
      phone: parent_phone || null,
      updated_at: new Date().toISOString(),
    };

    // Add parent name fields if provided
    if (parent_first_name !== undefined) {
      updateData.first_name = parent_first_name || null;
    }
    if (parent_last_name !== undefined) {
      updateData.last_name = parent_last_name || null;
    }

    // Only update basic emergency contact if provided (detailed fields come from checkout)
    if (emergency_contact !== undefined) {
      updateData.emergency_contact = emergency_contact || null;
    }
    if (emergency_phone !== undefined) {
      updateData.emergency_phone = emergency_phone || null;
    }

    // Update parent record in parents table
    const { data: updatedParent, error } = await supabaseAdmin
      .from("parents")
      .update(updateData)
      .eq("email", email)
      .select()
      .single();

    if (error) {
      devError("Error updating contact info:", error);
      return NextResponse.json(
        { error: "Failed to update contact information" },
        { status: 500 }
      );
    }

    devLog("Contact info updated for parent:", email);

    return NextResponse.json({
      success: true,
      parent: updatedParent,
    });
  } catch (error) {
    devError("Update contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
