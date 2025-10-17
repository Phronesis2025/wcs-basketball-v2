// src/lib/messageActions.ts
import { supabase } from "./supabaseClient";
import { CoachMessage, CoachMessageReply } from "../types/supabase";
import { devLog, devError, sanitizeInput } from "./security";

// Get all messages with reply counts
export async function getMessages(): Promise<CoachMessage[]> {
  try {
    devLog("Fetching coach messages");

    const { data, error } = await supabase
      .from("coach_messages")
      .select("*")
      .is("deleted_at", null)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      devError("Error fetching messages:", error);
      // If table doesn't exist, return empty array for now
      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        devLog("Message board tables not yet created. Returning empty array.");
        return [];
      }
      throw new Error(error.message);
    }

    devLog("Successfully fetched messages:", data?.length || 0);
    return data || [];
  } catch (err: unknown) {
    devError("Error in getMessages:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch messages";
    throw new Error(errorMessage);
  }
}

// Get replies for a specific message
export async function getMessageReplies(
  messageId: string
): Promise<CoachMessageReply[]> {
  try {
    devLog("Fetching replies for message:", messageId);

    const { data, error } = await supabase
      .from("coach_message_replies")
      .select("*")
      .eq("message_id", messageId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      devError("Error fetching replies:", error);
      throw new Error(error.message);
    }

    devLog("Successfully fetched replies:", data?.length || 0);
    return data || [];
  } catch (err: unknown) {
    devError("Error in getMessageReplies:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to fetch replies";
    throw new Error(errorMessage);
  }
}

// Create a new message
export async function createMessage(
  content: string,
  authorId: string,
  authorName: string
): Promise<CoachMessage> {
  try {
    devLog("Creating new message:", {
      content: content.substring(0, 50) + "...",
      authorId,
      authorName,
    });

    // Sanitize and validate content
    const sanitizedContent = sanitizeInput(content.trim());

    if (sanitizedContent.length > 1000) {
      throw new Error("Message content cannot exceed 1000 characters");
    }

    if (sanitizedContent.length === 0) {
      throw new Error("Message content cannot be empty");
    }

    // Use server-side API route to bypass RLS
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: sanitizedContent,
        authorId,
        authorName: sanitizeInput(authorName),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      devError("API create message failed:", errorData);
      throw new Error(errorData.error || "Failed to create message");
    }

    const data = await response.json();
    devLog("Successfully created message:", data.id);
    return data;
  } catch (err: unknown) {
    devError("Error in createMessage:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to create message";
    throw new Error(errorMessage);
  }
}

// Create a new reply
export async function createReply(
  messageId: string,
  content: string,
  authorId: string,
  authorName: string
): Promise<CoachMessageReply> {
  try {
    devLog("Creating new reply:", {
      messageId,
      content: content.substring(0, 50) + "...",
      authorId,
      authorName,
    });

    // Sanitize and validate content
    const sanitizedContent = sanitizeInput(content.trim());

    if (sanitizedContent.length > 500) {
      throw new Error("Reply content cannot exceed 500 characters");
    }

    if (sanitizedContent.length === 0) {
      throw new Error("Reply content cannot be empty");
    }

    // Use server-side API route to bypass RLS
    const response = await fetch("/api/message-replies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId,
        content: sanitizedContent,
        authorId,
        authorName: sanitizeInput(authorName),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      devError("API create reply failed:", errorData);
      throw new Error(errorData.error || "Failed to create reply");
    }

    const data = await response.json();
    devLog("Successfully created reply:", data.id);
    return data;
  } catch (err: unknown) {
    devError("Error in createReply:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to create reply";
    throw new Error(errorMessage);
  }
}

// Update a message
export async function updateMessage(
  id: string,
  content: string,
  authorId: string,
  isAdmin: boolean
): Promise<CoachMessage> {
  try {
    devLog("Updating message:", {
      id,
      content: content.substring(0, 50) + "...",
      authorId,
      isAdmin,
    });

    // Sanitize and validate content
    const sanitizedContent = sanitizeInput(content.trim());

    if (sanitizedContent.length > 1000) {
      throw new Error("Message content cannot exceed 1000 characters");
    }

    if (sanitizedContent.length === 0) {
      throw new Error("Message content cannot be empty");
    }

    // Check if user can update this message
    const { data: existingMessage, error: fetchError } = await supabase
      .from("coach_messages")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError) {
      devError("Error fetching message for update:", fetchError);
      throw new Error("Message not found");
    }

    if (!isAdmin && existingMessage.author_id !== authorId) {
      throw new Error("You can only update your own messages");
    }

    const { data, error } = await supabase
      .from("coach_messages")
      .update({
        content: sanitizedContent,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      devError("Error updating message:", error);
      throw new Error(error.message);
    }

    devLog("Successfully updated message:", data.id);
    return data;
  } catch (err: unknown) {
    devError("Error in updateMessage:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update message";
    throw new Error(errorMessage);
  }
}

// Update a reply
export async function updateReply(
  id: string,
  content: string,
  authorId: string,
  isAdmin: boolean
): Promise<CoachMessageReply> {
  try {
    devLog("Updating reply:", {
      id,
      content: content.substring(0, 50) + "...",
      authorId,
      isAdmin,
    });

    // Sanitize and validate content
    const sanitizedContent = sanitizeInput(content.trim());

    if (sanitizedContent.length > 500) {
      throw new Error("Reply content cannot exceed 500 characters");
    }

    if (sanitizedContent.length === 0) {
      throw new Error("Reply content cannot be empty");
    }

    // Check if user can update this reply
    const { data: existingReply, error: fetchError } = await supabase
      .from("coach_message_replies")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError) {
      devError("Error fetching reply for update:", fetchError);
      throw new Error("Reply not found");
    }

    if (!isAdmin && existingReply.author_id !== authorId) {
      throw new Error("You can only update your own replies");
    }

    const { data, error } = await supabase
      .from("coach_message_replies")
      .update({
        content: sanitizedContent,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      devError("Error updating reply:", error);
      throw new Error(error.message);
    }

    devLog("Successfully updated reply:", data.id);
    return data;
  } catch (err: unknown) {
    devError("Error in updateReply:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to update reply";
    throw new Error(errorMessage);
  }
}

// Soft delete a message
export async function deleteMessage(
  id: string,
  authorId: string,
  isAdmin: boolean
): Promise<void> {
  try {
    devLog("Deleting message:", { id, authorId, isAdmin });

    // Get current user for debugging
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    devLog("Current user for delete:", { user: user?.id, authError });

    // Check if user can delete this message
    const { data: existingMessage, error: fetchError } = await supabase
      .from("coach_messages")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError) {
      devError("Error fetching message for deletion:", fetchError);
      throw new Error("Message not found");
    }

    devLog("Existing message data:", { existingMessage, authorId, isAdmin });

    if (!isAdmin && existingMessage.author_id !== authorId) {
      throw new Error("You can only delete your own messages");
    }

    // Call server API using admin client to bypass RLS
    const resp = await fetch("/api/messages/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: id, requesterId: authorId, isAdmin }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API delete message failed:", body);
      throw new Error(body.error || "Failed to delete message");
    }

    devLog("Successfully deleted message:", id);
  } catch (err: unknown) {
    devError("Error in deleteMessage:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete message";
    throw new Error(errorMessage);
  }
}

// Soft delete a reply
export async function deleteReply(
  id: string,
  authorId: string,
  isAdmin: boolean
): Promise<void> {
  try {
    devLog("Deleting reply:", { id, authorId, isAdmin });

    // Check if user can delete this reply
    const { data: existingReply, error: fetchError } = await supabase
      .from("coach_message_replies")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError) {
      devError("Error fetching reply for deletion:", fetchError);
      throw new Error("Reply not found");
    }

    if (!isAdmin && existingReply.author_id !== authorId) {
      throw new Error("You can only delete your own replies");
    }

    const { error } = await supabase
      .from("coach_message_replies")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      devError("Error deleting reply:", error);
      throw new Error(error.message);
    }

    devLog("Successfully deleted reply:", id);
  } catch (err: unknown) {
    devError("Error in deleteReply:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to delete reply";
    throw new Error(errorMessage);
  }
}

// Pin/unpin a message (admin only)
export async function pinMessage(
  id: string,
  isAdmin: boolean
): Promise<CoachMessage> {
  try {
    devLog("Pinning/unpinning message:", { id, isAdmin });

    if (!isAdmin) {
      throw new Error("Only admins can pin/unpin messages");
    }

    // Get current pin status
    const { data: currentMessage, error: fetchError } = await supabase
      .from("coach_messages")
      .select("is_pinned")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError) {
      devError("Error fetching message for pin:", fetchError);
      throw new Error("Message not found");
    }

    const { data, error } = await supabase
      .from("coach_messages")
      .update({
        is_pinned: !currentMessage.is_pinned,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      devError("Error pinning/unpinning message:", error);
      throw new Error(error.message);
    }

    devLog("Successfully toggled pin status for message:", id);
    return data;
  } catch (err: unknown) {
    devError("Error in pinMessage:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to pin/unpin message";
    throw new Error(errorMessage);
  }
}
