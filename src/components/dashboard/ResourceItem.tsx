"use client";

import React from "react";

interface ResourceItemProps {
  name: string;
  url: string;
  size?: number;
  teamName?: string;
  onDownload: (url: string, name: string) => void;
}

export default function ResourceItem({
  name,
  url,
  size,
  teamName,
  onDownload,
}: ResourceItemProps) {
  // Get file extension for icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "txt":
      case "csv":
        return "📋";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return "🖼️";
      default:
        return "📎";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 flex items-center justify-between hover:bg-gray-650 transition-colors">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <span className="text-2xl flex-shrink-0">{getFileIcon(name)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-inter font-medium truncate">
            {teamName || name}
          </p>
          {teamName && (
            <p className="text-gray-400 text-sm font-inter truncate">{name}</p>
          )}
          {size && (
            <p className="text-gray-500 text-xs font-inter">
              {formatFileSize(size)}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onDownload(url, name)}
        className="px-4 py-2 bg-[red] text-white font-bebas uppercase rounded-md hover:bg-[#b80000] transition-colors flex-shrink-0 ml-4"
        title={`Download ${name}`}
      >
        Download
      </button>
    </div>
  );
}

