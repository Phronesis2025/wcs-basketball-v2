"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

export default function SetupPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has password_reset: true
    const checkUserStatus = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          devLog("No authenticated user, redirecting to login");
          router.push("/coaches/login");
          return;
        }

        // Check user's password_reset status
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, email, role, password_reset")
          .eq("id", authUser.id)
          .single();

        if (userError) {
          devError("Failed to fetch user data:", userError);
          setError("Failed to load user data");
          return;
        }

        if (!userData.password_reset) {
          devLog("User does not need password reset, redirecting to dashboard");
          router.push("/admin/club-management");
          return;
        }

        setUser(userData);
        devLog("User needs password reset:", userData);
      } catch (error) {
        devError("Error checking user status:", error);
        setError("An error occurred while checking your account status");
      }
    };

    checkUserStatus();
  }, [router]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return errors;
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordMismatch(false);
    setLoading(true);

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setPasswordMismatch(true);
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        setError(passwordErrors.join(". "));
        setLoading(false);
        return;
      }

      devLog("Setting up new password for user:", user?.email);

      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("No active session found. Please log in again.");
        setLoading(false);
        return;
      }

      // Call the API route to update password
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        devError("Failed to update password:", errorData);
        setError(
          errorData.error || "Failed to update password. Please try again."
        );
        setLoading(false);
        return;
      }

      devLog("Password setup completed successfully");

      // Redirect to dashboard
      router.push("/admin/club-management");
    } catch (error) {
      devError("Password setup error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Real-time password matching validation
  const checkPasswordMatch = () => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  };

  // Check password match when either field changes
  React.useEffect(() => {
    checkPasswordMatch();
  }, [newPassword, confirmPassword]);

  // Password requirement validation
  const getPasswordRequirements = () => {
    const requirements = [
      {
        text: "At least 8 characters long",
        met: newPassword.length >= 8,
      },
      {
        text: "One uppercase letter (A-Z)",
        met: /[A-Z]/.test(newPassword),
      },
      {
        text: "One lowercase letter (a-z)",
        met: /[a-z]/.test(newPassword),
      },
      {
        text: "One number (0-9)",
        met: /[0-9]/.test(newPassword),
      },
      {
        text: "One special character (!@#$%^&*)",
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
      },
    ];
    return requirements;
  };

  // Check if all password requirements are met
  const allRequirementsMet = () => {
    return getPasswordRequirements().every((req) => req.met);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="pt-20 pb-12 sm:pt-24">
          <div className="w-full max-w-md space-y-8 mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red mx-auto"></div>
              <p className="mt-2 text-sm font-inter text-white">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="pt-20 pb-12 sm:pt-24">
        <div className="w-full max-w-md space-y-8 mx-auto">
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            Set Up Your Password
          </h1>
          <p className="text-sm font-inter text-center text-gray-300 mb-6">
            Welcome, {user.email}! Please create a secure password for your
            account.
          </p>

          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-500 p-4">
              <div className="text-sm font-inter text-red-300">{error}</div>
            </div>
          )}

          <form onSubmit={handlePasswordSetup} className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-inter text-white mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red focus:border-red"
                  placeholder="Enter your new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-inter text-white mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full mt-1 p-2 bg-gray-800 text-white rounded-md border ${
                    passwordMismatch
                      ? "border-red-500 focus:ring-red focus:border-red"
                      : "border-gray-700 focus:ring-red focus:border-red"
                  } focus:outline-none focus:ring-2`}
                  placeholder="Confirm your new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passwordMismatch && (
                <p className="mt-1 text-sm font-inter text-red-400">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="bg-navy/20 border border-navy p-4 rounded-md">
              <h3 className="text-sm font-bebas text-white mb-3 uppercase">
                Password Requirements:
              </h3>
              <div className="space-y-2">
                {getPasswordRequirements().map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {requirement.met ? (
                        <svg
                          className="w-5 h-5 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-500 rounded-sm"></div>
                      )}
                    </div>
                    <span
                      className={`text-sm font-inter ${
                        requirement.met ? "text-green-300" : "text-gray-300"
                      }`}
                    >
                      {requirement.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || passwordMismatch || !allRequirementsMet()}
              className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? "Setting up password..." : "Set Password"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400 font-inter">
                  Security Notice
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs font-inter text-gray-400 text-center">
              Your password is encrypted and stored securely. This is a one-time
              setup process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
