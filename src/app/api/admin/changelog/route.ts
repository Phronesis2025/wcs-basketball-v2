import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";
import { ValidationError, ApiError, AuthenticationError, AuthorizationError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

async function isAdmin(userId?: string | null): Promise<boolean> {
  if (!userId || !supabaseAdmin) return false;
  const { data } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return data?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const userId = request.headers.get("x-user-id");
    const admin = await isAdmin(userId);

    const query = supabaseAdmin
      .from("changelog")
      .select("*, users:created_by(email)")
      .order("release_date", { ascending: false })
      .order("version", { ascending: false });

    const { data, error } = admin
      ? await query
      : await query.eq("is_published", true);

    if (error) {
      throw new DatabaseError("Failed to fetch changelog", error);
    }

    return formatSuccessResponse(data || []);
  } catch (e) {
    return handleApiError(e, request);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server misconfigured", 500);
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      throw new AuthorizationError("Forbidden");
    }

    const body = await request.json();
    const { version, release_date, category, description, is_published = true } = body || {};
    if (!version || !release_date || !category || !description) {
      throw new ValidationError("Missing required fields: version, release_date, category, description");
    }

    const { data, error } = await supabaseAdmin
      .from("changelog")
      .insert([
        {
          version,
          release_date,
          category,
          description,
          is_published,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to create changelog entry", error);
    }

    return formatSuccessResponse(data);
  } catch (e) {
    return handleApiError(e, request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server misconfigured", 500);
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      throw new AuthorizationError("Forbidden");
    }

    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) {
      throw new ValidationError("Missing id");
    }

    const { data, error } = await supabaseAdmin
      .from("changelog")
      .update({ ...updates })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to update changelog entry", error);
    }

    return formatSuccessResponse(data);
  } catch (e) {
    return handleApiError(e, request);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      throw new ApiError("Server misconfigured", 500);
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      throw new AuthorizationError("Forbidden");
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      throw new ValidationError("Missing id");
    }

    // Soft delete by unpublishing
    const { error } = await supabaseAdmin
      .from("changelog")
      .update({ is_published: false })
      .eq("id", id);

    if (error) {
      throw new DatabaseError("Failed to delete changelog entry", error);
    }

    return formatSuccessResponse({ success: true });
  } catch (e) {
    return handleApiError(e, request);
  }
}


