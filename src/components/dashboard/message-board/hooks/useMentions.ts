// src/components/dashboard/message-board/hooks/useMentions.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getUnreadMentionsForUser,
  markMentionAsRead,
} from "@/lib/messageActions";
import { devLog, devError } from "@/lib/security";

interface UseMentionsProps {
  userId: string;
  onMentionRead?: () => void;
}

export const useMentions = ({ userId, onMentionRead }: UseMentionsProps) => {
  const [unreadMentions, setUnreadMentions] = useState<any[]>([]);
  const [loadingMentions, setLoadingMentions] = useState(false);

  const loadUnreadMentions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoadingMentions(true);
      const mentions = await getUnreadMentionsForUser(userId);
      setUnreadMentions(mentions);
    } catch (error) {
      devError("Error loading unread mentions:", error);
    } finally {
      setLoadingMentions(false);
    }
  }, [userId]);

  const handleMarkMentionRead = useCallback(
    async (mentionId: string) => {
      try {
        await markMentionAsRead(mentionId);
        setUnreadMentions((prev) =>
          prev.filter((m) => m.id !== mentionId)
        );
        onMentionRead?.();
      } catch (error) {
        devError("Error marking mention as read:", error);
      }
    },
    [onMentionRead]
  );

  // Set up real-time subscription for mentions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("message-notifications", {
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
          table: "message_notifications",
          filter: `mentioned_user_id=eq.${userId}`,
        },
        (payload) => {
          devLog("New mention notification:", payload);
          loadUnreadMentions();
        }
      )
      .subscribe((status) => {
        devLog("Mention subscription status:", status);
      });

    // Load initial mentions
    loadUnreadMentions();

    return () => {
      devLog("Cleaning up mention subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, loadUnreadMentions]);

  return {
    unreadMentions,
    loadingMentions,
    loadUnreadMentions,
    handleMarkMentionRead,
  };
};

