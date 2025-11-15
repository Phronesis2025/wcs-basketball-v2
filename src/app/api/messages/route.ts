import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseClient";
import { devLog, devError, sanitizeInput } from "@/lib/security";
import { ValidationError, ApiError, DatabaseError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

// Extract @mentions from message content
function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1].toLowerCase());
  }

  return [...new Set(mentions)]; // Remove duplicates
}

// Get users by mention patterns
async function getUsersByMentions(
  mentions: string[]
): Promise<Array<{ id: string; email: string }>> {
  try {
    if (mentions.length === 0) return [];

    const { data: users, error } = await supabaseAdmin
      ?.from("users")
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
async function createMentionNotifications(
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
      const { error } = await supabaseAdmin
        ?.from("message_notifications")
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

export async function POST(request: NextRequest) {
  try {
    const { content, authorId, authorName } = await request.json();

    if (!content || !authorId || !authorName) {
      throw new ValidationError("Missing required fields");
    }

    if (!supabaseAdmin) {
      throw new ApiError("Server configuration error", 500);
    }

    const sanitizedContent = sanitizeInput(String(content).trim());
    const sanitizedAuthorName = sanitizeInput(String(authorName));

    devLog("[API] Creating message", {
      authorId,
      authorName: sanitizedAuthorName,
      preview: sanitizedContent.slice(0, 50),
    });

    const { data, error } = await supabaseAdmin
      .from("coach_messages")
      .insert({
        author_id: authorId,
        author_name: sanitizedAuthorName,
        content: sanitizedContent,
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError("Failed to create message", error);
    }

    // Process mentions after successful message creation
    try {
      await createMentionNotifications(
        data.id,
        null,
        sanitizedContent,
        authorId
      );
    } catch (mentionError) {
      devError("[API] Mention processing failed:", mentionError);
      // Don't fail the message creation if mention processing fails
    }

    return formatSuccessResponse(data);
  } catch (err) {
    return handleApiError(err, request);
  }
}
