"use client";

import { useState, useEffect, ReactNode } from "react";
import BasketballLoader from "./BasketballLoader";

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
          throw new Error("Failed to verify location");
        }

        const data = await response.json();

        if (data.allowed) {
          // Store in sessionStorage for this session
          sessionStorage.setItem("location_verified", "true");
          setIsAllowed(true);
          onVerified?.();
        } else {
          setIsAllowed(false);
          setError(
            data.reason ||
              "Access is currently limited to residents within 50 miles of Salina, Kansas. If you believe this is an error, please contact us."
          );
        }
      } catch (err) {
        console.error("Location verification error:", err);
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
    return (
      <div className="min-h-screen bg-navy text-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bebas mb-4 text-red">
              Access Restricted
            </h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <p className="text-sm text-gray-400">
              Registration is currently limited to residents within 50 miles of
              Salina, Kansas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

