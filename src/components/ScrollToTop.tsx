"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Scroll to top on component mount (page load/refresh)
    window.scrollTo(0, 0);

    // Also scroll to top when the page becomes visible (handles back/forward navigation)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null; // This component doesn't render anything
}
