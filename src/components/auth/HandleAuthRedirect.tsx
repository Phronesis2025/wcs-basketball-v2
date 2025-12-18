"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AuthPersistence } from "@/lib/authPersistence";
import { devLog, devError } from "@/lib/security";

/**
 * Component to handle Supabase auth redirects with hash fragments
 * Processes #access_token=... from URL and establishes session
 */
export default function HandleAuthRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const processAuthRedirect = async () => {
      // Check if we're on a callback URL with hash fragments
      if (typeof window === "undefined") return;
      
      // Prevent double processing
      if (hasProcessedRef.current) return;

      const hash = window.location.hash;
      
      if (hash && hash.includes("access_token")) {
        hasProcessedRef.current = true;
        devLog("HandleAuthRedirect: Found access_token in URL hash, processing...");

        try {
          // FIRST: Extract tokens from hash BEFORE clearing anything
          const hashParams = new URLSearchParams(hash.substring(1)); // Remove #
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (!accessToken || !refreshToken) {
            devError("HandleAuthRedirect: Missing tokens in hash");
            hasProcessedRef.current = false;
            return;
          }

          devLog("HandleAuthRedirect: Extracted tokens from URL hash");

          // NOW clear old tokens (after we've extracted the new ones)
          try {
            localStorage.removeItem("supabase.auth.token");
            localStorage.removeItem("auth.authenticated");
            sessionStorage.removeItem("supabase.auth.token");
            sessionStorage.removeItem("auth.authenticated");
            devLog("HandleAuthRedirect: Cleared old tokens from storage");
          } catch (e) {
            devError("HandleAuthRedirect: Error clearing old tokens", e);
          }

          // Set session with extracted tokens
          const { data: sessionData, error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setError) {
            devError("HandleAuthRedirect: Error setting session from hash", setError);
            hasProcessedRef.current = false;
            return;
          }

          if (sessionData.session) {
            devLog("HandleAuthRedirect: Session established from hash", {
              userId: sessionData.session.user?.id,
              email: sessionData.session.user?.email,
            });

            // Store session in our persistence layer
            await AuthPersistence.storeSession(sessionData.session);
            devLog("HandleAuthRedirect: Session stored in persistence layer");

            // Dispatch auth state change event
            window.dispatchEvent(
              new CustomEvent("authStateChanged", {
                detail: {
                  authenticated: true,
                  user: sessionData.session.user,
                },
              })
            );

            // Clean up URL - remove hash fragments
            const currentUrl = window.location.pathname + window.location.search;
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, currentUrl);
            }

            devLog("HandleAuthRedirect: Auth redirect processing complete");

            // Check if this is a new user (OAuth signup) and redirect to registration
            // If we're on the root path with hash fragments, it's likely an OAuth redirect
            if (window.location.pathname === "/" || window.location.pathname === "") {
              devLog("HandleAuthRedirect: OAuth redirect detected, redirecting to registration");
              router.push(`/register?oauth=success&email=${encodeURIComponent(sessionData.session.user.email || "")}`);
            }
          } else {
            devError("HandleAuthRedirect: No session returned from setSession");
            hasProcessedRef.current = false;
          }
        } catch (error) {
          devError("HandleAuthRedirect: Exception processing auth redirect", error);
          hasProcessedRef.current = false;
        }
      }
    };

    // Process immediately - no delay needed
    processAuthRedirect();
  }, [router, searchParams]);

  return null; // This component doesn't render anything
}

