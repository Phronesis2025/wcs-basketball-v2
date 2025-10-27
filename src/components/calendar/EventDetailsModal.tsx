// src/components/calendar/EventDetailsModal.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { Schedule, Team } from "@/types/supabase";
import { eventTypeToColor } from "@/lib/calendarColors";
import { formatDateTimeChicago } from "@/lib/date";
import { useScrollLock } from "@/hooks/useScrollLock";

type Props = {
  isOpen: boolean;
  event: Schedule | null;
  teams: Team[];
  onClose: () => void;
};

export default function EventDetailsModal({
  isOpen,
  event,
  teams,
  onClose,
}: Props) {
  // Lock scroll when modal is open
  useScrollLock(isOpen);

  const ref = useRef<HTMLDivElement>(null);
  const firstBtnRef = useRef<HTMLButtonElement>(null);

  const teamName = (() => {
    if (!event) return "";
    if (event.is_global || !event.team_id) return "All Teams";
    const t = teams.find((t) => t.id === event.team_id);
    return t?.name || "Team";
  })();

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // focus first button
    firstBtnRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const { bg, text } = eventTypeToColor(event.event_type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Event details"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="w-full max-w-md max-h-[90vh] bg-gray-900 border border-red-500/40 rounded-lg shadow-xl flex flex-col"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div
            className={`px-2 py-1 rounded-full text-xs font-inter ${bg} ${text}`}
          >
            {event.event_type}
          </div>
          <button
            ref={firstBtnRef}
            onClick={onClose}
            className="text-gray-300 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-3 text-gray-200 font-inter overflow-y-auto flex-1">
          <div>
            <div className="text-sm text-gray-400">Team</div>
            <div className="text-base">{teamName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Date & Time</div>
            <div className="text-base">
              {formatDateTimeChicago(new Date(event.date_time))}
            </div>
          </div>
          {event.location && (
            <div>
              <div className="text-sm text-gray-400">Location</div>
              <div className="text-base">{event.location}</div>
            </div>
          )}
          {event.opponent && (
            <div>
              <div className="text-sm text-gray-400">Opponent</div>
              <div className="text-base">{event.opponent}</div>
            </div>
          )}
          {event.description && (
            <div>
              <div className="text-sm text-gray-400">Details</div>
              <div className="text-base whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-md py-2 font-inter"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
