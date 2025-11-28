import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CoachMessageReply } from "@/types/supabase";
import {
  getMessageReplies,
  createReply,
  updateReply,
  deleteReply,
} from "@/lib/messageActions";
import { devError, validateInput } from "@/lib/security";
import toast from "react-hot-toast";

interface UseRepliesProps {
  userId: string;
  userName: string;
  isAdmin: boolean;
  onRefresh?: () => void;
}

export function useReplies({
  userId,
  userName,
  isAdmin,
  onRefresh,
}: UseRepliesProps) {
  const [replies, setReplies] = useState<Record<string, CoachMessageReply[]>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);

  // Load replies for a single message (used when a reply is added/edited)
  const loadReplies = useCallback(async (messageId: string) => {
    try {
      const repliesData = await getMessageReplies(messageId);
      setReplies((prev) => ({
        ...prev,
        [messageId]: repliesData || [],
      }));
    } catch (error) {
      devError("Error loading replies:", error);
      // Set empty array on error to prevent undefined state
      setReplies((prev) => ({
        ...prev,
        [messageId]: [],
      }));
    }
  }, []);

  // Load replies for many messages in a single batched query to avoid
  // hammering Supabase with dozens of parallel requests (which causes
  // net::ERR_INSUFFICIENT_RESOURCES in the browser).
  const loadRepliesForMessages = useCallback(
    async (messageIds: string[]) => {
      if (!messageIds || messageIds.length === 0) return;

      try {
        const { data, error } = await supabase
          .from("coach_message_replies")
          .select("*")
          .in("message_id", messageIds)
          .is("deleted_at", null)
          .order("created_at", { ascending: true });

        if (error) {
          // Check if table doesn't exist first (before logging error)
          const errorMessage = error.message || String(error) || "";
          const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
          
          if (
            errorMessage.includes("relation") &&
            errorMessage.includes("does not exist")
          ) {
            // Table doesn't exist yet - this is expected during initial setup
            // Set empty arrays for all message IDs and return silently
            const emptyReplies: Record<string, CoachMessageReply[]> = {};
            messageIds.forEach((msgId) => {
              emptyReplies[msgId] = [];
            });
            setReplies((prev) => ({
              ...prev,
              ...emptyReplies,
            }));
            return;
          }

          // For other errors, log with better serialization
          devError("Error loading replies batch:", {
            errorMessage,
            errorString,
            errorDetails: {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            },
            messageIds,
            messageIdsCount: messageIds.length,
          });
          
          // Set empty arrays for all message IDs on error to prevent undefined state
          const emptyReplies: Record<string, CoachMessageReply[]> = {};
          messageIds.forEach((msgId) => {
            emptyReplies[msgId] = [];
          });
          setReplies((prev) => ({
            ...prev,
            ...emptyReplies,
          }));
          return;
        }

        const grouped: Record<string, CoachMessageReply[]> = {};
        (data || []).forEach((reply: any) => {
          const msgId = reply.message_id;
          if (!msgId) return;
          if (!grouped[msgId]) grouped[msgId] = [];
          grouped[msgId].push(reply as CoachMessageReply);
        });

        // Also ensure all messageIds have an entry (even if empty)
        messageIds.forEach((msgId) => {
          if (!grouped[msgId]) {
            grouped[msgId] = [];
          }
        });

        setReplies((prev) => ({
          ...prev,
          ...grouped,
        }));
      } catch (error) {
        // Log the full error details for debugging with better serialization
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorString = error instanceof Error 
          ? JSON.stringify(error, Object.getOwnPropertyNames(error))
          : JSON.stringify(error);
        
        devError("Error loading replies batch (catch block):", {
          errorMessage,
          errorString,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          messageIds,
          messageIdsCount: messageIds.length,
        });
        
        // Set empty arrays for all message IDs on error to prevent undefined state
        const emptyReplies: Record<string, CoachMessageReply[]> = {};
        messageIds.forEach((msgId) => {
          emptyReplies[msgId] = [];
        });
        setReplies((prev) => ({
          ...prev,
          ...emptyReplies,
        }));
      }
    },
    []
  );

  // Create reply
  const handleReply = useCallback(
    async (messageId: string, replyText: string) => {
      if (!replyText.trim() || submitting) return;

      // Validate reply for profanity
      const validation = validateInput(replyText, "reply");
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      try {
        setSubmitting(true);
        const created = await createReply(
          messageId,
          validation.sanitizedValue,
          userId,
          userName
        );
        // Optimistically append the new reply
        setReplies((prev) => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), created],
        }));
        toast.success("Reply posted successfully", {
          duration: 3000,
          position: "top-right",
        });
        onRefresh?.();
        return { success: true };
      } catch (error) {
        devError("Error creating reply:", error);
        toast.error("Failed to create reply. Please try again.", {
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

  // Edit reply
  const handleEditReply = useCallback(
    async (replyId: string, editText: string) => {
      if (!editText.trim() || submitting) return;

      // Validate edited reply for profanity
      const validation = validateInput(editText, "reply");
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      try {
        setSubmitting(true);
        await updateReply(replyId, validation.sanitizedValue, userId, isAdmin);
        toast.success("Reply updated successfully", {
          duration: 3000,
          position: "top-right",
        });
        // Reload replies for all messages to reflect the update
        const messageIds = Object.keys(replies);
        for (const messageId of messageIds) {
          await loadReplies(messageId);
        }
        return { success: true };
      } catch (error) {
        devError("Error updating reply:", error);
        toast.error("Failed to update reply. Please try again.", {
          duration: 4000,
          position: "top-right",
        });
        return { success: false, error };
      } finally {
        setSubmitting(false);
      }
    },
    [userId, isAdmin, submitting, replies, loadReplies]
  );

  // Delete reply
  const handleDeleteReply = useCallback(
    async (replyId: string) => {
      try {
        setSubmitting(true);
        await deleteReply(replyId, userId, isAdmin);
        toast.success("Reply deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
        // Reload replies for all messages to reflect the deletion
        const messageIds = Object.keys(replies);
        for (const messageId of messageIds) {
          await loadReplies(messageId);
        }
        onRefresh?.();
        return { success: true };
      } catch (error) {
        devError("Error deleting reply:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete reply";
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-right",
        });
        return { success: false, error: errorMessage };
      } finally {
        setSubmitting(false);
      }
    },
    [userId, isAdmin, replies, loadReplies, onRefresh]
  );

  return {
    replies,
    submitting,
    loadReplies,
    loadRepliesForMessages,
    handleReply,
    handleEditReply,
    handleDeleteReply,
  };
}

