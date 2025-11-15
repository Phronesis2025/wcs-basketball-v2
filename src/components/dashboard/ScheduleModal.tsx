// src/components/dashboard/ScheduleModal.tsx
import React, { useEffect } from "react";
import { Schedule, TeamUpdate, PracticeDrill } from "../../types/supabase";
import { devError } from "../../lib/security";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useScheduleModal } from "./schedule-modal/hooks/useScheduleModal";
import RecurringScheduleConfig from "./schedule-modal/RecurringScheduleConfig";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  onProfanityError: (errors: string[]) => void;
  type: "Game" | "Practice" | "Update" | "Drill";
  editingData?: Schedule | TeamUpdate | PracticeDrill | null;
  loading?: boolean;
  selectedTeamId?: string;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  onProfanityError,
  type,
  editingData,
  loading = false,
  selectedTeamId,
}: ScheduleModalProps) {
  // Lock scroll when modal is open
  useScrollLock(isOpen);

  // Use the custom hook for all form state and logic
  const formState = useScheduleModal({
    type,
    editingData,
    selectedTeamId,
    onProfanityError,
  });

  // Cleanup file inputs when modal closes
  useEffect(() => {
    if (!isOpen) {
      formState.resetForms();
    }
  }, [isOpen, formState]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (formState.updateImagePreview) {
        URL.revokeObjectURL(formState.updateImagePreview);
      }
      if (formState.drillImagePreview) {
        URL.revokeObjectURL(formState.drillImagePreview);
      }
    };
  }, [formState.updateImagePreview, formState.drillImagePreview]);

  // Form population and validation are handled by the hook

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = formState.handleSubmit(e);
    if (formData) {
      try {
        onSubmit(formData);
      } catch (error) {
        devError("Error submitting form:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-1 sm:mx-0">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bebas uppercase text-gray-900">
            Schedule New
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 border-b border-gray-200">
          {(["Game", "Practice", "Update", "Drill"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => formState.setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-inter transition-colors ${
                formState.activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bebas uppercase text-gray-900">
              {formState.activeTab}
            </h3>
          </div>

          {/* Game Form */}
          {formState.activeTab === "Game" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={formState.gameType}
                  onChange={(e) =>
                    formState.setGameType(e.target.value as "game" | "tournament")
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="game">Single Game</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  {formState.gameType === "tournament"
                    ? "Start Date & Time"
                    : "Date & Time"}
                </label>
                <div className="w-full">
                  <input
                    type="datetime-local"
                    value={formState.gameDateTime}
                    onChange={(e) => formState.setGameDateTime(e.target.value)}
                    placeholder="mm/dd/yyyy --:-- --"
                    className="block w-full max-w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none overflow-hidden"
                    style={{ width: "100%", maxWidth: "100%" }}
                    required
                  />
                </div>
              </div>
              {formState.gameType === "tournament" && (
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    End Date & Time
                  </label>
                  <div className="w-full">
                    <input
                      type="datetime-local"
                      value={formState.gameEndDateTime}
                      onChange={(e) => formState.setGameEndDateTime(e.target.value)}
                      placeholder="mm/dd/yyyy --:-- --"
                      className={`block w-full max-w-full p-3 border rounded-md focus:outline-none focus:ring-2 text-gray-900 appearance-none overflow-hidden ${
                        formState.dateValidationError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      style={{ width: "100%", maxWidth: "100%" }}
                      required
                    />
                    {formState.dateValidationError && (
                      <p className="text-red-500 text-sm mt-1 font-medium">
                        {formState.dateValidationError}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Opponent
                </label>
                <input
                  type="text"
                  value={formState.gameOpponent}
                  onChange={(e) => formState.setGameOpponent(e.target.value)}
                  placeholder="eg. Central 7th grade"
                  className="w-full max-w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  style={{ width: "100%", maxWidth: "100%" }}
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formState.gameLocation}
                  onChange={(e) => formState.setGameLocation(e.target.value)}
                  placeholder="eg. Salina South Gym"
                  className="w-full max-w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  style={{ width: "100%", maxWidth: "100%" }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Comments (optional)
                </label>
                <textarea
                  value={formState.gameComments}
                  onChange={(e) => formState.setGameComments(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Practice Form */}
          {formState.activeTab === "Practice" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formState.practiceTitle}
                  onChange={(e) => formState.setPracticeTitle(e.target.value)}
                  placeholder="eg. Shooting Drills"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <div className="w-full">
                  <input
                    type="datetime-local"
                    value={formState.practiceDateTime}
                    onChange={(e) => formState.setPracticeDateTime(e.target.value)}
                    placeholder="mm/dd/yyyy --:-- --"
                    className="block w-full max-w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none overflow-hidden"
                    style={{ width: "100%", maxWidth: "100%" }}
                    required
                  />
                </div>
              </div>

              {/* Recurring Options */}
              <RecurringScheduleConfig
                isRecurring={formState.isRecurring}
                onRecurringChange={formState.setIsRecurring}
                recurringType={formState.recurringType}
                onRecurringTypeChange={formState.setRecurringType}
                recurringCount={formState.recurringCount}
                onRecurringCountChange={formState.setRecurringCount}
                recurringEndDate={formState.recurringEndDate}
                onRecurringEndDateChange={formState.setRecurringEndDate}
                selectedDays={formState.selectedDays}
                onToggleDay={formState.toggleDay}
              />

              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formState.practiceDuration}
                  onChange={(e) => formState.setPracticeDuration(e.target.value)}
                  placeholder="eg. 90 min"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formState.practiceLocation}
                  onChange={(e) => formState.setPracticeLocation(e.target.value)}
                  placeholder="eg. Salina South Gym"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Comments (optional)
                </label>
                <textarea
                  value={formState.practiceComments}
                  onChange={(e) => formState.setPracticeComments(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Update Form */}
          {formState.activeTab === "Update" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formState.updateTitle}
                  onChange={(e) => formState.setUpdateTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Date & Time (optional)
                </label>
                <div className="w-full">
                  <input
                    type="datetime-local"
                    value={formState.updateDateTime}
                    onChange={(e) => formState.setUpdateDateTime(e.target.value)}
                    placeholder="mm/dd/yyyy --:-- --"
                    className="block w-full max-w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none overflow-hidden"
                    style={{ width: "100%", maxWidth: "100%" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add a date/time to include this update on the schedule
                  calendar
                </p>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={formState.updateContent}
                  onChange={(e) => formState.setUpdateContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Image (optional)
                </label>

                {/* Image Preview */}
                {formState.updateImagePreview && (
                  <div className="mb-4">
                    <img
                      src={formState.updateImagePreview}
                      alt="New update image"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <p className="text-sm text-blue-600 mt-2">
                      New image selected
                    </p>
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={formState.handleUpdateImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="update-image-upload"
                    />
                    <div
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => {
                        const fileInput = document.getElementById(
                          "update-image-upload"
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
                    </div>
                  </div>
                  {formState.updateImageError && (
                    <p className="text-[red] text-sm mt-1 font-medium">
                      {formState.updateImageError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is-important"
                  checked={formState.isImportant}
                  onChange={(e) => formState.setIsImportant(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="is-important"
                  className="text-sm font-inter font-medium text-gray-700"
                >
                  Mark as Important
                </label>
              </div>
            </div>
          )}

          {/* Drill Form */}
          {formState.activeTab === "Drill" && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Drill Title *
                </label>
                <input
                  type="text"
                  value={formState.drillTitle}
                  onChange={(e) => formState.setDrillTitle(e.target.value)}
                  placeholder="e.g., Lightning Pass Relay"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  YouTube URL (optional)
                </label>
                <input
                  type="url"
                  value={formState.drillYoutubeUrl}
                  onChange={(e) => formState.setDrillYoutubeUrl(e.target.value)}
                  placeholder="e.g., https://www.youtube.com/watch?v=VIDEO_ID"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  If provided, the YouTube thumbnail will be used instead of the uploaded image
                </p>
              </div>

              {/* Skills and Equipment Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Skills Developed *
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formState.newSkill}
                        onChange={(e) => formState.setNewSkill(e.target.value)}
                        placeholder="e.g., Passing"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), formState.addSkill())
                        }
                      />
                      <button
                        type="button"
                        onClick={formState.addSkill}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formState.drillSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => formState.removeSkill(skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Equipment Needed *
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formState.newEquipment}
                        onChange={(e) => formState.setNewEquipment(e.target.value)}
                        placeholder="e.g., cones"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), formState.addEquipment())
                        }
                      />
                      <button
                        type="button"
                        onClick={formState.addEquipment}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formState.drillEquipment.map((equipment, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {equipment}
                          <button
                            type="button"
                            onClick={() => formState.removeEquipment(equipment)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time, Difficulty, Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formState.drillTime}
                    onChange={(e) => formState.setDrillTime(e.target.value)}
                    placeholder="e.g., 10 minutes"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formState.drillDifficulty}
                    onChange={(e) =>
                      formState.setDrillDifficulty(
                        e.target.value as
                          | "Basic"
                          | "Intermediate"
                          | "Advanced"
                          | "Expert"
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formState.drillCategory}
                    onChange={(e) =>
                      formState.setDrillCategory(
                        e.target.value as
                          | "Drill"
                          | "Warm-up"
                          | "Conditioning"
                          | "Skill Development"
                          | "Team Building"
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="Drill">Drill</option>
                    <option value="Warm-up">Warm-up</option>
                    <option value="Conditioning">Conditioning</option>
                    <option value="Skill Development">Skill Development</option>
                    <option value="Team Building">Team Building</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Instructions *
                </label>
                <textarea
                  value={formState.drillInstructions}
                  onChange={(e) => formState.setDrillInstructions(e.target.value)}
                  placeholder="Detailed step-by-step instructions for the drill..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={6}
                  required
                />
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formState.drillAdditionalInfo}
                  onChange={(e) => formState.setDrillAdditionalInfo(e.target.value)}
                  placeholder="Tips, variations, age-specific modifications, etc..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={4}
                />
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Benefits *
                </label>
                <textarea
                  value={formState.drillBenefits}
                  onChange={(e) => formState.setDrillBenefits(e.target.value)}
                  placeholder="What skills and abilities does this drill develop?"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Drill Image
                </label>

                {/* Image Preview */}
                {formState.drillImagePreview && (
                  <div className="mb-4">
                    <img
                      src={formState.drillImagePreview}
                      alt="New drill image"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <p className="text-sm text-blue-600 mt-2">
                      New image selected
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
                        onChange={formState.handleDrillImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="drill-image-upload"
                        key={`drill-upload-${
                          editingData?.id || "new"
                        }-${Date.now()}`}
                      />
                    )}
                    <label
                      htmlFor="drill-image-upload"
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const fileInput = document.getElementById(
                          "drill-image-upload"
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
                  {formState.drillImageError && (
                    <p className="text-[red] text-sm mt-1 font-medium">
                      {formState.drillImageError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md font-inter hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Saving..."
                : formState.activeTab === "Drill"
                ? "Post Drill"
                : formState.activeTab === "Game"
                ? `Schedule ${
                    formState.gameType === "tournament" ? "Tournament" : "Game"
                  }`
                : `Schedule ${formState.activeTab}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
