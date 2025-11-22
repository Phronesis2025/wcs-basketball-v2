// src/components/dashboard/coach-profile/hooks/useMentions.ts
import { useState, useEffect, useCallback } from "react";
import { devLog, devError } from "@/lib/security";
import { getMessages, getUnreadMentionCount } from "@/lib/messageActions";
import { CoachMessage } from "@/types/supabase";

interface UseMentionsProps {
  userId: string | null;
  activeSection: string;
}

export const useMentions = ({ userId, activeSection }: UseMentionsProps) => {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [unreadMentions, setUnreadMentions] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    try {
      devLog("Fetching messages for profile...");
      const messagesData = await getMessages();
      setMessages(messagesData);
      devLog("Messages loaded:", messagesData.length);
    } catch (error) {
      devError("Error fetching messages:", error);
      setMessages([]);
    }
  }, [userId]);

  const fetchUnreadMentions = useCallback(async () => {
    if (!userId) return;
    try {
      const count = await getUnreadMentionCount(userId);
      setUnreadMentions(count);
      devLog("Unread mentions:", count);
    } catch (error) {
      devError("Error fetching unread mentions:", error);
      setUnreadMentions(0);
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchUnreadMentions();

    // Set up interval to refresh count periodically when on messages section
    if (activeSection === "messages") {
      const interval = setInterval(fetchUnreadMentions, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [userId, messages, activeSection, fetchUnreadMentions]);

  return {
    messages,
    unreadMentions,
    fetchUnreadMentions,
  };
};

