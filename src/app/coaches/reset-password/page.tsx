"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import BasketballLoader from "@/components/BasketballLoader";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"username" | "reset">("username");
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Password requirements validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Check if we have a reset token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setResetToken(token);
      setStep("reset");
    }
  }, [searchParams]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!username) {
      setMessage("Please enter your username");
      return;
    }

    setLoading(true);
    try {
      // Call API to verify username and get reset token
      const response = await fetch("/api/auth/coach-forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to verify username. Please try again.");
        setLoading(false);
        return;
      }

      // If successful, redirect to reset password page with token
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setMessage("An error occurred. Please contact an administrator.");
        setLoading(false);
      }
    } catch (err: any) {
      devError("Username verification error:", err);
      setMessage("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Both password fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Validate all password requirements
    if (!allRequirementsMet) {
      setMessage("Please meet all password requirements");
      return;
    }

    if (!resetToken) {
      setMessage("Invalid reset token. Please start over.");
      router.push("/coaches/reset-password");
      return;
    }

    setLoading(true);
    try {
      // Verify token and reset password
      const response = await fetch("/api/auth/coach-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/coaches/login");
      }, 2000);
    } catch (err: any) {
      devError("Password reset error:", err);
      setMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (step === "username") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bebas text-white uppercase mb-6 text-center">
            Reset Password
          </h2>
          <p className="text-sm text-gray-300 mb-6 text-center">
            Enter your username to reset your password
          </p>

          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-inter text-white mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`rounded-md border p-4 ${
                  message.includes("successfully") || message.includes("sent")
                    ? "bg-green-900/20 border-green-500"
                    : "bg-red-900/20 border-red-500"
                }`}
              >
                <div
                  className={`text-sm font-inter ${
                    message.includes("successfully") || message.includes("sent")
                      ? "text-green-300"
                      : "text-red-300"
                  }`}
                >
                  {message}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>

            <Link
              href="/coaches/login"
              className="block text-center text-sm text-gray-400 hover:text-white underline"
            >
              Back to login
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bebas text-white uppercase mb-6 text-center">
          Set New Password
        </h2>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-inter text-white mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
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
                    className="w-5 h-5"
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
            
            {/* Password Requirements */}
            <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
              <p className="text-xs font-inter text-gray-300 mb-2">Password Requirements:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center text-xs">
                  <span className={`mr-2 ${passwordRequirements.minLength ? "text-green-400" : "text-gray-500"}`}>
                    {passwordRequirements.minLength ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <span className={passwordRequirements.minLength ? "text-gray-300" : "text-gray-500"}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  <span className={`mr-2 ${passwordRequirements.hasUpperCase ? "text-green-400" : "text-gray-500"}`}>
                    {passwordRequirements.hasUpperCase ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <span className={passwordRequirements.hasUpperCase ? "text-gray-300" : "text-gray-500"}>
                    One uppercase letter
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  <span className={`mr-2 ${passwordRequirements.hasLowerCase ? "text-green-400" : "text-gray-500"}`}>
                    {passwordRequirements.hasLowerCase ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <span className={passwordRequirements.hasLowerCase ? "text-gray-300" : "text-gray-500"}>
                    One lowercase letter
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  <span className={`mr-2 ${passwordRequirements.hasNumber ? "text-green-400" : "text-gray-500"}`}>
                    {passwordRequirements.hasNumber ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <span className={passwordRequirements.hasNumber ? "text-gray-300" : "text-gray-500"}>
                    One number
                  </span>
                </li>
                <li className="flex items-center text-xs">
                  <span className={`mr-2 ${passwordRequirements.hasSpecialChar ? "text-green-400" : "text-gray-500"}`}>
                    {passwordRequirements.hasSpecialChar ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                  <span className={passwordRequirements.hasSpecialChar ? "text-gray-300" : "text-gray-500"}>
                    One special character (!@#$%^&* etc.)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter text-white mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-5 h-5"
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
                    className="w-5 h-5"
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

          {message && (
            <div
              className={`rounded-md border p-4 ${
                message.includes("successfully")
                  ? "bg-green-900/20 border-green-500"
                  : "bg-red-900/20 border-red-500"
              }`}
            >
              <div
                className={`text-sm font-inter ${
                  message.includes("successfully")
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {message}
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading || !allRequirementsMet || password !== confirmPassword}
              className="flex-1 bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <Link
              href="/coaches/login"
              className="px-6 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <BasketballLoader size={80} />
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

