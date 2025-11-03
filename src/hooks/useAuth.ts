"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    isAdmin: false,
    userRole: null,
  });

  const checkAuth = async () => {
    try {
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
          return false;
        }

        // Store the session for future use
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
        return false;
      }

      const session = JSON.parse(sessionData);

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

        return true;
      } else {
        // Token might be expired - try to refresh
        const errorText = await response.text();
        devError("Error loading user data: ", errorText);
        
        // Try to refresh the session
        try {
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
              return true;
            }
          }
        } catch (refreshErr) {
          devError("Failed to refresh session:", refreshErr);
        }
        
        // If refresh failed, clear auth state
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("auth.authenticated");
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          isAdmin: false,
          userRole: null,
        });
        return false;
      }
    } catch (error) {
      devError("Error checking auth:", error);
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
