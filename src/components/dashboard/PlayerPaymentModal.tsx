"use client";

import React, { useState, useEffect } from "react";
import { Player, Team } from "@/types/supabase";
import { useScrollLock } from "@/hooks/useScrollLock";
import { validateInputForProfanity } from "@/lib/profanityFilter";

interface PlayerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  teams: Team[];
  playerStatus: "approved" | "pending" | "on_hold" | "rejected";
  onApprove?: (playerId: string, teamId: string) => Promise<void>;
  onOnHold?: (playerId: string, reason: string) => Promise<void>;
  onReject?: (playerId: string, reason: string) => Promise<void>;
  onMoveToPending?: (playerId: string) => Promise<void>;
  fetchManagementData?: () => Promise<void>;
}

export default function PlayerPaymentModal({
  isOpen,
  onClose,
  player,
  teams,
  playerStatus,
  onApprove,
  onOnHold,
  onReject,
  onMoveToPending,
  fetchManagementData,
}: PlayerPaymentModalProps) {
  useScrollLock(isOpen);

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showOnHoldOptions, setShowOnHoldOptions] = useState(false);
  const [selectedOnHoldReason, setSelectedOnHoldReason] = useState<string>("");
  const [otherOnHoldReason, setOtherOnHoldReason] = useState<string>("");
  const [profanityError, setProfanityError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedTeamId("");
      setRejectReason("");
      setShowRejectInput(false);
      setShowOnHoldOptions(false);
      setSelectedOnHoldReason("");
      setOtherOnHoldReason("");
      setProfanityError("");
      setLoading(false);
    }
  }, [isOpen]);

  // Validate profanity in "Other" field for on hold
  useEffect(() => {
    if (showOnHoldOptions && selectedOnHoldReason === "other" && otherOnHoldReason) {
      const validation = validateInputForProfanity("Reason", otherOnHoldReason);
      if (!validation.isValid) {
        setProfanityError(validation.errorMessage || "Inappropriate language detected");
      } else {
        setProfanityError("");
      }
    } else {
      setProfanityError("");
    }
  }, [showOnHoldOptions, selectedOnHoldReason, otherOnHoldReason]);

  if (!isOpen || !player) return null;

  // Calculate player age
  const playerAge = player.date_of_birth
    ? Math.floor(
        (new Date().getTime() -
          new Date(player.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const assignedTeam = teams.find((t: Team) => t.id === player.team_id);

  // Normalize gender labels between Player (Male/Female/Other) and Team (Boys/Girls/Co-ed)
  const normalizeGender = (value: string | null | undefined): "male" | "female" | "coed" | "other" => {
    const v = (value || "").trim().toLowerCase();
    if (v === "male" || v === "m" || v === "boy" || v === "boys") return "male";
    if (v === "female" || v === "f" || v === "girl" || v === "girls") return "female";
    if (v === "coed" || v === "co-ed" || v === "co ed") return "coed";
    return "other";
  };

  // Filter teams based on age and gender compatibility for pending players
  const compatibleTeams = playerStatus === "pending" && playerAge && player.gender
    ? teams.filter((t: Team) => {
        // Only consider active teams when available
        if ((t as any).is_active === false) return false;

        const ageRanges: Record<string, { min: number; max: number }> = {
          U8: { min: 6, max: 8 },
          U10: { min: 8, max: 10 },
          U12: { min: 10, max: 12 },
          U14: { min: 12, max: 14 },
          U16: { min: 14, max: 16 },
          U18: { min: 15, max: 18 },
        };
        const ageRange = ageRanges[t.age_group || ""];
        if (ageRange && (playerAge < ageRange.min || playerAge > ageRange.max)) {
          return false;
        }

        const playerNorm = normalizeGender(player.gender);
        const teamNorm = normalizeGender(t.gender);

        // Compatibility: team coed accepts all, or genders match; players with "other" can only join coed
        if (teamNorm === "coed") return true;
        if (playerNorm === "other") return false;
        return teamNorm === playerNorm;
      })
    : teams;

  // Format registration date
  const registrationDate = player.created_at
    ? new Date(player.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const handleApprove = async () => {
    if (!selectedTeamId && playerStatus === "pending") {
      alert("Please select a team first.");
      return;
    }
    if (onApprove) {
      setLoading(true);
      try {
        await onApprove(player.id, selectedTeamId);
        if (fetchManagementData) await fetchManagementData();
        onClose();
      } catch (error) {
        console.error("Error approving player:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }

    if (onReject) {
      setLoading(true);
      try {
        await onReject(player.id, rejectReason);
        // Close modal first, then refresh data
        onClose();
        if (fetchManagementData) {
          await fetchManagementData();
        }
      } catch (error) {
        console.error("Error rejecting player:", error);
        // Don't close on error - let user see the error message
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMoveToPending = async () => {
    if (onMoveToPending) {
      setLoading(true);
      try {
        await onMoveToPending(player.id);
        if (fetchManagementData) await fetchManagementData();
        onClose();
      } catch (error) {
        console.error("Error moving player to pending:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOnHold = async () => {
    if (!showOnHoldOptions) {
      setShowOnHoldOptions(true);
      return;
    }

    if (!selectedOnHoldReason) {
      return;
    }

    if (selectedOnHoldReason === "other") {
      if (!otherOnHoldReason.trim()) {
        setProfanityError("Please provide a reason");
        return;
      }
      
      // Final profanity check before submitting
      const validation = validateInputForProfanity("Reason", otherOnHoldReason);
      if (!validation.isValid) {
        setProfanityError(validation.errorMessage || "Inappropriate language detected");
        return;
      }
      
      if (onOnHold) {
        setLoading(true);
        try {
          await onOnHold(player.id, otherOnHoldReason.trim());
          // Close modal first, then refresh data
          onClose();
          if (fetchManagementData) {
            await fetchManagementData();
          }
        } catch (error) {
          console.error("Error placing player on hold:", error);
          // Don't close on error - let user see the error message
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Map the reason values to display text
      const reasonMap: Record<string, string> = {
        "no_team_spot": "No teams spot available",
        "not_enough_players": "Not enough players/coaches for full team",
      };
      const reasonText = reasonMap[selectedOnHoldReason] || selectedOnHoldReason;
      
      if (onOnHold) {
        setLoading(true);
        try {
          await onOnHold(player.id, reasonText);
          // Close modal first, then refresh data
          onClose();
          if (fetchManagementData) {
            await fetchManagementData();
          }
        } catch (error) {
          console.error("Error placing player on hold:", error);
          // Don't close on error - let user see the error message
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const canSubmitOnHold = selectedOnHoldReason && (selectedOnHoldReason !== "other" || (otherOnHoldReason.trim() && !profanityError));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bebas uppercase text-black">Player Information</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-black transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Player Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                {player.name}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Parent Email</label>
                <p className="text-black">{player.parent_email || "N/A"}</p>
              </div>
              {playerAge && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Age</label>
                  <p className="text-black">{playerAge} years</p>
                </div>
              )}
              {player.gender && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Gender</label>
                  <p className="text-black">{player.gender}</p>
                </div>
              )}
              {player.grade && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Grade</label>
                  <p className="text-black">{player.grade}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Registration Date</label>
                <p className="text-black">{registrationDate}</p>
              </div>
              {assignedTeam && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Team</label>
                  <p className="text-black">{assignedTeam.name}</p>
                </div>
              )}
              {player.parent_phone && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Parent Phone</label>
                  <p className="text-black">{player.parent_phone}</p>
                </div>
              )}
            </div>

            {/* Status-specific reason fields */}
            {player.on_hold_reason && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                <p className="text-black text-sm">
                  <strong>On Hold Reason:</strong> {player.on_hold_reason}
                </p>
              </div>
            )}

            {player.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-black text-sm">
                  <strong>Rejection Reason:</strong> {player.rejection_reason}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {playerStatus === "pending" && (
              <>
                {!showOnHoldOptions ? (
                  <>
                    {compatibleTeams.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Assign Team
                        </label>
                        <select
                          value={selectedTeamId}
                          onChange={(e) => setSelectedTeamId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                          <option value="" disabled>
                            Select team
                          </option>
                          {compatibleTeams.map((t: Team) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.age_group} {t.gender})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleApprove}
                        disabled={loading || !selectedTeamId}
                        className="flex-1 bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={handleOnHold}
                        disabled={loading}
                        className="flex-1 bg-yellow-500 text-white rounded-md px-4 py-2 hover:bg-yellow-600 transition text-sm font-medium disabled:opacity-50"
                      >
                        On Hold
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={loading || (showRejectInput && !rejectReason.trim())}
                        className="flex-1 bg-[red] text-white rounded-md px-4 py-2 hover:bg-[#b80000] transition text-sm font-medium disabled:opacity-50"
                      >
                        {showRejectInput ? "Confirm Reject" : "Reject"}
                      </button>
                    </div>
                    {showRejectInput && (
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Rejection Reason
                        </label>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Place Player On Hold
                      </h3>
                      <p className="text-sm text-black mb-4">
                        Select a reason for placing <strong>{player.name}</strong> on hold:
                      </p>
                    </div>
                    
                    {/* Reason Options */}
                    <div className="space-y-3 mb-4">
                      {/* Option 1 */}
                      <label className="flex items-start p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="holdReason"
                          value="no_team_spot"
                          checked={selectedOnHoldReason === "no_team_spot"}
                          onChange={(e) => setSelectedOnHoldReason(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-sm text-black">
                          No teams spot available
                        </span>
                      </label>

                      {/* Option 2 */}
                      <label className="flex items-start p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="holdReason"
                          value="not_enough_players"
                          checked={selectedOnHoldReason === "not_enough_players"}
                          onChange={(e) => setSelectedOnHoldReason(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-sm text-black">
                          Not enough players/coaches for full team
                        </span>
                      </label>

                      {/* Option 3 */}
                      <div className="border border-gray-300 rounded-md">
                        <label className="flex items-start p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="holdReason"
                            value="other"
                            checked={selectedOnHoldReason === "other"}
                            onChange={(e) => setSelectedOnHoldReason(e.target.value)}
                            className="mt-1 mr-3"
                          />
                          <span className="text-sm text-black flex-1">Other:</span>
                        </label>
                        
                        {selectedOnHoldReason === "other" && (
                          <div className="px-3 pb-3">
                            <textarea
                              value={otherOnHoldReason}
                              onChange={(e) => setOtherOnHoldReason(e.target.value)}
                              placeholder="Please provide additional details..."
                              className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 text-black ${
                                profanityError
                                  ? "border-black focus:ring-black focus:border-black"
                                  : "border-gray-300 focus:ring-black focus:border-black"
                              }`}
                              rows={3}
                              maxLength={500}
                            />
                            {profanityError && (
                              <p className="mt-1 text-xs text-black">{profanityError}</p>
                            )}
                            {!profanityError && otherOnHoldReason && (
                              <p className="mt-1 text-xs text-black">
                                {otherOnHoldReason.length}/500 characters
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowOnHoldOptions(false);
                          setSelectedOnHoldReason("");
                          setOtherOnHoldReason("");
                          setProfanityError("");
                        }}
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300 transition text-sm font-medium disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleOnHold}
                        disabled={loading || !canSubmitOnHold}
                        className="flex-1 px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition text-sm font-medium disabled:opacity-50"
                      >
                        {loading ? "Placing on Hold..." : "Place on Hold"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {playerStatus === "approved" && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-black border border-yellow-300">
                  Awaiting Payment
                </span>
              </div>
            )}

            {playerStatus === "on_hold" && (
              <button
                onClick={handleMoveToPending}
                disabled={loading}
                className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Moving..." : "Move to Pending"}
              </button>
            )}

            {playerStatus === "rejected" && (
              <>
                <div className="text-center mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-black border border-red-300">
                    Rejected
                  </span>
                </div>
                <button
                  onClick={handleMoveToPending}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Restoring..." : "Restore"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

