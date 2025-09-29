// src/app/coaches/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  devLog,
  devError,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
} from "@/lib/security";

export default function CoachesLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Generate CSRF token
    const token = generateCSRFToken();
    setCsrfToken(token);
    document.cookie = `csrf-token=${token}; Path=/; SameSite=Strict`;

    // Client-side rate limiting (5 attempts/5 minutes)
    const storedAttempts = localStorage.getItem("login_attempts");
    const storedTimestamp = localStorage.getItem("login_timestamp");
    const now = Date.now();
    if (
      storedAttempts &&
      storedTimestamp &&
      now - parseInt(storedTimestamp) < 5 * 60 * 1000
    ) {
      const count = parseInt(storedAttempts);
      if (count >= 5) {
        setIsLocked(true);
        setError("Too many login attempts. Please try again in 5 minutes.");
      }
      setAttempts(count);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError(null);

    // Validate CSRF
    const storedCsrf = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1];
    if (!validateCSRFToken(csrfToken, storedCsrf || "")) {
      setError("Invalid CSRF token");
      setLoading(false);
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password: sanitizedPassword,
        });

      if (signInError) {
        throw new Error("Invalid email or password");
      }

      // Check user role
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, password_reset")
        .eq("id", authData.user.id)
        .single();

      if (
        userError ||
        !userData ||
        !["coach", "admin"].includes(userData.role)
      ) {
        // Sign out if not authorized
        await supabase.auth.signOut();
        throw new Error("Unauthorized: Only coaches and admins can log in");
      }

      // Increment login attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("login_attempts", newAttempts.toString());
      localStorage.setItem("login_timestamp", Date.now().toString());
      if (newAttempts >= 5) {
        setIsLocked(true);
        setError("Too many login attempts. Please try again in 5 minutes.");
        setLoading(false);
        return;
      }

      devLog("Login successful for", sanitizedEmail);

      // Check if password reset is required
      if (userData.password_reset) {
        setShowReset(true);
        setLoading(false);
        return;
      }

      // Clear rate limiting on success
      localStorage.removeItem("login_attempts");
      localStorage.removeItem("login_timestamp");
      router.push("/coaches/dashboard");
    } catch (err) {
      devError("Login error:", err);
      setError((err as Error).message || "Invalid email or password");
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      setError("Password must be 8+ characters with uppercase and numbers");
      return;
    }

    setLoading(true);
    try {
      // Update Supabase Auth password
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (authError) {
        throw new Error("Failed to update password: " + authError.message);
      }

      // Update password_reset flag
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        throw new Error("No authenticated user found");
      }
      const { error: updateError } = await supabase
        .from("users")
        .update({ password_reset: false })
        .eq("id", user.user.id);

      if (updateError) {
        throw new Error(
          "Failed to update password_reset: " + updateError.message
        );
      }

      devLog("Password reset successful for", email);

      // Clear rate limiting
      localStorage.removeItem("login_attempts");
      localStorage.removeItem("login_timestamp");
      router.push("/coaches/dashboard");
    } catch (err) {
      devError("Password reset error:", err);
      setError((err as Error).message || "Failed to reset password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-900/50 border border-red-500/50 rounded-lg p-6">
        <h1 className="text-3xl font-bebas uppercase text-center mb-6">
          Coaches Login
        </h1>
        {error && (
          <p className="text-red font-inter text-center mb-4">{error}</p>
        )}
        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="hidden" name="csrf-token" value={csrfToken} />
            <div>
              <label htmlFor="email" className="block text-sm font-inter">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                disabled={isLocked || loading}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-inter">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                disabled={isLocked || loading}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
              disabled={isLocked || loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input type="hidden" name="csrf-token" value={csrfToken} />
            <p className="text-gray-300 font-inter">
              Please set a new password for your account.
            </p>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-inter"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-inter"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                disabled={loading}
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        <div className="text-center mt-4">
          <Link
            href="/teams"
            className="text-red hover:underline font-inter"
            aria-label="Back to teams"
          >
            ← Back to Teams
          </Link>
        </div>
      </div>
    </div>
  );
}
