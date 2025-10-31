"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get("player") || "Your child";

  return (
    <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-900/30 border border-green-500/40 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-green-400"
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
          </div>
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold uppercase">
            Registration Received!
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 space-y-6">
          <div className="space-y-4">
            <p className="text-lg text-white">
              Thank you for registering{" "}
              <span className="font-semibold">{playerName}</span> with World
              Class Sports!
            </p>
            <p className="text-gray-200">
              We've received your registration and our team is reviewing your
              information. Here's what happens next:
            </p>
          </div>

          {/* Process Steps */}
          <div className="bg-gray-900/60 border border-blue-500/40 rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg text-white">
              What to Expect Next
            </h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium text-white">Team Assignment</p>
                  <p className="text-sm text-gray-200">
                    Our admin will review your registration and assign{" "}
                    {playerName} to an appropriate team.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium text-white">
                    Approval Notification
                  </p>
                  <p className="text-sm text-gray-200">
                    You'll receive an email confirming your player's team
                    assignment and approval status.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium text-white">
                    Payment Information
                  </p>
                  <p className="text-sm text-gray-200">
                    Once approved, you'll receive a payment link to complete
                    your registration and secure your spot.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-4">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5"
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
              <div className="text-sm text-gray-200">
                <p className="font-semibold mb-1 text-white">Check Your Email</p>
                <p>
                  Please check the email address you used to register. You
                  should have received a confirmation email that you need to
                  verify to activate your account.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
            <h3 className="font-semibold text-white mb-2">
              Typical Timeline
            </h3>
            <p className="text-sm text-gray-200">
              Our team typically processes registrations within{" "}
              <span className="font-semibold">1-3 business days</span>. You'll
              receive email updates throughout the process.
            </p>
          </div>

          {/* Contact Info */}
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
            <h3 className="font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-sm text-gray-200 mb-2">
              If you have questions about your registration or need to make
              changes, please contact us:
            </p>
            <ul className="text-sm text-gray-200 space-y-1">
              <li>• Email: support@westcoastsports.com</li>
              <li>• Phone: (555) 123-4567</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/parent/profile"
                className="flex-1 bg-red text-white font-bold py-3 px-6 rounded text-center hover:bg-red/90 transition"
              >
                Go to My Profile
              </Link>
              <Link
                href="/teams"
                className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded text-center hover:bg-gray-600 transition"
              >
                Explore Our Teams
              </Link>
            </div>
            <Link
              href="/"
              className="bg-transparent border-2 border-gray-600 text-white font-semibold py-3 px-6 rounded text-center hover:border-gray-500 hover:bg-gray-800 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-300">
          <p>
            Your registration ID is saved. You can sign in at any time to check
            your status.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <RegistrationSuccessContent />
    </Suspense>
  );
}
