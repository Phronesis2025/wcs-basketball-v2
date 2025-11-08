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

    // Check if message has replies (for non-admin users)
    if (!isAdmin && isAuthor) {
      const { count, error: replyError } = await (adminClient ?? supabase)
        .from("coach_message_replies")
        .select("*", { count: "exact", head: true })
        .eq("message_id", messageId)
        .is("deleted_at", null);

      if (!replyError && count && count > 0) {
        return NextResponse.json(
          { 
            error: `Cannot delete message with ${count} ${count === 1 ? "reply" : "replies"}. Only admins can delete messages that have replies.`,
            replyCount: count 
          },
          { status: 400 }
        );
      }
    }

    // Attempt admin delete first if admin client is available and user is admin
    if (adminClient && isAdmin) {
      const { error: adminErr } = await adminClient
        .from("coach_messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId);

      if (!adminErr) {
        // Admin delete succeeded
        return NextResponse.json({ success: true });
      }

      devError("[API] Admin delete failed:", adminErr);
      // Fall through to check if we can use fallback
    }

    // Fallback: RLS-safe author-owned update via anon client (only for authors)
    if (isAuthor && !isAdmin) {
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

    // If we reach here and isAdmin is true but admin client failed or doesn't exist
    if (isAdmin) {
      if (!adminClient) {
        return NextResponse.json(
          { error: "Admin delete failed - admin client not configured" },
          { status: 500 }
        );
      }
      // Admin client exists but delete failed
      return NextResponse.json(
        { error: "Admin delete failed - please try again" },
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
