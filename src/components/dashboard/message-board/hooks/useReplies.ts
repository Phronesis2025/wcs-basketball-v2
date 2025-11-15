import { useState, useCallback } from "react";
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

  // Load replies for a message
  const loadReplies = useCallback(async (messageId: string) => {
    try {
      const repliesData = await getMessageReplies(messageId);
      setReplies((prev) => ({
        ...prev,
        [messageId]: repliesData,
      }));
    } catch (error) {
      devError("Error loading replies:", error);
    }
  }, []);

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
    handleReply,
    handleEditReply,
    handleDeleteReply,
  };
}

