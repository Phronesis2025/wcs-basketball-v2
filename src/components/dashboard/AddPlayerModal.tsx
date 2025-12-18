"use client";

import React, { useState, useEffect } from "react";
import { Player, Team } from "@/types/supabase";
import { validateInput, devLog, devError } from "@/lib/security";
import {
  isGradeCompatible,
  isGenderCompatible,
  validateDateOfBirth,
  getCompatibleTeamsByGrade,
  calculateAge,
} from "@/lib/ageValidation";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ManageDeleteConfirmModal from "./ManageDeleteConfirmModal";
import { useScrollLock } from "@/hooks/useScrollLock";

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerData: Partial<Player>) => void;
  onDelete?: (player: Player) => void;
  editingPlayer?: Player | null;
  teams: Team[];
  loading?: boolean;
  isManageTab?: boolean; // New prop to distinguish Manage tab from Coach tab
}

export default function AddPlayerModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingPlayer,
  teams,
  loading = false,
  isManageTab = false,
}: AddPlayerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    jerseyNumber: "",
    grade: "",
    dateOfBirth: "",
    gender: "",
    teamId: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    emergencyContact: "",
    emergencyPhone: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [compatibleTeams, setCompatibleTeams] = useState<
    Array<{
      id: string;
      name: string;
      age_group: string;
      gender: string;
      compatible: boolean;
      message: string;
    }>
  >([]);
  const [gradeValidationWarning, setGradeValidationWarning] =
    useState<string>("");

  // Lock scroll when modal is open
  useScrollLock(isOpen);

  // Initialize form when editing or when modal opens
  useEffect(() => {
    if (!isOpen) return; // Only run when modal is open

    devLog("AddPlayerModal useEffect - editingPlayer:", editingPlayer);
    if (editingPlayer) {
      devLog("Populating form with player data:", {
        name: editingPlayer.name,
        jerseyNumber: editingPlayer.jersey_number,
        grade: editingPlayer.grade,
        dateOfBirth: editingPlayer.date_of_birth,
        gender: editingPlayer.gender,
        teamId: editingPlayer.team_id,
        parentName: editingPlayer.parent_name,
        parentPhone: editingPlayer.parent_phone,
        parentEmail: editingPlayer.parent_email,
        emergencyContact: editingPlayer.emergency_contact,
        emergencyPhone: editingPlayer.emergency_phone,
        is_active: editingPlayer.is_active,
      });
      setFormData({
        name: editingPlayer.name || "",
        jerseyNumber: editingPlayer.jersey_number?.toString() || "",
        grade: editingPlayer.grade || "",
        dateOfBirth: editingPlayer.date_of_birth || "",
        gender: editingPlayer.gender || "",
        teamId: editingPlayer.team_id || "unassigned",
        parentName: editingPlayer.parent_name || "",
        parentPhone: editingPlayer.parent_phone || "",
        parentEmail: editingPlayer.parent_email || "",
        emergencyContact: editingPlayer.emergency_contact || "",
        emergencyPhone: editingPlayer.emergency_phone || "",
        is_active: editingPlayer.is_active ?? true,
      });

      // Initialize grade and gender validation for existing player
      if (editingPlayer.grade) {
        const compatible = getCompatibleTeamsByGrade(
          editingPlayer.grade,
          editingPlayer.gender || "",
          teams
        );
        setCompatibleTeams(compatible);
      }
    } else {
      setFormData({
        name: "",
        jerseyNumber: "",
        grade: "",
        dateOfBirth: "",
        gender: "",
        teamId: "",
        parentName: "",
        parentPhone: "",
        parentEmail: "",
        emergencyContact: "",
        emergencyPhone: "",
        is_active: true,
      });
      setCompatibleTeams([]);
      setGradeValidationWarning("");
    }
  }, [editingPlayer, teams, isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Handle grade validation when grade changes
    if (field === "grade") {
      const grade = value as string;
      if (grade.trim()) {
        const compatible = getCompatibleTeamsByGrade(
          grade,
          formData.gender,
          teams
        );
        setCompatibleTeams(compatible);

        // Check if currently selected team is compatible
        if (formData.teamId) {
          const selectedTeam = compatible.find(
            (team) => team.id === formData.teamId
          );
          if (selectedTeam && !selectedTeam.compatible) {
            setGradeValidationWarning(selectedTeam.message);
          } else {
            setGradeValidationWarning("");
          }
        }
      } else {
        setCompatibleTeams([]);
        setGradeValidationWarning("");
      }
    }

    // Handle gender validation
    if (field === "gender") {
      // If we have a grade, recalculate compatible teams
      if (formData.grade.trim()) {
        const compatible = getCompatibleTeamsByGrade(
          formData.grade,
          value as string,
          teams
        );
        setCompatibleTeams(compatible);

        // Check if currently selected team is compatible
        if (formData.teamId) {
          const selectedTeam = compatible.find(
            (team) => team.id === formData.teamId
          );
          if (selectedTeam && !selectedTeam.compatible) {
            setGradeValidationWarning(selectedTeam.message);
          } else {
            setGradeValidationWarning("");
          }
        }
      }
    }

    // Handle team selection validation
    if (field === "teamId" && formData.grade.trim()) {
      if (value === "unassigned") {
        setGradeValidationWarning("");
      } else {
        const selectedTeam = compatibleTeams.find((team) => team.id === value);
        if (selectedTeam && !selectedTeam.compatible) {
          setGradeValidationWarning(selectedTeam.message);
        } else {
          setGradeValidationWarning("");
        }
      }
    }
  };

  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element =
        document.querySelector(`[name="${firstErrorField}"]`) ||
        document.querySelector(`input[id*="${firstErrorField}"]`) ||
        document.querySelector(`select[id*="${firstErrorField}"]`);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Focus the element for better UX
        (element as HTMLElement).focus();
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const profanityErrors: string[] = [];

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = "Player name is required";
    }
    if (!formData.teamId) {
      newErrors.teamId = "Team selection is required";
    }
    if (!formData.grade.trim()) {
      newErrors.grade = "Grade is required";
    }
    if (!formData.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dateValidation = validateDateOfBirth(formData.dateOfBirth);
      if (!dateValidation.valid) {
        newErrors.dateOfBirth = dateValidation.message;
      }
    }

    // Validate parent information
    if (!formData.parentName.trim()) {
      newErrors.parentName = "Parent/Guardian name is required";
    }
    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = "Parent/Guardian phone is required";
    }
    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = "Parent/Guardian email is required";
    }

    // Validate emergency contact information
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact name is required";
    }
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = "Emergency contact phone is required";
    }

    // Validate grade-team compatibility (skip if unassigned)
    if (
      formData.grade.trim() &&
      formData.teamId &&
      formData.teamId !== "unassigned"
    ) {
      const selectedTeam = teams.find((team) => team.id === formData.teamId);
      if (selectedTeam) {
        const gradeCompatibility = isGradeCompatible(
          formData.grade,
          selectedTeam.age_group
        );
        const genderCompatibility = isGenderCompatible(
          formData.gender,
          selectedTeam.gender
        );

        if (!gradeCompatibility.compatible) {
          newErrors.teamId = gradeCompatibility.message;
        } else if (!genderCompatibility.compatible) {
          newErrors.teamId = genderCompatibility.message;
        }
      }
    }

    // Check for profanity
    const fieldsToCheck = [
      { value: formData.name, field: "name" },
      { value: formData.parentName, field: "parentName" },
      { value: formData.emergencyContact, field: "emergencyContact" },
    ];

    fieldsToCheck.forEach(({ value, field }) => {
      if (value && !validateInput(value)) {
        profanityErrors.push(`${field} contains inappropriate content`);
      }
    });

    setErrors(newErrors);
    setProfanityErrors(profanityErrors);

    // Scroll to first error if validation fails
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => scrollToFirstError(newErrors), 100);
    }

    return Object.keys(newErrors).length === 0 && profanityErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const playerData = {
      name: formData.name.trim(),
      jersey_number: formData.jerseyNumber
        ? parseInt(formData.jerseyNumber)
        : null,
      grade: formData.grade.trim() || null,
      date_of_birth: formData.dateOfBirth || null,
      age: calculateAge(formData.dateOfBirth || "2000-01-01 ") || null,
      gender: formData.gender.trim() || null,
      team_id: formData.teamId === "unassigned" ? undefined : formData.teamId,
    };

    onSubmit(playerData as Partial<Player>);
  };

  const handleDeleteConfirm = async () => {
    if (!editingPlayer || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(editingPlayer);
      setShowDeleteConfirm(false);
    } catch (error) {
      devError("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto pt-20 sm:pt-20">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto mx-1 sm:mx-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingPlayer ? "Edit Player" : "Add New Player"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Player Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter player name"
                />
                {errors.name && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Jersey Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey Number
                </label>
                <input
                  type="number"
                  value={formData.jerseyNumber}
                  onChange={(e) =>
                    handleInputChange("jerseyNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter jersey number"
                />
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={(e) => handleInputChange("grade", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.grade ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter grade"
                />
                {errors.grade && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.grade}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.gender}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className={`w-full max-w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 box-border ${
                    errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              {/* Team Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team *
                </label>
                <select
                  name="teamId"
                  value={formData.teamId}
                  onChange={(e) => handleInputChange("teamId", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.teamId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a team</option>
                  <option value="unassigned">Unassigned</option>
                  {compatibleTeams.length > 0
                    ? compatibleTeams.map((team) => (
                        <option
                          key={team.id}
                          value={team.id}
                          disabled={!team.compatible}
                          className={!team.compatible ? "text-gray-400" : ""}
                        >
                          {team.name} ({team.age_group} - {team.gender})
                          {!team.compatible ? " - Grade incompatible" : ""}
                        </option>
                      ))
                    : teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.age_group} - {team.gender})
                        </option>
                      ))}
                </select>
                {errors.teamId && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.teamId}
                  </p>
                )}
                {gradeValidationWarning && !errors.teamId && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {gradeValidationWarning}
                  </p>
                )}
              </div>

              {/* Active Status */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleInputChange("is_active", e.target.checked)
                    }
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active player
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Parent/Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parent Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={(e) =>
                    handleInputChange("parentName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.parentName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter parent/guardian name"
                />
                {errors.parentName && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.parentName}
                  </p>
                )}
              </div>

              {/* Parent Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent/Guardian Phone *
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) =>
                    handleInputChange("parentPhone", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.parentPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.parentPhone && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.parentPhone}
                  </p>
                )}
              </div>

              {/* Parent Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent/Guardian Email *
                </label>
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={(e) =>
                    handleInputChange("parentEmail", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.parentEmail ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
                {errors.parentEmail && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.parentEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    handleInputChange("emergencyContact", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.emergencyContact
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter emergency contact name"
                />
                {errors.emergencyContact && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.emergencyContact}
                  </p>
                )}
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) =>
                    handleInputChange("emergencyPhone", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.emergencyPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter emergency contact phone"
                />
                {errors.emergencyPhone && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.emergencyPhone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profanity Errors */}
          {profanityErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-[red] mb-2">
                Content Issues:
              </h4>
              <ul className="text-sm text-[red] list-disc list-inside">
                {profanityErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t">
            {/* Mobile Layout - Stacked buttons */}
            <div className="flex flex-col space-y-3 md:hidden">
              {/* Delete Button - Only show when editing */}
              {editingPlayer && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 text-white bg-[red] rounded-md hover:bg-[#b80000] transition-colors"
                >
                  Delete Player
                </button>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingPlayer
                    ? "Update Player"
                    : "Add Player"}
                </button>
              </div>
            </div>

            {/* Desktop Layout - Horizontal buttons */}
            <div className="hidden md:flex justify-between">
              {/* Delete Button - Only show when editing */}
              {editingPlayer && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-white bg-[red] rounded-md hover:bg-[#b80000] transition-colors"
                >
                  Delete Player
                </button>
              )}

              {/* Right side buttons */}
              <div className="flex space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : editingPlayer
                    ? "Update Player"
                    : "Add Player"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {isManageTab ? (
        <ManageDeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Player"
          message="Are you sure you want to delete this player? This action cannot be undone."
          itemName={editingPlayer ? editingPlayer.name : ""}
          itemType="player"
          loading={deleting}
        />
      ) : (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Player"
          message="Are you sure you want to delete this player? This action cannot be undone."
          itemName={editingPlayer ? editingPlayer.name : ""}
          loading={deleting}
        />
      )}
    </div>
  );
}
