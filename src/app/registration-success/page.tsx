"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import BasketballLoader from "@/components/BasketballLoader";
import Navbar from "@/components/Navbar";

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get("player") || "Your child";

  return (
    <>
      <Navbar />
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>

        <section
          className="relative mx-auto max-w-4xl px-6"
          aria-label="Registration Success"
        >
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <div className="relative z-10 bg-white/5 border border-green-500/30 rounded-xl p-8 mb-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-900/30 border border-green-500/40 rounded-full mb-4 relative overflow-hidden group">
                  <svg
                    className="w-10 h-10 text-green-400 relative z-10"
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
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                </div>
              </div>
              <h1 className="mb-4 text-4xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600 md:text-5xl font-inter">
                Registration Received!
              </h1>
              <p className="text-lg text-slate-300 mb-2 font-inter">
                Thank you for registering{" "}
                <span className="font-semibold text-white">{playerName}</span>{" "}
                with World Class Sports!
              </p>
              <p className="text-slate-300 mb-4 font-inter">
                We've received your registration and our team is reviewing your
                information.
              </p>
            </div>

            {/* Main Content Card */}
            <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-8 md:p-12 space-y-6">
              {/* Process Steps */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-3xl font-inter">
                  What to Expect Next
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base relative overflow-hidden group">
                      <span className="relative z-10">1</span>
                      {/* Shimmer effect - starts immediately */}
                      <div
                        className="absolute inset-0 animate-shimmer-sequential bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        style={{ animationDelay: "0s" }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1 font-inter">
                        Team Assignment
                      </p>
                      <p className="text-sm text-slate-300 font-inter">
                        Our admin will review your registration and assign{" "}
                        <span className="font-semibold text-white">
                          {playerName}
                        </span>{" "}
                        to an appropriate team.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base relative overflow-hidden group">
                      <span className="relative z-10">2</span>
                      {/* Shimmer effect - starts after circle 1 (2s shimmer + 1s wait = 3s delay) */}
                      <div
                        className="absolute inset-0 animate-shimmer-sequential bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        style={{ animationDelay: "3s" }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1 font-inter">
                        Approval Notification
                      </p>
                      <p className="text-sm text-slate-300 font-inter">
                        You'll receive an email confirming your player's team
                        assignment and approval status.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base relative overflow-hidden group">
                      <span className="relative z-10">3</span>
                      {/* Shimmer effect - starts after circle 2 (3s + 2s shimmer + 1s wait = 6s delay) */}
                      <div
                        className="absolute inset-0 animate-shimmer-sequential bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        style={{ animationDelay: "6s" }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1 font-inter">
                        Payment Information
                      </p>
                      <p className="text-sm text-slate-300 font-inter">
                        Once approved, you'll receive a payment link to complete
                        your registration and secure your spot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5"
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
                  <div className="text-sm text-blue-300 font-inter">
                    <p className="font-semibold mb-1 text-white">
                      Check Your Email
                    </p>
                    <p>
                      Please check the email address you used to register. You
                      should have received a confirmation email that you need to
                      verify to activate your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2 font-inter">
                  Typical Timeline
                </h3>
                <p className="text-sm text-slate-300 font-inter">
                  Our team typically processes registrations within{" "}
                  <span className="font-semibold text-white">
                    1-3 business days
                  </span>
                  . You'll receive email updates throughout the process.
                </p>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2 font-inter">
                  Need Help?
                </h3>
                <p className="text-sm text-slate-300 mb-2 font-inter">
                  If you have questions about your registration or need to make
                  changes, please contact us:
                </p>
                <ul className="text-sm text-slate-300 space-y-1 font-inter">
                  <li>• Email: wcsbts@gmail.com</li>
                  <li>• Phone: (555) 123-4567</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/teams"
                  className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded text-center hover:bg-gray-600 transition min-h-[48px] flex items-center justify-center font-inter"
                >
                  Explore Our Teams
                </Link>
                <Link
                  href="/"
                  className="flex-1 bg-transparent border-2 border-gray-600 text-white font-semibold py-3 px-6 rounded text-center hover:border-gray-500 hover:bg-gray-800 transition min-h-[48px] flex items-center justify-center font-inter"
                >
                  Return to Home
                </Link>
              </div>
            </div>

            {/* Additional Info */}
            <div className="relative z-10 mt-8 text-center text-sm text-slate-400 font-inter">
              <p>
                Your registration ID is saved. To sign in later, use the "Forgot
                Password" option on the login page to set your password, then
                you can access your profile to check your status.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export const dynamic = "force-dynamic";

export default function RegistrationSuccess() {
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
      <RegistrationSuccessContent />
    </Suspense>
  );
}
