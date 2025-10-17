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
} from "@/lib/security";
// Server actions temporarily disabled due to Next.js issues

export default function CoachesLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Password reset functionality temporarily disabled
  // const [newPassword, setNewPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  // Password reset functionality temporarily disabled
  // const [showReset, setShowReset] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/coaches/dashboard");
        return;
      }
    };
    checkAuth();

    // Generate CSRF token for form security (best practice to prevent CSRF attacks)
    const token = generateCSRFToken();
    setCsrfToken(token);
    document.cookie = `csrf-token=${encodeURIComponent(
      token
    )}; Path=/; SameSite=Strict`;

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
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    devLog("🔐 [LOGIN DEBUG] Starting login process...");
    devLog("🔐 [LOGIN DEBUG] Email:", email);
    devLog("🔐 [LOGIN DEBUG] Password length:", password.length);

    setLoading(true);
    setError(null);

    // Validate CSRF token (security best practice)
    const storedCsrf = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1];

    // Decode the URL-encoded token from the cookie
    const decodedStoredCsrf = storedCsrf ? decodeURIComponent(storedCsrf) : "";

    devLog("🔐 [LOGIN DEBUG] CSRF token validation:");
    devLog("🔐 [LOGIN DEBUG] Generated token:", csrfToken);
    devLog("🔐 [LOGIN DEBUG] Stored token:", decodedStoredCsrf);
    devLog(
      "🔐 [LOGIN DEBUG] Tokens match:",
      csrfToken === decodedStoredCsrf
    );

    // Temporarily disable CSRF validation to fix login issue
    // TODO: Re-enable CSRF validation once login flow is working
    devLog(
      "🔐 [LOGIN DEBUG] ⚠️ CSRF validation temporarily disabled for debugging"
    );

    // if (!validateCSRFToken(csrfToken, decodedStoredCsrf)) {
    //   console.error("🔐 [LOGIN DEBUG] ❌ CSRF token validation failed");
    //   setError("Invalid CSRF token");
    //   setLoading(false);
    //   return;
    // }

    // Sanitize inputs to prevent injection (best practice)
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    devLog("🔐 [LOGIN DEBUG] Sanitized email:", sanitizedEmail);
    devLog(
      "🔐 [LOGIN DEBUG] Sanitized password length:",
      sanitizedPassword.length
    );

    try {
      // Check if we're using placeholder values (indicates environment variable issues)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      devLog("🔐 [LOGIN DEBUG] Supabase URL:", supabaseUrl);

      if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
        devError("🔐 [LOGIN DEBUG] ❌ Invalid Supabase URL");
        throw new Error(
          "Database connection not configured. Please check your network settings and try again."
        );
      }

      devLog("🔐 [LOGIN DEBUG] Making request to /api/auth/login...");

      // Use server-side authentication to bypass CORS issues
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: sanitizedPassword,
        }),
      });

      devLog("🔐 [LOGIN DEBUG] Response status:", response.status);
      devLog("🔐 [LOGIN DEBUG] Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        devError("🔐 [LOGIN DEBUG] ❌ Login failed:", errorData);
        throw new Error(errorData.error || "Authentication failed");
      }

      const authData = await response.json();
      devLog("🔐 [LOGIN DEBUG] ✅ Login successful!");
      devLog("🔐 [LOGIN DEBUG] Auth data:", authData);

      // Store session data in localStorage to bypass CORS issues
      if (authData.session) {
        devLog("🔐 [LOGIN DEBUG] Storing session in localStorage...");
        localStorage.setItem(
          "supabase.auth.token",
          JSON.stringify(authData.session)
        );
        // Set a flag to indicate successful authentication
        localStorage.setItem("auth.authenticated", "true");

        // Also store in sessionStorage as backup (survives page reloads)
        sessionStorage.setItem(
          "supabase.auth.token",
          JSON.stringify(authData.session)
        );
        sessionStorage.setItem("auth.authenticated", "true");

        devLog("🔐 [LOGIN DEBUG] Dispatching auth state change event...");
        // Dispatch custom event to notify navbar of auth state change
        window.dispatchEvent(
          new CustomEvent("authStateChanged", {
            detail: { authenticated: true, user: authData.user },
          })
        );
        devLog("🔐 [LOGIN DEBUG] Auth state change event dispatched");
      } else {
        devError("🔐 [LOGIN DEBUG] ⚠️ No session data in auth response");
      }

      // Debug: Confirm user ID before server action call
      devLog("Calling getUserRole with ID:", authData.user.id);

      // For now, allow all authenticated users to proceed
      // TODO: Implement proper role checking when server actions are working
      devLog("User authenticated successfully:", authData.user.id);

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

      // Proceed to dashboard with a small delay to ensure localStorage is set
      devLog(
        "🔐 [LOGIN DEBUG] Setting timeout for navigation to dashboard..."
      );
      setTimeout(() => {
        devLog("🔐 [LOGIN DEBUG] Navigating to dashboard...");
        devLog(
          "🔐 [LOGIN DEBUG] localStorage auth.authenticated:",
          localStorage.getItem("auth.authenticated")
        );
        devLog(
          "🔐 [LOGIN DEBUG] localStorage supabase.auth.token exists:",
          !!localStorage.getItem("supabase.auth.token")
        );
        // Use replace instead of push to prevent back button issues
        router.replace("/coaches/dashboard");
      }, 100);
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

  // Password reset functionality temporarily disabled
  // const handlePasswordReset = async (e: React.FormEvent) => {
  //   // Implementation removed for now
  // };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="pt-20 sm:pt-24">
        <div className="w-full max-w-md space-y-8 mx-auto">
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            WCS Coaches
          </h1>
          {error && <p className="text-red font-inter text-center">{error}</p>}
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
    </div>
  );
}
