// src/components/dashboard/ScheduleModal.tsx
import React, { useState, useEffect } from "react";
import { Schedule, TeamUpdate, PracticeDrill } from "../../types/supabase";
import { validateInput } from "../../lib/security";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  onProfanityError: (errors: string[]) => void;
  type: "Game" | "Practice" | "Update" | "Drill";
  editingData?: Schedule | TeamUpdate | PracticeDrill | null;
  loading?: boolean;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  onProfanityError,
  type,
  editingData,
  loading = false,
}: ScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<
    "Game" | "Practice" | "Update" | "Drill"
  >("Game");

  // Game form fields
  const [gameDateTime, setGameDateTime] = useState("");
  const [gameOpponent, setGameOpponent] = useState("");
  const [gameLocation, setGameLocation] = useState("");
  const [gameComments, setGameComments] = useState("");

  // Practice form fields
  const [practiceTitle, setPracticeTitle] = useState("");
  const [practiceDateTime, setPracticeDateTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<"count" | "date">("count");
  const [recurringCount, setRecurringCount] = useState(4);
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [practiceDuration, setPracticeDuration] = useState("");
  const [practiceLocation, setPracticeLocation] = useState("");
  const [practiceComments, setPracticeComments] = useState("");

  // Update form fields
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateImage, setUpdateImage] = useState<File | null>(null);
  const [isImportant, setIsImportant] = useState(false);

  // Drill form fields
  const [drillTitle, setDrillTitle] = useState("");
  const [drillSkills, setDrillSkills] = useState<string[]>([]);
  const [drillEquipment, setDrillEquipment] = useState<string[]>([]);
  const [drillTime, setDrillTime] = useState("");
  const [drillInstructions, setDrillInstructions] = useState("");
  const [drillAdditionalInfo, setDrillAdditionalInfo] = useState("");
  const [drillBenefits, setDrillBenefits] = useState("");
  const [drillDifficulty, setDrillDifficulty] = useState<
    "Basic" | "Intermediate" | "Advanced" | "Expert"
  >("Basic");
  const [drillCategory, setDrillCategory] = useState<
    "Drill" | "Warm-up" | "Conditioning" | "Skill Development" | "Team Building"
  >("Drill");
  const [drillImage, setDrillImage] = useState<File | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newEquipment, setNewEquipment] = useState("");

  // Predefined options (commented out for future use)
  // const skillOptions = [
  //   "Passing",
  //   "Defensive stance & footwork",
  //   "Shooting",
  //   "Rebounding",
  //   "Dribbling",
  // ];

  // const equipmentOptions = ["None", "Cones", "Markers", "Chairs"];

  const days = [
    { letter: "S", name: "Sunday" },
    { letter: "M", name: "Monday" },
    { letter: "T", name: "Tuesday" },
    { letter: "W", name: "Wednesday" },
    { letter: "T", name: "Thursday" },
    { letter: "F", name: "Friday" },
    { letter: "S", name: "Saturday" },
  ];

  useEffect(() => {
    if (isOpen) {
      setActiveTab(type);
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (editingData && isOpen) {
      // Populate form fields based on editing data
      if ("event_type" in editingData) {
        // Schedule data
        setGameDateTime(editingData.date_time);
        setGameOpponent(editingData.opponent || "");
        setGameLocation(editingData.location);
        setGameComments(editingData.description || "");
        setPracticeTitle(editingData.description || "");
        setPracticeDateTime(editingData.date_time);
        setPracticeLocation(editingData.location);
        setPracticeComments(editingData.description || "");
      } else if ("content" in editingData) {
        // Update data
        setUpdateTitle(editingData.title);
        setUpdateContent(editingData.content);
      } else if ("skills" in editingData) {
        // Practice drill data
        setDrillTitle(editingData.title);
        setDrillSkills(editingData.skills || []);
        setDrillEquipment(editingData.equipment || []);
        setDrillTime(editingData.time);
        setDrillInstructions(editingData.instructions);
        setDrillAdditionalInfo(editingData.additional_info || "");
        setDrillBenefits(editingData.benefits);
        setDrillDifficulty(
          editingData.difficulty as
            | "Basic"
            | "Intermediate"
            | "Advanced"
            | "Expert"
        );
        setDrillCategory(
          editingData.category as
            | "Drill"
            | "Warm-up"
            | "Conditioning"
            | "Skill Development"
            | "Team Building"
        );
      }
    } else {
      // Reset form when opening for new item
      resetForms();
    }
  }, [editingData, isOpen, type]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Prevent scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scrolling
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const resetForms = () => {
    setGameDateTime("");
    setGameOpponent("");
    setGameLocation("");
    setGameComments("");
    setPracticeTitle("");
    setPracticeDateTime("");
    setIsRecurring(false);
    setRecurringType("count");
    setRecurringCount(4);
    setRecurringEndDate("");
    setSelectedDays([]);
    setPracticeDuration("");
    setPracticeLocation("");
    setPracticeComments("");
    setUpdateTitle("");
    setUpdateContent("");
    setUpdateImage(null);
    setIsImportant(false);
    setDrillTitle("");
    setDrillSkills([]);
    setDrillEquipment([]);
    setNewSkill("");
    setNewEquipment("");
    setDrillTime("");
    setDrillInstructions("");
    setDrillAdditionalInfo("");
    setDrillBenefits("");
    setDrillDifficulty("Basic");
    setDrillCategory("Drill");
    setDrillImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all text inputs for profanity
    const validationErrors: string[] = [];

    // Validate based on active tab
    if (activeTab === "Game") {
      const opponentValidation = validateInput(gameOpponent, "opponent");
      const locationValidation = validateInput(gameLocation, "location");
      const commentsValidation = validateInput(gameComments, "comments");

      if (!opponentValidation.isValid)
        validationErrors.push(...opponentValidation.errors);
      if (!locationValidation.isValid)
        validationErrors.push(...locationValidation.errors);
      if (!commentsValidation.isValid)
        validationErrors.push(...commentsValidation.errors);
    } else if (activeTab === "Practice") {
      const titleValidation = validateInput(practiceTitle, "practice title");
      const durationValidation = validateInput(practiceDuration, "duration");
      const locationValidation = validateInput(practiceLocation, "location");
      const commentsValidation = validateInput(practiceComments, "comments");

      if (!titleValidation.isValid)
        validationErrors.push(...titleValidation.errors);
      if (!durationValidation.isValid)
        validationErrors.push(...durationValidation.errors);
      if (!locationValidation.isValid)
        validationErrors.push(...locationValidation.errors);
      if (!commentsValidation.isValid)
        validationErrors.push(...commentsValidation.errors);
    } else if (activeTab === "Update") {
      const titleValidation = validateInput(updateTitle, "update title");
      const contentValidation = validateInput(updateContent, "update content");

      if (!titleValidation.isValid)
        validationErrors.push(...titleValidation.errors);
      if (!contentValidation.isValid)
        validationErrors.push(...contentValidation.errors);
    } else if (activeTab === "Drill") {
      const titleValidation = validateInput(drillTitle, "drill title");
      const instructionsValidation = validateInput(
        drillInstructions,
        "instructions"
      );
      const additionalInfoValidation = validateInput(
        drillAdditionalInfo,
        "additional info"
      );
      const benefitsValidation = validateInput(drillBenefits, "benefits");

      if (!titleValidation.isValid)
        validationErrors.push(...titleValidation.errors);
      if (!instructionsValidation.isValid)
        validationErrors.push(...instructionsValidation.errors);
      if (!additionalInfoValidation.isValid)
        validationErrors.push(...additionalInfoValidation.errors);
      if (!benefitsValidation.isValid)
        validationErrors.push(...benefitsValidation.errors);
    }

    // If there are validation errors, show them and prevent submission
    if (validationErrors.length > 0) {
      onProfanityError(validationErrors);
      return;
    }

    let formData: Record<string, unknown> = {};

    switch (activeTab) {
      case "Game":
        formData = {
          formType: "Game",
          event_type: "Game",
          date_time: gameDateTime,
          opponent: gameOpponent,
          location: gameLocation,
          description: gameComments,
        };
        break;
      case "Practice":
        formData = {
          formType: "Practice",
          event_type: "Practice",
          title: practiceTitle,
          date_time: practiceDateTime,
          location: practiceLocation,
          description: practiceComments,
          duration: practiceDuration,
          isRecurring,
          recurringType,
          recurringCount,
          recurringEndDate,
          selectedDays,
        };
        break;
      case "Update":
        formData = {
          formType: "Update",
          title: updateTitle,
          content: updateContent,
          image: updateImage,
          isImportant,
        };
        break;
      case "Drill":
        // Auto-add any typed values that weren't added to arrays
        const finalSkills = [...drillSkills];
        const finalEquipment = [...drillEquipment];

        if (newSkill.trim() && !drillSkills.includes(newSkill.trim())) {
          finalSkills.push(newSkill.trim());
        }
        if (
          newEquipment.trim() &&
          !drillEquipment.includes(newEquipment.trim())
        ) {
          finalEquipment.push(newEquipment.trim());
        }

        formData = {
          formType: "Drill",
          title: drillTitle,
          skills: finalSkills,
          equipment: finalEquipment,
          time: drillTime,
          instructions: drillInstructions,
          additional_info: drillAdditionalInfo,
          benefits: drillBenefits,
          difficulty: drillDifficulty,
          category: drillCategory,
          image: drillImage,
        };
        break;
    }

    onSubmit(formData);
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  // Drill helper functions
  const addSkill = () => {
    if (newSkill.trim() && !drillSkills.includes(newSkill.trim())) {
      setDrillSkills([...drillSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setDrillSkills(drillSkills.filter((s) => s !== skill));
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !drillEquipment.includes(newEquipment.trim())) {
      setDrillEquipment([...drillEquipment, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (equipment: string) => {
    setDrillEquipment(drillEquipment.filter((e) => e !== equipment));
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
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-inter transition-colors ${
                activeTab === tab
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
              {activeTab}
            </h3>
          </div>

          {/* Game Form */}
          {activeTab === "Game" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Date & Time
                </label>
                <div className="w-full">
                  <input
                    type="datetime-local"
                    value={gameDateTime}
                    onChange={(e) => setGameDateTime(e.target.value)}
                    placeholder="mm/dd/yyyy --:-- --"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Opponent
                </label>
                <input
                  type="text"
                  value={gameOpponent}
                  onChange={(e) => setGameOpponent(e.target.value)}
                  placeholder="eg. Central 7th grade"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={gameLocation}
                  onChange={(e) => setGameLocation(e.target.value)}
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
                  value={gameComments}
                  onChange={(e) => setGameComments(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Practice Form */}
          {activeTab === "Practice" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={practiceTitle}
                  onChange={(e) => setPracticeTitle(e.target.value)}
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
                    value={practiceDateTime}
                    onChange={(e) => setPracticeDateTime(e.target.value)}
                    placeholder="mm/dd/yyyy --:-- --"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Recurring Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="is-recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is-recurring"
                    className="text-sm font-inter font-medium text-gray-700"
                  >
                    Reoccurring
                  </label>
                </div>

                {isRecurring && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        Every
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value="1"
                          className="w-16 p-2 border border-gray-300 rounded-md text-center text-gray-900"
                          disabled
                        />
                        <select className="p-2 border border-gray-300 rounded-md text-gray-900">
                          <option value="week">Week(s)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        Repeat on:
                      </label>
                      <div className="flex space-x-2">
                        {days.map((day, index) => (
                          <button
                            key={`${day.name}-${index}`}
                            type="button"
                            onClick={() => toggleDay(index)}
                            className={`w-10 h-10 rounded-full text-xs font-medium transition-colors ${
                              selectedDays.includes(index)
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                            }`}
                            title={day.name}
                          >
                            {day.letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                        Ends
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="end-option"
                            value="count"
                            checked={recurringType === "count"}
                            onChange={() => setRecurringType("count")}
                            className="w-4 h-4 text-blue-600 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">After</span>
                          <input
                            type="number"
                            min="2"
                            max="52"
                            value={recurringCount}
                            onChange={(e) =>
                              setRecurringCount(parseInt(e.target.value) || 4)
                            }
                            className="w-16 p-2 border border-gray-300 rounded-md text-center text-gray-900"
                          />
                          <span className="text-sm text-gray-700">times</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="end-option"
                            value="date"
                            checked={recurringType === "date"}
                            onChange={() => setRecurringType("date")}
                            className="w-4 h-4 text-blue-600 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">On</span>
                          <input
                            type="date"
                            value={recurringEndDate}
                            onChange={(e) =>
                              setRecurringEndDate(e.target.value)
                            }
                            className="p-2 border border-gray-300 rounded-md text-gray-900"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={practiceDuration}
                  onChange={(e) => setPracticeDuration(e.target.value)}
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
                  value={practiceLocation}
                  onChange={(e) => setPracticeLocation(e.target.value)}
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
                  value={practiceComments}
                  onChange={(e) => setPracticeComments(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Update Form */}
          {activeTab === "Update" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUpdateImage(e.target.files?.[0] || null)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is-important"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
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
          {activeTab === "Drill" && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                  Drill Title *
                </label>
                <input
                  type="text"
                  value={drillTitle}
                  onChange={(e) => setDrillTitle(e.target.value)}
                  placeholder="e.g., Lightning Pass Relay"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
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
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g., Passing"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {drillSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
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
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                        placeholder="e.g., cones"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addEquipment())
                        }
                      />
                      <button
                        type="button"
                        onClick={addEquipment}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {drillEquipment.map((equipment, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {equipment}
                          <button
                            type="button"
                            onClick={() => removeEquipment(equipment)}
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
                    value={drillTime}
                    onChange={(e) => setDrillTime(e.target.value)}
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
                    value={drillDifficulty}
                    onChange={(e) =>
                      setDrillDifficulty(
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
                    value={drillCategory}
                    onChange={(e) =>
                      setDrillCategory(
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
                  value={drillInstructions}
                  onChange={(e) => setDrillInstructions(e.target.value)}
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
                  value={drillAdditionalInfo}
                  onChange={(e) => setDrillAdditionalInfo(e.target.value)}
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
                  value={drillBenefits}
                  onChange={(e) => setDrillBenefits(e.target.value)}
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDrillImage(e.target.files?.[0] || null)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                {drillImage && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {drillImage.name}
                  </p>
                )}
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
                : activeTab === "Drill"
                ? "Post Drill"
                : `Schedule ${activeTab}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
