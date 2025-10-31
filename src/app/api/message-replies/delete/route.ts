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

    let error;
    if (supabaseAdmin) {
      // Attempt to delete with admin client first
      const { error: adminError } = await supabaseAdmin
        .from("coach_message_replies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", replyId);
      error = adminError;
    }

    // If admin client failed or not available, try with regular client (RLS will apply)
    if (error || !supabaseAdmin) {
      devLog(
        "[API] Admin delete failed or not available, falling back to RLS-safe update."
      );
      const { error: rlsError } = await supabase
        .from("coach_message_replies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", replyId)
        .eq("author_id", requesterId); // Ensure RLS is respected for non-admin
      error = rlsError;
    }

    if (error) {
      devError("[API] Delete reply failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    devError("[API] Unexpected error deleting reply:", err);
    return NextResponse.json(
      { error: "Failed to delete reply" },
      { status: 500 }
    );
  }
}
