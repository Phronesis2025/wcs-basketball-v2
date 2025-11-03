// src/lib/messageActions.ts
import { supabase } from "./supabaseClient";
import {
  CoachMessage,
  CoachMessageReply,
  MessageNotification,
} from "../types/supabase";
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
    const { data: existingMessages, error: fetchError } = await supabase
      .from("coach_messages")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null);

    if (fetchError) {
      devError("Error fetching message for update:", fetchError);
      throw new Error("Message not found");
    }

    if (!existingMessages || existingMessages.length === 0) {
      throw new Error("Message not found");
    }

    const existingMessage = existingMessages[0];

    if (!isAdmin && existingMessage.author_id !== authorId) {
      throw new Error("You can only update your own messages");
    }

    // Call server API using admin client to bypass RLS for admins
    const resp = await fetch("/api/messages/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        messageId: id, 
        content: sanitizedContent, 
        requesterId: authorId, 
        isAdmin 
      }),
    });
    
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API update message failed:", body);
      throw new Error(body.error || "Failed to update message");
    }

    const result = await resp.json();
    devLog("Successfully updated message:", result.data?.id || id);
    return result.data;
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
    const { data: existingReplies, error: fetchError } = await supabase
      .from("coach_message_replies")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null);

    if (fetchError) {
      devError("Error fetching reply for update:", fetchError);
      throw new Error("Reply not found");
    }

    if (!existingReplies || existingReplies.length === 0) {
      throw new Error("Reply not found");
    }

    const existingReply = existingReplies[0];

    if (!isAdmin && existingReply.author_id !== authorId) {
      throw new Error("You can only update your own replies");
    }

    // Call server API using admin client to bypass RLS for admins
    const resp = await fetch("/api/message-replies/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        replyId: id, 
        content: sanitizedContent, 
        requesterId: authorId, 
        isAdmin 
      }),
    });
    
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API update reply failed:", body);
      throw new Error(body.error || "Failed to update reply");
    }

    const result = await resp.json();
    devLog("Successfully updated reply:", result.data?.id || id);
    return result.data;
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
    const { data: existingMessages, error: fetchError } = await supabase
      .from("coach_messages")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null);

    if (fetchError) {
      devError("Error fetching message for deletion:", fetchError);
      throw new Error("Message not found");
    }

    if (!existingMessages || existingMessages.length === 0) {
      throw new Error("Message not found");
    }

    const existingMessage = existingMessages[0];

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
    const { data: existingReplies, error: fetchError } = await supabase
      .from("coach_message_replies")
      .select("author_id")
      .eq("id", id)
      .is("deleted_at", null);

    if (fetchError) {
      devError("Error fetching reply for deletion:", fetchError);
      throw new Error("Reply not found");
    }

    if (!existingReplies || existingReplies.length === 0) {
      throw new Error("Reply not found");
    }

    const existingReply = existingReplies[0];

    devLog("Existing reply data:", { existingReply, authorId, isAdmin });

    if (!isAdmin && existingReply.author_id !== authorId) {
      throw new Error("You can only delete your own replies");
    }

    // Call server API using admin client to bypass RLS
    const resp = await fetch("/api/message-replies/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyId: id, requesterId: authorId, isAdmin }),
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API delete reply failed:", body);
      throw new Error(body.error || "Failed to delete reply");
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

    // Call server API using admin client to bypass RLS
    const resp = await fetch("/api/messages/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: id, requesterId: "admin", isAdmin }),
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      devError("API pin message failed:", body);
      throw new Error(body.error || "Failed to pin/unpin message");
    }

    const data = await resp.json();
    devLog("Successfully toggled pin status for message:", id);
    return data;
  } catch (err: unknown) {
    devError("Error in pinMessage:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to pin/unpin message";
    throw new Error(errorMessage);
  }
}

// Extract @mentions from message content
export function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1].toLowerCase());
  }

  return [...new Set(mentions)]; // Remove duplicates
}

// Get users by mention patterns
export async function getUsersByMentions(
  mentions: string[]
): Promise<Array<{ id: string; email: string }>> {
  try {
    if (mentions.length === 0) return [];

    const { data: users, error } = await supabase
      .from("users")
      .select("id, email")
      .in("role", ["coach", "admin"]);

    if (error) {
      devError("Error fetching users for mentions:", error);
      return [];
    }

    const matchingUsers: Array<{ id: string; email: string }> = [];

    for (const mention of mentions) {
      const user = users?.find((u) => {
        const emailPrefix = u.email.split("@")[0].toLowerCase();
        return (
          emailPrefix === mention || u.email.toLowerCase().includes(mention)
        );
      });

      if (user) {
        matchingUsers.push(user);
      }
    }

    return matchingUsers;
  } catch (err) {
    devError("Error in getUsersByMentions:", err);
    return [];
  }
}

// Create notifications for mentioned users
export async function createMentionNotifications(
  messageId: string,
  replyId: string | null,
  content: string,
  authorId: string
): Promise<void> {
  try {
    const mentions = extractMentions(content);
    if (mentions.length === 0) return;

    const users = await getUsersByMentions(mentions);
    if (users.length === 0) return;

    // Create notification for each mentioned user (excluding the author)
    const notifications = users
      .filter((user) => user.id !== authorId)
      .map((user) => ({
        message_id: messageId,
        reply_id: replyId,
        mentioned_user_id: user.id,
        mentioned_by_user_id: authorId,
      }));

    if (notifications.length > 0) {
      const { error } = await supabase
        .from("message_notifications")
        .insert(notifications);

      if (error) {
        devError("Error creating mention notifications:", error);
      } else {
        devLog(`Created ${notifications.length} mention notifications`);
      }
    }
  } catch (err) {
    devError("Error in createMentionNotifications:", err);
  }
}

// Get unread mention count for current user
export async function getUnreadMentionCount(userId: string): Promise<number> {
  try {
    devLog("Fetching unread mention count for user:", userId);

    // Count distinct messages/replies that have unread mentions
    const { data, error } = await supabase
      .from("message_notifications")
      .select("message_id, reply_id")
      .eq("mentioned_user_id", userId)
      .is("acknowledged_at", null);

    if (error) {
      devError("Error fetching unread mention count:", error);
      return 0;
    }

    // Count unique messages/replies (not total mentions)
    const uniqueItems = new Set();
    data?.forEach((notification) => {
      const key = notification.reply_id || notification.message_id;
      uniqueItems.add(key);
    });

    const count = uniqueItems.size;
    devLog("Unread mentions:", count);
    return count;
  } catch (error) {
    devError("Error in getUnreadMentionCount:", error);
    return 0;
  }
}

// Get full unread mention details for user
export async function getUnreadMentionsForUser(userId: string) {
  try {
    devLog("Fetching unread mentions for user:", userId);

    const { data, error } = await supabase
      .from("message_notifications")
      .select(
        `
        id,
        message_id,
        reply_id,
        mentioned_at,
        mentioned_user_id,
        coach_messages!message_id (
          id,
          content,
          author_id,
          author_name,
          created_at
        ),
        coach_message_replies!reply_id (
          id,
          content,
          author_id,
          author_name,
          created_at,
          message_id
        )
      `
      )
      .eq("mentioned_user_id", userId)
      .is("acknowledged_at", null)
      .order("mentioned_at", { ascending: false });

    if (error) {
      devError("Error fetching unread mentions:", error);
      return [];
    }

    // Additional safety filter: ensure all returned mentions are for the requested user
    const filteredData = (data || []).filter(
      (mention) => mention.mentioned_user_id === userId
    );

    devLog("Unread mentions fetched:", filteredData?.length || 0);
    return filteredData;
  } catch (error) {
    devError("Error in getUnreadMentionsForUser:", error);
    return [];
  }
}

// Mark individual mention as read
export async function markMentionAsRead(
  notificationId: string
): Promise<boolean> {
  try {
    devLog("Marking mention as read:", notificationId);

    const { error } = await supabase
      .from("message_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", notificationId);

    if (error) {
      devError("Error marking mention as read:", error);
      return false;
    }

    devLog("Mention marked as read successfully");
    return true;
  } catch (error) {
    devError("Error in markMentionAsRead:", error);
    return false;
  }
}

// Mark mentions as read
export async function markMentionsAsRead(
  userId: string,
  messageIds: string[]
): Promise<void> {
  try {
    if (messageIds.length === 0) return;

    const { error } = await supabase
      .from("message_notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("mentioned_user_id", userId)
      .in("message_id", messageIds)
      .eq("is_read", false);

    if (error) {
      devError("Error marking mentions as read:", error);
    } else {
      devLog(`Marked mentions as read for ${messageIds.length} messages`);
    }
  } catch (err) {
    devError("Error in markMentionsAsRead:", err);
  }
}
