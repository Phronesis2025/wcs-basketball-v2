"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { devError } from "@/lib/security";

function AddAnotherChildInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading } = useAuth();

  // Pre-filled parent information (from URL params or user data)
  const [email, setEmail] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Player form (empty - parent fills this out)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [grade, setGrade] = useState("");
  const [gender, setGender] = useState("Boys");
  const [waiver, setWaiver] = useState(false);

  const [csrfToken, setCsrfToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingParentData, setIsLoadingParentData] = useState(true);

  // Authentication check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/parent/login");
    }
  }, [loading, isAuthenticated, router]);

  // Load parent data from existing children
  useEffect(() => {
    if (user?.email) {
      loadParentData(user.email);
    }
  }, [user]);

  // CSRF token
  useEffect(() => {
    const token =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setCsrfToken(token);
  }, []);

  const loadParentData = async (email: string) => {
    try {
      const response = await fetch(`/api/parent/profile?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        if (data.children && data.children.length > 0) {
          const firstChild = data.children[0];

          // Pre-fill parent information
          setEmail(email);
          setParentFirstName(firstChild.parent_first_name || "");
          setParentLastName(firstChild.parent_last_name || "");
          setParentPhone(firstChild.parent_phone || "");
          setEmergencyContact(firstChild.emergency_contact || "");
          setEmergencyPhone(firstChild.emergency_phone || "");
        }
      }
    } catch (error) {
      devError("Error loading parent data:", error);
      setMessage("Error loading your information. Please try again.");
    } finally {
      setIsLoadingParentData(false);
    }
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculatedAge = calculateAge(birthdate);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validation (only check player info since parent info is pre-filled)
    if (!firstName || !lastName || !birthdate)
      return setMessage("Player information is required");
    if (!waiver) return setMessage("Please agree to the waiver to continue");

    setIsSubmitting(true);
    try {
      // Register player using existing parent account
      const resp = await fetch("/api/register-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_user_id: user?.id, // Use existing parent user ID
          parent_name:
            `${parentFirstName} ${parentLastName}`.trim() ||
            email.split("@")[0],
          parent_first_name: parentFirstName,
          parent_last_name: parentLastName,
          parent_email: email,
          parent_phone: parentPhone,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone,
          player: {
            first_name: firstName,
            last_name: lastName,
            birthdate,
            grade,
            gender,
          },
          waiver_signed: waiver,
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        return setMessage(
          errorData.error || "Registration failed. Please try again."
        );
      }

      // Success - redirect to parent profile
      router.push("/parent/profile?success=child_added");
    } catch (error) {
      devError("Registration error:", error);
      setMessage("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoadingParentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Another Child
          </h1>
          <p className="text-gray-600">
            Your parent information has been pre-filled. Just add your child's
            details below.
          </p>
        </div>

        {/* Success Message */}
        {searchParams.get("success") === "child_added" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Child successfully added! You can view them in your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Parent Information (Pre-filled, Read-only) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Parent Information (Pre-filled)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={parentFirstName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={parentLastName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>
            <p className="text-sm text-blue-700 mt-3">
              💡 Need to update your contact information?
              <Link
                href="/parent/profile"
                className="text-blue-600 hover:underline ml-1"
              >
                Go to your profile
              </Link>
            </p>
          </div>

          {/* Player Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Child Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                  required
                />
                {calculatedAge !== null && (
                  <p className="text-sm text-gray-500 mt-1">
                    Age: {calculatedAge} years old
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                >
                  <option value="">Select Grade</option>
                  <option value="K">Kindergarten</option>
                  <option value="1st">1st Grade</option>
                  <option value="2nd">2nd Grade</option>
                  <option value="3rd">3rd Grade</option>
                  <option value="4th">4th Grade</option>
                  <option value="5th">5th Grade</option>
                  <option value="6th">6th Grade</option>
                  <option value="7th">7th Grade</option>
                  <option value="8th">8th Grade</option>
                  <option value="9th">9th Grade</option>
                  <option value="10th">10th Grade</option>
                  <option value="11th">11th Grade</option>
                  <option value="12th">12th Grade</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red focus:border-transparent"
                >
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                </select>
              </div>
            </div>
          </div>

          {/* Waiver Agreement */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="waiver"
                checked={waiver}
                onChange={(e) => setWaiver(e.target.checked)}
                className="mt-1 h-4 w-4 text-red focus:ring-red border-gray-300 rounded"
                required
              />
              <label htmlFor="waiver" className="ml-3 text-sm text-gray-700">
                I agree to the{" "}
                <Link href="/terms" className="text-red hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-red hover:underline">
                  Privacy Policy
                </Link>
                . *
              </label>
            </div>
          </div>

          {/* Error Message */}
          {message && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red text-white font-medium rounded-md hover:bg-red/90 focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding Child..." : "Add Child"}
            </button>
            <Link
              href="/parent/profile"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddAnotherChild() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>}>
      <AddAnotherChildInner />
    </Suspense>
  );
}
