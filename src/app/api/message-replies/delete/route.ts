import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { replyId, requesterId, isAdmin } = await request.json();
    if (!replyId) {
      return NextResponse.json(
        { error: "replyId is required" },
        { status: 400 }
      );
    }

    devLog("[API] Deleting reply:", {
      replyId,
      requesterId,
      isAdmin,
      hasAdminClient: !!supabaseAdmin,
    });

    // Fetch reply to check author
    const { data: existing, error: fetchErr } = await (
      supabaseAdmin || supabase
    )
      .from("coach_message_replies")
      .select("author_id, deleted_at")
      .eq("id", replyId)
      .single();

    if (fetchErr) {
      devError("[API] Delete reply fetch failed:", fetchErr);
      return NextResponse.json({ error: "Reply not found" }, { status: 404 });
    }

    if (existing?.deleted_at) {
      return NextResponse.json({ success: true });
    }

    // Authorization: allow author or admin
    const isAuthor = requesterId && existing?.author_id === requesterId;
    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Attempt admin delete first if admin client is available and user is admin
    if (isAdmin) {
      if (!supabaseAdmin) {
        devError("[API] Admin delete attempted but admin client not configured");
        return NextResponse.json(
          { error: "Admin delete failed - admin client not configured" },
          { status: 500 }
        );
      }

      // Use admin client to bypass RLS for admin deletes
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from("coach_message_replies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", replyId)
        .select();
      
      if (!adminError) {
        devLog("[API] Admin delete succeeded:", { replyId, updated: adminData });
        return NextResponse.json({ success: true });
      }
      
      devError("[API] Admin delete failed:", adminError);
      return NextResponse.json(
        { 
          error: "Failed to delete reply", 
          details: adminError.message 
        },
        { status: 500 }
      );
    }

    // Fallback: RLS-safe author-owned update via anon client (only for authors)
    if (isAuthor) {
      const { error: rlsError } = await supabase
        .from("coach_message_replies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", replyId)
        .eq("author_id", requesterId); // Ensure RLS is respected for non-admin
      
      if (!rlsError) {
        return NextResponse.json({ success: true });
      }

      devError("[API] Fallback delete reply failed:", rlsError);
      return NextResponse.json({ error: rlsError.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch (err) {
    devError("[API] Unexpected error deleting reply:", err);
    return NextResponse.json(
      { error: "Failed to delete reply" },
      { status: 500 }
    );
  }
}
