// src/components/dashboard/ViewModal.tsx
import React from "react";
import { Schedule, TeamUpdate, PracticeDrill } from "../../types/supabase";
import { useScrollLock } from "@/hooks/useScrollLock";
import { sanitizeInput } from "../../lib/security";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Schedule | TeamUpdate | PracticeDrill | null;
  itemType: "game" | "practice" | "update" | "drill";
}

export default function ViewModal({
  isOpen,
  onClose,
  item,
  itemType,
}: ViewModalProps) {
  // Lock scroll when modal is open
  useScrollLock(isOpen);

  if (!isOpen || !item) return null;

  const formatDateTimeChicago = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCategoryColor = (category: string) => {
    const normalizedCategory = category?.trim().toLowerCase();
    if (normalizedCategory === "drill") {
      return "bg-blue-100 text-blue-700";
    } else if (normalizedCategory === "warm-up") {
      return "bg-green-100 text-green-700";
    } else if (normalizedCategory === "conditioning") {
      return "bg-orange-100 text-orange-700";
    } else if (normalizedCategory === "skill development") {
      return "bg-purple-100 text-purple-700";
    } else if (normalizedCategory === "team building") {
      return "bg-yellow-100 text-yellow-700";
    } else {
      return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Basic":
        return "bg-gray-100 text-gray-700";
      case "Intermediate":
        return "bg-blue-100 text-blue-700";
      case "Advanced":
        return "bg-orange-100 text-orange-700";
      case "Expert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const renderGameDetails = (schedule: Schedule) => (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bebas text-gray-900 mb-2">
          vs {sanitizeInput(schedule.opponent || "TBD")}
        </h2>
        <div className="text-lg text-gray-600">
          {formatDateTimeChicago(schedule.date_time)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Location:</span>
          <span className="text-gray-900">
            {sanitizeInput(schedule.location || "TBD")}
          </span>
        </div>

        {schedule.description && (
          <div className="py-2">
            <span className="font-semibold text-gray-700 block mb-2">
              Description:
            </span>
            <p className="text-gray-900">
              {sanitizeInput(schedule.description)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Event Type:</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {schedule.event_type}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="font-semibold text-gray-700">Created:</span>
          <span className="text-gray-900">
            {formatDateTimeChicago(schedule.created_at)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderPracticeDetails = (schedule: Schedule) => (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bebas text-gray-900 mb-2">
          {sanitizeInput(schedule.description || "Practice Session")}
        </h2>
        <div className="text-lg text-gray-600">
          {formatDateTimeChicago(schedule.date_time)}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Location:</span>
          <span className="text-gray-900">
            {sanitizeInput(schedule.location || "TBD")}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Event Type:</span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            {schedule.event_type}
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="font-semibold text-gray-700">Created:</span>
          <span className="text-gray-900">
            {formatDateTimeChicago(schedule.created_at)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderUpdateDetails = (update: TeamUpdate) => (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bebas text-gray-900 mb-2">
          {sanitizeInput(update.title)}
        </h2>
        <div className="text-lg text-gray-600">
          {update.date_time
            ? formatDateTimeChicago(update.date_time)
            : formatDateTimeChicago(update.created_at)}
        </div>
      </div>

      <div className="space-y-3">
        {update.content && (
          <div className="py-2">
            <span className="font-semibold text-gray-700 block mb-2">
              Content:
            </span>
            <p className="text-gray-900 whitespace-pre-wrap">
              {sanitizeInput(update.content)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Type:</span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            Team Update
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="font-semibold text-gray-700">Created:</span>
          <span className="text-gray-900">
            {formatDateTimeChicago(update.created_at)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderDrillDetails = (drill: PracticeDrill) => (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bebas text-gray-900 mb-2">
          {sanitizeInput(drill.title)}
        </h2>
        <div className="text-lg text-gray-600">
          {formatDuration(drill.time)}
        </div>
      </div>

      <div className="space-y-3">
        {drill.instructions && (
          <div className="py-2">
            <span className="font-semibold text-gray-700 block mb-2">
              Instructions:
            </span>
            <p className="text-gray-900 whitespace-pre-wrap">
              {sanitizeInput(drill.instructions)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Category:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
              drill.category
            )}`}
          >
            {sanitizeInput(drill.category)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Difficulty:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
              drill.difficulty
            )}`}
          >
            {sanitizeInput(drill.difficulty)}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="font-semibold text-gray-700">Duration:</span>
          <span className="text-gray-900">
            {sanitizeInput(formatDuration(drill.time))}
          </span>
        </div>

        {drill.skills && drill.skills.length > 0 && (
          <div className="py-2">
            <span className="font-semibold text-gray-700 block mb-2">
              Skills:
            </span>
            <div className="flex flex-wrap gap-2">
              {drill.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
                >
                  {sanitizeInput(skill)}
                </span>
              ))}
            </div>
          </div>
        )}

        {drill.equipment && drill.equipment.length > 0 && (
          <div className="py-2">
            <span className="font-semibold text-gray-700 block mb-2">
              Equipment:
            </span>
            <div className="flex flex-wrap gap-2">
              {drill.equipment.map((item, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                >
                  {sanitizeInput(item)}
                </span>
              ))}
            </div>
          </div>
        )}

        {drill.benefits && (
          <div className="py-2">
            <span className="font-semibold text-gray-700 block mb-2">
              Benefits:
            </span>
            <p className="text-gray-900 whitespace-pre-wrap">
              {sanitizeInput(drill.benefits)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <span className="font-semibold text-gray-700">Created:</span>
          <span className="text-gray-900">
            {formatDateTimeChicago(drill.created_at)}
          </span>
        </div>
      </div>
    </div>
  );

  const formatDuration = (time: string) => {
    if (/^\d+$/.test(time.trim())) {
      return `${time} minutes`;
    }
    return time;
  };

  const renderContent = () => {
    switch (itemType) {
      case "game":
        return renderGameDetails(item as Schedule);
      case "practice":
        return renderPracticeDetails(item as Schedule);
      case "update":
        return renderUpdateDetails(item as TeamUpdate);
      case "drill":
        return renderDrillDetails(item as PracticeDrill);
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bebas text-gray-900">
              {itemType === "game" && "Game Details"}
              {itemType === "practice" && "Practice Details"}
              {itemType === "update" && "Update Details"}
              {itemType === "drill" && "Drill Details"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {renderContent()}

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-md font-inter hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
