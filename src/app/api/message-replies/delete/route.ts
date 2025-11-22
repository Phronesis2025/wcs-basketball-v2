import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, AuthorizationError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { replyId, requesterId, isAdmin } = await request.json();
    if (!replyId) {
      throw new ValidationError("replyId is required");
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
      throw new NotFoundError("Reply not found");
    }

    if (existing?.deleted_at) {
      return formatSuccessResponse({ success: true });
    }

    // Authorization: allow author or admin
    const isAuthor = requesterId && existing?.author_id === requesterId;
    if (!isAuthor && !isAdmin) {
      throw new AuthorizationError("Forbidden");
    }

    // Attempt admin delete first if admin client is available and user is admin
    if (isAdmin) {
      if (!supabaseAdmin) {
        throw new ApiError("Admin delete failed - admin client not configured", 500);
      }

      // Use admin client to bypass RLS for admin deletes
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from("coach_message_replies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", replyId)
        .select();
      
      if (!adminError) {
        devLog("[API] Admin delete succeeded:", { replyId, updated: adminData });
        return formatSuccessResponse({ success: true });
      }
      
      throw new DatabaseError("Failed to delete reply", adminError);
    }

    // Fallback: RLS-safe author-owned update via anon client (only for authors)
    if (isAuthor) {
      const { error: rlsError } = await supabase
        .from("coach_message_replies")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", replyId)
        .eq("author_id", requesterId); // Ensure RLS is respected for non-admin
      
      if (!rlsError) {
        return formatSuccessResponse({ success: true });
      }

      throw new DatabaseError("Failed to delete reply", rlsError);
    }

    throw new AuthorizationError("Unauthorized");
  } catch (err) {
    return handleApiError(err, request);
  }
}
