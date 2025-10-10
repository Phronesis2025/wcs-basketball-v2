// src/components/dashboard/MessageBoard.tsx
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";
import { CoachMessage, CoachMessageReply } from "../../types/supabase";
import {
  getMessages,
  getMessageReplies,
  createMessage,
  createReply,
  updateMessage,
  updateReply,
  deleteMessage,
  deleteReply,
  pinMessage,
} from "../../lib/messageActions";
import { devLog, devError } from "../../lib/security";

interface MessageBoardProps {
  userId: string;
  userName: string;
  isAdmin: boolean;
}

export default function MessageBoard({
  userId,
  userName,
  isAdmin,
}: MessageBoardProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [replies, setReplies] = useState<Record<string, CoachMessageReply[]>>(
    {}
  );
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [newMessageText, setNewMessageText] = useState<string>("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "message" | "reply";
  } | null>(null);

  // Load messages and replies
  const loadMessages = useCallback(async () => {
    try {
      devLog("Loading messages...");
      setLoading(true);
      const messagesData = await getMessages();
      devLog("Loaded messages:", messagesData.length);
      setMessages(messagesData);

      // Load replies for each message
      for (const message of messagesData) {
        await loadReplies(message.id);
      }
    } catch (error) {
      devError("Error loading messages:", error);
      // If it's a table not found error, show helpful message
      if (
        error instanceof Error &&
        error.message.includes("tables not yet created")
      ) {
        setMessages([]); // Set empty array to show the setup message
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Debug logging for message data
  useEffect(() => {
    if (messages.length > 0) {
      devLog("Messages loaded for delete check:", {
        messageCount: messages.length,
        firstMessage: messages[0],
        userId,
        isAdmin,
        editingMessage,
        allMessageAuthors: messages.map((m) => ({
          id: m.id,
          author_id: m.author_id,
          author_name: m.author_name,
        })),
      });
    }
  }, [messages, userId, isAdmin, editingMessage]);

  // Set up real-time subscriptions
  useEffect(() => {
    devLog("Setting up real-time subscription...");
    devLog("Setting up real-time subscription for user:", userId);

    const channel = supabase
      .channel("coach-messages", {
        config: {
          broadcast: { self: true },
          presence: { key: userId || "anonymous" },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "coach_messages",
        },
        (payload) => {
          devLog("New message inserted:", payload);
          loadMessages();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "coach_messages",
        },
        (payload) => {
          devLog("Message updated:", payload);
          loadMessages();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "coach_message_replies",
        },
        (payload) => {
          devLog("New reply inserted:", payload);
          loadMessages();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "coach_message_replies",
        },
        (payload) => {
          devLog("Reply updated:", payload);
          loadMessages();
        }
      )
      .subscribe((status, err) => {
        devLog("Real-time subscription status:", status);

        if (status === "SUBSCRIBED") {
          devLog("Successfully subscribed to real-time updates");
          setRealtimeConnected(true);
        } else if (status === "CHANNEL_ERROR") {
          devError("Real-time subscription error:", err);
          setRealtimeConnected(false);
        } else if (status === "TIMED_OUT") {
          devError("Real-time subscription timed out");
          setRealtimeConnected(false);
        } else if (status === "CLOSED") {
          devLog("Real-time subscription closed");
          setRealtimeConnected(false);
        }
      });

    return () => {
      devLog("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, loadMessages]);

  const loadReplies = async (messageId: string) => {
    try {
      const repliesData = await getMessageReplies(messageId);
      setReplies((prev) => ({
        ...prev,
        [messageId]: repliesData,
      }));
    } catch (error) {
      devError("Error loading replies:", error);
    }
  };

  const handleNewMessage = async () => {
    if (!newMessageText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await createMessage(newMessageText, userId, userName);
      setNewMessageText("");
      setShowNewMessageModal(false);
      toast.success("Message posted successfully", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      devError("Error creating message:", error);
      toast.error("Failed to create message. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await createReply(messageId, replyText, userId, userName);
      setReplyText("");
      toast.success("Reply posted successfully", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      devError("Error creating reply:", error);
      toast.error("Failed to create reply. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await updateMessage(messageId, editText, userId, isAdmin);
      setEditingMessage(null);
      setEditText("");
      toast.success("Message updated successfully", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      devError("Error updating message:", error);
      toast.error("Failed to update message. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!editText.trim() || submitting) return;

    try {
      setSubmitting(true);
      await updateReply(replyId, editText, userId, isAdmin);
      setEditingReply(null);
      setEditText("");
      toast.success("Reply updated successfully", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      devError("Error updating reply:", error);
      toast.error("Failed to update reply. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeleteTarget({ id: messageId, type: "message" });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      devLog("Attempting to delete:", { deleteTarget, userId, isAdmin });

      if (deleteTarget.type === "message") {
        await deleteMessage(deleteTarget.id, userId, isAdmin);
        toast.success("Message deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
      } else {
        await deleteReply(deleteTarget.id, userId, isAdmin);
        toast.success("Reply deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
      }

      devLog("Deleted successfully, refreshing messages...");
      await loadMessages();
      devLog("Messages refreshed after deletion");
    } catch (error) {
      devError("Error deleting:", error);
      toast.error(`Failed to delete ${deleteTarget.type}. Please try again.`, {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const handleDeleteReply = (replyId: string) => {
    setDeleteTarget({ id: replyId, type: "reply" });
    setShowDeleteConfirm(true);
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      setSubmitting(true);
      await pinMessage(messageId, isAdmin);
      // Find the message to determine if it was pinned or unpinned
      const message = messages.find(m => m.id === messageId);
      if (message) {
        toast.success(message.is_pinned ? "Message unpinned" : "Message pinned", {
          duration: 3000,
          position: "top-right",
        });
      }
    } catch (error) {
      devError("Error pinning message:", error);
      toast.error("Failed to pin/unpin message. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpanded = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  const startEdit = (
    message: CoachMessage | CoachMessageReply,
    type: "message" | "reply"
  ) => {
    setEditText(message.content);
    if (type === "message") {
      setEditingMessage(message.id);
    } else {
      setEditingReply(message.id);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditingReply(null);
    setEditText("");
  };

  const formatTimestamp = (timestamp: string) => {
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

  const canEdit = (authorId: string) => {
    return authorId === userId || isAdmin;
  };

  const canDelete = (authorId: string) => {
    const canDeleteResult = authorId === userId || isAdmin;
    devLog("canDelete check:", {
      authorId,
      userId,
      isAdmin,
      canDeleteResult,
      authorIdType: typeof authorId,
      userIdType: typeof userId,
      isAdminType: typeof isAdmin,
      strictEqual: authorId === userId,
      adminCheck: isAdmin,
    });
    return canDeleteResult;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bebas uppercase text-gray-900">
            Coaches Message Board
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-xs sm:text-sm text-gray-500 font-inter">
              Ask questions and share insights with other coaches
            </p>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  realtimeConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={
                  realtimeConnected
                    ? "Real-time updates active"
                    : "Real-time updates disconnected"
                }
              />
              <span className="text-xs text-gray-400">
                {realtimeConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadMessages}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-inter hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            title="Refresh messages"
          >
            {loading ? "Loading..." : "↻"}
          </button>
          <button
            type="button"
            onClick={async () => {
              devLog("Testing real-time connection...");

              // Test by creating a temporary message
              try {
                const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
                devLog("Creating test message:", testMessage);
                await createMessage(testMessage, userId, userName);
                devLog("Test message created successfully");

                // Force refresh the messages to show the new one
                devLog("Manually refreshing messages...");
                await loadMessages();
                devLog("Messages refreshed");
              } catch (error) {
                devError("Test message creation failed:", error);
              }
            }}
            className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-md text-sm font-inter hover:bg-yellow-200 transition-colors"
            title="Test real-time connection by creating a test message"
          >
            Test
          </button>
          <button
            type="button"
            onClick={() => setShowNewMessageModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            + New Message
          </button>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bebas uppercase text-gray-900 mb-4">
              New Message
            </h3>
            <textarea
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-md text-sm font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                  setShowNewMessageModal(false);
                  setNewMessageText("");
                }}
                className="px-4 py-2 text-sm font-inter text-gray-600 hover:text-gray-800 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewMessage}
                disabled={!newMessageText.trim() || submitting}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Posting..." : "Post Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Message Board Setup Required
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                The message board tables need to be created in your database
                first.
              </p>
              <div className="text-left bg-white rounded p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  To set up the message board:
                </p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Open your Supabase Dashboard</li>
                  <li>Go to the SQL Editor</li>
                  <li>
                    Copy and paste the contents of{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      docs/coach_messages_migration.sql
                    </code>
                  </li>
                  <li>Execute the SQL script</li>
                </ol>
              </div>
              <p className="text-xs text-blue-600">
                After applying the migration, refresh this page to start using
                the message board.
              </p>
            </div>
            <p className="text-sm">
              No messages yet. Be the first to start a conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const messageReplies = replies[message.id] || [];
            const isExpanded = expandedMessage === message.id;
            const isEditing = editingMessage === message.id;

            return (
              <div
                key={message.id}
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
                          <span className="text-xs text-gray-400">
                            (edited)
                          </span>
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
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md text-sm font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          rows={3}
                          maxLength={1000}
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 py-2 text-sm font-inter text-gray-600 hover:text-gray-800 transition-colors"
                            disabled={submitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditMessage(message.id)}
                            disabled={!editText.trim() || submitting}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {submitting ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 font-inter mb-3 text-sm sm:text-base">
                        {message.content}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(message.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-inter self-start"
                        disabled={submitting}
                      >
                        <svg
                          className="w-4 h-4"
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
                          ? `Hide ${messageReplies.length} comments`
                          : `View ${messageReplies.length} comments`}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 mt-2">
                      {canEdit(message.author_id) && !isEditing && (
                        <button
                          type="button"
                          onClick={() => startEdit(message, "message")}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          aria-label="Edit message"
                          disabled={submitting}
                        >
                          <svg
                            className="w-4 h-4"
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
                      {canDelete(message.author_id) && !isEditing && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          aria-label="Delete message"
                          disabled={submitting}
                        >
                          <svg
                            className="w-4 h-4"
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
                          onClick={() => handlePinMessage(message.id)}
                          className="text-gray-400 hover:text-yellow-600 p-1"
                          aria-label={
                            message.is_pinned ? "Unpin message" : "Pin message"
                          }
                          disabled={submitting}
                        >
                          <svg
                            className="w-4 h-4"
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
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <div className="space-y-3 mb-4">
                      {messageReplies.map((reply) => {
                        const isEditingReply = editingReply === reply.id;
                        return (
                          <div
                            key={reply.id}
                            className="flex items-start space-x-2"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-inter font-semibold text-gray-900 text-sm">
                                  {reply.author_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  • {formatTimestamp(reply.created_at)}
                                </span>
                                {reply.updated_at !== reply.created_at && (
                                  <span className="text-xs text-gray-400">
                                    (edited)
                                  </span>
                                )}
                              </div>

                              {isEditingReply ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editText}
                                    onChange={(e) =>
                                      setEditText(e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md text-xs font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    rows={2}
                                    maxLength={500}
                                  />
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      type="button"
                                      onClick={cancelEdit}
                                      className="px-2 py-1 text-xs font-inter text-gray-600 hover:text-gray-800 transition-colors"
                                      disabled={submitting}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleEditReply(reply.id)}
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
                                    {reply.content}
                                  </p>
                                  <div className="flex items-center space-x-1 mt-1">
                                    {canEdit(reply.author_id) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEdit(reply, "reply")
                                        }
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                        aria-label="Edit reply"
                                        disabled={submitting}
                                      >
                                        <svg
                                          className="w-4 h-4"
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
                                    {canDelete(reply.author_id) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteReply(reply.id)
                                        }
                                        className="text-gray-400 hover:text-red-600 p-1"
                                        aria-label="Delete reply"
                                        disabled={submitting}
                                      >
                                        <svg
                                          className="w-4 h-4"
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
                      })}
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-3 border border-gray-300 rounded-md text-sm font-inter resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
                            onClick={() => setReplyText("")}
                            className="px-4 py-2 text-sm font-inter text-gray-600 hover:text-gray-800 transition-colors"
                            disabled={submitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReply(message.id)}
                            disabled={!replyText.trim() || submitting}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-inter rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {submitting ? "Posting..." : "Post Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete {deleteTarget?.type === "message" ? "Message" : "Reply"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. The {deleteTarget?.type} will be
                permanently removed from the message board.
              </p>
              <div className="flex space-x-3 justify-center">
                {(() => {
                  devLog("Rendering modal buttons:", {
                    showDeleteConfirm,
                    deleteTarget,
                    submitting,
                  });
                  return null;
                })()}
                <button
                  type="button"
                  onClick={() => {
                    devLog("Cancel button clicked");
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!submitting) {
                      devLog("Delete button clicked in modal");
                      confirmDelete();
                    }
                  }}
                  disabled={submitting}
                  style={{
                    minWidth: "100px",
                    padding: "8px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "white",
                    backgroundColor: "#dc2626",
                    border: "2px solid #b91c1c",
                    borderRadius: "6px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.5 : 1,
                    display: "inline-block",
                    textAlign: "center",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = "#b91c1c";
                      e.currentTarget.style.boxShadow =
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = "#dc2626";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                >
                  {(() => {
                    devLog("Button content:", {
                      submitting,
                      content: submitting ? "Deleting..." : "Delete",
                    });
                    return null;
                  })()}
                  {submitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
