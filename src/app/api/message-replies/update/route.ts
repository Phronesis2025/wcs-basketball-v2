import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { replyId, content, requesterId, isAdmin } = await request.json();
    
    if (!replyId || !content) {
      return NextResponse.json(
        { error: "replyId and content are required" },
        { status: 400 }
      );
    }

    devLog("[API] Updating reply:", {
      replyId,
      contentLength: content.length,
      requesterId,
      isAdmin,
      hasAdminClient: !!supabaseAdmin,
    });

    // Sanitize content
    const sanitizedContent = sanitizeInput(content.trim());

    if (sanitizedContent.length > 500) {
      return NextResponse.json(
        { error: "Reply content cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { error: "Reply content cannot be empty" },
        { status: 400 }
      );
    }

    // Fetch reply to check author and permissions
    const adminClient = supabaseAdmin;
    const { data: existing, error: fetchErr } = await (adminClient ?? supabase)
      .from("coach_message_replies")
      .select("author_id, deleted_at")
      .eq("id", replyId)
      .single();

    if (fetchErr) {
      devError("[API] Update reply fetch failed:", fetchErr);
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    if (existing?.deleted_at) {
      return NextResponse.json({ error: "Reply has been deleted" }, { status: 404 });
    }

    // Authorization: allow author or admin
    const isAuthor = requesterId && existing?.author_id === requesterId;
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Attempt admin update first if admin client exists
    if (adminClient) {
      const { data, error: adminErr } = await adminClient
        .from("coach_message_replies")
        .update({ 
          content: sanitizedContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", replyId)
        .select()
        .single();

      if (!adminErr && data) {
        return NextResponse.json({ success: true, data });
      }

      devError(
        "[API] Admin reply update failed, will try RLS-safe fallback:",
        adminErr
      );
      // Continue to fallback path below
    }

    // Fallback: RLS-safe author-owned update via anon client
    if (isAuthor) {
      const { data, error: rlsErr } = await supabase
        .from("coach_message_replies")
        .update({ 
          content: sanitizedContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", replyId)
        .eq("author_id", requesterId)
        .select()
        .single();

      if (!rlsErr && data) {
        return NextResponse.json({ success: true, data });
      }

      devError("[API] RLS fallback reply update failed:", rlsErr);
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
    devError("[API] Update reply error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update reply";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

