// src/components/dashboard/message-board/hooks/useEditing.ts
import { useState, useCallback } from "react";
import { CoachMessage, CoachMessageReply } from "@/types/supabase";

export const useEditing = () => {
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  const startEdit = useCallback(
    (item: CoachMessage | CoachMessageReply, type: "message" | "reply") => {
      setEditText(item.content);
      if (type === "message") {
        setEditingMessage(item.id);
      } else {
        setEditingReply(item.id);
      }
    },
    []
  );

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setEditingReply(null);
    setEditText("");
  }, []);

  return {
    editingMessage,
    editingReply,
    editText,
    setEditText,
    startEdit,
    cancelEdit,
  };
};

