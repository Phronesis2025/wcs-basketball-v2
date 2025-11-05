"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BasketballLoader from "@/components/BasketballLoader";

function RegistrationPendingContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get("player");

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Registration Pending">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 mb-8 text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bebas font-bold uppercase mb-4 text-green-400">
                Magic Link Sent!
              </h1>
              <p className="text-lg text-gray-300 mb-2">
                We've sent a confirmation email to your inbox.
              </p>
              <p className="text-gray-300 mb-4">
                {playerName
                  ? `Please check your email to complete ${playerName}'s registration.`
                  : "Please check your email to complete your registration."}
              </p>
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-300">
                  <strong>What's next?</strong> Click the confirmation link in your email to
                  complete your registration. You'll be automatically signed in and redirected to
                  your profile.
                </p>
              </div>
            </div>

            {/* Explore Website Section */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
              <h2 className="text-2xl font-bebas text-white uppercase mb-6 text-center">
                Explore While You Wait
              </h2>
              <p className="text-gray-300 text-center mb-8">
                Check out these areas of our website while you wait for your confirmation email:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teams */}
                <Link
                  href="/teams"
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-6 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bebas text-white group-hover:text-red">
                      Our Teams
                    </h3>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-red transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">
                    View all our basketball teams and find the perfect fit for your player.
                  </p>
                </Link>

                {/* Schedules */}
                <Link
                  href="/schedules"
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-6 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bebas text-white group-hover:text-red">
                      Game Schedule
                    </h3>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-red transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">
                    Check out upcoming games, practices, and events.
                  </p>
                </Link>

                {/* About */}
                <Link
                  href="/about"
                  className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-6 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bebas text-white group-hover:text-red">
                      About Us
                    </h3>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-red transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400">
                    Learn more about WCS Basketball and our mission.
                  </p>
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-gray-900/30 border border-gray-700 rounded-lg p-6 text-center">
              <p className="text-gray-300 mb-2">
                Didn't receive the email? Check your spam folder or{" "}
                <Link
                  href="/register"
                  className="text-red hover:underline font-semibold"
                >
                  try registering again
                </Link>
                .
              </p>
              <p className="text-sm text-gray-400">
                If you continue to have issues, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function RegistrationPending() {
  return (
    <Suspense
      fallback={
        <div className="bg-navy min-h-screen text-white flex items-center justify-center">
          <BasketballLoader size={80} />
        </div>
      }
    >
      <RegistrationPendingContent />
    </Suspense>
  );
}

