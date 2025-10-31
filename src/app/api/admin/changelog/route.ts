import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

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
      devError("changelog GET error", error);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e) {
    devError("changelog GET exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { version, release_date, category, description, is_published = true } = body || {};
    if (!version || !release_date || !category || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
      devError("changelog POST error", error);
      return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    devError("changelog POST exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body || {};
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("changelog")
      .update({ ...updates })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      devError("changelog PUT error", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    devError("changelog PUT exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const userId = request.headers.get("x-user-id");
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Soft delete by unpublishing
    const { error } = await supabaseAdmin
      .from("changelog")
      .update({ is_published: false })
      .eq("id", id);

    if (error) {
      devError("changelog DELETE error", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    devError("changelog DELETE exception", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


