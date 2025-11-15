// src/components/dashboard/message-board/UnreadMentions.tsx
import React from "react";
import { renderMessageContent } from "./utils/messageUtils";

interface UnreadMention {
  id: string;
  mentioned_user_id: string;
  message_id: string;
  reply_id?: string;
  mentioned_at: string;
  coach_messages?: {
    content: string;
    author_name: string;
  };
  coach_message_replies?: {
    content: string;
    author_name: string;
    message_id: string;
    coach_messages?: {
      content: string;
      author_name: string;
    };
  };
}

interface UnreadMentionsProps {
  mentions: UnreadMention[];
  userId: string;
  onMarkRead: (mentionId: string) => void;
  onMarkAllRead: () => void;
  onMentionClick: (messageId: string) => void;
}

export default function UnreadMentions({
  mentions,
  userId,
  onMarkRead,
  onMarkAllRead,
  onMentionClick,
}: UnreadMentionsProps) {
  // Filter mentions to only show those for the current user
  const userMentions = mentions.filter(
    (mention) => mention.mentioned_user_id === userId
  );

  if (userMentions.length === 0) return null;

  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bebas text-black dark:text-black">
          <span className="md:hidden">{userMentions.length} unread</span>
          <span className="hidden md:inline">
            UNREAD MENTIONS ({userMentions.length})
          </span>
        </h4>
        <button
          onClick={onMarkAllRead}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-inter underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {userMentions.map((mention) => {
          const isReply = !!mention.reply_id;
          const replyData = mention.coach_message_replies;
          const messageData = mention.coach_messages;
          const parentMessage = replyData?.coach_messages;

          const actualContent = isReply
            ? replyData?.content || ""
            : messageData?.content || "";
          const authorName = isReply
            ? replyData?.author_name || ""
            : messageData?.author_name || "";

          const targetMessageId = isReply
            ? replyData?.message_id || mention.message_id
            : mention.message_id;

          const handleMentionClick = () => {
            if (!targetMessageId) return;
            onMentionClick(targetMessageId);
          };

          return (
            <div
              key={mention.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={handleMentionClick}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    e.stopPropagation();
                    onMarkRead(mention.id);
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {authorName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {isReply ? "replied to you" : "mentioned you in a post"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {new Date(mention.mentioned_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Show parent message context if it's a reply */}
                  {isReply && parentMessage && (
                    <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs border-l-2 border-gray-300 dark:border-gray-600">
                      <div className="text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-semibold">
                          {parentMessage.author_name}
                        </span>{" "}
                        posted:
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        {renderMessageContent(parentMessage.content || "")}
                      </p>
                    </div>
                  )}
                  {/* Show the actual reply/message that mentions the user */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-2 border-blue-400 dark:border-blue-500">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {renderMessageContent(actualContent)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

