"use client";

import { useState, useEffect } from "react";
import { getCSRFTokenFromCookies } from "@/lib/security";

/**
 * Custom hook for CSRF token management
 * Automatically fetches and manages CSRF tokens for forms and state-changing operations
 */
export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get token from cookies first
    const existingToken = getCSRFTokenFromCookies();
    if (existingToken) {
      setCsrfToken(existingToken);
      setIsLoading(false);
      return;
    }

    // If no token in cookies, fetch a new one from the API
    fetchCSRFToken();
  }, []);

  const fetchCSRFToken = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/csrf", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching CSRF token:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/csrf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csrfToken: token }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.valid === true;
    } catch (err) {
      console.error("Error validating CSRF token:", err);
      return false;
    }
  };

  const refreshToken = () => {
    fetchCSRFToken();
  };

  return {
    csrfToken,
    isLoading,
    error,
    fetchCSRFToken,
    validateToken,
    refreshToken,
  };
}

export default useCSRF;
