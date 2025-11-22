import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError, sanitizeInput } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, AuthorizationError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { drillData, userId } = await request.json();
    if (!drillData || !userId) {
      throw new ValidationError("Missing fields");
    }
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const payload = {
      team_id: drillData.team_id || null,
      title: sanitizeInput(String(drillData.title || "").trim()),
      skills: Array.isArray(drillData.skills) ? drillData.skills : [],
      equipment: Array.isArray(drillData.equipment) ? drillData.equipment : [],
      time: sanitizeInput(String(drillData.time || "").trim()),
      instructions: sanitizeInput(String(drillData.instructions || "").trim()),
      additional_info: drillData.additional_info
        ? sanitizeInput(String(drillData.additional_info).trim())
        : null,
      benefits: sanitizeInput(String(drillData.benefits || "").trim()),
      difficulty: sanitizeInput(String(drillData.difficulty || "").trim()),
      category: sanitizeInput(String(drillData.category || "").trim()),
      week_number: 1,
      image_url: drillData.image_url || null,
      youtube_url: drillData.youtube_url
        ? sanitizeInput(String(drillData.youtube_url).trim())
        : null,
      is_global: drillData.is_global || false,
      created_by: userId,
    };

    devLog("[API] Creating drill", {
      title: payload.title,
      team: payload.team_id,
    });
    const { data, error } = await supabaseAdmin
      .from("practice_drills")
      .insert(payload)
      .select()
      .single();
    if (error) {
      throw new DatabaseError("Failed to create practice drill", error);
    }
    return formatSuccessResponse(data);
  } catch (err) {
    return handleApiError(err, request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { drillId, drillData, userId, isAdmin } = await request.json();
    if (!drillId || !drillData || !userId) {
      throw new ValidationError("Missing fields");
    }
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    // Fetch existing to authorize
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("practice_drills")
      .select("created_by")
      .eq("id", drillId)
      .single();
    if (fetchErr) {
      throw new NotFoundError("Drill not found");
    }
    const isAuthor = existing?.created_by === userId;
    if (!isAuthor && !isAdmin) {
      throw new AuthorizationError("Forbidden");
    }

    const updateData: Record<string, unknown> = {};
    if (drillData.title !== undefined)
      updateData.title = sanitizeInput(String(drillData.title).trim());
    if (drillData.skills !== undefined) updateData.skills = drillData.skills;
    if (drillData.equipment !== undefined)
      updateData.equipment = drillData.equipment;
    if (drillData.time !== undefined)
      updateData.time = sanitizeInput(String(drillData.time).trim());
    if (drillData.instructions !== undefined)
      updateData.instructions = sanitizeInput(
        String(drillData.instructions).trim()
      );
    if (drillData.additional_info !== undefined)
      updateData.additional_info = drillData.additional_info
        ? sanitizeInput(String(drillData.additional_info).trim())
        : null;
    if (drillData.benefits !== undefined)
      updateData.benefits = sanitizeInput(String(drillData.benefits).trim());
    if (drillData.difficulty !== undefined)
      updateData.difficulty = sanitizeInput(
        String(drillData.difficulty).trim()
      );
    if (drillData.category !== undefined)
      updateData.category = sanitizeInput(String(drillData.category).trim());
    if (drillData.image_url !== undefined)
      updateData.image_url = drillData.image_url;
    if (drillData.youtube_url !== undefined)
      updateData.youtube_url = drillData.youtube_url
        ? sanitizeInput(String(drillData.youtube_url).trim())
        : null;
    if (drillData.team_id !== undefined)
      updateData.team_id = drillData.team_id || null;
    if (drillData.is_global !== undefined)
      updateData.is_global = drillData.is_global || false;

    const { data, error } = await supabaseAdmin
      .from("practice_drills")
      .update(updateData)
      .eq("id", drillId)
      .select()
      .single();
    if (error) {
      throw new DatabaseError("Failed to update practice drill", error);
    }
    return formatSuccessResponse(data);
  } catch (err) {
    return handleApiError(err, request);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { drillId, userId, isAdmin } = await request.json();
    if (!drillId || !userId) {
      throw new ValidationError("Missing fields");
    }
    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("practice_drills")
      .select("created_by")
      .eq("id", drillId)
      .single();
    if (fetchErr) {
      throw new NotFoundError("Drill not found");
    }
    const isAuthor = existing?.created_by === userId;
    if (!isAuthor && !isAdmin) {
      throw new AuthorizationError("Forbidden");
    }

    const { error } = await supabaseAdmin
      .from("practice_drills")
      .delete()
      .eq("id", drillId);
    if (error) {
      throw new DatabaseError("Failed to delete practice drill", error);
    }
    return formatSuccessResponse({ success: true });
  } catch (err) {
    return handleApiError(err, request);
  }
}
