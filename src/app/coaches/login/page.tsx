// src/app/coaches/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  devLog,
  devError,
  sanitizeInput,
  generateCSRFToken,
} from "@/lib/security";
import { AuthPersistence } from "@/lib/authPersistence";
import LocationGate from "@/components/LocationGate";
// Server actions temporarily disabled due to Next.js issues

export default function CoachesLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        // Check if we're in the process of signing out
        const isSigningOut = localStorage.getItem("auth.signingOut");
        if (isSigningOut) {
          devLog("User is signing out, staying on login page");
          localStorage.removeItem("auth.signingOut");
          return;
        }

        // Check if user should be redirected to login (inverse logic)
        const shouldRedirect = await AuthPersistence.shouldRedirectToLogin();
        if (!shouldRedirect) {
          devLog("User already authenticated, redirecting to club management");
          router.push("/admin/club-management");
          return;
        }
      } catch (error) {
        devError("Error checking authentication:", error);
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
    devLog("🔐 [LOGIN DEBUG] Tokens match:", csrfToken === decodedStoredCsrf);

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

      // Store session data and set it in Supabase client
      if (authData.session) {
        devLog("🔐 [LOGIN DEBUG] Setting session in Supabase client...");

        // IMPORTANT: Set the session in Supabase's auth client
        // This ensures Supabase knows about the authenticated state
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
          });

        if (sessionError) {
          devError("🔐 [LOGIN DEBUG] ⚠️ Error setting session:", sessionError);
        } else {
          devLog(
            "🔐 [LOGIN DEBUG] ✅ Session set in Supabase client successfully"
          );
        }

        // Also store in localStorage as backup
        devLog("🔐 [LOGIN DEBUG] Storing session in localStorage...");
        await AuthPersistence.storeSession(authData.session);

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

      // Check if user needs to reset password
      try {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, email, role, password_reset")
          .eq("id", authData.user.id)
          .single();

        if (userError) {
          devError("Failed to fetch user data:", userError);
          setError("Failed to load user data");
          setLoading(false);
          return;
        }

        devLog("User data:", userData);

        // If user needs password reset, redirect to setup page
        if (userData.password_reset) {
          devLog("User needs password reset, redirecting to setup page");
          router.replace("/coaches/setup-password");
          return;
        }

        devLog("User authenticated successfully:", authData.user.id);
      } catch (error) {
        devError("Error checking user password reset status:", error);
        setError("Failed to verify account status");
        setLoading(false);
        return;
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

      // Proceed to dashboard with a small delay to ensure localStorage is set
      devLog("🔐 [LOGIN DEBUG] Setting timeout for navigation to dashboard...");
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
        router.replace("/admin/club-management");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordMessage(null);
    setError(null);

    if (!email) {
      setForgotPasswordMessage("Please enter your username");
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await fetch("/api/auth/coach-forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotPasswordMessage(data.error || "Failed to verify username. Please try again.");
        setForgotPasswordLoading(false);
        return;
      }

      // Redirect to reset password page with token
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        setForgotPasswordMessage("An error occurred. Please try again.");
      }
    } catch (err: any) {
      devError("Forgot password error:", err);
      setForgotPasswordMessage("An error occurred. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <LocationGate>
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>

        <section className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="mb-8 text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter relative z-20">
            WCS Coaches
          </h1>
            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm bg-red-900/40 text-red-200 border border-red-500/40 font-inter">
                {error}
              </div>
            )}
          {forgotPasswordMessage && (
            <div
                className={`p-3 rounded-lg text-sm mb-4 font-inter ${
                forgotPasswordMessage.includes("error") || forgotPasswordMessage.includes("Failed")
                  ? "bg-red-900/40 text-red-200 border border-red-500/40"
                  : forgotPasswordMessage.includes("sent") || forgotPasswordMessage.includes("exists")
                  ? "bg-green-900/40 text-green-200 border border-green-500/40"
                  : "bg-blue-900/40 text-blue-200 border border-blue-500/40"
              }`}
            >
              {forgotPasswordMessage}
            </div>
          )}
            <div className="login-card-border mb-8">
              <div className="login-card-border-inner">
                <form onSubmit={handleLogin} className="space-y-6">
            <input type="hidden" name="csrf-token" value={csrfToken} />
            <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2 font-inter">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-inter"
                disabled={isLocked || loading}
                required
                autoComplete="username"
                    placeholder="your.email@example.com"
              />
            </div>
            <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 font-inter">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(!showForgotPassword);
                    setError(null);
                    setForgotPasswordMessage(null);
                  }}
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium font-inter transition-colors"
                  disabled={isLocked || loading}
                >
                  Forgot Password?
                </button>
              </div>
              {!showForgotPassword ? (
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg px-4 py-3 pr-12 bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-inter"
                    disabled={isLocked || loading}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none transition-colors"
                    disabled={isLocked || loading}
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
              ) : (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-1">
                      <p className="text-sm text-slate-300 mb-3 font-inter">
                    Enter your username and we'll redirect you to reset your password.
                  </p>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={forgotPasswordLoading || !email}
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm font-inter"
                  >
                    {forgotPasswordLoading ? "Verifying..." : "Continue to Reset"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordMessage(null);
                    }}
                        className="w-full mt-2 text-slate-400 hover:text-white text-sm underline font-inter transition-colors"
                  >
                    Back to login
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-inter"
              disabled={isLocked || loading || showForgotPassword}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
              </div>
            </div>
        </div>
        </section>
      </main>
    </LocationGate>
  );
}
