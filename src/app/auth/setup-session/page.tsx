"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AuthPersistence } from "@/lib/authPersistence";
import { devLog, devError } from "@/lib/security";
import BasketballLoader from "@/components/BasketballLoader";

function SetupSessionInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const registered = searchParams.get("registered") === "true";

  useEffect(() => {
    const setupSession = async () => {
      if (!email) {
        devError("setup-session: No email provided");
        router.push("/register?error=no_email");
        return;
      }

      devLog("setup-session: Setting up session for", { email });

      try {
        // Send OTP to establish session (this will use Supabase's magic link)
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/parent/profile?registered=true`,
            shouldCreateUser: false, // User already created by admin
          },
        });

        if (error) {
          devError("setup-session: Failed to send OTP", error);
          // Try alternative: Check if we can get existing session
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session) {
            devLog("setup-session: Found existing session");
            await AuthPersistence.storeSession(sessionData.session);
            window.dispatchEvent(
              new CustomEvent("authStateChanged", {
                detail: { authenticated: true, user: sessionData.session.user },
              })
            );
            router.push("/parent/profile?registered=true");
          } else {
            // No session - redirect to login
            router.push(`/parent/login?email=${encodeURIComponent(email)}&message=Please check your email for a sign-in link`);
          }
          return;
        }

        if (data) {
          devLog("setup-session: OTP sent, redirecting to email confirmation");
          // User needs to click link in email
          router.push("/register?message=Check your email to complete sign-in");
        }
      } catch (error) {
        devError("setup-session: Exception", error);
        router.push("/register?error=session_setup_failed");
      }
    };

    setupSession();
  }, [email, router]);

  return (
    <div className="bg-navy min-h-screen text-white flex items-center justify-center">
      <div className="text-center">
        <BasketballLoader size={80} />
      </div>
    </div>
  );
}

export default function SetupSession() {
  return (
    <Suspense fallback={
      <div className="bg-navy min-h-screen text-white flex items-center justify-center">
        <BasketballLoader size={80} />
      </div>
    }>
      <SetupSessionInner />
    </Suspense>
  );
}

