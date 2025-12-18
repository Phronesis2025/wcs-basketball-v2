import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CoachMessage } from "@/types/supabase";
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  pinMessage,
} from "@/lib/messageActions";
import { devLog, devError, validateInput } from "@/lib/security";
import toast from "react-hot-toast";

interface UseMessagesProps {
  userId: string;
  userName: string;
  isAdmin: boolean;
  onRefresh?: () => void;
}

export function useMessages({
  userId,
  userName,
  isAdmin,
  onRefresh,
}: UseMessagesProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      devLog("Loading messages...");
      setLoading(true);
      const messagesData = await getMessages();
      devLog("Loaded messages:", messagesData.length);
      setMessages(messagesData);
    } catch (error) {
      devError("Error loading messages:", error);
      if (
        error instanceof Error &&
        error.message.includes("tables not yet created")
      ) {
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Don't set up subscription if userId is missing
    if (!userId || userId.trim() === "") {
      devLog("Skipping real-time subscription setup - userId is missing");
      return;
    }

    devLog("Setting up real-time subscription for user:", userId);

    const channel = supabase
      .channel("coach-messages", {
        config: {
          broadcast: { self: true },
          presence: { key: userId },
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
      .subscribe((status) => {
        devLog("Real-time subscription status:", status);
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      devLog("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, loadMessages]);

  // Create new message
  const handleNewMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || submitting) return;

      if (!userId || userId === "") {
        toast.error(
          "User session not ready. Please wait a moment and try again.",
          {
            duration: 4000,
            position: "top-right",
          }
        );
        return;
      }

      // Validate message for profanity
      const validation = validateInput(messageText, "message");
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      try {
        setSubmitting(true);

        // Fetch current coach name from database
        let currentCoachName = userName;
        try {
          const { data: coachRows, error: coachError } = await supabase
            .from("coaches")
            .select("first_name, last_name")
            .eq("user_id", userId)
            .limit(1);

          if (!coachError && coachRows && Array.isArray(coachRows) && coachRows[0]) {
            currentCoachName = `${coachRows[0].first_name} ${coachRows[0].last_name}`;
          }
        } catch (error) {
          devError("Error fetching coach name for message:", error);
        }

        const created = await createMessage(
          validation.sanitizedValue,
          userId,
          currentCoachName
        );
        // Optimistically prepend the new message
        setMessages((prev) => [created, ...prev]);
        toast.success("Message posted successfully", {
          duration: 3000,
          position: "top-right",
        });
        onRefresh?.();
        return { success: true };
      } catch (error) {
        devError("Error creating message:", error);
        toast.error("Failed to create message. Please try again.", {
          duration: 4000,
          position: "top-right",
        });
        return { success: false, error };
      } finally {
        setSubmitting(false);
      }
    },
    [userId, userName, submitting, onRefresh]
  );

  // Edit message
  const handleEditMessage = useCallback(
    async (messageId: string, editText: string) => {
      if (!editText.trim() || submitting) return;

      // Validate edited message for profanity
      const validation = validateInput(editText, "message");
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      try {
        setSubmitting(true);
        await updateMessage(messageId, validation.sanitizedValue, userId, isAdmin);
        toast.success("Message updated successfully", {
          duration: 3000,
          position: "top-right",
        });
        await loadMessages();
        return { success: true };
      } catch (error) {
        devError("Error updating message:", error);
        toast.error("Failed to update message. Please try again.", {
          duration: 4000,
          position: "top-right",
        });
        return { success: false, error };
      } finally {
        setSubmitting(false);
      }
    },
    [userId, isAdmin, submitting, loadMessages]
  );

  // Delete message
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      try {
        setSubmitting(true);
        devLog("Attempting to delete message:", { messageId, userId, isAdmin });

        await deleteMessage(messageId, userId, isAdmin);
        toast.success("Message deleted successfully", {
          duration: 3000,
          position: "top-right",
        });

        devLog("Deleted successfully, refreshing messages...");
        await loadMessages();
        return { success: true };
      } catch (error) {
        devError("Error deleting message:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete message";
        // Check if error is about replies
        if (errorMessage.includes("replies") || errorMessage.includes("reply")) {
          toast.error(errorMessage, {
            duration: 5000,
            position: "top-right",
          });
          return { success: false, error: errorMessage, hasReplies: true };
        }
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-right",
        });
        return { success: false, error: errorMessage };
      } finally {
        setSubmitting(false);
      }
    },
    [userId, isAdmin, loadMessages]
  );

  // Pin message
  const handlePinMessage = useCallback(
    async (messageId: string) => {
      try {
        setSubmitting(true);
        await pinMessage(messageId, isAdmin);
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          toast.success(message.is_pinned ? "Message unpinned" : "Message pinned", {
            duration: 3000,
            position: "top-right",
          });
        }
        await loadMessages();
        return { success: true };
      } catch (error) {
        devError("Error pinning message:", error);
        toast.error("Failed to pin/unpin message. Please try again.", {
          duration: 4000,
          position: "top-right",
        });
        return { success: false, error };
      } finally {
        setSubmitting(false);
      }
    },
    [isAdmin, messages, loadMessages]
  );

  return {
    messages,
    loading,
    submitting,
    realtimeConnected,
    loadMessages,
    handleNewMessage,
    handleEditMessage,
    handleDeleteMessage,
    handlePinMessage,
  };
}

