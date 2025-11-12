"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "test_site_banner_dismissed";

export default function TestSiteBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 border-b-2 border-amber-600 shadow-lg">
      <div className="container max-w-7xl mx-auto flex items-center justify-center py-3 px-4 relative">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-bold text-gray-900 text-center">
            TEST SITE - This website is currently in testing phase and not open for public registration.
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-4 text-gray-900 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 rounded px-2 py-1 transition-colors"
          aria-label="Dismiss banner"
        >
          <svg
            className="w-5 h-5"
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
    </div>
  );
}

