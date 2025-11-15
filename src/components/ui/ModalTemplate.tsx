"use client";

import React, { useState, useEffect } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { devError } from "@/lib/security";

// Generic interface for modal data - customize based on your needs
interface ModalData {
  // Basic text fields
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  description?: string;

  // Dropdown selections
  role: string;
  department?: string;
  status: string;

  // Date fields
  startDate?: string;
  endDate?: string;
  birthDate?: string;

  // Boolean fields
  isActive: boolean;
  isPublic?: boolean;

  // File/image fields
  imageUrl?: string;
  documentUrl?: string;
}

interface ModalTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ModalData) => void;
  onDelete?: (data: ModalData) => void;
  editingData?: ModalData | null;
  loading?: boolean;
  title: string;
  deleteTitle?: string;
  deleteMessage?: string;
}

export default function ModalTemplate({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  editingData,
  loading = false,
  title,
  deleteTitle = "Delete Item",
  deleteMessage = "Are you sure you want to delete this item? This action cannot be undone.",
}: ModalTemplateProps) {
  // Form state management
  const [formData, setFormData] = useState<ModalData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    description: "",
    role: "",
    department: "",
    status: "active",
    startDate: "",
    endDate: "",
    birthDate: "",
    isActive: true,
    isPublic: false,
    imageUrl: "",
    documentUrl: "",
  });

  // Error handling
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);

  // File upload states
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<string | null>(null);

  // UI states
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Lock scroll when modal is open
  useScrollLock(isOpen);

  // Dropdown options - customize these based on your needs
  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "coach", label: "Coach" },
    { value: "player", label: "Player" },
    { value: "parent", label: "Parent" },
  ];

  const departmentOptions = [
    { value: "soccer", label: "Soccer" },
    { value: "basketball", label: "Basketball" },
    { value: "baseball", label: "Baseball" },
    { value: "tennis", label: "Tennis" },
    { value: "swimming", label: "Swimming" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" },
  ];

  // Initialize form when editing
  useEffect(() => {
    if (editingData) {
      setFormData({
        firstName: editingData.firstName || "",
        lastName: editingData.lastName || "",
        email: editingData.email || "",
        phone: editingData.phone || "",
        bio: editingData.bio || "",
        description: editingData.description || "",
        role: editingData.role || "",
        department: editingData.department || "",
        status: editingData.status || "active",
        startDate: editingData.startDate || "",
        endDate: editingData.endDate || "",
        birthDate: editingData.birthDate || "",
        isActive: editingData.isActive ?? true,
        isPublic: editingData.isPublic ?? false,
        imageUrl: editingData.imageUrl || "",
        documentUrl: editingData.documentUrl || "",
      });

      // Set current files for editing
      setCurrentImage(editingData.imageUrl || null);
      setCurrentDocument(editingData.documentUrl || null);
    } else {
      // Reset form for new item
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
        description: "",
        role: "",
        department: "",
        status: "active",
        startDate: "",
        endDate: "",
        birthDate: "",
        isActive: true,
        isPublic: false,
        imageUrl: "",
        documentUrl: "",
      });
      setCurrentImage(null);
      setCurrentDocument(null);
    }

    // Reset file inputs and previews
    setSelectedImageFile(null);
    setSelectedDocumentFile(null);
    setImagePreview(null);
    setDocumentPreview(null);
    setErrors({});
  }, [editingData]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (documentPreview) {
        URL.revokeObjectURL(documentPreview);
      }
    };
  }, [imagePreview, documentPreview]);

  // Cleanup file inputs when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImageFile(null);
      setSelectedDocumentFile(null);
      setImagePreview(null);
      setDocumentPreview(null);
      setErrors({});
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (
    field: keyof ModalData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle file upload for images
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  // Handle file upload for documents
  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          document: "Please select a valid document (PDF, DOC, DOCX)",
        }));
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          document: "File size must be less than 10MB",
        }));
        return;
      }

      setSelectedDocumentFile(file);
      setErrors((prev) => ({ ...prev, document: "" }));
    }
  };

  // Upload functions using Supabase storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `image_${timestamp}.${fileExtension}`;

      // Upload to Supabase storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      devError("Image upload error:", error);
      throw new Error("Failed to upload image. Please try again.");
    }
  };

  const uploadDocument = async (file: File): Promise<string> => {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `document_${timestamp}.${fileExtension}`;

      // Upload to Supabase storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const response = await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload document");
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      devError("Document upload error:", error);
      throw new Error("Failed to upload document. Please try again.");
    }
  };

  // Scroll to first error
  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        (element as HTMLElement).focus();
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
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
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Phone validation (if provided)
    if (
      formData.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);

    // Scroll to first error if validation fails
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => scrollToFirstError(newErrors), 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      let imageUrl = formData.imageUrl;
      let documentUrl = formData.documentUrl;

      // Upload new image if selected
      if (selectedImageFile) {
        imageUrl = await uploadImage(selectedImageFile);
      } else if (editingData && currentImage) {
        imageUrl = currentImage;
      }

      // Upload new document if selected
      if (selectedDocumentFile) {
        documentUrl = await uploadDocument(selectedDocumentFile);
      } else if (editingData && currentDocument) {
        documentUrl = currentDocument;
      }

      const submitData: ModalData = {
        ...formData,
        imageUrl,
        documentUrl,
      };

      onSubmit(submitData);
    } catch (error) {
      devError("Error uploading files:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Failed to upload files. Please try again.",
      }));
    } finally {
      setUploading(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!editingData || !onDelete) return;

    setDeleting(true);
    try {
      await onDelete(editingData);
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
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bebas uppercase text-gray-900">
            {editingData ? `Edit ${title}` : `Add ${title}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
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
          {/* General Error Display */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
            </div>

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
                <p className="text-red-500 text-sm mt-1 font-medium">
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
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
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
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a role</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select a department</option>
                {departmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Important Dates
              </h3>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {errors.endDate}
                </p>
              )}
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Description Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Additional Information
              </h3>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter bio or description"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter additional details"
              />
            </div>

            {/* File Upload Section */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                File Uploads
              </h3>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>

              {/* Image Preview */}
              {(imagePreview || currentImage) && (
                <div className="mb-4">
                  <img
                    src={imagePreview || currentImage}
                    alt={imagePreview ? "New image" : "Current image"}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  {currentImage && !imagePreview && (
                    <p className="text-sm text-gray-500 mt-2">Current image</p>
                  )}
                  {imagePreview && (
                    <p className="text-sm text-blue-600 mt-2">
                      New image selected
                    </p>
                  )}
                </div>
              )}

              {/* Image File Upload */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="image-upload"
                  />
                  <div
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => {
                      const fileInput = document.getElementById(
                        "image-upload"
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
                          Click to upload image
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1 font-medium">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>

            {/* Document Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Upload
              </label>

              {/* Document Preview */}
              {selectedDocumentFile && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Selected: {selectedDocumentFile.name}
                  </p>
                </div>
              )}

              {/* Document File Upload */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="document-upload"
                  />
                  <div
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={() => {
                      const fileInput = document.getElementById(
                        "document-upload"
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
                          Click to upload document
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
                {errors.document && (
                  <p className="text-red-500 text-sm mt-1 font-medium">
                    {errors.document}
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Settings
              </h3>
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active Status
                </span>
              </label>
            </div>

            {/* Public Status */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    handleInputChange("isPublic", e.target.checked)
                  }
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Public Visibility
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* Mobile Layout - Stacked buttons */}
            <div className="flex flex-col space-y-3 md:hidden">
              {/* Delete Button - Only show when editing */}
              {editingData && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-3 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete {title}
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
                    : editingData
                    ? `Update ${title}`
                    : `Add ${title}`}
                </button>
              </div>
            </div>

            {/* Desktop Layout - Horizontal buttons */}
            <div className="hidden md:flex justify-between">
              {/* Delete Button - Only show when editing */}
              {editingData && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete {title}
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
                    : editingData
                    ? `Update ${title}`
                    : `Add ${title}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {deleteTitle}
              </h3>
              <p className="text-gray-600 mb-6">{deleteMessage}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
