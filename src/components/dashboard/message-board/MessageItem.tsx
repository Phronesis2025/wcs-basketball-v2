// src/components/dashboard/message-board/MessageItem.tsx
import React from "react";
import { CoachMessage, CoachMessageReply } from "@/types/supabase";
import { formatTimestamp, renderMessageContent, canEdit, canDelete } from "./utils/messageUtils";
import ReplySection from "./ReplySection";

interface MessageItemProps {
  message: CoachMessage;
  replies: CoachMessageReply[];
  isExpanded: boolean;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEdit: (item: CoachMessage | CoachMessageReply, type: "message" | "reply") => void;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string) => void;
  onDelete: (messageId: string, replyCount: number) => void;
  onPin: (messageId: string) => void;
  onToggleExpanded: (messageId: string) => void;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: (messageId: string) => void;
  onEditReply: (replyId: string) => void;
  onDeleteReply: (replyId: string) => void;
  editingReply: string | null;
  userId: string;
  isAdmin: boolean;
  submitting: boolean;
}

export default function MessageItem({
  message,
  replies,
  isExpanded,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onPin,
  onToggleExpanded,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onEditReply,
  onDeleteReply,
  editingReply,
  userId,
  isAdmin,
  submitting,
}: MessageItemProps) {
  return (
    <div
      id={`message-${message.id}`}
      className={`border-b border-gray-100 pb-4 last:border-b-0 ${
        message.is_pinned
          ? "bg-yellow-50 border-l-4 border-l-yellow-400 pl-4"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-inter font-semibold text-gray-900 text-sm sm:text-base">
                {message.author_name}
              </span>
              {message.is_pinned && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  PINNED
                </span>
              )}
              {message.updated_at !== message.created_at && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>
            <span className="text-xs sm:text-sm text-gray-500">
              • {formatTimestamp(message.created_at)}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-base sm:text-sm font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                rows={3}
                maxLength={1000}
                autoFocus={false}
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 sm:gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-4 py-2.5 sm:py-2 text-sm font-inter text-gray-600 hover:text-gray-800 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onSaveEdit(message.id)}
                  disabled={!editText.trim() || submitting}
                  className="px-4 py-2.5 sm:py-2 bg-blue-600 text-white text-sm font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 font-inter mb-3 text-sm sm:text-base">
              {renderMessageContent(message.content, message.id)}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => onToggleExpanded(message.id)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm sm:text-sm font-inter self-start px-3 py-2 sm:px-0 sm:py-0 rounded-md hover:bg-blue-50 sm:hover:bg-transparent transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
              disabled={submitting}
            >
              <svg
                className="w-5 h-5 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Reply</span>
            </button>
            <span className="text-xs sm:text-sm text-gray-500">
              {isExpanded
                ? `Hide ${replies.length} comments`
                : `View ${replies.length} comments`}
            </span>
          </div>

          {/* Action buttons - Mobile-friendly touch targets (min 44px) */}
          <div className="flex items-center space-x-2 sm:space-x-1 mt-2">
            {canEdit(message.author_id, userId, isAdmin) && !isEditing && (
              <button
                type="button"
                onClick={() => onStartEdit(message, "message")}
                className="text-gray-400 hover:text-gray-600 p-3 sm:p-1 rounded-md hover:bg-gray-100 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                aria-label="Edit message"
                disabled={submitting}
              >
                <svg
                  className="w-5 h-5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {canDelete(message.author_id, userId, isAdmin) && !isEditing && (
              <button
                type="button"
                onClick={() => onDelete(message.id, replies.length)}
                className={`p-3 sm:p-1 rounded-md transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center ${
                  !isAdmin && replies.length > 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                }`}
                aria-label="Delete message"
                disabled={submitting || (!isAdmin && replies.length > 0)}
                title={
                  !isAdmin && replies.length > 0
                    ? "Cannot delete message with replies. Only admins can delete messages that have replies."
                    : "Delete message"
                }
              >
                <svg
                  className="w-5 h-5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
            {isAdmin && !isEditing && (
              <button
                type="button"
                onClick={() => onPin(message.id)}
                className="text-gray-400 hover:text-yellow-600 p-3 sm:p-1 rounded-md hover:bg-yellow-50 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                aria-label={message.is_pinned ? "Unpin message" : "Pin message"}
                disabled={submitting}
              >
                <svg
                  className="w-5 h-5 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <ReplySection
          messageId={message.id}
          replies={replies}
          editingReply={editingReply}
          editText={editText}
          onEditTextChange={onEditTextChange}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onEditReply}
          onDelete={onDeleteReply}
          replyText={replyText}
          onReplyTextChange={onReplyTextChange}
          onSubmitReply={() => onSubmitReply(message.id)}
          userId={userId}
          isAdmin={isAdmin}
          submitting={submitting}
        />
      )}
    </div>
  );
}

