"use client";

import { useState } from "react";
import { Player } from "@/types/supabase";

interface ChildSelectorProps {
  children: Player[];
  activeChild: Player | null;
  onSelectChild: (child: Player) => void;
}

export default function ChildSelector({
  children,
  activeChild,
  onSelectChild,
}: ChildSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="font-semibold text-gray-900">
          Viewing: {children[0].name}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex justify-between items-center hover:border-gray-400 transition"
      >
        <span className="font-medium">
          {activeChild ? activeChild.name : "Select a child"}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                onSelectChild(child);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{child.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    child.status === "active"
                      ? "bg-green-100 text-green-800"
                      : child.status === "approved"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {child.status || "pending"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
