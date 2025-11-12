"use client";

import { Suspense } from "react";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import BasketballLoader from "@/components/BasketballLoader";
import LocationGate from "@/components/LocationGate";

export const dynamic = 'force-dynamic';

function RegisterInner() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const fromProfile = searchParams.get("fromProfile") === "true";
  const oauthSuccess = searchParams.get("oauth") === "success";

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
              {fromProfile ? "Add Another Player" : "Register Your Player"}
            </h1>
            <p className="text-gray-300 text-lg">
              {fromProfile
                ? "Complete the form below to register another player"
                : "Join WCS Basketball and start your player's journey"}
            </p>
          </div>

          {/* Registration Wizard */}
          {!authLoading && (
            <LocationGate>
              <div className="bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-700">
                <RegistrationWizard
                  skipParentStep={fromProfile && isAuthenticated}
                  prefillData={prefillData}
                />
              </div>
            </LocationGate>
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
