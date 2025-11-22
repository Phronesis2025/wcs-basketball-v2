import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { sanitizeInput } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, AuthorizationError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { messageId, content, requesterId, isAdmin } = await request.json();
    
    if (!messageId || !content) {
      throw new ValidationError("messageId and content are required");
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
      throw new ValidationError("Message content cannot exceed 1000 characters", "content");
    }

    if (sanitizedContent.length === 0) {
      throw new ValidationError("Message content cannot be empty", "content");
    }

    // Fetch message to check author and permissions
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
      throw new NotFoundError("Message has been deleted");
    }

    // Authorization: allow author or admin
    const isAuthor = requesterId && existing?.author_id === requesterId;
    if (!isAuthor && !isAdmin) {
      throw new AuthorizationError("Forbidden");
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
        return formatSuccessResponse(data);
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
        return formatSuccessResponse(data);
      }

      throw new DatabaseError("Failed to update message", rlsErr);
    }

    throw new ApiError("Update failed: no valid path", 500);
  } catch (err: unknown) {
    return handleApiError(err, request);
  }
}

