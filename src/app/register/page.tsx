"use client";

import { Suspense } from "react";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import BasketballLoader from "@/components/BasketballLoader";
import LocationGate from "@/components/LocationGate";
import Navbar from "@/components/Navbar";

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
    <>
      <Navbar />
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>

        <section className="relative mx-auto max-w-4xl px-6" aria-label="Registration">
          {/* Header */}
          <div className="text-center mb-12 relative z-20">
            <h1 className="mb-4 text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter">
              {fromProfile ? "Add Another Player" : "Register Your Player"}
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-inter max-w-2xl mx-auto">
              {fromProfile
                ? "Complete the form below to register another player"
                : "Join WCS Basketball and start your player's journey"}
            </p>
          </div>

          {/* Registration Wizard */}
          {!authLoading && (
            <LocationGate>
              <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-6 md:p-8">
                <RegistrationWizard
                  skipParentStep={fromProfile && isAuthenticated}
                  prefillData={prefillData}
                />
              </div>
            </LocationGate>
          )}

          {authLoading && (
            <div className="text-center py-12 relative z-10">
              <BasketballLoader size={80} />
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <BasketballLoader size={80} />
      </div>
    }>
      <RegisterInner />
    </Suspense>
  );
}
