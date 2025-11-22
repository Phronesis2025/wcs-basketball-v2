"use client";

import { useState, useEffect, ReactNode } from "react";
import BasketballLoader from "./BasketballLoader";
import { supabase } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

interface LocationGateProps {
  children: ReactNode;
  onVerified?: () => void;
}

export default function LocationGate({ children, onVerified }: LocationGateProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkLocation = async () => {
      // Check if user is already authenticated (admin/coach) - bypass location check
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // User is authenticated, allow access without location check
          setIsAllowed(true);
          setIsChecking(false);
          onVerified?.();
          return;
        }
      } catch (err) {
        // Continue with location check if auth check fails
        devError("Error checking auth:", err);
      }

      // Check sessionStorage first (valid for current session)
      const cached = sessionStorage.getItem("location_verified");
      if (cached === "true") {
        setIsAllowed(true);
        setIsChecking(false);
        onVerified?.();
        return;
      }

      try {
        // Call location verification API
        const response = await fetch("/api/verify-location", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const { extractApiErrorMessage } = await import("@/lib/errorHandler");
          const errorMessage = await extractApiErrorMessage(response);
          throw new Error(errorMessage);
        }

        const { extractApiResponseData } = await import("@/lib/errorHandler");
        const data = await extractApiResponseData<{ allowed: boolean; reason?: string }>(response);

        if (data.allowed) {
          // Store in sessionStorage for this session
          sessionStorage.setItem("location_verified", "true");
          setIsAllowed(true);
          onVerified?.();
        } else {
          // If blocked, allow user to bypass by clicking a button (for legitimate users)
          setIsAllowed(false);
          setError(
            data.reason ||
              "Access is currently limited to residents within 50 miles of Salina, Kansas. If you believe this is an error, please contact us."
          );
        }
      } catch (err) {
        devError("Location verification error:", err);
        // On error, allow access but log the issue
        // This prevents blocking legitimate users if API is down
        setIsAllowed(true);
        setError(null);
        sessionStorage.setItem("location_verified", "true");
        onVerified?.();
      } finally {
        setIsChecking(false);
      }
    };

    checkLocation();
  }, [onVerified]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <BasketballLoader size={80} />
          <p className="text-white mt-4 text-lg">Verifying location...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    const handleBypass = () => {
      // Allow bypass for legitimate users who are incorrectly blocked
      sessionStorage.setItem("location_verified", "true");
      setIsAllowed(true);
      onVerified?.();
    };

    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bebas mb-4 text-red">
              Access Restricted
            </h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <p className="text-sm text-gray-400 mb-6">
              Registration is currently limited to residents within 50 miles of
              Salina, Kansas.
            </p>
            <button
              onClick={handleBypass}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              I'm in the service area - Continue
            </button>
            <p className="text-xs text-gray-500 mt-4">
              If you're in Salina, Kansas or within 50 miles, you can bypass this check.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

