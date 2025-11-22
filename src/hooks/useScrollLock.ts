"use client";

import { useEffect, useRef } from "react";

/**
 * Custom hook to prevent background scrolling when a modal is open
 * @param isLocked - Whether to lock the scroll
 */
export function useScrollLock(isLocked: boolean) {
  const scrollPositionRef = useRef<number>(0);
  const isRestoringRef = useRef<boolean>(false);

  useEffect(() => {
    if (isLocked) {
      // Store the current scroll position in a ref that persists
      scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      isRestoringRef.current = false;

      // Get current body styles to restore later
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const originalOverflow = document.body.style.overflow;

      // Lock the scroll by setting overflow hidden and preserving scroll position
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        if (isRestoringRef.current) return; // Prevent double restoration
        isRestoringRef.current = true;
        
        const savedScrollY = scrollPositionRef.current;
        
        // Disable smooth scrolling temporarily
        const htmlStyle = document.documentElement.style;
        const originalScrollBehavior = htmlStyle.scrollBehavior;
        htmlStyle.scrollBehavior = 'auto';
        
        // Restore body styles first
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        document.body.style.overflow = originalOverflow;

        // Restore scroll position immediately - do this synchronously
        // Use both methods to ensure it works across browsers
        window.scrollTo(0, savedScrollY);
        document.documentElement.scrollTop = savedScrollY;
        window.pageYOffset = savedScrollY; // Fallback for older browsers
        
        // Use multiple restoration attempts to ensure it sticks
        const restoreScroll = () => {
          window.scrollTo(0, savedScrollY);
          document.documentElement.scrollTop = savedScrollY;
        };
        
        // Immediate restoration
        restoreScroll();
        
        // Restore after next frame
        requestAnimationFrame(() => {
          restoreScroll();
          // Restore scroll behavior
          htmlStyle.scrollBehavior = originalScrollBehavior;
          isRestoringRef.current = false;
        });
      };
    }
  }, [isLocked]);
}
