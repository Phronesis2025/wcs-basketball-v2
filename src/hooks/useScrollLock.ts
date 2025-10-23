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

      // Lock the scroll by setting overflow hidden and preserving scroll position
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scroll position and unlock
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
}
