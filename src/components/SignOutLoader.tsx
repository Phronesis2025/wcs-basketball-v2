"use client";

import { useEffect, useState } from "react";
import BasketballLoader from "./BasketballLoader";

/**
 * Component that shows basketball loading screen during sign-out
 * Checks for auth.justSignedOut flag in sessionStorage
 */
export default function SignOutLoader({ children }: { children: React.ReactNode }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Check if user is signing out on mount
    const checkSignOut = () => {
      if (typeof window === "undefined") return;
      
      const justSignedOut = sessionStorage.getItem("auth.justSignedOut");
      if (justSignedOut === "true") {
        setIsSigningOut(true);
        
        // Clear the flag after showing loader for a reasonable time
        const flagTimestamp = sessionStorage.getItem("auth.justSignedOutTimestamp");
        if (flagTimestamp) {
          const now = Date.now();
          const timeSinceSignOut = now - parseInt(flagTimestamp);
          
          // Keep showing loader for at least 1.5 seconds, but clear after 10 seconds total
          const minDisplayTime = 1500;
          const maxTotalTime = 10000;
          const remainingTime = Math.max(0, Math.min(minDisplayTime, maxTotalTime - timeSinceSignOut));
          
          if (remainingTime > 0) {
            const timer = setTimeout(() => {
              setIsSigningOut(false);
              // Clear flags after showing loader
              sessionStorage.removeItem("auth.justSignedOut");
              sessionStorage.removeItem("auth.justSignedOutTimestamp");
            }, remainingTime);
            
            return () => clearTimeout(timer);
          } else {
            // Time has passed, clear flags immediately
            setIsSigningOut(false);
            sessionStorage.removeItem("auth.justSignedOut");
            sessionStorage.removeItem("auth.justSignedOutTimestamp");
          }
        } else {
          // No timestamp, clear after 2 seconds
          const timer = setTimeout(() => {
            setIsSigningOut(false);
            sessionStorage.removeItem("auth.justSignedOut");
            sessionStorage.removeItem("auth.justSignedOutTimestamp");
          }, 2000);
          
          return () => clearTimeout(timer);
        }
      } else {
        setIsSigningOut(false);
      }
    };

    // Check immediately on mount
    checkSignOut();
  }, []);

  // Show basketball loader during sign-out (overlay on top of everything)
  return (
    <>
      {isSigningOut && (
        <div className="fixed inset-0 bg-navy z-[9999] flex items-center justify-center">
          <div className="text-center">
            <BasketballLoader size={80} />
          </div>
        </div>
      )}
      {children}
    </>
  );
}

