// src/components/dashboard/AnnouncementCard.tsx
import React from "react";
import { TeamUpdate } from "../../types/supabase";

interface AnnouncementCardProps {
  update: TeamUpdate;
  onEdit?: (update: TeamUpdate) => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function AnnouncementCard({
  update,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: AnnouncementCardProps) {
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Mock importance - in real app this would come from update data
  const isImportant =
    update.title.toLowerCase().includes("important") ||
    update.title.toLowerCase().includes("urgent");

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-inter font-semibold text-gray-900">
            {update.title}
          </h4>
          <p className="text-sm text-gray-500 font-inter mt-1">
            {formatDateTime(update.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isImportant && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              IMPORTANT
            </span>
          )}
          {onEdit && onDelete && canEdit && canDelete && (
            <div className="flex space-x-1">
              {canEdit && (
                <button
                  onClick={() => onEdit(update)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Edit announcement"
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
                  onClick={() => onDelete(update.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                  aria-label="Delete announcement"
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
