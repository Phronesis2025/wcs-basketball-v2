import { useState, useEffect, useCallback } from "react";
import { Schedule, TeamUpdate, PracticeDrill } from "@/types/supabase";
import { validateInput, devLog, devError } from "@/lib/security";

interface UseScheduleModalProps {
  type: "Game" | "Practice" | "Update" | "Drill";
  editingData?: Schedule | TeamUpdate | PracticeDrill | null;
  selectedTeamId?: string;
  onProfanityError: (errors: string[]) => void;
}

export function useScheduleModal({
  type,
  editingData,
  selectedTeamId,
  onProfanityError,
}: UseScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<
    "Game" | "Practice" | "Update" | "Drill"
  >("Game");

  // Game form fields
  const [gameType, setGameType] = useState<"game" | "tournament">("game");
  const [gameDateTime, setGameDateTime] = useState("");
  const [gameEndDateTime, setGameEndDateTime] = useState("");
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
  const [updateDateTime, setUpdateDateTime] = useState("");
  const [updateImage, setUpdateImage] = useState<File | null>(null);
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(
    null
  );
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
  const [drillImagePreview, setDrillImagePreview] = useState<string | null>(
    null
  );
  const [drillYoutubeUrl, setDrillYoutubeUrl] = useState("");
  const [updateImageError, setUpdateImageError] = useState<string | null>(null);
  const [drillImageError, setDrillImageError] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [dateValidationError, setDateValidationError] = useState<string | null>(
    null
  );

  // Reset all forms
  const resetForms = useCallback(() => {
    setGameType("game");
    setGameDateTime("");
    setGameEndDateTime("");
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
    setUpdateDateTime("");
    setUpdateImage(null);
    setUpdateImagePreview(null);
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
    setDrillImagePreview(null);
    setDrillYoutubeUrl("");
    setUpdateImageError(null);
    setDrillImageError(null);
    setDateValidationError(null);
  }, []);

  // Set active tab when type changes
  useEffect(() => {
    setActiveTab(type);
  }, [type]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (updateImagePreview) {
        URL.revokeObjectURL(updateImagePreview);
      }
      if (drillImagePreview) {
        URL.revokeObjectURL(drillImagePreview);
      }
    };
  }, [updateImagePreview, drillImagePreview]);

  // File change handlers
  const handleUpdateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUpdateImageError("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUpdateImageError("File size must be less than 5MB");
        return;
      }
      setUpdateImage(file);
      setUpdateImageError(null);
      const previewUrl = URL.createObjectURL(file);
      setUpdateImagePreview(previewUrl);
    }
  };

  const handleDrillImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setDrillImageError("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setDrillImageError("File size must be less than 5MB");
        return;
      }
      setDrillImage(file);
      setDrillImageError(null);
      const previewUrl = URL.createObjectURL(file);
      setDrillImagePreview(previewUrl);
    }
  };

  // Populate form from editing data
  useEffect(() => {
    if (editingData) {
      const formatForDateTimeLocal = (isoString: string) => {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
      };

      if ("event_type" in editingData) {
        // Schedule data
        setGameDateTime(formatForDateTimeLocal(editingData.date_time));
        setGameOpponent(editingData.opponent || "");
        setGameLocation(editingData.location || "");
        setGameComments(editingData.description || "");
        setPracticeTitle(editingData.title || editingData.description || "");
        setPracticeDateTime(formatForDateTimeLocal(editingData.date_time));
        setPracticeLocation(editingData.location || "");
        setPracticeComments(editingData.description || "");

        if (editingData.event_type === "Tournament") {
          setGameType("tournament");
          if (editingData.end_date_time) {
            setGameEndDateTime(formatForDateTimeLocal(editingData.end_date_time));
          }
        } else {
          setGameType("game");
        }

        if (
          editingData.event_type === "Practice" &&
          editingData.recurring_group_id
        ) {
          setIsRecurring(true);
          if (
            "recurringPattern" in editingData &&
            editingData.recurringPattern
          ) {
            const pattern = editingData.recurringPattern as {
              selectedDays: number[];
              recurringType: "count" | "date";
              recurringCount: number;
              recurringEndDate?: string;
            };
            setRecurringType(pattern.recurringType);
            setRecurringCount(pattern.recurringCount);
            setSelectedDays(pattern.selectedDays);
            if (pattern.recurringEndDate) {
              const date = new Date(pattern.recurringEndDate);
              setRecurringEndDate(date.toISOString().slice(0, 10));
            }
          } else {
            setRecurringType("date");
            setRecurringCount(4);
            const eventDate = new Date(editingData.date_time);
            const dayOfWeek = eventDate.getDay();
            setSelectedDays([dayOfWeek]);
          }
        } else {
          setIsRecurring(false);
        }
      } else if ("content" in editingData) {
        // Update data
        setUpdateTitle(editingData.title || "");
        setUpdateContent(editingData.content || "");
        if (editingData.date_time) {
          setUpdateDateTime(formatForDateTimeLocal(editingData.date_time));
        }
        setUpdateImage(null);
      } else if ("skills" in editingData) {
        // Practice drill data
        setDrillTitle(editingData.title || "");
        setDrillSkills(editingData.skills || []);
        setDrillEquipment(editingData.equipment || []);
        setDrillTime(editingData.time || "");
        setDrillInstructions(editingData.instructions || "");
        setDrillAdditionalInfo(editingData.additional_info || "");
        setDrillBenefits(editingData.benefits || "");
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
        setDrillYoutubeUrl(editingData.youtube_url || "");
      }
    } else {
      resetForms();
    }
  }, [editingData, resetForms]);

  // Real-time validation for tournament dates
  useEffect(() => {
    if (gameType === "tournament" && gameDateTime && gameEndDateTime) {
      const startDate = new Date(gameDateTime);
      const endDate = new Date(gameEndDateTime);

      if (endDate <= startDate) {
        setDateValidationError("End date must be after start date");
      } else {
        setDateValidationError(null);
      }
    } else {
      setDateValidationError(null);
    }
  }, [gameType, gameDateTime, gameEndDateTime]);

  // Helper to get datetime value from DOM (workaround for datetime-local issues)
  const getDateTimeValue = (stateValue: string, inputSelector: string) => {
    if (stateValue) return stateValue;
    const input = document.querySelector(inputSelector) as HTMLInputElement;
    return input?.value || "";
  };

  // Form submission handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const actualGameDateTime = getDateTimeValue(
        gameDateTime,
        'input[type="datetime-local"][placeholder*="mm/dd/yyyy"]'
      );
      const actualGameEndDateTime = getDateTimeValue(
        gameEndDateTime,
        'input[type="datetime-local"][placeholder*="mm/dd/yyyy"]'
      );
      const actualPracticeDateTime = getDateTimeValue(
        practiceDateTime,
        'input[type="datetime-local"][placeholder*="mm/dd/yyyy"]'
      );
      const actualUpdateDateTime = getDateTimeValue(
        updateDateTime,
        'input[type="datetime-local"][placeholder*="mm/dd/yyyy"]'
      );

      const fallbackDateTime = () => {
        const inputs = document.querySelectorAll('input[type="datetime-local"]');
        for (const input of inputs) {
          if (input.value && input.value.trim() !== "") {
            devLog("Found datetime input with value:", input.value);
            return input.value;
          }
        }
        devLog("No datetime input found with value");
        return "";
      };

      const finalPracticeDateTime = actualPracticeDateTime || fallbackDateTime();
      const finalGameDateTime = actualGameDateTime || fallbackDateTime();
      const finalUpdateDateTime = actualUpdateDateTime || fallbackDateTime();

      // Validate all text inputs for profanity
      const validationErrors: string[] = [];

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

        if (gameType === "tournament") {
          if (!gameEndDateTime) {
            validationErrors.push("Tournament end date and time is required");
          } else {
            const startDate = new Date(finalGameDateTime);
            const endDate = new Date(actualGameEndDateTime || gameEndDateTime);

            if (endDate <= startDate) {
              validationErrors.push(
                "Tournament end date must be after the start date"
              );
            }
          }
        }
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

        if (drillYoutubeUrl.trim()) {
          const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
          if (!youtubeUrlPattern.test(drillYoutubeUrl.trim())) {
            validationErrors.push("Please enter a valid YouTube URL");
          }
        }
      }

      if (validationErrors.length > 0) {
        onProfanityError(validationErrors);
        return null;
      }

      let formData: Record<string, unknown> = {};

      switch (activeTab) {
        case "Game":
          formData = {
            event_type: gameType === "tournament" ? "Tournament" : "Game",
            team_id: selectedTeamId,
            date_time: finalGameDateTime,
            opponent: gameOpponent,
            location: gameLocation,
            description: gameComments,
            gameDateTime: finalGameDateTime,
            gameEndDateTime: actualGameEndDateTime || gameEndDateTime,
            gameLocation: gameLocation,
            gameOpponent: gameOpponent,
            gameComments: gameComments,
            gameType: gameType,
          };
          break;
        case "Practice":
          formData = {
            event_type: "Practice",
            team_id: selectedTeamId,
            title: practiceTitle,
            date_time: finalPracticeDateTime,
            location: practiceLocation,
            description: practiceComments,
            duration: practiceDuration,
            isRecurring,
            recurringType,
            recurringCount,
            recurringEndDate,
            selectedDays,
            practiceDateTime: finalPracticeDateTime,
            practiceTitle: practiceTitle,
            practiceLocation: practiceLocation,
            practiceComments: practiceComments,
            practiceDuration: practiceDuration,
          };
          break;
        case "Update":
          formData = {
            formType: "Update",
            title: updateTitle,
            content: updateContent,
            date_time: finalUpdateDateTime || null,
            image: updateImage,
            isImportant,
            saveToSchedules: !!finalUpdateDateTime,
          };
          break;
        case "Drill":
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
            youtube_url: drillYoutubeUrl.trim() || undefined,
          };
          break;
      }

      return formData;
    },
    [
      activeTab,
      gameType,
      gameDateTime,
      gameEndDateTime,
      gameOpponent,
      gameLocation,
      gameComments,
      practiceTitle,
      practiceDateTime,
      practiceLocation,
      practiceComments,
      practiceDuration,
      isRecurring,
      recurringType,
      recurringCount,
      recurringEndDate,
      selectedDays,
      updateTitle,
      updateContent,
      updateDateTime,
      updateImage,
      isImportant,
      drillTitle,
      drillSkills,
      drillEquipment,
      newSkill,
      newEquipment,
      drillTime,
      drillInstructions,
      drillAdditionalInfo,
      drillBenefits,
      drillDifficulty,
      drillCategory,
      drillImage,
      drillYoutubeUrl,
      selectedTeamId,
      onProfanityError,
    ]
  );

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

  // Recurring schedule helpers
  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  return {
    // State
    activeTab,
    setActiveTab,
    // Game state
    gameType,
    setGameType,
    gameDateTime,
    setGameDateTime,
    gameEndDateTime,
    setGameEndDateTime,
    gameOpponent,
    setGameOpponent,
    gameLocation,
    setGameLocation,
    gameComments,
    setGameComments,
    // Practice state
    practiceTitle,
    setPracticeTitle,
    practiceDateTime,
    setPracticeDateTime,
    isRecurring,
    setIsRecurring,
    recurringType,
    setRecurringType,
    recurringCount,
    setRecurringCount,
    recurringEndDate,
    setRecurringEndDate,
    selectedDays,
    practiceDuration,
    setPracticeDuration,
    practiceLocation,
    setPracticeLocation,
    practiceComments,
    setPracticeComments,
    // Update state
    updateTitle,
    setUpdateTitle,
    updateContent,
    setUpdateContent,
    updateDateTime,
    setUpdateDateTime,
    updateImage,
    updateImagePreview,
    isImportant,
    setIsImportant,
    updateImageError,
    handleUpdateImageChange,
    // Drill state
    drillTitle,
    setDrillTitle,
    drillSkills,
    drillEquipment,
    drillTime,
    setDrillTime,
    drillInstructions,
    setDrillInstructions,
    drillAdditionalInfo,
    setDrillAdditionalInfo,
    drillBenefits,
    setDrillBenefits,
    drillDifficulty,
    setDrillDifficulty,
    drillCategory,
    setDrillCategory,
    drillImage,
    drillImagePreview,
    drillYoutubeUrl,
    setDrillYoutubeUrl,
    drillImageError,
    handleDrillImageChange,
    newSkill,
    setNewSkill,
    newEquipment,
    setNewEquipment,
    addSkill,
    removeSkill,
    addEquipment,
    removeEquipment,
    // Validation
    dateValidationError,
    // Handlers
    handleSubmit,
    toggleDay,
    resetForms,
  };
}

