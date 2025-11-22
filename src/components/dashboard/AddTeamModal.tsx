"use client";

import React, { useState, useEffect } from "react";
import { Team } from "@/types/supabase";
import { validateInput, devLog, devError } from "@/lib/security";
import Image from "next/image";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ManageDeleteConfirmModal from "./ManageDeleteConfirmModal";
import { useScrollLock } from "@/hooks/useScrollLock";

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamData: Partial<Team>) => void;
  onDelete?: (team: Team) => void;
  editingTeam?: Team | null;
  loading?: boolean;
  isManageTab?: boolean; // New prop to distinguish Manage tab from Coach tab
  coaches?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }>; // Available coaches
}

export default function AddTeamModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingTeam,
  loading = false,
  isManageTab = false,
  coaches = [],
}: AddTeamModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    ageGroup: "",
    gender: "",
    logoUrl: "",
    is_active: true,
    coachIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Lock scroll when modal is open
  useScrollLock(isOpen);

  // Initialize form when editing or when modal opens
  useEffect(() => {
    if (!isOpen) return; // Only run when modal is open
    
    devLog("AddTeamModal useEffect - editingTeam:", editingTeam);
    if (editingTeam) {
      devLog("Populating form with team data:", {
        name: editingTeam.name,
        ageGroup: editingTeam.age_group,
        is_active: editingTeam.is_active,
      });
      setFormData({
        name: editingTeam.name || "",
        ageGroup: editingTeam.age_group || "",
        gender: editingTeam.gender || "",
        logoUrl: editingTeam.logo_url || "",
        is_active: editingTeam.is_active ?? true,
        coachIds: editingTeam.coaches?.map((coach) => coach.id) || [],
      });
      setLogoPreview(editingTeam.logo_url || "");
      setImagePreview(editingTeam.team_image || "");
    } else {
      setFormData({
        name: "",
        ageGroup: "",
        gender: "",
        logoUrl: "",
        is_active: true,
        coachIds: [],
      });
      setLogoPreview("");
      setImagePreview("");
    }
  }, [editingTeam, isOpen]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCoachSelection = (coachId: string, isSelected: boolean) => {
    setFormData((prev) => {
      if (isSelected) {
        if (!prev.coachIds.includes(coachId)) {
          return { ...prev, coachIds: [...prev.coachIds, coachId] };
        }
      } else {
        return {
          ...prev,
          coachIds: prev.coachIds.filter((id) => id !== coachId),
        };
      }
      return prev;
    });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          logo: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          logo: "File size must be less than 5MB",
        }));
        return;
      }

      setSelectedLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Clear any previous errors
      setErrors((prev) => ({ ...prev, logo: "" }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    devLog("🖼️ Team Image File Selected:", file);
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "File size must be less than 5MB",
        }));
        return;
      }

      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Clear any previous errors
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const uploadLogo = async (file: File, teamName: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("teamName", teamName);

    const response = await fetch("/api/upload/team-logo", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const { extractApiErrorMessage } = await import("@/lib/errorHandler");
      const errorMessage = await extractApiErrorMessage(response);
      throw new Error(errorMessage);
    }

    const { extractApiResponseData } = await import("@/lib/errorHandler");
    const data = await extractApiResponseData<{ url: string }>(response);
    return data.url;
  };

  const uploadImage = async (file: File, teamName: string): Promise<string> => {
    devLog("🖼️ uploadImage function called with:", {
      fileName: file.name,
      fileSize: file.size,
      teamName,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("teamName", teamName);

    devLog("🖼️ Making API call to /api/upload/team-image");
    const response = await fetch("/api/upload/team-image", {
      method: "POST",
      body: formData,
    });

    devLog("🖼️ API response status:", response.status);
    devLog("🖼️ API response ok:", response.ok);

    if (!response.ok) {
      const { extractApiErrorMessage } = await import("@/lib/errorHandler");
      const errorMessage = await extractApiErrorMessage(response);
      devError("🖼️ API error response:", errorMessage);
      throw new Error(errorMessage);
    }

    const { extractApiResponseData } = await import("@/lib/errorHandler");
    const data = await extractApiResponseData<{ url: string }>(response);
    devLog("🖼️ API success response:", data);
    return data.url;
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
      newErrors.name = "Team name is required";
    }
    if (!formData.ageGroup.trim()) {
      newErrors.ageGroup = "Grade level is required";
    }
    if (!formData.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    // Check for profanity
    const fieldsToCheck = [
      { value: formData.name, field: "name" },
      { value: formData.ageGroup, field: "ageGroup" },
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

    setUploadingLogo(true);
    setUploadingImage(true);

    try {
      let logoUrl = formData.logoUrl;
      // Initialize imageUrl with existing team_image value (important for edit mode)
      let imageUrl = editingTeam?.team_image || "";

      // Upload logo if a new file is selected
      if (selectedLogoFile) {
        logoUrl = await uploadLogo(selectedLogoFile, formData.name.trim());
      }

      // Upload team image if a new file is selected
      devLog("🖼️ Checking for team image upload:", {
        selectedImageFile,
        hasFile: !!selectedImageFile,
        existingImage: editingTeam?.team_image,
      });
      if (selectedImageFile) {
        devLog("🖼️ Uploading team image...");
        imageUrl = await uploadImage(selectedImageFile, formData.name.trim());
        devLog("🖼️ Team image uploaded successfully:", imageUrl);
      } else {
        devLog("🖼️ No team image file selected, preserving existing image:", imageUrl);
      }

      // Add cache-busting param to avoid stale cached images after overwrite
      const addCacheBuster = (url: string) => {
        try {
          const u = new URL(url);
          u.searchParams.set("v", Date.now().toString());
          return u.toString();
        } catch {
          // Fallback for non-absolute URLs
          const sep = url.includes("?") ? "&" : "?";
          return `${url}${sep}v=${Date.now()}`;
        }
      };

      if (logoUrl) logoUrl = addCacheBuster(logoUrl);
      if (imageUrl) imageUrl = addCacheBuster(imageUrl);

      const teamData = {
        name: formData.name.trim(),
        age_group: formData.ageGroup.trim(),
        gender: formData.gender.trim(),
        team_image: imageUrl,
        logo_url: logoUrl,
        is_active: formData.is_active,
        coach_ids: formData.coachIds,
      };

      onSubmit(teamData);
    } catch (error) {
      devError("Error uploading files:", error);
      setErrors((prev) => ({
        ...prev,
        logo: "Failed to upload files. Please try again.",
      }));
    } finally {
      setUploadingLogo(false);
      setUploadingImage(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingTeam || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(editingTeam);
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
            {editingTeam ? "Edit Team" : "Add Team"}
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
            {/* Team Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter team name"
              />
              {errors.name && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Grade Level (stored in age_group field) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level *
              </label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.ageGroup ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select grade level</option>
                <option value="2nd Grade">2nd Grade</option>
                <option value="3rd Grade">3rd Grade</option>
                <option value="4th Grade">4th Grade</option>
                <option value="5th Grade">5th Grade</option>
                <option value="6th Grade">6th Grade</option>
                <option value="7th Grade">7th Grade</option>
                <option value="8th Grade">8th Grade</option>
                <option value="U18 (High School)">U18 (High School)</option>
              </select>
              {errors.ageGroup && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.ageGroup}
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
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Mixed">Mixed</option>
                <option value="Coed">Coed</option>
              </select>
              {errors.gender && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div>
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
                  Active Team
                </span>
              </label>
            </div>

            {/* Coach Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Coaches
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                {coaches.length === 0 ? (
                  <p className="text-gray-500 text-sm">No coaches available</p>
                ) : (
                  <div className="space-y-2">
                    {coaches.map((coach) => (
                      <label
                        key={coach.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.coachIds.includes(coach.id)}
                          onChange={(e) =>
                            handleCoachSelection(coach.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">
                          {coach.first_name} {coach.last_name} ({coach.email})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.coachIds.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {formData.coachIds.length} coach
                  {formData.coachIds.length !== 1 ? "es" : ""} selected
                </p>
              )}
              {errors.coachIds && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.coachIds}
                </p>
              )}
            </div>

            {/* Team Logo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Logo
              </label>

              {/* Logo Preview */}
              {logoPreview && (
                <div className="mb-4">
                  <img
                    src={logoPreview}
                    alt="New logo preview"
                    className="w-32 h-32 object-contain rounded-lg border border-gray-300"
                  />
                  <p className="text-sm text-blue-600 mt-2">
                    New logo selected
                  </p>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <div className="relative">
                  {isOpen && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="logo-upload"
                      key={`logo-upload-${Date.now()}`}
                    />
                  )}
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const fileInput = document.getElementById(
                        "logo-upload"
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
                <p className="text-xs text-gray-500">
                  Upload a logo file (PNG, JPG, etc.) - will be renamed to logo-
                  {formData.name
                    .toLowerCase()
                    .replace(/^wcs\s+/, "")
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")}
                  .png
                </p>
              </div>
              {errors.logo && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.logo}
                </p>
              )}
            </div>

            {/* Team Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Image
              </label>

              {/* Team Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="New team image preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <p className="text-sm text-blue-600 mt-2">
                    New team image selected
                  </p>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <div className="relative">
                  {isOpen && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="team-image-upload"
                      key={`team-image-upload-${Date.now()}`}
                    />
                  )}
                  <label
                    htmlFor="team-image-upload"
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      const fileInput = document.getElementById(
                        "team-image-upload"
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
                <p className="text-xs text-gray-500">
                  Upload a team image file (PNG, JPG, etc.) - will be renamed to{" "}
                  {formData.name
                    .toLowerCase()
                    .replace(/^wcs\s+/, "")
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")}
                  .png
                </p>
              </div>
              {errors.image && (
                <p className="text-[red] text-sm mt-1 font-medium">
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* Mobile Layout - Stacked buttons */}
            <div className="flex flex-col space-y-3 md:hidden">
              {/* Delete Button - Only show when editing */}
              {editingTeam && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 text-white bg-[red] rounded-md hover:bg-[#b80000] transition-colors"
                >
                  Delete Team
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
                  disabled={loading || uploadingLogo || uploadingImage}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading || uploadingLogo || uploadingImage
                    ? "Saving..."
                    : editingTeam
                    ? "Update Team"
                    : "Add Team"}
                </button>
              </div>
            </div>

            {/* Desktop Layout - Horizontal buttons */}
            <div className="hidden md:flex justify-between">
              {/* Delete Button - Only show when editing */}
              {editingTeam && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-white bg-[red] rounded-md hover:bg-[#b80000] transition-colors"
                >
                  Delete Team
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
                  disabled={loading || uploadingLogo || uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading || uploadingLogo || uploadingImage
                    ? "Saving..."
                    : editingTeam
                    ? "Update Team"
                    : "Add Team"}
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
          title="Delete Team"
          message="Are you sure you want to delete this team? This action cannot be undone."
          itemName={editingTeam ? editingTeam.name : ""}
          itemType="team"
          loading={deleting}
        />
      ) : (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Team"
          message="Are you sure you want to delete this team? This action cannot be undone."
          itemName={editingTeam ? editingTeam.name : ""}
          loading={deleting}
        />
      )}
    </div>
  );
}
