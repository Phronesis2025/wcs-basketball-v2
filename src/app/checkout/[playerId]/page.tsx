"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { devError } from "@/lib/security";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const playerId = params?.playerId as string;
  const isNewPlayer = playerId === "new";
  
  // Player information (only for new player mode)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [grade, setGrade] = useState("");
  const [gender, setGender] = useState("Male");
  const [schoolName, setSchoolName] = useState("");
  const [shirtSize, setShirtSize] = useState("");
  const [positionPreference, setPositionPreference] = useState("");
  const [previousExperience, setPreviousExperience] = useState("");

  // Parent address information
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Guardian information
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Medical information
  const [medicalAllergies, setMedicalAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [medicalMedications, setMedicalMedications] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");

  // Consent checkboxes
  const [consentPhotoRelease, setConsentPhotoRelease] = useState(false);
  const [consentMedicalTreatment, setConsentMedicalTreatment] = useState(false);
  const [consentParticipation, setConsentParticipation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/parent/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Combine day, month, year into birthdate format (YYYY-MM-DD)
  useEffect(() => {
    if (birthMonth && birthDay && birthYear) {
      const monthNum = parseInt(birthMonth);
      const dayNum = parseInt(birthDay);
      const yearNum = parseInt(birthYear);
      
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      const validDay = Math.min(dayNum, daysInMonth);
      
      const formattedDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(validDay).padStart(2, "0")}`;
      setBirthdate(formattedDate);
      
      if (dayNum !== validDay) {
        setBirthDay(String(validDay));
      }
    } else {
      setBirthdate("");
    }
  }, [birthMonth, birthDay, birthYear]);

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

  // Load existing parent/player data
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.email) {
      loadExistingData();
    }
  }, [authLoading, isAuthenticated, user, playerId]);

  const loadExistingData = async () => {
    if (isNewPlayer) {
      // For new player, load parent data only
      try {
        const response = await fetch(`/api/parent/profile?email=${encodeURIComponent(user!.email!)}`);
        if (response.ok) {
          const profile = await response.json();
          if (profile.parent) {
            setAddressLine1(profile.parent.address_line1 || "");
            setAddressLine2(profile.parent.address_line2 || "");
            setCity(profile.parent.city || "");
            setState(profile.parent.state || "");
            setZip(profile.parent.zip || "");
            setEmergencyContact(profile.parent.emergency_contact || "");
            setEmergencyPhone(profile.parent.emergency_phone || "");
            setGuardianRelationship(profile.parent.guardian_relationship || "");
            setMedicalAllergies(profile.parent.medical_allergies || "");
            setMedicalConditions(profile.parent.medical_conditions || "");
            setMedicalMedications(profile.parent.medical_medications || "");
            setDoctorName(profile.parent.doctor_name || "");
            setDoctorPhone(profile.parent.doctor_phone || "");
            setConsentPhotoRelease(profile.parent.consent_photo_release || false);
            setConsentMedicalTreatment(profile.parent.consent_medical_treatment || false);
            setConsentParticipation(profile.parent.consent_participation || false);
          }
        }
      } catch (error) {
        devError("Failed to load parent data:", error);
      } finally {
        setIsLoadingData(false);
      }
    } else {
      // For existing player, load both parent and player data
      try {
        // Load player data directly from Supabase
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("*")
          .eq("id", playerId)
          .single();
        
        if (!playerError && playerData) {
          setSchoolName(playerData.school_name || "");
          setShirtSize(playerData.shirt_size || "");
          setPositionPreference(playerData.position_preference || "");
          setPreviousExperience(playerData.previous_experience || "");
        }

        // Load parent data
        const parentResponse = await fetch(`/api/parent/profile?email=${encodeURIComponent(user!.email!)}`);
        if (parentResponse.ok) {
          const profile = await parentResponse.json();
          if (profile.parent) {
            setAddressLine1(profile.parent.address_line1 || "");
            setAddressLine2(profile.parent.address_line2 || "");
            setCity(profile.parent.city || "");
            setState(profile.parent.state || "");
            setZip(profile.parent.zip || "");
            setEmergencyContact(profile.parent.emergency_contact || "");
            setEmergencyPhone(profile.parent.emergency_phone || "");
            setGuardianRelationship(profile.parent.guardian_relationship || "");
            setMedicalAllergies(profile.parent.medical_allergies || "");
            setMedicalConditions(profile.parent.medical_conditions || "");
            setMedicalMedications(profile.parent.medical_medications || "");
            setDoctorName(profile.parent.doctor_name || "");
            setDoctorPhone(profile.parent.doctor_phone || "");
            setConsentPhotoRelease(profile.parent.consent_photo_release || false);
            setConsentMedicalTreatment(profile.parent.consent_medical_treatment || false);
            setConsentParticipation(profile.parent.consent_participation || false);
          }
        }
      } catch (error) {
        devError("Failed to load data:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Validation
    if (isNewPlayer) {
      if (!firstName || !lastName || !birthdate || !grade || !gender) {
        setMessage("Please fill in all required player information");
        return;
      }
    }

    if (!addressLine1 || !city || !state || !zip) {
      setMessage("Please fill in complete address information");
      return;
    }

    if (!guardianRelationship || !emergencyContact || !emergencyPhone) {
      setMessage("Please fill in all guardian information");
      return;
    }

    if (!consentPhotoRelease || !consentMedicalTreatment || !consentParticipation) {
      setMessage("Please consent to all required items");
      return;
    }

    // Profanity validation across relevant text inputs
    const fieldsToCheck = [
      { label: "Player first name", value: firstName, when: isNewPlayer },
      { label: "Player last name", value: lastName, when: isNewPlayer },
      { label: "Grade", value: grade, when: isNewPlayer },
      { label: "School name", value: schoolName, when: true },
      { label: "Position preference", value: positionPreference, when: true },
      { label: "Previous experience", value: previousExperience, when: true },
      { label: "Address line 1", value: addressLine1, when: true },
      { label: "Address line 2", value: addressLine2, when: true },
      { label: "City", value: city, when: true },
      { label: "State", value: state, when: true },
      { label: "Guardian relationship", value: guardianRelationship, when: true },
      { label: "Emergency contact name", value: emergencyContact, when: true },
      { label: "Medical allergies", value: medicalAllergies, when: true },
      { label: "Medical conditions", value: medicalConditions, when: true },
      { label: "Medical medications", value: medicalMedications, when: true },
      { label: "Doctor name", value: doctorName, when: true },
    ].filter(f => f.when);
    const profane = fieldsToCheck.find(f => containsProfanity(f.value));
    if (profane) {
      setMessage(`${profane.label} contains inappropriate language.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/checkout/complete-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: isNewPlayer ? null : playerId,
          is_new_player: isNewPlayer,
          user_email: user?.email, // Pass user email for new player lookup
          // Player information (only for new player)
          player: isNewPlayer ? {
            first_name: firstName,
            last_name: lastName,
            birthdate,
            grade,
            gender,
            school_name: schoolName,
            shirt_size: shirtSize,
            position_preference: positionPreference,
            previous_experience: previousExperience,
          } : null,
          // Player details (for existing player)
          ...(!isNewPlayer ? {
            school_name: schoolName,
            shirt_size: shirtSize,
            position_preference: positionPreference,
            previous_experience: previousExperience,
          } : {}),
          // Parent detailed information
          address_line1: addressLine1,
          address_line2: addressLine2,
          city,
          state,
          zip,
          guardian_relationship: guardianRelationship,
          emergency_contact: emergencyContact,
          emergency_phone: emergencyPhone,
          medical_allergies: medicalAllergies,
          medical_conditions: medicalConditions,
          medical_medications: medicalMedications,
          doctor_name: doctorName,
          doctor_phone: doctorPhone,
          consent_photo_release: consentPhotoRelease,
          consent_medical_treatment: consentMedicalTreatment,
          consent_participation: consentParticipation,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit form");
      }

      const data = await response.json();
      const redirectPlayerId = isNewPlayer ? data.player_id : playerId;

      // Redirect to payment page
      router.push(`/payment/${redirectPlayerId}`);
    } catch (e: any) {
      setMessage(e.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-6 text-center uppercase">
              {isNewPlayer ? "Add Another Child" : "Complete Checkout Information"}
            </h1>

            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-8 mb-8">
              <form onSubmit={onSubmit} className="space-y-8">
                {/* Player Information Section (only for new player) */}
                {isNewPlayer && (
                  <>
                    <div className="space-y-4">
                      <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase border-b border-gray-700 pb-2">
                        Player Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">First Name *</label>
                          <input
                            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Last Name *</label>
                          <input
                            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2">Date of Birth *</label>
                        <div className="flex gap-2">
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
                                if (year.length <= 4) {
                                  setBirthYear(year);
                                }
                              }}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Grade *</label>
                          <input
                            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Gender *</label>
                          <select
                            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <hr className="my-6 border-gray-700" />
                  </>
                )}

                {/* Player Details Section */}
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase border-b border-gray-700 pb-2">
                    Player Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">School Name</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Shirt Size</label>
                      <select
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={shirtSize}
                        onChange={(e) => setShirtSize(e.target.value)}
                      >
                        <option value="">Select Size</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Position Preference</label>
                    <input
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={positionPreference}
                      onChange={(e) => setPositionPreference(e.target.value)}
                      placeholder="e.g., Point Guard, Striker, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Previous Experience</label>
                    <textarea
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={previousExperience}
                      onChange={(e) => setPreviousExperience(e.target.value)}
                      placeholder="Describe any previous sports experience..."
                    />
                  </div>
                </div>

                <hr className="my-6 border-gray-700" />

                {/* Parent Address Section */}
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase border-b border-gray-700 pb-2">
                    Parent Address
                  </h2>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Street Address *</label>
                    <input
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Address Line 2</label>
                    <input
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">City *</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">State *</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">ZIP Code *</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-gray-700" />

                {/* Guardian Information Section */}
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase border-b border-gray-700 pb-2">
                    Guardian Information
                  </h2>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Guardian Relationship *</label>
                    <select
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={guardianRelationship}
                      onChange={(e) => setGuardianRelationship(e.target.value)}
                      required
                    >
                      <option value="">Select Relationship</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Emergency Contact Name *</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Emergency Contact Phone *</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-gray-700" />

                {/* Medical Information Section */}
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase border-b border-gray-700 pb-2">
                    Medical Information
                  </h2>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Allergies</label>
                    <textarea
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={medicalAllergies}
                      onChange={(e) => setMedicalAllergies(e.target.value)}
                      placeholder="List any known allergies..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Medical Conditions</label>
                    <textarea
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={medicalConditions}
                      onChange={(e) => setMedicalConditions(e.target.value)}
                      placeholder="List any medical conditions..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Medications</label>
                    <textarea
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={medicalMedications}
                      onChange={(e) => setMedicalMedications(e.target.value)}
                      placeholder="List any current medications..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Doctor Name</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Doctor Phone</label>
                      <input
                        className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="tel"
                        value={doctorPhone}
                        onChange={(e) => setDoctorPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-gray-700" />

                {/* Consent Checkboxes Section */}
                <div className="space-y-4">
                  <h2 className="font-semibold text-lg font-bebas tracking-wide uppercase border-b border-gray-700 pb-2">
                    Consent & Agreement
                  </h2>
                  <div className="space-y-3">
                    <label className="inline-flex items-center gap-3 text-gray-300">
                      <input
                        type="checkbox"
                        checked={consentPhotoRelease}
                        onChange={(e) => setConsentPhotoRelease(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-red focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <span>I consent to photo release for promotional purposes *</span>
                    </label>
                    <label className="inline-flex items-center gap-3 text-gray-300">
                      <input
                        type="checkbox"
                        checked={consentMedicalTreatment}
                        onChange={(e) => setConsentMedicalTreatment(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-red focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <span>I consent to medical treatment in case of emergency *</span>
                    </label>
                    <label className="inline-flex items-center gap-3 text-gray-300">
                      <input
                        type="checkbox"
                        checked={consentParticipation}
                        onChange={(e) => setConsentParticipation(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-red focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <span>I consent to participation in sports activities *</span>
                    </label>
                  </div>
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

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-red text-white rounded disabled:opacity-60 hover:bg-red/90 transition"
                  >
                    {loading
                      ? "Submitting..."
                      : isNewPlayer
                      ? "Submit Registration"
                      : "Continue to Payment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
