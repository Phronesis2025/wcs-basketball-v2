"use client";

import React, { useEffect } from "react";

interface DownloadConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDelete?: () => void; // Optional delete handler
  fileName: string;
  fileType: "image" | "document";
  fileUrl?: string;
  fileSize?: number;
  displayName?: string; // The name shown on the card (e.g., team name)
  isAdmin?: boolean; // Whether user is admin (to show delete button)
}

export default function DownloadConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onDelete,
  fileName,
  fileType,
  fileUrl,
  fileSize,
  displayName,
  isAdmin = false,
}: DownloadConfirmModalProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bebas text-white uppercase">
            Download {fileType === "image" ? "Image" : "Document"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {fileType === "image" && fileUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full h-48 object-contain rounded-lg border border-gray-600"
              />
            </div>
          )}

          <div className="text-center">
            <p className="text-white font-inter mb-2">
              Do you want to download this {fileType === "image" ? "image" : "document"}?
            </p>
            {displayName && displayName !== fileName && (
              <p className="text-white font-inter font-medium mb-1">{displayName}</p>
            )}
            <p className="text-gray-400 font-inter text-sm">{fileName}</p>
            {fileSize && (
              <p className="text-gray-500 font-inter text-xs mt-1">
                Size: {formatFileSize(fileSize)}
              </p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-2 bg-blue-600 text-white font-bebas uppercase rounded-md hover:bg-blue-700 transition-colors"
            >
              Download
            </button>
            {isAdmin && onDelete && (
              <button
                onClick={onDelete}
                className="px-6 py-2 bg-[red] text-white font-bebas uppercase rounded-md hover:bg-[#b80000] transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

