"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

// Type for authenticated user with metadata
interface AuthenticatedUser {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    first_name?: string;
    last_name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthenticatedUser | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: string | null;
}

export function useAuth() {
  const router = useRouter();
  const isCheckingRef = useRef(false);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    isAdmin: false,
    userRole: null,
  });

  const checkAuth = async () => {
    try {
      // Prevent overlapping checks which can cause request storms
      if (isCheckingRef.current) {
        return false;
      }
      isCheckingRef.current = true;
      // Don't check auth if we're in the process of signing out
      const isSigningOut = localStorage.getItem("auth.signingOut") === "true" || 
                          sessionStorage.getItem("auth.justSignedOut") === "true";
      
      if (isSigningOut) {
        devLog("Sign-out in progress, skipping auth check");
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          isAdmin: false,
          userRole: null,
        });
        
        // Clear sessionStorage flag after confirming sign-out (localStorage flag handled by Navbar)
        // Check timestamp to ensure we keep flag for at least 10 seconds
        const flagTimestamp = sessionStorage.getItem("auth.justSignedOutTimestamp");
        if (sessionStorage.getItem("auth.justSignedOut") && flagTimestamp) {
          const now = Date.now();
          const timeSinceSignOut = now - parseInt(flagTimestamp);
          if (timeSinceSignOut > 10000) {
            sessionStorage.removeItem("auth.justSignedOut");
            sessionStorage.removeItem("auth.justSignedOutTimestamp");
            devLog("useAuth: Cleared sign-out flag after 10 seconds");
          }
        }
        
        isCheckingRef.current = false;
        return false;
      }

      // Check for authentication in multiple places
      let sessionData = localStorage.getItem("supabase.auth.token");
      let isAuthenticated = localStorage.getItem("auth.authenticated");

      // If not found in localStorage, check sessionStorage
      if (!sessionData || !isAuthenticated) {
        sessionData = sessionStorage.getItem("supabase.auth.token");
        isAuthenticated = sessionStorage.getItem("auth.authenticated");
      }

      // If still no session data, check if user is authenticated via Supabase
      if (!sessionData || !isAuthenticated) {
        devLog("No session data found in storage, checking Supabase auth...");
        
        // Don't try to get session from Supabase during sign-out
        const isSigningOut = localStorage.getItem("auth.signingOut") === "true" || 
                            sessionStorage.getItem("auth.justSignedOut") === "true";
        
        if (isSigningOut) {
          devLog("Sign-out in progress, skipping Supabase session check");
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            isAdmin: false,
            userRole: null,
          });
          isCheckingRef.current = false;
          return false;
        }
        
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          devError("Error getting session:", error);
          return false;
        }

        if (!session) {
          devLog("No active session found - user needs to log in");
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            isAdmin: false,
            userRole: null,
          });
          isCheckingRef.current = false;
          return false;
        }

        // Double-check we're not signing out before restoring session
        const isSigningOutCheck = localStorage.getItem("auth.signingOut") === "true" || 
                                 sessionStorage.getItem("auth.justSignedOut") === "true";
        
        if (isSigningOutCheck) {
          devLog("Sign-out in progress, not restoring session from Supabase");
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            isAdmin: false,
            userRole: null,
          });
          isCheckingRef.current = false;
          return false;
        }

        // Verify session is not expired before storing
        if (session.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();
          if (now >= expiresAt) {
            devLog("useAuth: Supabase session expired, not storing");
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              isAdmin: false,
              userRole: null,
            });
            isCheckingRef.current = false;
            return false;
          }
        }

        // Store the session for future use (only if not signing out and not expired)
        localStorage.setItem("supabase.auth.token", JSON.stringify(session));
        localStorage.setItem("auth.authenticated", "true");
        sessionData = JSON.stringify(session);
      }

      if (!sessionData) {
        devLog("No session data found - user needs to log in");
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          isAdmin: false,
          userRole: null,
        });
        isCheckingRef.current = false;
        return false;
      }

      const session = JSON.parse(sessionData);

      // Verify token is not expired before proceeding
      if (session.expires_at) {
        const expiresAt = session.expires_at * 1000; // Convert to milliseconds
        const now = Date.now();
        if (now >= expiresAt) {
          devLog("useAuth: Token expired, clearing auth state");
          localStorage.removeItem("supabase.auth.token");
          localStorage.removeItem("auth.authenticated");
          sessionStorage.removeItem("supabase.auth.token");
          sessionStorage.removeItem("auth.authenticated");
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            isAdmin: false,
            userRole: null,
          });
          isCheckingRef.current = false;
          return false;
        }
      }

      // Double-check we're not signing out before making API calls
      const isSigningOutFinalCheck = localStorage.getItem("auth.signingOut") === "true" || 
                                     sessionStorage.getItem("auth.justSignedOut") === "true";
      if (isSigningOutFinalCheck) {
        devLog("useAuth: Sign-out detected before API call, aborting");
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          isAdmin: false,
          userRole: null,
        });
        isCheckingRef.current = false;
        return false;
      }

      // Extract access token
      let accessToken = session.access_token;
      if (!accessToken && session.user?.access_token) {
        accessToken = session.user.access_token;
      }

      if (!accessToken) {
        devError("No access token found in session");
        return false;
      }

      // Get user data
      const response = await fetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const userData = await response.json();

        // Fetch user role
        let userRole = null;
        try {
          const roleResponse = await fetch("/api/auth/check-role", {
            headers: {
              "x-user-id": userData.user?.id,
            },
          });

          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            userRole = roleData.role;
          }
        } catch (roleError) {
          devError("Failed to fetch user role:", roleError);
        }

        setAuthState({
          isAuthenticated: true,
          user: userData.user,
          loading: false,
          isAdmin: userData.user?.user_metadata?.role === "admin",
          userRole,
        });

        isCheckingRef.current = false;
        return true;
      } else {
        // Check if we're signing out before trying to refresh
        const isSigningOut = localStorage.getItem("auth.signingOut") === "true" || 
                            sessionStorage.getItem("auth.justSignedOut") === "true";
        
        if (isSigningOut) {
          devLog("Sign-out in progress, skipping token refresh");
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            isAdmin: false,
            userRole: null,
          });
          isCheckingRef.current = false;
          return false;
        }
        
        // Token might be expired - try to refresh
        const errorText = await response.text();
        
        // Only log error if it's not an expected expired token during sign-out
        if (!errorText.includes("expired")) {
          devError("Error loading user data: ", errorText);
        }
        
        // Try to refresh the session
        try {
          // Double-check we're not signing out before attempting refresh
          const isSigningOut = localStorage.getItem("auth.signingOut") === "true" || 
                              sessionStorage.getItem("auth.justSignedOut") === "true";
          
          if (isSigningOut) {
            devLog("Sign-out in progress, skipping session refresh");
            localStorage.removeItem("supabase.auth.token");
            localStorage.removeItem("auth.authenticated");
            sessionStorage.removeItem("supabase.auth.token");
            sessionStorage.removeItem("auth.authenticated");
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
              isAdmin: false,
              userRole: null,
            });
            isCheckingRef.current = false;
            return false;
          }
          
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession(session);
          
          if (!refreshError && newSession) {
            // Update stored session with refreshed token
            localStorage.setItem("supabase.auth.token", JSON.stringify(newSession));
            localStorage.setItem("auth.authenticated", "true");
            
            // Retry the request with new token
            const retryResponse = await fetch("/api/auth/user", {
              headers: { Authorization: `Bearer ${newSession.access_token}` },
            });
            
            if (retryResponse.ok) {
              const userData = await retryResponse.json();
              
              // Fetch user role
              let userRole = null;
              try {
                const roleResponse = await fetch("/api/auth/check-role", {
                  headers: {
                    "x-user-id": userData.user?.id,
                  },
                });
                
                if (roleResponse.ok) {
                  const roleData = await roleResponse.json();
                  userRole = roleData.role;
                }
              } catch (roleError) {
                devError("Failed to fetch user role:", roleError);
              }
              
              setAuthState({
                isAuthenticated: true,
                user: userData.user,
                loading: false,
                isAdmin: userData.user?.user_metadata?.role === "admin",
                userRole,
              });
              
              devLog("Session refreshed successfully");
              isCheckingRef.current = false;
              return true;
            }
          }
        } catch (refreshErr) {
          // Only log error if it's not a rate limit error during sign-out
          const isRateLimitError = refreshErr instanceof Error && 
                                  (refreshErr.message?.includes("429") || 
                                   refreshErr.message?.includes("rate limit"));
          
          if (!isRateLimitError) {
            devError("Failed to refresh session:", refreshErr);
          } else {
            devLog("Rate limit encountered during session refresh - clearing auth state");
          }
        }
        
        // If refresh failed, clear auth state
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("auth.authenticated");
        sessionStorage.removeItem("supabase.auth.token");
        sessionStorage.removeItem("auth.authenticated");
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          isAdmin: false,
          userRole: null,
        });
        isCheckingRef.current = false;
        return false;
      }
    } catch (error) {
      devError("Error checking auth:", error);
      isCheckingRef.current = false;
      return false;
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for authentication state changes
    const handleAuthStateChange = (event: CustomEvent) => {
      if (event.detail.authenticated === false) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          isAdmin: false,
          userRole: null,
        });
        router.push("/coaches/login");
      }
    };

    window.addEventListener(
      "authStateChanged",
      handleAuthStateChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "authStateChanged",
        handleAuthStateChange as EventListener
      );
    };
  }, [router]);

  return {
    ...authState,
    checkAuth,
  };
}
