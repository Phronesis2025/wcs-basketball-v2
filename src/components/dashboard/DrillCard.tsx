// src/components/dashboard/DrillCard.tsx
import React from "react";

interface DrillCardProps {
  title: string;
  category: "Offense" | "Defense" | "Conditioning" | "Fundamentals";
  duration: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DrillCard({
  title,
  category,
  duration,
  skillLevel,
  onEdit,
  onDelete,
}: DrillCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Offense":
        return "bg-red-500";
      case "Defense":
        return "bg-blue-600";
      case "Conditioning":
        return "bg-green-500";
      case "Fundamentals":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-gray-200 text-gray-700";
      case "Intermediate":
        return "bg-blue-100 text-blue-700";
      case "Advanced":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-inter font-semibold text-gray-900">{title}</h4>
          <div className="flex items-center space-x-2 mt-2">
            <span
              className={`text-white text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(
                category
              )}`}
            >
              {category}
            </span>
            <span className="text-sm text-gray-600 font-inter">{duration}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${getSkillLevelColor(
              skillLevel
            )}`}
          >
            {skillLevel}
          </span>
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
    </div>
  );
}
