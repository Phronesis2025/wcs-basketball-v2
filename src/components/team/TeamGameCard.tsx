// src/components/team/TeamGameCard.tsx
import React from "react";
import { Schedule } from "../../types/supabase";

interface TeamGameCardProps {
  schedule: Schedule;
}

export default function TeamGameCard({ schedule }: TeamGameCardProps) {
  const formatDateTimeChicago = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-inter font-semibold text-gray-900">
            vs {schedule.opponent || "TBD"}
          </h4>
          <p className="text-sm text-gray-500 font-inter mt-1">
            {formatDateTimeChicago(schedule.date_time)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {schedule.location}
          </span>
        </div>
      </div>
    </div>
  );
}
