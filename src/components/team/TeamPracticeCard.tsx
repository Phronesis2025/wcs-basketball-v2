// src/components/team/TeamPracticeCard.tsx
import React from "react";
import { Schedule } from "../../types/supabase";

interface TeamPracticeCardProps {
  schedule: Schedule;
}

export default function TeamPracticeCard({ schedule }: TeamPracticeCardProps) {
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

  const { day, time } = formatDateTimeChicago(schedule.date_time);

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-inter font-semibold text-gray-900 text-sm sm:text-base truncate">
            {schedule.description || "Practice Session"}
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
            <p className="text-xs sm:text-sm text-gray-500 font-inter">{day}</p>
            <p className="text-xs sm:text-sm text-gray-600 font-inter">
              {time} • 2h
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {schedule.location}
          </span>
        </div>
      </div>
    </div>
  );
}
