// src/components/dashboard/PracticeCard.tsx
import React from "react";
import { Schedule } from "../../types/supabase";

interface PracticeCardProps {
  schedule: Schedule;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (id: string) => void;
  onView?: (schedule: Schedule) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function PracticeCard({
  schedule,
  onEdit,
  onDelete,
  onView,
  canEdit = true,
  canDelete = true,
}: PracticeCardProps) {
  const formatDateTimeChicago = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      day: date.toLocaleDateString("en-US", {
        timeZone: "America/Chicago",
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Mock duration - in real app this would come from schedule data
  const duration = "2h";

  const { day, time } = formatDateTimeChicago(schedule.date_time);

  return (
    <div
      className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView?.(schedule)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-inter font-semibold text-gray-900 text-sm sm:text-base truncate">
            {schedule.description || "Practice Session"}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
            <p className="text-xs sm:text-sm text-gray-500 font-inter">{day}</p>
            <p className="text-xs sm:text-sm text-gray-600 font-inter">
              {time} • {duration}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {onEdit && onDelete && canEdit && canDelete && (
            <div className="flex space-x-1">
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(schedule);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Edit practice"
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
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(schedule.id);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1"
                  aria-label="Delete practice"
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
          )}
        </div>
      </div>
    </div>
  );
}
