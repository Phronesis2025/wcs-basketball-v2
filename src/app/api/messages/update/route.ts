import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { messageId, content, requesterId, isAdmin } = await request.json();
    
    if (!messageId || !content) {
      return NextResponse.json(
        { error: "messageId and content are required" },
        { status: 400 }
      );
    }

    devLog("[API] Updating message:", {
      messageId,
      contentLength: content.length,
      requesterId,
      isAdmin,
      hasAdminClient: !!supabaseAdmin,
    });

    // Sanitize content
    const sanitizedContent = sanitizeInput(content.trim());

    if (sanitizedContent.length > 1000) {
      return NextResponse.json(
        { error: "Message content cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    // Fetch message to check author and permissions
    const adminClient = supabaseAdmin;
    const { data: existing, error: fetchErr } = await (adminClient ?? supabase)
      .from("coach_messages")
      .select("author_id, deleted_at")
      .eq("id", messageId)
      .single();

    if (fetchErr) {
      devError("[API] Update fetch failed:", fetchErr);
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (existing?.deleted_at) {
      return NextResponse.json({ error: "Message has been deleted" }, { status: 404 });
    }

    // Authorization: allow author or admin
    const isAuthor = requesterId && existing?.author_id === requesterId;
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Attempt admin update first if admin client exists
    if (adminClient) {
      const { data, error: adminErr } = await adminClient
        .from("coach_messages")
        .update({ 
          content: sanitizedContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", messageId)
        .select()
        .single();

      if (!adminErr && data) {
        return NextResponse.json({ success: true, data });
      }

      devError(
        "[API] Admin update failed, will try RLS-safe fallback:",
        adminErr
      );
      // Continue to fallback path below
    }

    // Fallback: RLS-safe author-owned update via anon client
    if (isAuthor) {
      const { data, error: rlsErr } = await supabase
        .from("coach_messages")
        .update({ 
          content: sanitizedContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", messageId)
        .eq("author_id", requesterId)
        .select()
        .single();

      if (!rlsErr && data) {
        return NextResponse.json({ success: true, data });
      }

      devError("[API] RLS fallback update failed:", rlsErr);
      return NextResponse.json(
        { error: rlsErr?.message || "Update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Update failed: no valid path" },
      { status: 500 }
    );
  } catch (err: unknown) {
    devError("[API] Update message error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update message";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

