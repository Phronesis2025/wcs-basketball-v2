// src/components/dashboard/message-board/ReplySection.tsx
import React, { useState } from "react";
import { CoachMessageReply } from "@/types/supabase";
import ReplyItem from "./ReplyItem";

interface ReplySectionProps {
  messageId: string;
  replies: CoachMessageReply[];
  editingReply: string | null;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEdit: (reply: CoachMessageReply) => void;
  onCancelEdit: () => void;
  onSaveEdit: (replyId: string) => void;
  onDelete: (replyId: string) => void;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: () => void;
  userId: string;
  isAdmin: boolean;
  submitting: boolean;
}

export default function ReplySection({
  messageId,
  replies,
  editingReply,
  editText,
  onEditTextChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  userId,
  isAdmin,
  submitting,
}: ReplySectionProps) {
  return (
    <div className="mt-4 pl-4 border-l-2 border-gray-200">
      <div className="space-y-3 mb-4">
        {replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            isEditing={editingReply === reply.id}
            editText={editText}
            onEditTextChange={onEditTextChange}
            onStartEdit={() => onStartEdit(reply)}
            onCancelEdit={onCancelEdit}
            onSaveEdit={() => onSaveEdit(reply.id)}
            onDelete={() => onDelete(reply.id)}
            userId={userId}
            isAdmin={isAdmin}
            submitting={submitting}
          />
        ))}
      </div>

      <div className="space-y-3">
        <textarea
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          placeholder="Write a reply..."
          className="w-full p-3 border border-gray-300 rounded-md text-base sm:text-sm font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          rows={3}
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {replyText.length}/500 characters
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onReplyTextChange("")}
              className="px-4 py-2 text-sm font-inter text-gray-600 hover:text-gray-800 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmitReply}
              disabled={!replyText.trim() || submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

