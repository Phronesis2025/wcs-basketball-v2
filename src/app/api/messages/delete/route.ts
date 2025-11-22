import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, AuthorizationError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { messageId, requesterId, isAdmin } = await request.json();
    if (!messageId) {
      throw new ValidationError("messageId is required");
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
      throw new NotFoundError("Message not found");
    }

    if (existing?.deleted_at) {
      return formatSuccessResponse({ success: true });
    }

    // Authorization: allow author or admin
    const isAuthor = requesterId && existing?.author_id === requesterId;
    if (!isAuthor && !isAdmin) {
      throw new AuthorizationError("Forbidden");
    }

    // Check if message has replies (for non-admin users)
    if (!isAdmin && isAuthor) {
      const { count, error: replyError } = await (adminClient ?? supabase)
        .from("coach_message_replies")
        .select("*", { count: "exact", head: true })
        .eq("message_id", messageId)
        .is("deleted_at", null);

      if (!replyError && count && count > 0) {
        throw new ValidationError(
          `Cannot delete message with ${count} ${count === 1 ? "reply" : "replies"}. Only admins can delete messages that have replies.`
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
        return formatSuccessResponse({ success: true });
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
        return formatSuccessResponse({ success: true });
      }

      throw new DatabaseError("Failed to delete message", rlsErr);
    }

    // If we reach here and isAdmin is true but admin client failed or doesn't exist
    if (isAdmin) {
      if (!adminClient) {
        throw new ApiError("Admin delete failed - admin client not configured", 500);
      }
      // Admin client exists but delete failed
      throw new ApiError("Admin delete failed - please try again", 500);
    }

    throw new AuthorizationError("Unauthorized");
  } catch (err) {
    return handleApiError(err, request);
  }
}
