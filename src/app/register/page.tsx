"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { devLog, devError } from "@/lib/security";

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const fromProfile = searchParams.get("fromProfile") === "true";

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
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [grade, setGrade] = useState("");
  const [gender, setGender] = useState("Male");
  const [waiver, setWaiver] = useState(false);

  // contact information
  const [parentPhone, setParentPhone] = useState("");

  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingParentData, setIsLoadingParentData] = useState(false);

  useEffect(() => {
    const token =
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    setCsrfToken(token);
  }, []);

  // Load parent data if coming from profile page
  useEffect(() => {
    const tryLoad = async () => {
      if (!fromProfile || authLoading) return;
      // Prefer email from our auth hook
      let emailToUse = user?.email;
      // Fallback: query Supabase session directly if hook isn't populated yet
      if (!emailToUse) {
        const { data } = await supabase.auth.getSession();
        emailToUse = data.session?.user?.email || undefined;
      }
      if (emailToUse) {
        loadParentData(emailToUse);
      }
    };
    tryLoad();
  }, [fromProfile, authLoading, isAuthenticated, user]);

  const loadParentData = async (userEmail: string) => {
    setIsLoadingParentData(true);
    try {
      const response = await fetch(`/api/parent/profile?email=${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const profile = await response.json();
        if (profile.parent) {
          // Pre-fill parent information
          setEmail(profile.parent.email || userEmail);
          
          // Split parent name if available
          const parentName = profile.parent.name || "";
          const nameParts = parentName.split(" ");
          setParentFirstName(nameParts[0] || "");
          setParentLastName(nameParts.slice(1).join(" ") || "");
          
          setParentPhone(profile.parent.phone || "");
        }
      }
    } catch (error) {
      devError("Failed to load parent data:", error);
    } finally {
      setIsLoadingParentData(false);
    }
  };

  // Combine day, month, year into birthdate format (YYYY-MM-DD)
  useEffect(() => {
    if (birthMonth && birthDay && birthYear) {
      // Validate day based on month
      const monthNum = parseInt(birthMonth);
      const dayNum = parseInt(birthDay);
      const yearNum = parseInt(birthYear);
      
      // Get days in the month
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      
      // Validate day
      const validDay = Math.min(dayNum, daysInMonth);
      
      // Format as YYYY-MM-DD
      const formattedDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
      setBirthdate(formattedDate);
      
      // Update day if it was invalid
      if (dayNum !== validDay) {
        setBirthDay(String(validDay));
      }
    } else {
      setBirthdate("");
    }
  }, [birthMonth, birthDay, birthYear]);

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
  
  // Get days in month for day dropdown
  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31;
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    if (isNaN(monthNum) || isNaN(yearNum)) return 31;
    return new Date(yearNum, monthNum, 0).getDate();
  };
  
  const daysInMonth = getDaysInMonth(birthMonth, birthYear);

  // Simple profanity filter (client-side)
  const PROFANITY_LIST = [
    "fuck","shit","bitch","asshole","bastard","dick","cunt","slut","whore",
    "motherfucker","bullshit","cock","prick","twat"
  ];
  const containsProfanity = (value: string | undefined | null) => {
    if (!value) return false;
    const v = String(value).toLowerCase();
    return PROFANITY_LIST.some((w) => v.includes(w));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validation checks
    if (!email) return setMessage("Email is required");
    
    // Only require password if NOT coming from profile (new account)
    if (!fromProfile) {
      if (!password || !confirmPassword)
        return setMessage("Password fields are required");
      if (password !== confirmPassword)
        return setMessage("Passwords do not match");
      if (password.length < 8)
        return setMessage("Password must be at least 8 characters");
    }
    
    if (!firstName || !lastName)
      return setMessage("Player name is required");
    if (!birthMonth || !birthDay || !birthYear)
      return setMessage("Complete date of birth is required");
    if (!birthdate || isNaN(new Date(birthdate).getTime()))
      return setMessage("Please enter a valid date of birth");
    if (!waiver) return setMessage("Please agree to the waiver to continue");

    // Profanity validation (names and free-text inputs)
    const profaneField = [
      { label: "Parent first name", value: parentFirstName },
      { label: "Parent last name", value: parentLastName },
      { label: "Player first name", value: firstName },
      { label: "Player last name", value: lastName },
      { label: "Grade", value: grade },
    ].find((f) => containsProfanity(f.value));
    if (profaneField) {
      return setMessage(`${profaneField.label} contains inappropriate language.`);
    }

    // If coming from profile, user should be authenticated
    if (fromProfile && (!isAuthenticated || !user)) {
      return setMessage("Please log in to add another child");
    }

    setLoading(true);
    try {
      let parentUserId: string | undefined;
      
      if (fromProfile && user?.id) {
        // Use existing authenticated user
        parentUserId = user.id;
      } else {
        // Create new parent auth user with email redirect and player metadata
        // Get base URL dynamically for redirect (works in both dev and prod)
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : (process.env.NEXT_PUBLIC_BASE_URL || 'https://wcs-basketball-v2.vercel.app');

        const { data: signUp, error: signErr } = await supabase.auth.signUp({
          email,
          password: password!,
          options: {
            data: {
              playerName: `${firstName} ${lastName}`,
              grade: grade || null,
              gender: gender || null,
            },
            emailRedirectTo: `${baseUrl}/registration-success?player=${encodeURIComponent(firstName)}`,
          },
        });
        if (signErr) {
          devError("Supabase signUp error:", signErr);
          return setMessage("Registration failed. Please try again.");
        }
        devLog("Supabase signUp response:", signUp);
        parentUserId = signUp.user?.id;
        if (!parentUserId) return setMessage("Unable to create account.");
      }

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

      // 3) Sign in the user immediately after registration (only if new account)
      if (!fromProfile) {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password: password!,
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
      }

      // Navigate based on context
      if (fromProfile) {
        // Redirect back to profile with success message
        router.push(
          `/parent/profile?success=child_added&player=${encodeURIComponent(firstName)}`
        );
      } else {
        // Navigate to success page with player name
        router.push(
          `/registration-success?player=${encodeURIComponent(firstName)}`
        );
      }
    } catch (e: any) {
      setMessage(e.message || "Unexpected error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Register">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-6 text-center uppercase">
              Register
            </h1>

            {!fromProfile && (
              <p className="text-center text-sm text-gray-300 mb-8">
                Already have an account?{" "}
                <Link
                  href="/parent/login"
                  className="text-red font-semibold hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            )}

            {!fromProfile && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-8 text-gray-300">
                <p className="text-sm mb-2">
                  Registering a new player only takes a minute:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Create your parent account with name and email.</li>
                  <li>Enter your player's details (name, birthdate, grade, gender).</li>
                  <li>Agree to the waiver and submit the form.</li>
                  <li>You'll receive a confirmation and can manage details in your profile.</li>
                </ol>
              </div>
            )}

            {fromProfile && (
              <div className="bg-gray-900/50 border border-blue-400/40 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-200">
                  <strong>Adding another child?</strong> Your parent information has been pre-filled below. You only need to enter your child's details.
                </p>
              </div>
            )}

            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-8 mb-8">
              <form onSubmit={onSubmit} className="space-y-6">
          <input type="hidden" name="csrf_token" value={csrfToken} />

          <div className="space-y-2">
            <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase">Parent Account</h2>
            <label className="block text-sm text-gray-300">First Name</label>
            <input
              className={`w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fromProfile ? "opacity-70 cursor-not-allowed" : ""
              }`}
              type="text"
              value={parentFirstName}
              onChange={(e) => setParentFirstName(e.target.value)}
              disabled={fromProfile}
              required
            />
            <label className="block text-sm text-gray-300">Last Name</label>
            <input
              className={`w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fromProfile ? "opacity-70 cursor-not-allowed" : ""
              }`}
              type="text"
              value={parentLastName}
              onChange={(e) => setParentLastName(e.target.value)}
              disabled={fromProfile}
              required
            />
            <label className="block text-sm text-gray-300">Email</label>
            <input
              className={`w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fromProfile ? "opacity-70 cursor-not-allowed" : ""
              }`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={fromProfile}
              required
            />
            {!fromProfile && (
              <>
                <label className="block text-sm text-gray-300">Password</label>
                <div className="relative">
                  <input
                    className="w-full rounded px-3 py-2 pr-10 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                <label className="block text-sm text-gray-300">Confirm Password</label>
                <div className="relative">
                  <input
                    className="w-full rounded px-3 py-2 pr-10 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
              </>
            )}
            <label className="block text-sm text-gray-300">Phone</label>
            <input
              className={`w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                fromProfile ? "opacity-70 cursor-not-allowed" : ""
              }`}
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              disabled={fromProfile}
              placeholder="(555) 123-4567"
            />
          </div>

          <hr className="my-4 border-gray-700" />

          <div className="space-y-2">
            <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase">Player Information</h2>
            <label className="block text-sm text-gray-300">First Name</label>
            <input
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <label className="block text-sm text-gray-300">Last Name</label>
            <input
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <label className="block text-sm text-gray-300">Date of Birth</label>
            <div className="flex gap-2">
              {/* Month Dropdown */}
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Month</label>
                <select
                  className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  required
                >
                  <option value="">Select Month</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              
              {/* Day Dropdown */}
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Day</label>
                <select
                  className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  required
                  disabled={!birthMonth || !birthYear}
                >
                  <option value="">Day</option>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={String(day)}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Year Input */}
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">Year</label>
                <input
                  className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  min="2000"
                  max={new Date().getFullYear()}
                  placeholder="YYYY"
                  value={birthYear}
                  onChange={(e) => {
                    const year = e.target.value;
                    // Limit to 4 digits
                    if (year.length <= 4) {
                      setBirthYear(year);
                    }
                  }}
                  required
                />
              </div>
            </div>
            {calculatedAge !== null && calculatedAge >= 0 && (
              <div className="text-sm text-gray-300 mt-2">
                Age: <span className="font-semibold">{calculatedAge}</span>
              </div>
            )}
            {calculatedAge !== null && calculatedAge < 0 && (
              <div className="text-sm text-red-400 mt-2">
                Invalid birthdate (future date)
              </div>
            )}
            <label className="block text-sm text-gray-300">Grade</label>
            <input
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <label className="block text-sm text-gray-300">Gender</label>
            <select
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
            </select>
            <label className="inline-flex items-center gap-2 mt-2 text-gray-300">
              <input
                type="checkbox"
                checked={waiver}
                onChange={(e) => setWaiver(e.target.checked)}
              />
              <span>I agree to the waiver</span>
            </label>
          </div>

          {message && (
            <div
              className={`p-3 rounded text-sm ${
                message.startsWith("Success")
                  ? "bg-green-900/40 text-green-200 border border-green-500/40"
                  : "bg-red-900/40 text-red-200 border border-red-500/40"
              }`}
            >
              {message}
            </div>
          )}

          <button
            disabled={loading || isLoadingParentData}
            className="w-full bg-red text-white font-bold py-3 rounded disabled:opacity-60 hover:bg-red/90 transition-colors"
          >
            {isLoadingParentData
              ? "Loading..."
              : loading
              ? "Submitting..."
              : fromProfile
              ? "Add Child"
              : "Submit Registration"}
          </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="bg-navy min-h-screen text-white pt-20 px-4">Loading...</div>}>
      <RegisterInner />
    </Suspense>
  );
}
