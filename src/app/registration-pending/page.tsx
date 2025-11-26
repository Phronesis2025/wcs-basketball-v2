"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BasketballLoader from "@/components/BasketballLoader";
import Navbar from "@/components/Navbar";

function RegistrationPendingContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get("player");

  return (
    <>
      <Navbar />
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>

        <section className="relative mx-auto max-w-4xl px-6" aria-label="Registration Pending">
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <div className="relative z-10 bg-white/5 border border-green-500/30 rounded-xl p-8 mb-8 text-center">
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
              <h1 className="mb-4 text-4xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600 md:text-5xl font-inter">
                Magic Link Sent!
              </h1>
              <p className="text-lg text-slate-300 mb-2 font-inter">
                We've sent a confirmation email to your inbox.
              </p>
              <p className="text-slate-300 mb-4 font-inter">
                {playerName
                  ? `Please check your email to complete ${playerName}'s registration.`
                  : "Please check your email to complete your registration."}
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-300 font-inter">
                  <strong>What's next?</strong> Click the confirmation link in your email to
                  complete your registration. You'll be automatically signed in and redirected to
                  your profile.
                </p>
              </div>
            </div>

            {/* Explore Website Section */}
            <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-8 md:p-12">
              <h2 className="mb-4 text-3xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-4xl font-inter text-center">
                Explore While You Wait
              </h2>
              <p className="text-slate-400 text-center mb-10 font-inter text-base md:text-lg">
                Check out these areas of our website while you wait for your confirmation email:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Teams */}
                <Link
                  href="/teams"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl p-6 md:p-8 transition-all duration-300 group flex flex-col"
                >
                  <div className="mb-4">
                    <svg
                      className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors font-inter mb-2">
                      Our Teams
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 font-inter leading-relaxed flex-grow">
                    View all our basketball teams and find the perfect fit for your player.
                  </p>
                  <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium font-inter">Explore</span>
                    <svg
                      className="w-4 h-4 ml-2"
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
                </Link>

                {/* Schedules */}
                <Link
                  href="/schedules"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl p-6 md:p-8 transition-all duration-300 group flex flex-col"
                >
                  <div className="mb-4">
                    <svg
                      className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors font-inter mb-2">
                      Game Schedule
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 font-inter leading-relaxed flex-grow">
                    Check out upcoming games, practices, and events.
                  </p>
                  <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium font-inter">Explore</span>
                    <svg
                      className="w-4 h-4 ml-2"
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
                </Link>

                {/* About */}
                <Link
                  href="/about"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl p-6 md:p-8 transition-all duration-300 group flex flex-col"
                >
                  <div className="mb-4">
                    <svg
                      className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors font-inter mb-2">
                      About Us
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 font-inter leading-relaxed flex-grow">
                    Learn more about WCS Basketball and our mission.
                  </p>
                  <div className="mt-4 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span className="text-sm font-medium font-inter">Explore</span>
                    <svg
                      className="w-4 h-4 ml-2"
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
                </Link>
              </div>
            </div>

            {/* Help Section */}
            <div className="relative z-10 mt-8 bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-slate-300 mb-2 font-inter">
                Didn't receive the email? Check your spam folder or{" "}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                >
                  try registering again
                </Link>
                .
              </p>
              <p className="text-sm text-slate-400 font-inter">
                If you continue to have issues, please contact our support team.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default function RegistrationPending() {
  return (
    <Suspense
      fallback={
        <div className="bg-black min-h-screen text-white flex items-center justify-center">
          <BasketballLoader size={80} />
        </div>
      }
    >
      <RegistrationPendingContent />
    </Suspense>
  );
}

