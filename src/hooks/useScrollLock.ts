"use client";

import { useEffect } from "react";

/**
 * Custom hook to prevent background scrolling when a modal is open
 * @param isLocked - Whether to lock the scroll
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      // Store the current scroll position
      const scrollY = window.scrollY;

      // Get current body styles to restore later
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;

      // Lock the scroll by setting overflow hidden and preserving scroll position
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore original styles
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;

        // Restore scroll position with multiple attempts to ensure it works
        const restoreScroll = () => {
          window.scrollTo(0, scrollY);
        };

        // Try multiple times to ensure scroll restoration works
        requestAnimationFrame(restoreScroll);
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 10);
      };
    }
  }, [isLocked]);
}
