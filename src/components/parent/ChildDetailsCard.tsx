"use client";

import { useEffect, useState } from "react";
import { Player } from "@/types/supabase";
import { fetchTeamById } from "@/lib/actions";
import toast from "react-hot-toast";
import { useScrollLock } from "@/hooks/useScrollLock";
import { devError } from "@/lib/security";

interface ChildDetailsCardProps {
  child: Player;
}

export default function ChildDetailsCard({ child }: ChildDetailsCardProps) {
  const [teamLogoUrl, setTeamLogoUrl] = useState<string>(
    "/apple-touch-icon.png"
  );
  const [teamName, setTeamName] = useState<string>("");
  const [coachNames, setCoachNames] = useState<string[]>([]);
  const [showBilling, setShowBilling] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    date_of_birth: "",
    gender: "",
    jersey_number: "",
    shirt_size: "",
    position_preference: "",
    previous_experience: "",
    school_name: "",
  });
  const annualFee = Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360);

  // Add glowing animation CSS
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const existingStyle = document.head.querySelector('style[data-glow-animation]');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.setAttribute('data-glow-animation', 'true');
        style.textContent = `
          @keyframes glow {
            0%, 100% {
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2);
            }
            50% {
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.4), 0 0 40px rgba(255, 255, 255, 0.2);
            }
          }
          .glow-animation {
            animation: glow 2s ease-in-out infinite;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadTeamLogo = async () => {
      try {
        if (child.team_id) {
          const team = await fetchTeamById(child.team_id);
          if (isMounted && team) {
            setTeamLogoUrl(team.logo_url || "/apple-touch-icon.png");
            setTeamName(team.name || "");
            const names = Array.isArray((team as any).coach_names)
              ? (team as any).coach_names.filter(Boolean)
              : [];
            setCoachNames(names);
          } else if (isMounted) {
            setTeamLogoUrl("/apple-touch-icon.png");
            setTeamName("");
            setCoachNames([]);
          }
        } else if (isMounted) {
          setTeamLogoUrl("/apple-touch-icon.png");
          setTeamName("");
          setCoachNames([]);
        }
      } catch {
        if (isMounted) {
          setTeamLogoUrl("/apple-touch-icon.png");
          setTeamName("");
          setCoachNames([]);
        }
      }
    };
    loadTeamLogo();
    return () => {
      isMounted = false;
    };
  }, [child.team_id]);

  const calculateAge = (birthdate: string | null) => {
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

  const age = calculateAge(child.date_of_birth);

  const getStatusColor = () => {
    switch (child.status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = () => {
    switch (child.status) {
      case "active":
        return "Active";
      case "approved":
        return "Approved";
      default:
        return "Pending";
    }
  };

  const isApproved = () => {
    const s = (child.status || "").toLowerCase();
    return s === "approved" || s === "active";
  };

  const isActive = () => {
    const s = (child.status || "").toLowerCase();
    return s === "active";
  };

  const getExperienceLabel = (experience: string | null | undefined) => {
    if (!experience) return "Not specified";
    const exp = experience.toString();
    switch (exp) {
      case "1": return "1: No Experience";
      case "2": return "2: Some Basics";
      case "3": return "3: Intermediate";
      case "4": return "4: Advanced";
      case "5": return "5: Competitive League";
      default: return experience;
    }
  };

  const isTodayBirthday = () => {
    if (!child.date_of_birth) return false;
    
    try {
      // Parse the date string (expected format: YYYY-MM-DD)
      const birthDateStr = child.date_of_birth;
      const parts = birthDateStr.split('-');
      
      if (parts.length !== 3) return false;
      
      const birthYear = parseInt(parts[0], 10);
      const birthMonth = parseInt(parts[1], 10); // 1-12
      const birthDay = parseInt(parts[2], 10); // 1-31
      
      // Validate parsed values
      if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return false;
      if (birthMonth < 1 || birthMonth > 12 || birthDay < 1 || birthDay > 31) return false;
      
      // Get today's date in local timezone
      const today = new Date();
      const todayMonth = today.getMonth() + 1; // getMonth() returns 0-11, so add 1 to get 1-12
      const todayDay = today.getDate(); // 1-31
      
      // Compare month and day (ignore year)
      return todayMonth === birthMonth && todayDay === birthDay;
    } catch (error) {
      // If parsing fails, return false
      return false;
    }
  };

  const isPaid = (s?: string) =>
    (s || "").toLowerCase() === "paid" ||
    (s || "").toLowerCase() === "succeeded";
  const totalPaid = payments
    .filter((p) => isPaid(p.status))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remaining = Math.max(annualFee - totalPaid, 0);

  // Check if player is both approved AND has at least one successful payment
  const isApprovedAndPaid = () => {
    const approved = isApproved();
    const hasPaid = payments.some((p) => isPaid(p.status));
    return approved && hasPaid;
  };

  const loadBilling = async () => {
    setLoadingBilling(true);
    try {
      const resp = await fetch(`/api/player/payments/${child.id}`, {
        cache: "no-store",
      });
      if (resp.ok) {
        const json = await resp.json();
        setPayments(json.payments || []);
      }
    } finally {
      setLoadingBilling(false);
    }
  };

  // Preload once so the badge is accurate
  useEffect(() => {
    if (payments.length === 0 && !loadingBilling) {
      loadBilling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  useEffect(() => {
    if (showBilling && payments.length === 0 && !loadingBilling) {
      loadBilling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBilling]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (showEditModal) {
      setFormData({
        name: child.name || "",
        grade: child.grade || "",
        date_of_birth: child.date_of_birth || "",
        gender: child.gender || "",
        jersey_number: child.jersey_number?.toString() || "",
        shirt_size: child.shirt_size || "",
        position_preference: child.position_preference || "",
        previous_experience: child.previous_experience || "",
        school_name: child.school_name || "",
      });
    }
  }, [showEditModal, child]);

  // Lock scroll when modal is open
  useScrollLock(showEditModal);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Player name is required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/parent/update-player", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: child.id,
          name: formData.name.trim(),
          grade: formData.grade || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          jersey_number: formData.jersey_number || null,
          shirt_size: formData.shirt_size || null,
          position_preference: formData.position_preference || null,
          previous_experience: formData.previous_experience || null,
          school_name: formData.school_name || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update player information");
      }

      toast.success("Player information updated successfully!");
      setShowEditModal(false);
      
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      devError("Failed to update player:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update player information");
    } finally {
      setIsSaving(false);
    }
  };

  // If player is active, show flip card effect
  if (isActive()) {
    return (
      <>
      <div className="relative w-full" style={{ perspective: "1000px" }}>
        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s",
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of Card */}
          <div
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 relative w-full cursor-pointer min-h-[400px]"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            {/* Party popper in top-right corner */}
            {isTodayBirthday() && (
              <div className="absolute top-0 right-0 text-7xl sm:text-8xl -translate-y-6 translate-x-8" title="Happy Birthday!">
                🎉
              </div>
            )}
            
            {/* Top logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black border-2 sm:border-4 border-gray-300 shadow-md mx-auto flex items-center justify-center overflow-hidden relative glow-animation">
              <img
                src={teamLogoUrl}
                alt="Team logo"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/apple-touch-icon.png";
                }}
              />
            </div>

            {/* Name */}
            <h2 className="text-l sm:text-2xl md:text-2xl lg:text-xl font-extrabold text-center text-gray-900 mt-3">
              {child.name}
            </h2>

            {/* Subline */}
            <p className="text-center text-gray-500 mt-1 text-xs sm:text-sm md:text-sm lg:text-xs">
              {child.gender || ""}
              {child.grade ? ` • Grade ${child.grade}` : ""}
              {age ? ` • Age ${age}` : ""}
            </p>

            {/* Status badges - show progression based on status */}
            <div className="flex justify-center items-center gap-2 mt-3 sm:mt-4 flex-wrap">
              {(() => {
                const status = (child.status || "pending").toLowerCase();
                
                // On Hold: Show Pending (colored) + On Hold (bolder orange) + Active (greyed)
                if (status === "on_hold") {
                  return (
                    <>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                        Pending
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-orange-200 text-orange-900 border-2 border-orange-400">
                        On Hold
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                        Active
                      </span>
                    </>
                  );
                }
                
                // Pending: Show Pending (colored) + Approved (greyed) + Active (greyed)
                if (status === "pending") {
                  return (
                    <>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                        Pending
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                        Approved
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                        Active
                      </span>
                    </>
                  );
                }
                
                // Approved: Show Approved (bluish) + Active (greyed)
                if (status === "approved") {
                  return (
                    <>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                        Approved
                      </span>
                      <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                        Active
                      </span>
                    </>
                  );
                }
                
                // Active: Show only Active (greenish)
                if (status === "active") {
                  return (
                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                      Active
                    </span>
                  );
                }
                
                // Rejected: Show only Rejected badge
                if (status === "rejected") {
                  return (
                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                      Rejected
                    </span>
                  );
                }
                
                // Fallback: Show pending
                return (
                  <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                    Pending
                  </span>
                );
              })()}
            </div>

            {/* Info rows */}
            <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3 text-[11px] sm:text-sm md:text-sm lg:text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 whitespace-nowrap">Team:</span>
                <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {child.team_id ? teamName || "Assigned" : "Not Assigned Yet"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 whitespace-nowrap">Coach:</span>
                <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                  {child.team_id
                    ? coachNames.length > 0
                      ? coachNames.join(", ")
                      : "Not Assigned Yet"
                    : "Not Assigned Yet"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 whitespace-nowrap">
                  Jersey<span className="hidden sm:inline"> Number</span>
                </span>
                <span className="font-semibold text-gray-900 whitespace-nowrap">
                  {child.jersey_number || "Not Assigned"}
                </span>
              </div>
            </div>

            {/* Flip hint */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 italic">Click to view details</p>
            </div>
          </div>

          {/* Back of Card - Detailed Information */}
          <div
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 absolute inset-0 w-full cursor-pointer min-h-[400px]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header */}
            <div className="text-center mb-3">
              <h3 className="text-lg font-extrabold text-gray-900">Player Details</h3>
              <p className="text-xs text-gray-500 mt-1">{child.name}</p>
            </div>

            {/* Detailed Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                <span className="text-gray-500">Full Name:</span>
                <span className="font-semibold text-gray-900 text-right">{child.name}</span>
              </div>

              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                <span className="text-gray-500">Date of Birth:</span>
                <span className="font-semibold text-gray-900 text-right">
                  {child.date_of_birth
                    ? (() => {
                        const [year, month, day] = child.date_of_birth.split("-");
                        const date = new Date(
                          parseInt(year),
                          parseInt(month) - 1,
                          parseInt(day)
                        );
                        return date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });
                      })()
                    : "Not provided"}
                </span>
              </div>

              {age && (
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Age:</span>
                  <span className="font-semibold text-gray-900">{age} years old</span>
                </div>
              )}

              {child.grade && (
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Grade:</span>
                  <span className="font-semibold text-gray-900">{child.grade}</span>
                </div>
              )}

              {child.gender && (
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Gender:</span>
                  <span className="font-semibold text-gray-900">{child.gender}</span>
                </div>
              )}

              {child.jersey_number && (
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Jersey Number:</span>
                  <span className="font-semibold text-gray-900">#{child.jersey_number}</span>
                </div>
              )}

              {child.shirt_size && (
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Shirt Size:</span>
                  <span className="font-semibold text-gray-900">{child.shirt_size}</span>
                </div>
              )}

              {child.school_name && (
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">School:</span>
                  <span className="font-semibold text-gray-900 text-right">{child.school_name}</span>
                </div>
              )}
            </div>

            {/* Flip hint and Edit button */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400 italic">Click to flip back</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition text-sm font-medium"
              >
                Edit Info
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Player Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Player Information</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                disabled={isSaving}
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Player Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter player name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => handleInputChange("grade", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., 5th, 6th"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Jersey Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jersey Number
                  </label>
                  <input
                    type="number"
                    value={formData.jersey_number}
                    onChange={(e) => handleInputChange("jersey_number", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter jersey number"
                    min="0"
                  />
                </div>

                {/* Shirt Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shirt Size
                  </label>
                  <input
                    type="text"
                    value={formData.shirt_size}
                    onChange={(e) => handleInputChange("shirt_size", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., S, M, L, XL"
                  />
                </div>

                {/* Position Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Preference
                  </label>
                  <input
                    type="text"
                    value={formData.position_preference}
                    onChange={(e) => handleInputChange("position_preference", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Point Guard, Forward"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.previous_experience}
                    onChange={(e) => handleInputChange("previous_experience", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select experience</option>
                    <option value="1">1: No Experience</option>
                    <option value="2">2: Some Basics</option>
                    <option value="3">3: Intermediate</option>
                    <option value="4">4: Advanced</option>
                    <option value="5">5: Competitive League</option>
                  </select>
                </div>

                {/* School Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={formData.school_name}
                    onChange={(e) => handleInputChange("school_name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter school name"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // Regular card for non-active players
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 relative">
      {/* Party popper in top-right corner */}
      {isTodayBirthday() && (
        <div className="absolute top-0 right-0 text-7xl sm:text-8xl -translate-y-6 translate-x-8" title="Happy Birthday!">
          🎉
        </div>
      )}
      
      {/* Top logo */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black border-2 sm:border-4 border-gray-300 shadow-md mx-auto flex items-center justify-center overflow-hidden relative glow-animation">
        <img
          src={teamLogoUrl}
          alt="Team logo"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/apple-touch-icon.png";
          }}
        />
      </div>

      {/* Name */}
      <h2 className="text-l sm:text-2xl md:text-2xl lg:text-xl font-extrabold text-center text-gray-900 mt-3">
        {child.name}
      </h2>

      {/* Subline */}
      <p className="text-center text-gray-500 mt-1 text-xs sm:text-sm md:text-sm lg:text-xs">
        {child.gender || ""}
        {child.grade ? ` • Grade ${child.grade}` : ""}
        {age ? ` • Age ${age}` : ""}
      </p>

      {/* Status badges - show progression based on status */}
      <div className="flex justify-center items-center gap-2 mt-3 sm:mt-4 flex-wrap">
        {(() => {
          const status = (child.status || "pending").toLowerCase();
          
          // On Hold: Show Pending (colored) + On Hold (bolder orange) + Active (greyed)
          if (status === "on_hold") {
            return (
              <>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                  Pending
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-orange-200 text-orange-900 border-2 border-orange-400">
                  On Hold
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                  Active
                </span>
              </>
            );
          }
          
          // Pending: Show Pending (colored) + Approved (greyed) + Active (greyed)
          if (status === "pending") {
            return (
              <>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                  Pending
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                  Approved
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                  Active
                </span>
              </>
            );
          }
          
          // Approved: Show Approved (bluish) + Active (greyed)
          if (status === "approved") {
            return (
              <>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                  Approved
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-300 opacity-50">
                  Active
                </span>
              </>
            );
          }
          
          // Active: Show only Active (greenish)
          if (status === "active") {
            return (
              <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                Active
              </span>
            );
          }
          
          // Rejected: Show only Rejected badge
          if (status === "rejected") {
            return (
              <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                Rejected
              </span>
            );
          }
          
          // Fallback: Show pending
          return (
            <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
              Pending
            </span>
          );
        })()}
      </div>

      {/* Info rows */}
      <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3 text-[11px] sm:text-sm md:text-sm lg:text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500 whitespace-nowrap">Team:</span>
          <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
            {child.team_id ? teamName || "Assigned" : "Not Assigned Yet"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500 whitespace-nowrap">Coach:</span>
          <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
            {child.team_id
              ? coachNames.length > 0
                ? coachNames.join(", ")
                : "Not Assigned Yet"
              : "Not Assigned Yet"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 whitespace-nowrap">
            Jersey<span className="hidden sm:inline"> Number</span>
          </span>
          <span className="font-semibold text-gray-900 whitespace-nowrap">
            {child.jersey_number || "Not Assigned"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 whitespace-nowrap">Birthdate</span>
          <span className="font-semibold text-gray-900 whitespace-nowrap">
            {child.date_of_birth
              ? (() => {
                  const [year, month, day] = child.date_of_birth.split("-");
                  const date = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                  );
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()
              : "Not provided"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 whitespace-nowrap">Waiver Signed</span>
          <span className="font-semibold text-green-600 whitespace-nowrap">
            {child.waiver_signed ? "✅ Yes" : "❌ No"}
          </span>
        </div>
      </div>

      {/* Payment status message - only show if not approved or not paid */}
      {!isApprovedAndPaid() && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 text-center">
            {!isApproved()
              ? "⏳ Awaiting admin approval. Payment information will be available after approval."
              : "⏳ Payment information will be available after your first payment."}
          </p>
        </div>
      )}
    </div>
  );
}
