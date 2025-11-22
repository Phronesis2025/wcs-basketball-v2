// src/components/dashboard/message-board/ReplyItem.tsx
import React from "react";
import { CoachMessageReply } from "@/types/supabase";
import { formatTimestamp, renderMessageContent, canEdit, canDelete } from "./utils/messageUtils";

interface ReplyItemProps {
  reply: CoachMessageReply;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  userId: string;
  isAdmin: boolean;
  submitting: boolean;
}

export default function ReplyItem({
  reply,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  userId,
  isAdmin,
  submitting,
}: ReplyItemProps) {
  return (
    <div className="flex items-start space-x-2">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-inter font-semibold text-gray-900 text-sm">
            {reply.author_name}
          </span>
          <span className="text-xs text-gray-500">
            • {formatTimestamp(reply.created_at)}
          </span>
          {reply.updated_at !== reply.created_at && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-base sm:text-xs font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              rows={2}
              maxLength={500}
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-2 py-1 text-xs font-inter text-gray-600 hover:text-gray-800 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={!editText.trim() || submitting}
                className="px-2 py-1 bg-blue-600 text-white text-xs font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 font-inter text-sm">
              {renderMessageContent(reply?.content || '')}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {canEdit(reply.author_id, userId, isAdmin) && (
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="text-gray-400 hover:text-gray-600 p-2 sm:p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Edit reply"
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
              {canDelete(reply.author_id, userId, isAdmin) && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-600 p-2 sm:p-1 rounded-md hover:bg-red-50 transition-colors"
                  aria-label="Delete reply"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

