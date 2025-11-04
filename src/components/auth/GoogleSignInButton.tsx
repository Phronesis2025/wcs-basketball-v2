"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import toast from "react-hot-toast";

interface GoogleSignInButtonProps {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function GoogleSignInButton({
  redirectTo = "/auth/callback",
  onSuccess,
  onError,
  variant = "primary",
  className = "",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      devLog("GoogleSignInButton: Initiating Google OAuth", { redirectTo });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        devError("GoogleSignInButton: OAuth error", error);
        toast.error("Failed to sign in with Google. Please try again.");
        onError?.(error as Error);
        return;
      }

      devLog("GoogleSignInButton: OAuth redirect initiated", data);
      // The redirect will happen automatically
      onSuccess?.();
    } catch (err) {
      devError("GoogleSignInButton: Exception", err);
      toast.error("An error occurred. Please try again.");
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const baseStyles =
    variant === "primary"
      ? "bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 font-semibold shadow-md"
      : "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300";

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`
        ${baseStyles}
        w-full md:w-auto lg:mx-auto
        min-h-[48px] px-6 py-3 rounded-md
        flex items-center justify-center gap-3
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red
        ${className}
      `}
      aria-label="Sign up with Gmail"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-medium">Sign up with Gmail</span>
        </>
      )}
    </button>
  );
}

