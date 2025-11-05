"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ParentProfile, Player } from "@/types/supabase";
import Link from "next/link";
import toast from "react-hot-toast";
import ProfileHeader from "@/components/parent/ProfileHeader";
// Removed dropdown selector in favor of child cards
import ChildDetailsCard from "@/components/parent/ChildDetailsCard";
import ContactEditForm from "@/components/parent/ContactEditForm";
import PaymentHistoryTable from "@/components/parent/PaymentHistoryTable";
import PlayerMedicalInfo from "@/components/parent/PlayerMedicalInfo";
import HandleAuthRedirect from "@/components/auth/HandleAuthRedirect";
import { devError, devLog } from "@/lib/security";
import BasketballLoader from "@/components/BasketballLoader";
import { supabase } from "@/lib/supabaseClient";

function ParentProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading } = useAuth();
  const [mergingPending, setMergingPending] = useState(false);

  // Check for pending registration to merge when user is authenticated
  useEffect(() => {
    const mergePendingRegistration = async () => {
      if (!isAuthenticated || !user?.email || loading || mergingPending) return;
      
      const mergePending = searchParams.get("merge_pending");
      if (!mergePending) return;

      setMergingPending(true);
      try {
        const response = await fetch("/api/merge-pending-registration", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (response.ok) {
          devLog("Profile: Merged pending registration successfully");
          // Reload profile data
          router.refresh();
        } else {
          devError("Profile: Failed to merge pending registration");
        }
      } catch (error) {
        devError("Profile: Error merging pending registration", error);
      } finally {
        setMergingPending(false);
        // Remove query param
        router.replace("/parent/profile?registered=true");
      }
    };

    mergePendingRegistration();
  }, [isAuthenticated, user, loading, searchParams, router, mergingPending]);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  // No active child; show all children as cards
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasShownSuccessToast = useRef(false);
  const [activeTab, setActiveTab] = useState<"players" | "contact" | "billing">("players");
  const [contactSubTab, setContactSubTab] = useState<"contact" | "medical">("contact");

  // Authentication check - give more time for session to be established
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Wait for auth to finish loading
      if (loading) return;
      
      // If authenticated, proceed
      if (isAuthenticated) return;
      
      // If not authenticated, double-check with Supabase directly
      // This handles cases where session exists but useAuth hasn't picked it up yet
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          // Session exists but useAuth didn't catch it - refresh the page
          // This will trigger useAuth to re-check
          devLog("Profile: Found session that useAuth missed, refreshing");
          window.location.reload();
          return;
        }
        
        // No session found - redirect to homepage
        devLog("Profile: No session found, redirecting to homepage");
        router.push("/");
      } catch (err) {
        devError("Profile: Error checking session", err);
        // On error, redirect to homepage
        router.push("/");
      }
    };
    
    checkAuthAndRedirect();
  }, [loading, isAuthenticated, router]);

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

      // No active child state needed
    } catch (err) {
      setError("Failed to load profile data");
      devError("Error loading profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for success message
  useEffect(() => {
    const success = searchParams.get("success");
    const playerName = searchParams.get("player");
    
    if (!hasShownSuccessToast.current && success === "child_added" && playerName) {
      hasShownSuccessToast.current = true;
      toast.success(`Successfully registered ${decodeURIComponent(playerName)}!`);
      // Remove query params from URL
      router.replace("/parent/profile", { scroll: false });
      // Refresh profile data
      if (user?.email) {
        fetchProfile(user.email);
      }
    }
  }, [searchParams, router, user]);

  // Fetch profile data
  useEffect(() => {
    if (user && user.email) {
      fetchProfile(user.email);
    }
  }, [user]);

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
          <BasketballLoader size={80} />
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
    <div className="bg-navy min-h-screen text-white pt-20 px-4 pb-12">
      <HandleAuthRedirect />
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          name={profile?.parent.name || user?.email?.split("@")[0] || "Parent"}
          email={user?.email || ""}
          playerCount={profile?.children.length || 0}
        />

        {profile && (
          <>
            {/* Tabs */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 mb-6">
              <div className="flex gap-2">
                <button
                  className={`flex-1 py-3 rounded-md text-sm sm:text-base text-center font-bebas uppercase tracking-wide flex items-center justify-center gap-2 ${
                    activeTab === "players"
                      ? "bg-red text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("players")}
                >
                  <span aria-hidden>👥</span>
                  <span>Players</span>
                </button>
                <button
                  className={`flex-1 py-3 rounded-md text-sm sm:text-base text-center font-bebas uppercase tracking-wide flex items-center justify-center gap-2 ${
                    activeTab === "contact"
                      ? "bg-red text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("contact")}
                >
                  <span aria-hidden>📇</span>
                  <span>Contact Info</span>
                </button>
                <button
                  className={`flex-1 py-3 rounded-md text-sm sm:text-base text-center font-bebas uppercase tracking-wide flex items-center justify-center gap-2 ${
                    activeTab === "billing"
                      ? "bg-red text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                  onClick={() => setActiveTab("billing")}
                >
                  <span aria-hidden>💳</span>
                  <span>Billing</span>
                </button>
              </div>
            </div>

            {/* Players Tab */}
            {activeTab === "players" && (
              <>
                {profile.children.length > 0 ? (
                  <>
                    {/* Children Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6 justify-items-center md:justify-items-stretch">
                      {profile.children.map((child) => (
                        <div key={child.id} className="w-full max-w-[280px] md:max-w-none">
                          <ChildDetailsCard child={child} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center mb-6">
                    <h3 className="text-xl font-bebas text-white mb-2 uppercase">No registered children yet</h3>
                    <p className="text-gray-300 mb-4">Register a child to get started</p>
                    <Link href="/register" className="inline-block px-6 py-3 bg-red text-white rounded hover:bg-red/90 transition">
                      Register a Child
                    </Link>
                  </div>
                )}

                {/* Actions */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register?fromProfile=true"
                    className="flex-1 px-6 py-3 bg-red text-white text-center rounded hover:bg-red/90 transition min-h-[48px] flex items-center justify-center"
                  >
                    Add Another Child
                  </Link>
                  <Link
                    href="/teams"
                    className="flex-1 px-6 py-3 bg-gray-800 text-gray-200 text-center rounded hover:bg-gray-700 transition min-h-[48px] flex items-center justify-center"
                  >
                    View Teams
                  </Link>
                </div>
              </>
            )}

            {/* Contact Info Tab */}
            {activeTab === "contact" && (
              <div className="space-y-6 mb-6">
                {/* Sub-tab Navigation */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-2">
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 px-6 py-3 rounded-lg font-bebas uppercase tracking-wide transition-all ${
                        contactSubTab === "contact"
                          ? "bg-red text-white shadow-lg"
                          : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                      onClick={() => setContactSubTab("contact")}
                    >
                      <span>Parent Contact Info</span>
                    </button>
                    <button
                      className={`flex-1 px-6 py-3 rounded-lg font-bebas uppercase tracking-wide transition-all ${
                        contactSubTab === "medical"
                          ? "bg-red text-white shadow-lg"
                          : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                      onClick={() => setContactSubTab("medical")}
                    >
                      <span>Player Medical Info</span>
                    </button>
                  </div>
                </div>

                {/* Parent Contact Info Section */}
                {contactSubTab === "contact" && (
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Parent Contact Information
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      Manage your contact details and emergency information
                    </p>
                    <ContactEditForm
                      email={profile.parent.email}
                      initialFirstName={
                        profile.parent.name?.split(" ")[0] ||
                        (user?.email ? user.email.split("@")[0] : null)
                      }
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
                )}

                {/* Player Medical Information Section */}
                {contactSubTab === "medical" && (
                  <PlayerMedicalInfo
                    players={profile.children}
                    onUpdate={fetchProfile}
                  />
                )}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="mb-6 bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <PaymentHistoryTable
                  payments={profile.payments}
                  children={profile.children}
                />
              </div>
            )}
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

export default function ParentProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy text-white pt-20 px-4">Loading...</div>}>
      <ParentProfilePageInner />
    </Suspense>
  );
}
