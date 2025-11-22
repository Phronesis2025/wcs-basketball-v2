// src/components/dashboard/message-board/MessageComposer.tsx
import React, { useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

interface MessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  submitting: boolean;
}

export default function MessageComposer({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}: MessageComposerProps) {
  const [newMessageText, setNewMessageText] = useState("");
  useScrollLock(isOpen);

  const handleSubmit = () => {
    onSubmit(newMessageText);
    setNewMessageText("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bebas uppercase text-gray-900 mb-4">
          New Message
        </h3>
        <textarea
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border border-gray-300 rounded-md text-base sm:text-sm font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          rows={4}
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {newMessageText.length}/1000 characters
          </span>
        </div>
        <div className="flex items-center justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              setNewMessageText("");
            }}
            className="px-4 py-2 text-sm font-inter text-gray-600 hover:text-gray-800 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!newMessageText.trim() || submitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Posting..." : "Post Message"}
          </button>
        </div>
      </div>
    </div>
  );
}

