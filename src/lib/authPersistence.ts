// src/lib/authPersistence.ts
"use client";

import { supabase } from "./supabaseClient";
import { devLog, devError } from "./security";

export interface SessionData {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user?: any;
}

/**
 * Enhanced session persistence utilities
 * Handles session storage, recovery, and validation
 */
export class AuthPersistence {
  private static readonly STORAGE_KEYS = {
    SESSION: "supabase.auth.token",
    AUTHENTICATED: "auth.authenticated",
    LAST_REFRESH: "auth.last_refresh",
  };

  /**
   * Store session data in both localStorage and sessionStorage
   */
  static async storeSession(session: any): Promise<void> {
    try {
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user,
      };

      const sessionString = JSON.stringify(sessionData);

      // Store in both localStorage and sessionStorage for redundancy
      localStorage.setItem(this.STORAGE_KEYS.SESSION, sessionString);
      localStorage.setItem(this.STORAGE_KEYS.AUTHENTICATED, "true");
      localStorage.setItem(
        this.STORAGE_KEYS.LAST_REFRESH,
        Date.now().toString()
      );

      sessionStorage.setItem(this.STORAGE_KEYS.SESSION, sessionString);
      sessionStorage.setItem(this.STORAGE_KEYS.AUTHENTICATED, "true");

      devLog("Session stored successfully");
    } catch (error) {
      devError("Error storing session:", error);
    }
  }

  /**
   * Retrieve session data from storage
   */
  static getStoredSession(): SessionData | null {
    try {
      // Try localStorage first
      let sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION);
      let isAuthenticated = localStorage.getItem(
        this.STORAGE_KEYS.AUTHENTICATED
      );

      // If not found in localStorage, try sessionStorage
      if (!sessionData || !isAuthenticated) {
        sessionData = sessionStorage.getItem(this.STORAGE_KEYS.SESSION);
        isAuthenticated = sessionStorage.getItem(
          this.STORAGE_KEYS.AUTHENTICATED
        );
      }

      if (sessionData && isAuthenticated === "true") {
        return JSON.parse(sessionData);
      }

      return null;
    } catch (error) {
      devError("Error retrieving stored session:", error);
      return null;
    }
  }

  /**
   * Check if session is valid and not expired
   */
  static isSessionValid(session: SessionData): boolean {
    if (!session || !session.access_token) {
      return false;
    }

    // Check if session has expired (if expires_at is available)
    if (session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= session.expires_at) {
        devLog("Session has expired");
        return false;
      }
    }

    return true;
  }

  /**
   * Attempt to recover session from storage
   */
  static async recoverSession(): Promise<boolean> {
    try {
      const storedSession = this.getStoredSession();

      if (!storedSession || !this.isSessionValid(storedSession)) {
        devLog("No valid stored session found");
        return false;
      }

      devLog("Valid session found in storage");
      return true; // Don't call setSession - let Supabase handle it
    } catch (error) {
      devError("Error recovering session:", error);
      return false;
    }
  }

  /**
   * Clear all authentication data with enhanced cleanup
   */
  static clearAuthData(): void {
    try {
      devLog("Starting comprehensive auth data cleanup...");

      // Set flags to prevent re-authentication during cleanup
      localStorage.setItem("auth.signingOut", "true");
      sessionStorage.setItem("auth.justSignedOut", "true");
      // Set timestamp to track when sign-out occurred
      sessionStorage.setItem("auth.justSignedOutTimestamp", Date.now().toString());

      // Clear primary auth keys
      localStorage.removeItem(this.STORAGE_KEYS.SESSION);
      localStorage.removeItem(this.STORAGE_KEYS.AUTHENTICATED);
      localStorage.removeItem(this.STORAGE_KEYS.LAST_REFRESH);

      sessionStorage.removeItem(this.STORAGE_KEYS.SESSION);
      sessionStorage.removeItem(this.STORAGE_KEYS.AUTHENTICATED);

      // Clear navbar and role cache
      sessionStorage.removeItem("navbarRoleChecked");
      sessionStorage.removeItem("navbarAdminStatus");

      // Clear additional auth-related keys (but NOT signing-out flags - those are handled by the sign-out handler)
      const additionalKeys = [
        "login_attempts",
        "login_timestamp",
      ];

      additionalKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Clear any other potential auth-related keys from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("auth") ||
            key.includes("supabase") ||
            key.includes("session") ||
            key.includes("login"))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => {
        devLog(`Removing localStorage key: ${key}`);
        localStorage.removeItem(key!);
      });

      // Clear any other potential auth-related keys from sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (
          key &&
          (key.includes("auth") ||
            key.includes("supabase") ||
            key.includes("session") ||
            key.includes("navbar") ||
            key.includes("login"))
        ) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach((key) => {
        devLog(`Removing sessionStorage key: ${key}`);
        sessionStorage.removeItem(key!);
      });

      // Dispatch auth state change event to notify components
      window.dispatchEvent(
        new CustomEvent("authStateChanged", {
          detail: { authenticated: false },
        })
      );

      devLog("Authentication data cleared from all storage");
    } catch (error) {
      devError("Error clearing auth data:", error);
    }
  }

  /**
   * Check if user should be redirected to login
   */
  static async shouldRedirectToLogin(): Promise<boolean> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return !session;
    } catch (error) {
      devError("Error checking if should redirect to login:", error);
      return true;
    }
  }

  /**
   * Get current user with session validation
   */
  static async getCurrentUser(): Promise<any | null> {
    try {
      // First try to get user from Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        return user;
      }

      // If that fails, try to recover from stored session
      const recovered = await this.recoverSession();
      if (recovered) {
        const {
          data: { user: recoveredUser },
        } = await supabase.auth.getUser();
        return recoveredUser;
      }

      return null;
    } catch (error) {
      devError("Error getting current user:", error);
      return null;
    }
  }
}
