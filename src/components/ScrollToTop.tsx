"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // DISABLED: Force scroll to top immediately on page load/refresh
    // window.scrollTo(0, 0);
    // DISABLED: Use requestAnimationFrame to ensure it happens after any browser restoration
    // const scrollToTop = () => {
    //   window.scrollTo(0, 0);
    // };
    // DISABLED: Multiple attempts to ensure scroll happens
    // requestAnimationFrame(scrollToTop);
    // setTimeout(scrollToTop, 0);
    // setTimeout(scrollToTop, 10);
    // DISABLED: Handle page visibility changes (back/forward navigation)
    // const handleVisibilityChange = () => {
    //   if (!document.hidden) {
    //     window.scrollTo(0, 0);
    //     requestAnimationFrame(() => window.scrollTo(0, 0));
    //   }
    // };
    // DISABLED: Handle page focus (when user returns to tab)
    // const handleFocus = () => {
    //   window.scrollTo(0, 0);
    // };
    // DISABLED: Handle beforeunload to reset scroll position
    // const handleBeforeUnload = () => {
    //   window.scrollTo(0, 0);
    // };
    // DISABLED: Add event listeners
    // document.addEventListener("visibilitychange", handleVisibilityChange);
    // window.addEventListener("focus", handleFocus);
    // window.addEventListener("beforeunload", handleBeforeUnload);
    // DISABLED: Cleanup
    // return () => {
    //   document.removeEventListener("visibilitychange", handleVisibilityChange);
    //   window.removeEventListener("focus", handleFocus);
    //   window.removeEventListener("beforeunload", handleBeforeUnload);
    // };
  }, []);

  return null; // This component doesn't render anything
}
