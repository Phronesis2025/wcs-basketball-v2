// src/components/calendar/MobileMonth.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Schedule, Team } from "@/types/supabase";
import { eventTypeToColor } from "@/lib/calendarColors";
import {
  buildMonthMatrix,
  formatDateKeyChicago,
  isSameMonth,
} from "@/lib/date";

type MobileMonthProps = {
  events: Schedule[];
  teams: Team[];
  onSelectEvent: (event: Schedule) => void;
  currentDate?: Date;
  maxVisiblePerDay?: number;
};

export default function MobileMonth({
  events,
  teams,
  onSelectEvent,
  currentDate,
  maxVisiblePerDay = 3,
}: MobileMonthProps) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [viewDate, setViewDate] = useState<Date>(currentDate ?? new Date());

  // keep view in sync if parent changes (only when month/year differs)
  useEffect(() => {
    if (!currentDate) return;
    if (
      currentDate.getFullYear() !== viewDate.getFullYear() ||
      currentDate.getMonth() !== viewDate.getMonth()
    ) {
      setViewDate(currentDate);
    }
    // intentionally omit viewDate from deps to avoid update loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const teamsById = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const evt of events) {
      const key = formatDateKeyChicago(new Date(evt.date_time));
      const arr = map.get(key) || [];
      arr.push(evt);
      map.set(key, arr);
    }
    // Stable order: by time then type
    for (const [k, arr] of map) {
      arr.sort(
        (a, b) =>
          new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      );
      map.set(k, arr);
    }
    return map;
  }, [events]);

  const days = useMemo(() => buildMonthMatrix(viewDate), [viewDate]);
  const todayKey = useMemo(() => formatDateKeyChicago(new Date()), []);

  return (
    <div className="w-full">
      {/* Month navigation (top) */}
      <div className="mb-3 grid grid-cols-3 items-center">
        <div className="justify-self-start">
          <button
            onClick={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
              )
            }
            className="px-3 py-1 text-sm bg-gray-800 text-gray-200 rounded-md"
            aria-label="Previous month"
          >
            Prev
          </button>
        </div>
        <div className="justify-self-center text-base font-inter text-gray-200">
          {viewDate.toLocaleString("en-US", { month: "long" })}
        </div>
        <div className="justify-self-end">
          <button
            onClick={() =>
              setViewDate(
                new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
              )
            }
            className="px-3 py-1 text-sm bg-gray-800 text-gray-200 rounded-md"
            aria-label="Next month"
          >
            Next
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-2 grid grid-cols-4 gap-2 text-xs font-inter text-gray-300">
        {(["Game", "Practice", "Tournament", "Update"] as const).map((t) => {
          const { bg, text, ring } = eventTypeToColor(t);
          return (
            <div key={t} className="flex items-center justify-center">
              <span
                className={`w-full max-w-[90px] inline-flex items-center justify-center h-[14px] rounded-sm ${bg} ${text} ring-1 ${ring}`}
              >
                <span className="text-[9px] leading-none">{t}</span>
              </span>
            </div>
          );
        })}
      </div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-xs font-inter text-gray-300 mb-2">
        {"SMTWTFS".split("").map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-px sm:gap-1">
        {days.map((day, idx) => {
          const dateKey = formatDateKeyChicago(day);
          const dayEvents = eventsByDate.get(dateKey) || [];
          const inMonth = isSameMonth(day, viewDate);
          const isToday = dateKey === todayKey;
          const isExpanded = !!expandedDays[dateKey];
          const visibleEvents = isExpanded
            ? dayEvents
            : dayEvents.slice(0, maxVisiblePerDay);

          return (
            <div
              key={idx}
              className={`min-h-24 px-0.5 sm:px-1 py-1 rounded-md border ${
                isToday
                  ? "border-white bg-[rgba(41,49,70,1)]"
                  : inMonth
                  ? "border-red-500/30"
                  : "border-gray-800 bg-gray-900/30"
              }`}
            >
              <div className="text-right text-xs text-gray-400 mb-1">
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {visibleEvents.map((evt) => {
                  const { bg, text, ring } = eventTypeToColor(evt.event_type);
                  const rawName =
                    evt.is_global || !evt.team_id
                      ? "All Teams"
                      : teamsById.get(evt.team_id)?.name || "Team";
                  const teamName = rawName.replace(/^\s*WCS\s*/i, "").trim();
                  return (
                    <button
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className={`w-full min-w-0 inline-flex items-center justify-center md:justify-between px-1 h-[14px] rounded-sm ${bg} ${text} ring-1 ${ring} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black`}
                      title={teamName}
                    >
                      <span className="truncate text-[8px] leading-none font-light font-inter md:flex-1 md:text-left">
                        {teamName}
                      </span>
                      <span className="hidden md:inline text-[8px] leading-none font-light font-inter ml-1 whitespace-nowrap">
                        {new Date(evt.date_time).toLocaleTimeString("en-US", {
                          timeZone: "America/Chicago",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </button>
                  );
                })}

                {dayEvents.length > maxVisiblePerDay && !isExpanded && (
                  <button
                    onClick={() =>
                      setExpandedDays((s) => ({ ...s, [dateKey]: true }))
                    }
                    className="w-full text-center text-[11px] text-gray-300 bg-gray-800/60 rounded-md py-px"
                  >
                    +{dayEvents.length - maxVisiblePerDay} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
