"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ParentProfile, Player } from "@/types/supabase";
import Link from "next/link";
import toast from "react-hot-toast";
import ProfileHeader from "@/components/parent/ProfileHeader";
import ChildSelector from "@/components/parent/ChildSelector";
import ChildDetailsCard from "@/components/parent/ChildDetailsCard";
import ContactEditForm from "@/components/parent/ContactEditForm";
import PaymentHistoryTable from "@/components/parent/PaymentHistoryTable";

export default function ParentProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [activeChild, setActiveChild] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  // Fetch profile data
  useEffect(() => {
    if (user && user.email) {
      fetchProfile(user.email);
    }
  }, [user]);

  const fetchProfile = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/parent/profile?email=${email}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);

      // Set first child as active
      if (data.children && data.children.length > 0) {
        setActiveChild(data.children[0]);
      }
    } catch (err) {
      setError("Failed to load profile data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async (
    firstName: string,
    lastName: string,
    phone: string,
    emergencyContact: string,
    emergencyPhone: string
  ) => {
    if (!user?.email) return;

    try {
      const response = await fetch("/api/parent/update-contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          parent_first_name: firstName,
          parent_last_name: lastName,
          parent_phone: phone,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact information");
      }

      // Refresh profile data
      await fetchProfile(user.email);
    } catch (err) {
      throw err;
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/parent/reset-password`,
      });

      if (error) {
        throw new Error("Failed to send password reset email");
      }

      toast.success("Password reset email sent! Please check your inbox.");
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = () => {
    router.push("/");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => user?.email && fetchProfile(user.email)}
              className="px-4 py-2 bg-red text-white rounded hover:bg-red/90 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          name={profile?.parent.name || user?.email?.split("@")[0] || "Parent"}
          email={user?.email || ""}
          playerCount={profile?.children.length || 0}
        />

        {profile && (
          <>
            {/* Children Switcher */}
            {profile.children.length > 0 && (
              <div className="mb-6">
                <ChildSelector
                  children={profile.children}
                  activeChild={activeChild}
                  onSelectChild={setActiveChild}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Active Child Details */}
              {activeChild && (
                <div>
                  <ChildDetailsCard child={activeChild} />
                </div>
              )}

              {/* Contact Information */}
              <div>
                <ContactEditForm
                  email={profile.parent.email}
                  initialFirstName={profile.parent.name?.split(" ")[0] || null}
                  initialLastName={
                    profile.parent.name?.split(" ").slice(1).join(" ") || null
                  }
                  initialPhone={profile.parent.phone}
                  initialEmergencyContact={profile.parent.emergency_contact}
                  initialEmergencyPhone={profile.parent.emergency_phone}
                  onSave={handleUpdateContact}
                  onPasswordReset={handlePasswordReset}
                />
              </div>
            </div>

            {/* Payment History */}
            <div className="mb-6">
              <PaymentHistoryTable payments={profile.payments} />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="flex-1 px-6 py-3 bg-red text-white text-center rounded hover:bg-red/90 transition"
              >
                Add Another Child
              </Link>
              <Link
                href="/teams"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 text-center rounded hover:bg-gray-300 transition"
              >
                View Teams
              </Link>
            </div>
          </>
        )}

        {/* Empty State - No Children */}
        {profile && profile.children.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="w-24 h-24 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No registered children yet
            </h3>
            <p className="text-gray-600 mb-6">
              Register a child to get started with West Coast Sports
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-red text-white rounded hover:bg-red/90 transition"
            >
              Register a Child
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
