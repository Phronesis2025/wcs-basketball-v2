"use client";

import React, { useState, useEffect } from "react";
import { Coach } from "@/types/supabase";
import { validateInput, devLog, devError } from "@/lib/security";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ManageDeleteConfirmModal from "./ManageDeleteConfirmModal";
import { useScrollLock } from "@/hooks/useScrollLock";
import { supabase } from "@/lib/supabaseClient";

interface AddCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (coachData: Partial<Coach>) => void;
  onDelete?: (coach: Coach) => void;
  editingCoach?: Coach | null;
  loading?: boolean;
  isManageTab?: boolean; // New prop to distinguish Manage tab from Coach tab
  teams?: Array<{ id: string; name: string }>; // Available teams
}

export default function AddCoachModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingCoach,
  loading = false,
  isManageTab = false,
  teams = [],
}: AddCoachModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    quote: "",
    is_active: true,
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [assignedTeam, setAssignedTeam] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Lock scroll when modal is open
  useScrollLock(isOpen);

  // Initialize form when editing
  useEffect(() => {
    devLog("AddCoachModal useEffect - editingCoach:", editingCoach);

    const fetchAssignedTeam = async (coachId: string) => {
      try {
        const { data, error } = await supabase
          .from("team_coaches")
          .select("team_id, teams(id, name)")
          .eq("coach_id", coachId)
          .maybeSingle();

        if (error) {
          devError("Error fetching assigned team:", error);
          return;
        }

        if (data && data.teams) {
          const team = data.teams as { id: string; name: string };
          setAssignedTeam(team);
          setSelectedTeamId(team.id);
          devLog("Assigned team found:", team);
        }
      } catch (err) {
        devError("Error fetching assigned team:", err);
      }
    };

    if (editingCoach) {
      devLog("Populating form with coach data:", {
        firstName: editingCoach.first_name,
        lastName: editingCoach.last_name,
        email: editingCoach.email,
        bio: editingCoach.bio,
        quote: editingCoach.quote,
        is_active: editingCoach.is_active,
      });
      setFormData({
        firstName: editingCoach.first_name || "",
        lastName: editingCoach.last_name || "",
        email: editingCoach.email || "",
        bio: editingCoach.bio || "",
        quote: editingCoach.quote || "",
        is_active: editingCoach.is_active ?? true,
      });

      // Set current image for editing
      setCurrentImage(editingCoach.image_url || null);

      // Fetch assigned team
      fetchAssignedTeam(editingCoach.id);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        bio: "",
        quote: "",
        is_active: true,
      });

      // Clear current image for new coach
      setCurrentImage(null);
      setAssignedTeam(null);
      setSelectedTeamId("");
    }

    // Reset file input and preview
    setSelectedFile(null);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, image: "" }));
  }, [editingCoach]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Cleanup file input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImagePreview(null);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    devLog("File input changed:", e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      devLog("File selected:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      // Validate file type
      if (!file.type.startsWith("image/")) {
        devLog("Invalid file type:", file.type);
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        devLog("File too large:", file.size);
        setErrors((prev) => ({
          ...prev,
          image: "File size must be less than 5MB",
        }));
        return;
      }

      devLog("File validation passed, setting selected file");
      setSelectedFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Clear any previous errors
      setErrors((prev) => ({ ...prev, image: "" }));
    } else {
      devLog("No file selected");
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/coach-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const { extractApiErrorMessage } = await import("@/lib/errorHandler");
      const errorMessage = await extractApiErrorMessage(response);
      throw new Error(errorMessage);
    }

    const { extractApiResponseData } = await import("@/lib/errorHandler");
    const result = await extractApiResponseData<{ url: string }>(response);
    return result.url;
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
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Check for profanity
    const fieldsToCheck = [
      { value: formData.firstName, field: "firstName" },
      { value: formData.lastName, field: "lastName" },
      { value: formData.bio, field: "bio" },
      { value: formData.quote, field: "quote" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      let imageUrl;

      // If a new file is selected, upload it
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      } else if (editingCoach && currentImage) {
        // Keep current image when editing and no new file selected
        imageUrl = currentImage;
      } else {
        // Use default image if no file selected and not editing
        imageUrl =
          "https://htgkddahhgugesktujds.supabase.co/storage/v1/object/public/images/coaches/goofy_coach.png";
      }

      const coachData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        image_url: imageUrl,
        quote: formData.quote.trim(),
        is_active: formData.is_active,
        selectedTeamId: selectedTeamId, // Include selected team
      };

      onSubmit(coachData);
    } catch (error) {
      devError("Error uploading image:", error);
      setErrors((prev) => ({
        ...prev,
        image: "Failed to upload image. Please try again.",
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingCoach || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(editingCoach);
      setShowDeleteConfirm(false);
    } catch (error) {
      devError("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bebas uppercase text-gray-900">
            {editingCoach ? "Edit Coach" : "Add Coach"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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

        <form onSubmit={handleSubmit} className="p-6">
          {/* Profanity Errors */}
          {profanityErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <h4 className="font-semibold">Content Issues:</h4>
              <ul className="list-disc list-inside">
                {profanityErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter coach bio"
              />
            </div>

            {/* Quote */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote
              </label>
              <textarea
                value={formData.quote}
                onChange={(e) => handleInputChange("quote", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter motivational quote"
              />
            </div>

            {/* Team Selection */}
            {isManageTab && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">
                    {assignedTeam
                      ? `Currently: ${assignedTeam.name}`
                      : "Select a team"}
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Coach Image */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coach Image
              </label>

              {/* Image Preview */}
              {(imagePreview || currentImage) && (
                <div className="mb-4">
                  <img
                    src={imagePreview || currentImage}
                    alt={
                      imagePreview ? "New coach image" : "Current coach image"
                    }
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  {currentImage && !imagePreview && (
                    <p className="text-sm text-gray-500 mt-2">
                      Current coach image
                    </p>
                  )}
                  {imagePreview && (
                    <p className="text-sm text-blue-600 mt-2">
                      New image selected
                    </p>
                  )}
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <div className="relative">
                  {isOpen && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="coach-image-upload"
                      key={`coach-upload-${
                        editingCoach?.id || "new"
                      }-${Date.now()}`}
                    />
                  )}
                  <label
                    htmlFor="coach-image-upload"
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={(e) => {
                      devLog("File upload label clicked");
                      e.preventDefault();
                      const fileInput = document.getElementById(
                        "coach-image-upload"
                      ) as HTMLInputElement;
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <div className="text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
                {errors.image && (
                  <p className="text-[red] text-sm mt-1 font-medium">
                    {errors.image}
                  </p>
                )}
              </div>
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
                  Active Coach
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* Mobile Layout - Stacked buttons */}
            <div className="flex flex-col space-y-3 md:hidden">
              {/* Delete Button - Only show when editing */}
              {editingCoach && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 text-white bg-[red] rounded-md hover:bg-[#b80000] transition-colors"
                >
                  Delete Coach
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
                  disabled={loading || uploading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading..."
                    : loading
                    ? "Saving..."
                    : editingCoach
                    ? "Update Coach"
                    : "Add Coach"}
                </button>
              </div>
            </div>

            {/* Desktop Layout - Horizontal buttons */}
            <div className="hidden md:flex justify-between">
              {/* Delete Button - Only show when editing */}
              {editingCoach && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-white bg-[red] rounded-md hover:bg-[#b80000] transition-colors"
                >
                  Delete Coach
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
                  disabled={loading || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading..."
                    : loading
                    ? "Saving..."
                    : editingCoach
                    ? "Update Coach"
                    : "Add Coach"}
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
          title="Delete Coach"
          message="Are you sure you want to delete this coach? This action cannot be undone."
          itemName={
            editingCoach
              ? `${editingCoach.first_name} ${editingCoach.last_name}`
              : ""
          }
          itemType="coach"
          loading={deleting}
        />
      ) : (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Coach"
          message="Are you sure you want to delete this coach? This action cannot be undone."
          itemName={
            editingCoach
              ? `${editingCoach.first_name} ${editingCoach.last_name}`
              : ""
          }
          loading={deleting}
        />
      )}
    </div>
  );
}
