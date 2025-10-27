"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import { useScrollLock } from "@/hooks/useScrollLock";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userId,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Lock scroll when modal is open
  useScrollLock(isOpen);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

      const passwordErrors = getPasswordRequirements().filter(
        (req) => !req.met
      );
      if (passwordErrors.length > 0) {
        setError(passwordErrors.map((req) => req.text).join(". "));
        setLoading(false);
        return;
      }

      devLog("Changing password for user:", userId);

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

      devLog("Password changed successfully");

      // Reset form and close modal
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (error) {
      devError("Password change error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setPasswordMismatch(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bebas text-white uppercase">
            Change Password
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-900/20 border border-red-500 p-4">
              <div className="text-sm font-inter text-red-300">{error}</div>
            </div>
          )}

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
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                placeholder="Enter your new password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
              >
                {showNewPassword ? (
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
                className={`w-full p-3 bg-gray-800 text-white rounded-md border ${
                  passwordMismatch
                    ? "border-red-500 focus:ring-red focus:border-red"
                    : "border-gray-600 focus:ring-red focus:border-red"
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
            <h3 className="text-sm font-bebas text-white mb-2 uppercase">
              Password Requirements:
            </h3>
            <div className="space-y-1">
              {getPasswordRequirements().map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    {requirement.met ? (
                      <svg
                        className="w-4 h-4 text-green-400"
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
                      <div className="w-4 h-4 border-2 border-gray-500 rounded-sm"></div>
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

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || passwordMismatch || !allRequirementsMet()}
              className="flex-1 bg-[red] text-white font-bebas uppercase py-2 rounded-md hover:bg-[#b80000] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
