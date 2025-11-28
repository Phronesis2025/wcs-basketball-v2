// src/components/dashboard/MessageBoard.tsx
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { CoachMessage, CoachMessageReply } from "../../types/supabase";
import { devLog, devError } from "../../lib/security";
import { useScrollLock } from "@/hooks/useScrollLock";
import BasketballLoader from "../BasketballLoader";
import { useMessages } from "./message-board/hooks/useMessages";
import { useReplies } from "./message-board/hooks/useReplies";
import { useMentions } from "./message-board/hooks/useMentions";
import { useEditing } from "./message-board/hooks/useEditing";
import MessageComposer from "./message-board/MessageComposer";
import UnreadMentions from "./message-board/UnreadMentions";
import MessageItem from "./message-board/MessageItem";

interface MessageBoardProps {
  userId: string;
  userName: string;
  isAdmin: boolean;
  onMentionRead?: () => void;
  refreshTrigger?: number;
  scrollToMessageId?: string | null;
}

export default function MessageBoard({
  userId,
  userName,
  isAdmin,
  onMentionRead,
  refreshTrigger,
  scrollToMessageId,
}: MessageBoardProps) {
  // Debug: Log isAdmin value
  useEffect(() => {
    devLog("MessageBoard - userId:", userId);
    devLog("MessageBoard - isAdmin:", isAdmin);
    devLog("MessageBoard - isAdmin type:", typeof isAdmin);
  }, [userId, isAdmin]);

  // Use custom hooks for state management
  const messagesHook = useMessages({
    userId,
    userName,
    isAdmin,
    onRefresh: () => {
      if (onMentionRead) {
        onMentionRead();
      }
    },
  });

  const repliesHook = useReplies({
    userId,
    userName,
    isAdmin,
    onRefresh: () => {
      if (onMentionRead) {
        onMentionRead();
      }
    },
  });

  const mentionsHook = useMentions({
    userId,
    onMentionRead,
  });

  const editingHook = useEditing();

  // Local state for UI
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "message" | "reply";
  } | null>(null);
  const [deleteTargetReplyCount, setDeleteTargetReplyCount] = useState<number>(0);
  const [showProfanityModal, setShowProfanityModal] = useState(false);
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);

  // Lock scroll when any modal is open - unified scroll management
  useScrollLock(
    showNewMessageModal ||
      !!editingHook.editingMessage ||
      !!editingHook.editingReply ||
      showDeleteConfirm ||
      showProfanityModal
  );

  // Load replies for all messages when messages change.
  // Use a single batched query instead of one request per message to avoid
  // hitting browser connection limits (net::ERR_INSUFFICIENT_RESOURCES).
  useEffect(() => {
    if (messagesHook.messages.length > 0) {
      const ids = messagesHook.messages.map((m) => m.id);
      repliesHook.loadRepliesForMessages(ids);
    }
  }, [messagesHook.messages, repliesHook]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (userId && refreshTrigger !== undefined && refreshTrigger > 0) {
      messagesHook.loadMessages();
      mentionsHook.loadUnreadMentions();
    }
  }, [refreshTrigger, userId, messagesHook, mentionsHook]);

  // Handle scrolling to a specific message and opening reply
  useEffect(() => {
    if (scrollToMessageId && messagesHook.messages.length > 0) {
      // Wait a bit for messages to render
      setTimeout(() => {
        const messageElement = document.getElementById(`message-${scrollToMessageId}`);
        if (messageElement) {
          // Expand the message to show reply
          setExpandedMessage(scrollToMessageId);
          // Scroll to the message - use 'start' on mobile for better UX
          const isMobile = window.innerWidth < 640;
          messageElement.scrollIntoView({ 
            behavior: "smooth", 
            block: isMobile ? "start" : "center" 
          });
          // On mobile, don't auto-focus textarea to avoid keyboard issues
          if (!isMobile) {
            setTimeout(() => {
              const replyTextarea = messageElement.querySelector('textarea[placeholder*="reply"], textarea[placeholder*="Reply"], textarea[placeholder*="Write a reply"]') as HTMLTextAreaElement;
              if (replyTextarea) {
                replyTextarea.focus();
              }
            }, 500);
          }
        }
      }, 300);
    }
  }, [scrollToMessageId, messagesHook.messages]);

  // Wrapper functions that handle profanity errors
  const handleNewMessage = async (messageText: string) => {
    const result = await messagesHook.handleNewMessage(messageText);
    if (!result.success && result.errors) {
      setProfanityErrors(result.errors);
      setShowProfanityModal(true);
    } else if (result.success) {
      setShowNewMessageModal(false);
    }
  };

  const handleReply = async (messageId: string) => {
    const currentReplyText = replyText[messageId] || "";
    const result = await repliesHook.handleReply(messageId, currentReplyText);
    if (!result.success && result.errors) {
      setProfanityErrors(result.errors);
      setShowProfanityModal(true);
    } else if (result.success) {
      setReplyText((prev) => ({ ...prev, [messageId]: "" }));
    }
  };

  const handleEditMessage = async (messageId: string) => {
    const result = await messagesHook.handleEditMessage(
      messageId,
      editingHook.editText
    );
    if (!result.success && result.errors) {
      setProfanityErrors(result.errors);
      setShowProfanityModal(true);
    } else if (result.success) {
      editingHook.cancelEdit();
    }
  };

  const handleEditReply = async (replyId: string) => {
    const result = await repliesHook.handleEditReply(
      replyId,
      editingHook.editText
    );
    if (!result.success && result.errors) {
      setProfanityErrors(result.errors);
      setShowProfanityModal(true);
    } else if (result.success) {
      editingHook.cancelEdit();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const messageReplies = repliesHook.replies[messageId] || [];
    const replyCount = messageReplies.length;
    setDeleteTarget({ id: messageId, type: "message" });
    setDeleteTargetReplyCount(replyCount);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "message") {
        const result = await messagesHook.handleDeleteMessage(deleteTarget.id);
        if (!result.success) {
          if (result.hasReplies) {
            // Don't close modal, let user see the error
            return;
          }
          throw new Error(result.error || "Failed to delete message");
        }
      } else {
        const result = await repliesHook.handleDeleteReply(deleteTarget.id);
        if (!result.success) {
          throw new Error(result.error || "Failed to delete reply");
        }
      }

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setDeleteTargetReplyCount(0);
    } catch (error) {
      devError("Error deleting:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete";
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  const handleDeleteReply = (replyId: string) => {
    setDeleteTarget({ id: replyId, type: "reply" });
    setDeleteTargetReplyCount(0);
    setShowDeleteConfirm(true);
  };

  const handlePinMessage = async (messageId: string) => {
    await messagesHook.handlePinMessage(messageId);
  };

  const toggleExpanded = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId);
  };

  const handleMentionClick = (messageId: string) => {
    setExpandedMessage(messageId);
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        // Use 'start' on mobile for better UX
        const isMobile = window.innerWidth < 640;
        messageElement.scrollIntoView({ 
          behavior: "smooth", 
          block: isMobile ? "start" : "center" 
        });
        // On mobile, don't auto-focus textarea to avoid keyboard issues
        if (!isMobile) {
          setTimeout(() => {
            const replyTextarea = messageElement.querySelector('textarea[placeholder*="reply"], textarea[placeholder*="Reply"], textarea[placeholder*="Write a reply"]') as HTMLTextAreaElement;
            if (replyTextarea) {
              replyTextarea.focus();
            }
          }, 500);
        }
      }
    }, 100);
  };

  if (messagesHook.loading) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <BasketballLoader size={80} />
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
                  messagesHook.realtimeConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={
                  messagesHook.realtimeConnected
                    ? "Real-time updates active"
                    : "Real-time updates disconnected"
                }
              />
              <span className="text-xs text-gray-400">
                {messagesHook.realtimeConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={messagesHook.loadMessages}
            className="bg-gray-100 text-gray-700 px-3 py-2.5 sm:py-2 rounded-md text-sm font-inter hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0 flex items-center justify-center"
            disabled={messagesHook.loading}
            title="Refresh messages"
          >
            {messagesHook.loading ? "Loading..." : "↻"}
          </button>
          <button
            type="button"
            onClick={() => setShowNewMessageModal(true)}
            className="bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0"
            disabled={messagesHook.submitting}
          >
            + New Message
          </button>
        </div>
      </div>

      {/* New Message Modal */}
      <MessageComposer
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onSubmit={handleNewMessage}
        submitting={messagesHook.submitting}
      />

      <div className="space-y-4">
        {messagesHook.messages.length === 0 ? (
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
          <>
            {/* Unread Mentions Section */}
            <UnreadMentions
              mentions={mentionsHook.unreadMentions}
              userId={userId}
              onMarkRead={mentionsHook.handleMarkMentionRead}
              onMarkAllRead={() => {
                mentionsHook.unreadMentions.forEach((m) =>
                  mentionsHook.handleMarkMentionRead(m.id)
                );
              }}
              onMentionClick={handleMentionClick}
            />

            {messagesHook.messages.map((message) => {
              const messageReplies = repliesHook.replies[message.id] || [];
              const isExpanded = expandedMessage === message.id;
              const isEditing = editingHook.editingMessage === message.id;

              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  replies={messageReplies}
                  isExpanded={isExpanded}
                  isEditing={isEditing}
                  editText={editingHook.editText}
                  onEditTextChange={editingHook.setEditText}
                  onStartEdit={editingHook.startEdit}
                  onCancelEdit={editingHook.cancelEdit}
                  onSaveEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onPin={handlePinMessage}
                  onToggleExpanded={toggleExpanded}
                  replyText={replyText[message.id] || ""}
                  onReplyTextChange={(text) =>
                    setReplyText((prev) => ({ ...prev, [message.id]: text }))
                  }
                  onSubmitReply={handleReply}
                  onEditReply={handleEditReply}
                  onDeleteReply={handleDeleteReply}
                  editingReply={editingHook.editingReply}
                  userId={userId}
                  isAdmin={isAdmin}
                  submitting={messagesHook.submitting || repliesHook.submitting}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            // Prevent closing on backdrop click for delete confirmation
            if (e.target === e.currentTarget && !messagesHook.submitting && !repliesHook.submitting) {
              setShowDeleteConfirm(false);
              setDeleteTarget(null);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl my-auto">
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
              {deleteTarget?.type === "message" && deleteTargetReplyCount > 0 && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 font-semibold">
                    ⚠️ This message has {deleteTargetReplyCount} {deleteTargetReplyCount === 1 ? "reply" : "replies"}
                  </p>
                  {!isAdmin && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Only admins can delete messages with replies.
                    </p>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. The {deleteTarget?.type} will be
                permanently removed from the message board.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    devLog("Cancel button clicked");
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
                  disabled={messagesHook.submitting || repliesHook.submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!messagesHook.submitting && !repliesHook.submitting) {
                      devLog("Delete button clicked in modal");
                      confirmDelete();
                    }
                  }}
                  disabled={messagesHook.submitting || repliesHook.submitting}
                  style={{
                    minWidth: "100px",
                    minHeight: "44px",
                    padding: "10px 24px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "white",
                    backgroundColor: "#dc2626",
                    border: "2px solid #b91c1c",
                    borderRadius: "6px",
                    cursor: (messagesHook.submitting || repliesHook.submitting) ? "not-allowed" : "pointer",
                    opacity: (messagesHook.submitting || repliesHook.submitting) ? 0.5 : 1,
                    display: "inline-block",
                    textAlign: "center",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.2s ease-in-out",
                    touchAction: "manipulation",
                  }}
                  className="sm:min-h-0"
                  onMouseEnter={(e) => {
                    if (!messagesHook.submitting && !repliesHook.submitting) {
                      e.currentTarget.style.backgroundColor = "#b91c1c";
                      e.currentTarget.style.boxShadow =
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!messagesHook.submitting && !repliesHook.submitting) {
                      e.currentTarget.style.backgroundColor = "#dc2626";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                    }
                  }}
                >
                  {(messagesHook.submitting || repliesHook.submitting) ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profanity Validation Modal */}
      {showProfanityModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              setShowProfanityModal(false);
              setProfanityErrors([]);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl my-auto">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
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
                Inappropriate Language Detected
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Please review and correct the following issues:
              </p>
              <div className="text-left mb-6">
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {profanityErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfanityModal(false);
                    setProfanityErrors([]);
                  }}
                  className="px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors touch-manipulation min-h-[44px] sm:min-h-0 w-full sm:w-auto"
                >
                  I&apos;ll Fix This
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
