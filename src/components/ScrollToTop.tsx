"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Force scroll to top immediately on page load/refresh
    window.scrollTo(0, 0);

    // Use requestAnimationFrame to ensure it happens after any browser restoration
    const scrollToTop = () => {
      window.scrollTo(0, 0);
    };

    // Multiple attempts to ensure scroll happens
    requestAnimationFrame(scrollToTop);
    setTimeout(scrollToTop, 0);
    setTimeout(scrollToTop, 10);

    // Handle page visibility changes (back/forward navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.scrollTo(0, 0);
        requestAnimationFrame(() => window.scrollTo(0, 0));
      }
    };

    // Handle page focus (when user returns to tab)
    const handleFocus = () => {
      window.scrollTo(0, 0);
    };

    // Handle beforeunload to reset scroll position
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null; // This component doesn't render anything
}
