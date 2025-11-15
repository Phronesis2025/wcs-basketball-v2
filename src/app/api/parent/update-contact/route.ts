import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
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
      throw new ValidationError("Email required");
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
      throw new DatabaseError("Failed to update contact information", error);
    }

    devLog("Contact info updated for parent:", email);

    return formatSuccessResponse({ parent: updatedParent });
  } catch (error) {
    return handleApiError(error, request);
  }
}
