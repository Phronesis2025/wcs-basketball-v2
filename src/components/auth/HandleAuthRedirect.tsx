"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    const processAuthRedirect = async () => {
      // Check if we're on a callback URL with hash fragments
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      
      if (hash && hash.includes("access_token")) {
        devLog("HandleAuthRedirect: Found access_token in URL hash, processing...");

        // IMPORTANT: Clear any old/expired tokens from storage before processing new ones
        // This prevents conflicts with expired tokens from previous sessions
        try {
          localStorage.removeItem("supabase.auth.token");
          localStorage.removeItem("auth.authenticated");
          sessionStorage.removeItem("supabase.auth.token");
          sessionStorage.removeItem("auth.authenticated");
          devLog("HandleAuthRedirect: Cleared old tokens from storage");
        } catch (e) {
          devError("HandleAuthRedirect: Error clearing old tokens", e);
        }

        try {
          // Supabase should automatically detect and process hash fragments
          // But we'll explicitly get the session to ensure it's set
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            devError("HandleAuthRedirect: Error getting session", sessionError);
            return;
          }

          if (session) {
            devLog("HandleAuthRedirect: Session detected", {
              userId: session.user?.id,
              email: session.user?.email,
            });

            // Store session
            await AuthPersistence.storeSession(session);

            // Set session in Supabase client (ensure it's active)
            const { error: setError } = await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            });

            if (setError) {
              devError("HandleAuthRedirect: Error setting session", setError);
            } else {
              devLog("HandleAuthRedirect: Session set successfully");
            }

            // Dispatch auth state change event
            window.dispatchEvent(
              new CustomEvent("authStateChanged", {
                detail: {
                  authenticated: true,
                  user: session.user,
                },
              })
            );

            // Clean up URL - remove hash fragments
            const currentUrl = window.location.pathname + window.location.search;
            if (window.history && window.history.replaceState) {
              window.history.replaceState(
                {},
                document.title,
                currentUrl
              );
            }

            // Small delay to ensure state is updated
            setTimeout(() => {
              router.refresh();
            }, 100);
          } else {
            devLog("HandleAuthRedirect: No session found in hash, trying to extract from URL");
            
            // Try to extract tokens from hash manually
            const hashParams = new URLSearchParams(hash.substring(1)); // Remove #
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");
            const tokenType = hashParams.get("token_type") || "bearer";

            if (accessToken && refreshToken) {
              devLog("HandleAuthRedirect: Extracted tokens from URL hash");
              
              // Set session with extracted tokens
              const { data: sessionData, error: setError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (setError) {
                devError("HandleAuthRedirect: Error setting session from hash", setError);
              } else if (sessionData.session) {
                devLog("HandleAuthRedirect: Session established from hash");
                await AuthPersistence.storeSession(sessionData.session);
                
                window.dispatchEvent(
                  new CustomEvent("authStateChanged", {
                    detail: {
                      authenticated: true,
                      user: sessionData.session.user,
                    },
                  })
                );

                // Clean up URL
                const currentUrl = window.location.pathname + window.location.search;
                if (window.history && window.history.replaceState) {
                  window.history.replaceState({}, document.title, currentUrl);
                }

                router.refresh();
              }
            }
          }
        } catch (error) {
          devError("HandleAuthRedirect: Exception processing auth redirect", error);
        }
      }
    };

    // Small delay to ensure page is fully loaded
    const timer = setTimeout(() => {
      processAuthRedirect();
    }, 100);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return null; // This component doesn't render anything
}

