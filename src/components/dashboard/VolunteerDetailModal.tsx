"use client";

import React, { useState, useEffect } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import toast from "react-hot-toast";

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  role: string;
  has_child_on_team: boolean;
  child_name: string | null;
  child_team_id: string | null;
  experience: string | null;
  availability: string | null;
  why_interested: string | null;
  background_check_consent: boolean;
  notes: string | null;
  created_at: string;
  teams?: {
    name: string;
    age_group: string | null;
    gender: string | null;
  } | null;
}

interface VolunteerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: Volunteer | null;
  onDelete: (volunteerId: string) => Promise<void>;
  onNotesUpdate?: () => void;
  userId: string | null;
}

export default function VolunteerDetailModal({
  isOpen,
  onClose,
  volunteer,
  onDelete,
  onNotesUpdate,
  userId,
}: VolunteerDetailModalProps) {
  useScrollLock(isOpen);

  const [notes, setNotes] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Initialize notes when volunteer changes
  useEffect(() => {
    if (volunteer) {
      setNotes(volunteer.notes || "");
    }
  }, [volunteer]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen || !volunteer) return null;

  const fullName = `${volunteer.first_name} ${volunteer.last_name}`;
  const roleDisplay = volunteer.role === "coach" ? "Coach" : "Volunteer";
  
  // Format address
  const addressParts = [
    volunteer.address_line1,
    volunteer.address_line2,
    volunteer.city,
    volunteer.state,
    volunteer.zip,
  ].filter(Boolean);
  const fullAddress = addressParts.join(", ");

  // Format child team name
  const childTeamName = volunteer.teams
    ? `${volunteer.teams.name}${volunteer.teams.age_group ? ` (${volunteer.teams.age_group})` : ""}${volunteer.teams.gender ? ` - ${volunteer.teams.gender}` : ""}`
    : null;

  // Format application date
  const applicationDate = volunteer.created_at
    ? new Date(volunteer.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const handleSaveNotes = async () => {
    if (!volunteer) return;

    setSavingNotes(true);
    const loadingToast = toast.loading("Saving notes...");

    try {
      if (!userId) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/admin/volunteers/${volunteer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const { extractApiErrorMessage } = await import("@/lib/errorHandler");
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      toast.dismiss(loadingToast);
      toast.success("Notes saved successfully");
      
      // Update the volunteer's notes in local state
      if (volunteer) {
        volunteer.notes = notes;
      }
      
      if (onNotesUpdate) {
        onNotesUpdate();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : "Failed to save notes"
      );
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!volunteer) return;

    setDeleting(true);
    const loadingToast = toast.loading("Rejecting volunteer...");

    try {
      await onDelete(volunteer.id);
      toast.dismiss(loadingToast);
      toast.success("Volunteer rejected successfully");
      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : "Failed to reject volunteer"
      );
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-black"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bebas uppercase text-black">
              Volunteer Information
            </h2>
            <button
              onClick={onClose}
              className="text-black hover:text-gray-600 transition-colors"
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
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-black">{fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-black">{roleDisplay}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-black">{volunteer.email}</p>
                </div>
                {volunteer.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-black">{volunteer.phone}</p>
                  </div>
                )}
                {fullAddress && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-black">{fullAddress}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Date
                  </label>
                  <p className="text-black">{applicationDate}</p>
                </div>
              </div>
            </div>

            {/* Child Information */}
            {volunteer.has_child_on_team && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  Child Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {volunteer.child_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Child Name
                      </label>
                      <p className="text-black">{volunteer.child_name}</p>
                    </div>
                  )}
                  {childTeamName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Team
                      </label>
                      <p className="text-black">{childTeamName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Application Details */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">
                Application Details
              </h3>
              <div className="space-y-4">
                {volunteer.experience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <p className="text-black whitespace-pre-wrap">
                      {volunteer.experience}
                    </p>
                  </div>
                )}
                {volunteer.availability && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Availability
                    </label>
                    <p className="text-black whitespace-pre-wrap">
                      {volunteer.availability}
                    </p>
                  </div>
                )}
                {volunteer.why_interested && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Why Interested
                    </label>
                    <p className="text-black whitespace-pre-wrap">
                      {volunteer.why_interested}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Check Consent
                  </label>
                  <p className="text-black">
                    {volunteer.background_check_consent ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Notes Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Admin Notes
              </h3>
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this volunteer (contact times, background info, etc.)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black min-h-[120px] resize-y"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>

            {/* Delete Button */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="w-full bg-[red] text-white rounded-md px-4 py-2 hover:bg-[#b80000] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Volunteer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
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
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reject Volunteer
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to reject this volunteer? This action
                  cannot be undone. The volunteer will be removed from the
                  pending list.
                </p>
                <p className="text-sm font-medium text-gray-900 mb-6">
                  &quot;{fullName}&quot;
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-white bg-[red] rounded-md hover:bg-[#b80000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? "Rejecting..." : "Yes, Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

