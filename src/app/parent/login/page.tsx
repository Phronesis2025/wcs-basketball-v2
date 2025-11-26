"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthPersistence } from "@/lib/authPersistence";
import { devLog, devError } from "@/lib/security";

export default function ParentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      devLog("🔐 [PARENT LOGIN] Starting login process...");
      devLog("🔐 [PARENT LOGIN] Email:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        devError("🔐 [PARENT LOGIN] Login failed:", error);
        setMessage("Invalid email or password");
        setLoading(false);
        return;
      }

      if (data.session) {
        devLog("🔐 [PARENT LOGIN] ✅ Login successful!");
        
        // IMPORTANT: Set the session in Supabase's auth client
        // This ensures Supabase knows about the authenticated state
        devLog("🔐 [PARENT LOGIN] Setting session in Supabase client...");
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

        if (sessionError) {
          devError("🔐 [PARENT LOGIN] ⚠️ Error setting session:", sessionError);
        } else {
          devLog("🔐 [PARENT LOGIN] ✅ Session set in Supabase client successfully");
        }

        // Store session using AuthPersistence for proper persistence
        devLog("🔐 [PARENT LOGIN] Storing session in localStorage...");
        await AuthPersistence.storeSession(data.session);

        devLog("🔐 [PARENT LOGIN] Dispatching auth state change event...");
        // Dispatch custom event to notify navbar of auth state change
        window.dispatchEvent(
          new CustomEvent("authStateChanged", {
            detail: { authenticated: true, user: data.user },
          })
        );
        devLog("🔐 [PARENT LOGIN] Auth state change event dispatched");

        // Proceed to profile page with a small delay to ensure localStorage is set
        devLog("🔐 [PARENT LOGIN] Setting timeout for navigation to profile...");
        setTimeout(() => {
          devLog("🔐 [PARENT LOGIN] Navigating to profile...");
          devLog(
            "🔐 [PARENT LOGIN] localStorage auth.authenticated:",
            localStorage.getItem("auth.authenticated")
          );
          // Use replace instead of push to prevent back button issues
          router.replace("/parent/profile");
        }, 100);
      } else {
        devError("🔐 [PARENT LOGIN] ⚠️ No session data in auth response");
        setMessage("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      devError("🔐 [PARENT LOGIN] Login error:", err);
      setMessage(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/parent/reset-password`,
      });

      if (error) {
        setMessage("Failed to send reset email. Please try again.");
        setForgotPasswordLoading(false);
        return;
      }

      setMessage("Password reset email sent! Please check your inbox and follow the instructions to reset your password.");
      setShowForgotPassword(false);
    } catch (err: any) {
      setMessage(err.message || "An error occurred. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
      </div>

      <section className="relative mx-auto max-w-4xl px-6 text-center" aria-label="Parent Login">
        <h1 className="mb-8 text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter relative z-20">
          Account Login
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl font-inter mb-12">
          Sign in to view your profile and manage your player's registration
        </p>

        <div className="max-w-md mx-auto">
          <div className="login-card-border mb-8">
            <div className="login-card-border-inner">
              <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 font-inter">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-inter"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300 font-inter">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(!showForgotPassword);
                  setMessage("");
                }}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline font-medium font-inter transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            {!showForgotPassword ? (
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg px-4 py-3 pr-12 bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-inter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-slate-300 mb-3 font-inter">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotPasswordLoading || !email}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm font-inter"
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setMessage("");
                  }}
                  className="w-full mt-2 text-slate-400 hover:text-white text-sm underline font-inter transition-colors"
                >
                  Back to login
                </button>
              </div>
            )}
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-inter ${
                message.includes("Invalid") || message.includes("Failed") || message.includes("error")
                  ? "bg-red-900/40 text-red-200 border border-red-500/40"
                  : message.includes("sent") || message.includes("successfully")
                  ? "bg-green-900/40 text-green-200 border border-green-500/40"
                  : "bg-blue-900/40 text-blue-200 border border-blue-500/40"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || showForgotPassword}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-inter"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="text-center text-sm text-slate-400 font-inter mt-6">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-400 font-semibold hover:text-blue-300 hover:underline transition-colors"
            >
              Register here
            </Link>
          </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
