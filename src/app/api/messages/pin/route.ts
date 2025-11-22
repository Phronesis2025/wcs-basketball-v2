import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, NotFoundError, AuthorizationError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const { messageId, requesterId, isAdmin } = await request.json();

    if (!messageId || !requesterId) {
      throw new ValidationError("Missing required fields");
    }

    if (!isAdmin) {
      throw new AuthorizationError("Only admins can pin/unpin messages");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    devLog("[API] Pinning/unpinning message", {
      messageId,
      requesterId,
      isAdmin,
    });

    // Get current pin status
    const { data: currentMessages, error: fetchError } = await supabaseAdmin
      .from("coach_messages")
      .select("is_pinned")
      .eq("id", messageId)
      .is("deleted_at", null);

    if (fetchError) {
      throw new NotFoundError("Message not found");
    }

    if (!currentMessages || currentMessages.length === 0) {
      throw new NotFoundError("Message not found");
    }

    const currentMessage = currentMessages[0];

    // Update pin status
    const { data, error } = await supabaseAdmin
      .from("coach_messages")
      .update({
        is_pinned: !currentMessage.is_pinned,
      })
      .eq("id", messageId)
      .select();

    if (error) {
      throw new DatabaseError("Failed to pin/unpin message", error);
    }

    if (!data || data.length === 0) {
      throw new NotFoundError("Message not found or update failed");
    }

    devLog("[API] Successfully toggled pin status for message:", messageId);
    return formatSuccessResponse(data[0]);
  } catch (err) {
    return handleApiError(err, request);
  }
}
