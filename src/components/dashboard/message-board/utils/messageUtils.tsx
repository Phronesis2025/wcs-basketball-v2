// src/components/dashboard/message-board/utils/messageUtils.ts
import React from "react";

/**
 * Format a timestamp to a human-readable relative time string
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string (e.g., "5 min ago", "2 hr ago", "3 days ago")
 */
export const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInHours = Math.floor(
    (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(
      (now.getTime() - messageTime.getTime()) / (1000 * 60)
    );
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hr ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }
};

/**
 * Render message content with mention highlighting
 * @param content - Message content string
 * @param messageId - Optional message ID for generating unique keys
 * @returns Array of React elements with mentions highlighted
 */
export const renderMessageContent = (
  content: string | null | undefined,
  messageId?: string
): React.ReactElement[] => {
  // Handle null/undefined content gracefully
  if (!content || typeof content !== 'string') {
    const key = messageId ? `${messageId}-empty` : 'empty';
    return [<React.Fragment key={key}>(empty message)</React.Fragment>];
  }
  
  const parts = content.split(/(@[a-zA-Z0-9._-]+)/g);
  return parts.map((part, index) => {
    // Create a unique key that includes messageId if provided
    const key = messageId ? `${messageId}-${index}` : `part-${index}`;
    
    if (part.match(/^@[a-zA-Z0-9._-]+$/)) {
      return (
        <span
          key={key}
          className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-sm font-medium"
        >
          {part}
        </span>
      );
    }
    // Wrap strings in fragments with keys so React can track them properly
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
};

/**
 * Check if the current user can edit a message/reply
 * - Admins can edit any message
 * - Coaches can only edit their own messages
 * @param authorId - ID of the message/reply author
 * @param userId - ID of the current user
 * @param isAdmin - Whether the current user is an admin
 * @returns True if the user can edit the message/reply
 */
export const canEdit = (
  authorId: string,
  userId: string,
  isAdmin: boolean
): boolean => {
  // Admins can edit any message
  if (isAdmin) {
    return true;
  }
  // Coaches can only edit their own messages
  return authorId === userId;
};

/**
 * Check if the current user can delete a message/reply
 * - Admins can delete any message
 * - Coaches can only delete their own messages
 * @param authorId - ID of the message/reply author
 * @param userId - ID of the current user
 * @param isAdmin - Whether the current user is an admin
 * @returns True if the user can delete the message/reply
 */
export const canDelete = (
  authorId: string,
  userId: string,
  isAdmin: boolean
): boolean => {
  // Admins can delete any message
  if (isAdmin) {
    return true;
  }
  // Coaches can only delete their own messages
  return authorId === userId;
};

