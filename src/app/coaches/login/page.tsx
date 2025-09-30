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
import { getUserRole, updatePasswordReset } from "@/lib/actions"; // Ensure actions.ts exports these

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
    // Generate CSRF token for form security (best practice to prevent CSRF attacks)
    const token = generateCSRFToken();
    setCsrfToken(token);
    document.cookie = `csrf-token=${token}; Path=/; SameSite=Strict`;

    // Client-side rate limiting to prevent brute-force (5 attempts/5 min)
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

    // Validate CSRF token (security best practice)
    const storedCsrf = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1];
    if (!validateCSRFToken(csrfToken, storedCsrf || "")) {
      setError("Invalid CSRF token");
      setLoading(false);
      return;
    }

    // Sanitize inputs to prevent injection (best practice)
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    try {
      // Sign in with Supabase Auth (client-side, anon key ok)
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password: sanitizedPassword,
        });

      if (signInError) {
        throw new Error("Invalid email or password");
      }

      // Debug: Confirm user ID before server action call
      devLog("Calling getUserRole with ID:", authData.user.id);

      // Call server action for role check (secure, server-side)
      const userData = await getUserRole(authData.user.id);

      if (!userData || !["coach", "admin"].includes(userData.role)) {
        // Sign out if not authorized (security best practice)
        await supabase.auth.signOut();
        throw new Error("Unauthorized: Only coaches and admins can log in");
      }

      // Increment login attempts (rate limiting continuation)
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("login_attempts", newAttempts.toString());
      localStorage.setItem("login_timestamp", Date.now().toString());

      // Clear attempts on successful login
      if (newAttempts >= 5) {
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("login_timestamp");
      }

      // Check password reset flag
      if (userData.password_reset) {
        setShowReset(true);
      } else {
        router.push("/coaches/dashboard");
      }
    } catch (err: unknown) {
      devError("Login error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("login_attempts", newAttempts.toString());
      localStorage.setItem("login_timestamp", Date.now().toString());
      if (newAttempts >= 5) {
        setIsLocked(true);
        setError("Too many login attempts. Please try again in 5 minutes.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate CSRF token
    const storedCsrf = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1];
    if (!validateCSRFToken(csrfToken, storedCsrf || "")) {
      setError("Invalid CSRF token");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Update password (client-side auth)
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Get user ID from session (client-side)
      const { data: session } = await supabase.auth.getSession();
      if (session && session.session) {
        const userId = session.session.user.id;
        // Call server action for DB update (secure)
        await updatePasswordReset(userId);
        router.push("/coaches/dashboard");
      } else {
        throw new Error("Session not found");
      }
    } catch (err: unknown) {
      devError("Password reset error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during password reset"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {error && <p className="text-red font-inter text-center">{error}</p>}
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
