"use client";

import { Suspense } from "react";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import GuestSignupForm from "@/components/registration/GuestSignupForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import BasketballLoader from "@/components/BasketballLoader";

export const dynamic = 'force-dynamic';

function RegisterInner() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const fromProfile = searchParams.get("fromProfile") === "true";
  const oauthSuccess = searchParams.get("oauth") === "success";
  const isGuest = searchParams.get("guest") === "true";
  const guestConfirmation = searchParams.get("guest_confirmation") === "true";

  // Pre-fill data if coming from profile or OAuth
  const prefillData: any = {};
  
  if (fromProfile && user) {
    prefillData.parent_email = user.email || "";
    // Load from profile API would go here if needed
  }

  if (oauthSuccess && user) {
    prefillData.parent_email = user.email || "";
    prefillData.parent_first_name = user.user_metadata?.full_name?.split(" ")[0] || "";
    prefillData.parent_last_name = user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "";
  }

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Registration">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold uppercase mb-4">
              {fromProfile ? "Add Another Child" : "Register Your Player"}
            </h1>
            <p className="text-gray-300 text-lg">
              {fromProfile
                ? "Complete the form below to register another child"
                : "Join WCS Basketball and start your player's journey"}
            </p>
          </div>

        {/* Guest Confirmation Message */}
        {guestConfirmation && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 mb-6">
            <h3 className="text-green-400 font-semibold mb-2 text-xl">✓ Magic Link Sent!</h3>
            <p className="text-gray-300 mb-4">
              Check your email and click the confirmation link to complete your registration.
            </p>
            <p className="text-sm text-gray-400">
              After clicking the link in your email, you'll be automatically signed in and redirected to your profile.
            </p>
          </div>
        )}

        {/* Guest Signup Form - Only show if NOT in confirmation state */}
        {isGuest && !guestConfirmation && !authLoading && (
          <div className="bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-700">
            <GuestSignupForm />
          </div>
        )}

          {/* Registration Wizard */}
          {!isGuest && !authLoading && (
            <div className="bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-700">
              <RegistrationWizard
                skipParentStep={fromProfile && isAuthenticated}
                prefillData={prefillData}
              />
            </div>
          )}

          {/* Authentication Options - Only show if not authenticated or not from profile */}
          {/* Moved below the form */}
          {!fromProfile && !isAuthenticated && !isGuest && (
            <div className="mt-8 space-y-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bebas text-white mb-4 text-center">
                  Quick Sign Up
                </h2>
                
                {/* Google OAuth - Primary */}
                <div className="mb-4">
                  <GoogleSignInButton
                    variant="primary"
                    className="w-full"
                  />
                </div>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-800 text-gray-400">or continue with email</span>
                  </div>
                </div>

                {/* Email/Password Option - Secondary */}
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">
                    Already have an account?{" "}
                    <Link href="/parent/login" className="text-red hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {authLoading && (
            <div className="text-center py-12">
              <BasketballLoader size={80} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="bg-navy min-h-screen text-white flex items-center justify-center">
        <BasketballLoader size={80} />
      </div>
    }>
      <RegisterInner />
    </Suspense>
  );
}
