// src/app/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserRole } from "@/lib/actions";
import { devError } from "@/lib/security";

export default function AdminAnalytics() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the same custom authentication method as coaches dashboard
        let authToken = localStorage.getItem("supabase.auth.token");
        let isAuthenticated = localStorage.getItem("auth.authenticated");

        // If localStorage is empty, try sessionStorage (survives page reloads)
        if (!authToken || !isAuthenticated) {
          authToken = sessionStorage.getItem("supabase.auth.token");
          isAuthenticated = sessionStorage.getItem("auth.authenticated");
        }

        if (!authToken || !isAuthenticated) {
          setIsLoading(false);
          return;
        }

        // Parse the session token
        const session = JSON.parse(authToken);
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const user = session.user;
        setUser(user);

        // Check if user has admin role
        const userData = await getUserRole(user.id);
        if (userData?.role === "admin") {
          setIsAuthorized(true);
        }
      } catch (error) {
        devError("Error checking authorization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-navy min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red mx-auto mb-4"></div>
          <p className="text-lg font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="bg-navy min-h-screen text-white">
        <section className="pt-20 pb-12 sm:pt-24" aria-label="Access Denied">
          <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 uppercase">
                Access Denied
              </h1>

              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 mb-8">
                <div className="text-6xl mb-4">🔒</div>
                <h2 className="text-2xl font-bebas font-bold mb-4 text-red">
                  Admin Access Required
                </h2>
                <p className="text-lg font-inter text-gray-300 mb-6">
                  This page is restricted to administrators only. You do not
                  have permission to view analytics data.
                </p>

                {!user ? (
                  <div className="space-y-4">
                    <Link
                      href="/coaches/login"
                      className="inline-block bg-red text-white font-bebas uppercase py-3 px-8 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Login as Admin
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                      Logged in as: {user.email}
                    </p>
                    <Link
                      href="/coaches/dashboard"
                      className="inline-block bg-gray-600 text-white font-bebas uppercase py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/"
                className="text-red hover:underline font-inter"
                aria-label="Back to home"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Admin Analytics">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
              Admin Analytics
            </h1>

            {/* Welcome Message */}
            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 mb-8">
              <div className="text-center">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-red">
                  Analytics Dashboard
                </h2>
                <p className="text-lg font-inter text-gray-300">
                  Welcome to the admin analytics dashboard. Here you can view
                  comprehensive data about your basketball program.
                </p>
              </div>
            </div>

            {/* Analytics Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Players Card */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-gray-400 uppercase tracking-wide">
                      Total Players
                    </p>
                    <p className="text-3xl font-bebas font-bold text-white">
                      --
                    </p>
                  </div>
                  <div className="text-4xl text-red">👥</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
              </div>

              {/* Active Teams Card */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-gray-400 uppercase tracking-wide">
                      Active Teams
                    </p>
                    <p className="text-3xl font-bebas font-bold text-white">
                      --
                    </p>
                  </div>
                  <div className="text-4xl text-red">🏀</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
              </div>

              {/* Upcoming Games Card */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-gray-400 uppercase tracking-wide">
                      Upcoming Games
                    </p>
                    <p className="text-3xl font-bebas font-bold text-white">
                      --
                    </p>
                  </div>
                  <div className="text-4xl text-red">📅</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
              </div>

              {/* Registration Rate Card */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-gray-400 uppercase tracking-wide">
                      Registration Rate
                    </p>
                    <p className="text-3xl font-bebas font-bold text-white">
                      --%
                    </p>
                  </div>
                  <div className="text-4xl text-red">📊</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
              </div>

              {/* Practice Attendance Card */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-gray-400 uppercase tracking-wide">
                      Avg. Practice Attendance
                    </p>
                    <p className="text-3xl font-bebas font-bold text-white">
                      --%
                    </p>
                  </div>
                  <div className="text-4xl text-red">✅</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
              </div>

              {/* Revenue Card */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-inter text-gray-400 uppercase tracking-wide">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bebas font-bold text-white">
                      $--
                    </p>
                  </div>
                  <div className="text-4xl text-red">💰</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Player Growth Chart */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bebas font-bold mb-4 text-red">
                  Player Growth Over Time
                </h3>
                <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 font-inter">Chart Coming Soon</p>
                </div>
              </div>

              {/* Team Performance Chart */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bebas font-bold mb-4 text-red">
                  Team Performance
                </h3>
                <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 font-inter">Chart Coming Soon</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bebas font-bold mb-4 text-red">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-red rounded-full"></div>
                  <p className="text-gray-300 font-inter">
                    Analytics tracking will be implemented soon
                  </p>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <p className="text-gray-300 font-inter">
                    Real-time data monitoring coming soon
                  </p>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <p className="text-gray-300 font-inter">
                    Export functionality will be available
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/coaches/dashboard"
                className="bg-red text-white font-bebas uppercase py-3 px-8 rounded-lg hover:bg-red-600 transition-colors text-center"
              >
                Back to Dashboard
              </Link>
              <button
                disabled
                className="bg-gray-600 text-gray-400 font-bebas uppercase py-3 px-8 rounded-lg cursor-not-allowed"
              >
                Export Data (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
