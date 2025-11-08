"use client";

import React from "react";
import Image from "next/image";

interface ResourceCardProps {
  name: string;
  url: string;
  size?: number;
  teamName?: string;
  type: "image" | "document";
  onClick: () => void;
}

export default function ResourceCard({
  name,
  url,
  size,
  teamName,
  type,
  onClick,
}: ResourceCardProps) {
  // Get file extension for document icon
  const getDocumentIcon = (fileName: string) => {
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
      default:
        return "📎";
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-700 border border-gray-600 rounded-lg p-4 cursor-pointer hover:bg-gray-600 hover:border-gray-500 transition-all group"
    >
      {type === "image" ? (
        <>
          <div className="relative w-full aspect-square mb-3 bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src={url}
              alt={teamName || name}
              fill
              className="object-contain group-hover:scale-105 transition-transform"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
          <div className="text-center">
            <p className="text-white font-inter font-medium text-sm truncate" title={teamName || name}>
              {teamName || name}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center w-full aspect-square mb-3 bg-gray-800 rounded-lg">
            <span className="text-6xl">{getDocumentIcon(name)}</span>
          </div>
          <div className="text-center">
            <p className="text-white font-inter font-medium text-sm truncate" title={name}>
              {name}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

