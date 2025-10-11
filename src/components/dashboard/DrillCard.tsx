// src/components/dashboard/DrillCard.tsx
import React from "react";
import Image from "next/image";
import { PracticeDrill } from "../../types/supabase";

interface DrillCardProps {
  drill: PracticeDrill;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DrillCard({
  drill,
  onEdit,
  onDelete,
}: DrillCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Drill":
        return "bg-blue-500";
      case "Warm-up":
        return "bg-green-500";
      case "Conditioning":
        return "bg-red-500";
      case "Skill Development":
        return "bg-purple-500";
      case "Team Building":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
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

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-inter font-semibold text-gray-900 text-lg mb-2">
            {drill.title}
          </h4>
          <div className="flex items-center space-x-2 mb-3">
            <span
              className={`text-white text-xs font-medium px-2 py-1 rounded-full ${getCategoryColor(
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
              Week {drill.week_number}
            </span>
            <span className="text-sm text-gray-600 font-inter">
              {drill.time}
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

      {/* Skills and Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Skills Developed</h5>
          <div className="flex flex-wrap gap-1">
            {drill.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Equipment Needed</h5>
          <div className="flex flex-wrap gap-1">
            {drill.equipment.map((equipment, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
              >
                {equipment}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions Preview */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Instructions</h5>
        <p className="text-sm text-gray-600 line-clamp-3">
          {drill.instructions}
        </p>
      </div>

      {/* Benefits Preview */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits</h5>
        <p className="text-sm text-gray-600 line-clamp-2">
          {drill.benefits}
        </p>
      </div>

      {/* Additional Info (if exists) */}
      {drill.additional_info && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Info</h5>
          <p className="text-sm text-gray-600 line-clamp-2">
            {drill.additional_info}
          </p>
        </div>
      )}

      {/* Image (if exists) */}
      {drill.image_url && (
        <div className="mt-4">
          <Image
            src={drill.image_url}
            alt={drill.title}
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
}
