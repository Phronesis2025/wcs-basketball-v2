"use client";

import React from "react";

interface RecurringScheduleConfigProps {
  isRecurring: boolean;
  onRecurringChange: (isRecurring: boolean) => void;
  recurringType: "count" | "date";
  onRecurringTypeChange: (type: "count" | "date") => void;
  recurringCount: number;
  onRecurringCountChange: (count: number) => void;
  recurringEndDate: string;
  onRecurringEndDateChange: (date: string) => void;
  selectedDays: number[];
  onToggleDay: (dayIndex: number) => void;
}

const days = [
  { letter: "S", name: "Sunday" },
  { letter: "M", name: "Monday" },
  { letter: "T", name: "Tuesday" },
  { letter: "W", name: "Wednesday" },
  { letter: "T", name: "Thursday" },
  { letter: "F", name: "Friday" },
  { letter: "S", name: "Saturday" },
];

export default function RecurringScheduleConfig({
  isRecurring,
  onRecurringChange,
  recurringType,
  onRecurringTypeChange,
  recurringCount,
  onRecurringCountChange,
  recurringEndDate,
  onRecurringEndDateChange,
  selectedDays,
  onToggleDay,
}: RecurringScheduleConfigProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        <input
          type="checkbox"
          id="is-recurring"
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label
          htmlFor="is-recurring"
          className="text-sm font-inter font-medium text-gray-700"
        >
          Reoccurring
        </label>
      </div>

      {isRecurring && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
              Every
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="4"
                value="1"
                className="w-16 p-2 border border-gray-300 rounded-md text-center text-gray-900"
                disabled
              />
              <select className="p-2 border border-gray-300 rounded-md text-gray-900">
                <option value="week">Week(s)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
              Repeat on:
            </label>
            <div className="flex space-x-2">
              {days.map((day, index) => (
                <button
                  key={`${day.name}-${index}`}
                  type="button"
                  onClick={() => onToggleDay(index)}
                  className={`w-10 h-10 rounded-full text-xs font-medium transition-colors ${
                    selectedDays.includes(index)
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                  title={day.name}
                >
                  {day.letter}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
              Ends
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="end-option"
                  value="count"
                  checked={recurringType === "count"}
                  onChange={() => onRecurringTypeChange("count")}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">After</span>
                <input
                  type="number"
                  min="2"
                  max="52"
                  value={recurringCount}
                  onChange={(e) =>
                    onRecurringCountChange(parseInt(e.target.value) || 4)
                  }
                  className="w-16 p-2 border border-gray-300 rounded-md text-center text-gray-900"
                />
                <span className="text-sm text-gray-700">times</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="end-option"
                  value="date"
                  checked={recurringType === "date"}
                  onChange={() => onRecurringTypeChange("date")}
                  className="w-4 h-4 text-blue-600 border-gray-300"
                />
                <span className="text-sm text-gray-700">On</span>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => onRecurringEndDateChange(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-gray-900"
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

