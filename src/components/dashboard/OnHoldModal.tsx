"use client";

import React, { useState, useEffect } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { validateInputForProfanity } from "@/lib/profanityFilter";

interface OnHoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  playerName: string;
  loading?: boolean;
}

export default function OnHoldModal({
  isOpen,
  onClose,
  onConfirm,
  playerName,
  loading = false,
}: OnHoldModalProps) {
  // Lock scroll when modal is open
  useScrollLock(isOpen);

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [profanityError, setProfanityError] = useState<string>("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setOtherReason("");
      setProfanityError("");
    }
  }, [isOpen]);

  // Validate profanity in "Other" field
  useEffect(() => {
    if (selectedReason === "other" && otherReason) {
      const validation = validateInputForProfanity("Reason", otherReason);
      if (!validation.isValid) {
        setProfanityError(validation.errorMessage || "Inappropriate language detected");
      } else {
        setProfanityError("");
      }
    } else {
      setProfanityError("");
    }
  }, [selectedReason, otherReason]);

  const handleSubmit = () => {
    if (!selectedReason) {
      return;
    }

    if (selectedReason === "other") {
      if (!otherReason.trim()) {
        setProfanityError("Please provide a reason");
        return;
      }
      
      // Final profanity check before submitting
      const validation = validateInputForProfanity("Reason", otherReason);
      if (!validation.isValid) {
        setProfanityError(validation.errorMessage || "Inappropriate language detected");
        return;
      }
      
      onConfirm(otherReason.trim());
    } else {
      onConfirm(selectedReason);
    }
  };

  const canSubmit = selectedReason && (selectedReason !== "other" || (otherReason.trim() && !profanityError));

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto pt-20 sm:pt-20"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-5rem)] mx-1 sm:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Place Player On Hold
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Select a reason for placing <strong>&quot;{playerName}&quot;</strong> on hold:
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
                checked={selectedReason === "no_team_spot"}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-sm text-gray-700">
                No teams spot available
              </span>
            </label>

            {/* Option 2 */}
            <label className="flex items-start p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="holdReason"
                value="not_enough_players"
                checked={selectedReason === "not_enough_players"}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-sm text-gray-700">
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
                  checked={selectedReason === "other"}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mt-1 mr-3"
                />
                <span className="text-sm text-gray-700 flex-1">Other:</span>
              </label>
              
              {selectedReason === "other" && (
                <div className="px-3 pb-3">
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please provide additional details..."
                    className={`w-full p-2 border rounded-md text-sm ${
                      profanityError
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                    }`}
                    rows={3}
                    maxLength={500}
                  />
                  {profanityError && (
                    <p className="mt-1 text-xs text-red-600">{profanityError}</p>
                  )}
                  {!profanityError && otherReason && (
                    <p className="mt-1 text-xs text-gray-500">
                      {otherReason.length}/500 characters
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className="flex-1 px-4 py-2 text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Placing on Hold..." : "Place on Hold"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

