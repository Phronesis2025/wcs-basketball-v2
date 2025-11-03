import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { messageId, requesterId, isAdmin } = await request.json();
    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    devLog("[API] Deleting message (admin):", {
      messageId,
      requesterId,
      isAdmin,
      hasAdminClient: !!supabaseAdmin,
    });

    // Fetch message to check author
    // Prefer admin client when available; we'll fall back to anon client if needed
    const adminClient = supabaseAdmin;

    const { data: existing, error: fetchErr } = await (adminClient ?? supabase)
      .from("coach_messages")
      .select("author_id, deleted_at")
      .eq("id", messageId)
      .single();

    if (fetchErr) {
      devError("[API] Delete fetch failed:", fetchErr);
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (existing?.deleted_at) {
      return NextResponse.json({ success: true });
    }

    // Authorization: allow author or admin
    const isAuthor = requesterId && existing?.author_id === requesterId;
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Attempt admin update first if admin client exists
    if (adminClient) {
      const { error: adminErr } = await adminClient
        .from("coach_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId);

      if (!adminErr) {
        return NextResponse.json({ success: true });
      }

      devError(
        "[API] Admin delete failed, will try RLS-safe fallback:",
        adminErr
      );
      // Continue to fallback path below
    }

    // Fallback: RLS-safe author-owned update via anon client (only for authors)
    if (isAuthor) {
      const { error: rlsErr } = await supabase
        .from("coach_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId)
        .eq("author_id", requesterId);

      if (!rlsErr) {
        return NextResponse.json({ success: true });
      }

      devError("[API] Fallback delete message failed:", rlsErr);
      return NextResponse.json({ error: rlsErr.message }, { status: 500 });
    }

    // If we reach here and isAdmin is true but admin client failed, return error
    if (isAdmin) {
      return NextResponse.json(
        { error: "Admin delete failed - admin client may not be configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch (err) {
    devError("[API] Unexpected error deleting message:", err);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
