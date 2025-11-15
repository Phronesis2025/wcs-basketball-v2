"use client";

import { Suspense } from "react";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import BasketballLoader from "@/components/BasketballLoader";
import { devError } from "@/lib/security";

interface PrefillData {
  parent_email?: string;
  parent_first_name?: string;
  parent_last_name?: string;
  parent_phone?: string;
}

function AddChildInner() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [prefillData, setPrefillData] = useState<PrefillData>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/parent/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load parent data for pre-filling
  useEffect(() => {
    const loadParentData = async () => {
      if (!user?.email || !isAuthenticated) return;

      try {
        const response = await fetch(`/api/parent/profile?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const profile = await response.json();
          if (profile.parent) {
            // Pre-fill parent information
            const parentName = profile.parent.name || "";
            const nameParts = parentName.split(" ");
            
            setPrefillData({
              parent_email: profile.parent.email || user.email || "",
              parent_first_name: nameParts[0] || "",
              parent_last_name: nameParts.slice(1).join(" ") || "",
              parent_phone: profile.parent.phone || "",
            });
          }
        }
      } catch (error) {
        devError("Failed to load parent data:", error);
      }
    };

    if (isAuthenticated && user) {
      loadParentData();
    }
  }, [user, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="bg-navy min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <BasketballLoader size={80} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="bg-navy min-h-screen text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bebas font-bold uppercase mb-4">
            Add Another Player
          </h1>
          <p className="text-gray-300 text-lg">
            Your parent information has been pre-filled. Just complete your player&apos;s details below.
          </p>
        </div>

        {/* Registration Wizard - Skip parent step since user is authenticated */}
        <div className="bg-gray-900 rounded-lg p-6 md:p-8 border border-gray-700">
          <RegistrationWizard
            skipParentStep={true}
            prefillData={prefillData}
          />
        </div>

        {/* Back to Profile Link */}
        <div className="mt-6 text-center">
          <Link
            href="/parent/profile"
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AddChild() {
  return (
    <Suspense fallback={
      <div className="bg-navy min-h-screen text-white flex items-center justify-center">
        <BasketballLoader size={80} />
      </div>
    }>
      <AddChildInner />
    </Suspense>
  );
}
