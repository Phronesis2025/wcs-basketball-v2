"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  // parent auth + form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");

  // player form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [grade, setGrade] = useState("");
  const [gender, setGender] = useState("Boys");
  const [waiver, setWaiver] = useState(false);

  // contact information
  const [parentPhone, setParentPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setCsrfToken(token);
  }, []);

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

    // basic checks (kept from your current page)
    if (!email || !password || !confirmPassword)
      return setMessage("All fields are required");
    if (password !== confirmPassword)
      return setMessage("Passwords do not match");
    if (password.length < 8)
      return setMessage("Password must be at least 8 characters");
    if (!firstName || !lastName || !birthdate)
      return setMessage("Player info is required");
    if (!waiver) return setMessage("Please agree to the waiver to continue");

    setLoading(true);
    try {
      // 1) create parent auth user
      const { data: signUp, error: signErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signErr) return setMessage("Registration failed. Please try again.");
      const parentUserId = signUp.user?.id;
      if (!parentUserId) return setMessage("Unable to create account.");

      // 2) register player (pending)
      const resp = await fetch("/api/register-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_user_id: parentUserId,
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
        const j = await resp.json().catch(() => ({}));
        throw new Error(j.error || "Failed to submit registration");
      }

      // 3) Sign in the user immediately after registration
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInData?.session) {
        // Store the session
        localStorage.setItem(
          "supabase.auth.token",
          JSON.stringify(signInData.session)
        );
        localStorage.setItem("auth.authenticated", "true");
        // Dispatch event to notify navbar of auth state change
        window.dispatchEvent(
          new CustomEvent("authStateChanged", {
            detail: { authenticated: true, user: signInData.user },
          })
        );
      }

      // Navigate to success page with player name
      router.push(
        `/registration-success?player=${encodeURIComponent(firstName)}`
      );
    } catch (e: any) {
      setMessage(e.message || "Unexpected error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-4 text-center uppercase text-navy">
          REGISTER
        </h1>

        <p className="text-center text-sm text-gray-600 mb-8">
          Already have an account?{" "}
          <Link
            href="/parent/login"
            className="text-red font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <input type="hidden" name="csrf_token" value={csrfToken} />

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Parent Account</h2>
            <label className="block text-sm">First Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              value={parentFirstName}
              onChange={(e) => setParentFirstName(e.target.value)}
              required
            />
            <label className="block text-sm">Last Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="text"
              value={parentLastName}
              onChange={(e) => setParentLastName(e.target.value)}
              required
            />
            <label className="block text-sm">Email</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="block text-sm">Password</label>
            <div className="relative">
              <input
                className="w-full border rounded px-3 py-2 pr-10"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <label className="block text-sm">Confirm Password</label>
            <div className="relative">
              <input
                className="w-full border rounded px-3 py-2 pr-10"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <hr className="my-4" />

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Player Information</h2>
            <label className="block text-sm">First Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <label className="block text-sm">Last Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <label className="block text-sm">Birthdate</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
            />
            {calculatedAge !== null && (
              <div className="text-sm text-gray-600">
                Age: <span className="font-semibold">{calculatedAge}</span>
              </div>
            )}
            <label className="block text-sm">Grade</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <label className="block text-sm">Gender</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option>Boys</option>
              <option>Girls</option>
            </select>
            <label className="inline-flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={waiver}
                onChange={(e) => setWaiver(e.target.checked)}
              />
              <span>I agree to the waiver</span>
            </label>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Contact Information</h2>
            <label className="block text-sm">Parent Phone</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
            <label className="block text-sm">Emergency Contact Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Emergency contact name"
            />
            <label className="block text-sm">Emergency Contact Phone</label>
            <input
              className="w-full border rounded px-3 py-2"
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded text-sm ${
                message.startsWith("Success")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-red text-white font-bold py-3 rounded disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
