// src/components/dashboard/DrillCard.tsx
import React from "react";
import Image from "next/image";
import { PracticeDrill } from "../../types/supabase";

interface DrillCardProps {
  drill: PracticeDrill;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DrillCard({ drill, onEdit, onDelete }: DrillCardProps) {
  const getCategoryColor = (category: string) => {
    // Normalize the category by trimming whitespace and converting to lowercase for comparison
    const normalizedCategory = category?.trim().toLowerCase();

    // Use case-insensitive matching
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

  const formatDuration = (time: string) => {
    // If it's just a number, add "minutes"
    if (/^\d+$/.test(time.trim())) {
      return `${time} minutes`;
    }
    // If it already contains time units, return as is
    return time;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-inter font-semibold text-gray-900">
            {drill.title}
          </h4>
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(
                drill.category
              )}`}
            >
              {drill.category}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(
                drill.difficulty
              )}`}
            >
              {drill.difficulty}
            </span>
            <span className="text-sm text-gray-600 font-inter">
              {formatDuration(drill.time)}
            </span>
          </div>
        </div>
        {onEdit && onDelete && (
          <div className="flex space-x-1">
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Edit drill"
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
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-600 p-1"
              aria-label="Delete drill"
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
          </div>
        )}
      </div>
    </div>
  );
}
