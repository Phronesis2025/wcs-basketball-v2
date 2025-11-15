// src/components/registration/hooks/useRegistrationWizard.ts
import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  parentBasicsSchema,
  playerInfoSchema,
  reviewConsentSchema,
  type ParentBasicsFormData,
  type PlayerInfoFormData,
  type ReviewConsentFormData,
} from "@/lib/schemas/registrationSchema";
import { devError } from "@/lib/security";
import * as Sentry from "@sentry/nextjs";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3;
type FormData = ParentBasicsFormData &
  PlayerInfoFormData &
  ReviewConsentFormData;

const STORAGE_KEY = "wcs_registration_draft";

interface UseRegistrationWizardProps {
  skipParentStep: boolean;
  prefillData: Partial<FormData>;
  user?: any;
  isAuthenticated: boolean;
}

export const useRegistrationWizard = ({
  skipParentStep,
  prefillData,
  user,
  isAuthenticated,
}: UseRegistrationWizardProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(skipParentStep ? 2 : 1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Initialize form with schema for current step
  const getSchemaForStep = (step: Step) => {
    switch (step) {
      case 1:
        return parentBasicsSchema;
      case 2:
        return playerInfoSchema;
      case 3:
        return reviewConsentSchema;
      default:
        return z.object({});
    }
  };

  const methods = useForm<FormData>({
    resolver: zodResolver(getSchemaForStep(currentStep)) as any,
    mode: "onChange",
    defaultValues: {
      parent_first_name:
        prefillData.parent_first_name ||
        user?.user_metadata?.full_name?.split(" ")[0] ||
        user?.user_metadata?.name?.split(" ")[0] ||
        "",
      parent_last_name:
        prefillData.parent_last_name ||
        user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
        user?.user_metadata?.name?.split(" ").slice(1).join(" ") ||
        "",
      parent_email: prefillData.parent_email || user?.email || "",
      parent_phone: prefillData.parent_phone || "",
      parent_zip: prefillData.parent_zip || "",
      player_first_name: prefillData.player_first_name || "",
      player_last_name: prefillData.player_last_name || "",
      player_birthdate: prefillData.player_birthdate || "",
      player_grade: prefillData.player_grade || "",
      player_gender:
        (prefillData.player_gender as "Male" | "Female" | "Other") || "Male",
      player_experience: prefillData.player_experience || "1",
      coppa_consent: false,
      waiver_signed: false,
    },
  });

  const {
    watch,
    trigger,
    setValue,
    clearErrors,
  } = methods;

  // Pre-fill email and name when user is authenticated (from Google OAuth or existing session)
  useEffect(() => {
    if (
      isAuthenticated &&
      user?.email &&
      currentStep === 1 &&
      !skipParentStep
    ) {
      // Pre-fill email from authenticated user
      setValue("parent_email", user.email);

      // Pre-fill name if available from Google OAuth metadata
      if (user.user_metadata?.full_name) {
        const nameParts = user.user_metadata.full_name.split(" ");
        setValue("parent_first_name", nameParts[0] || "");
        setValue("parent_last_name", nameParts.slice(1).join(" ") || "");
      } else if (user.user_metadata?.name) {
        const nameParts = user.user_metadata.name.split(" ");
        setValue("parent_first_name", nameParts[0] || "");
        setValue("parent_last_name", nameParts.slice(1).join(" ") || "");
      }
    }
  }, [isAuthenticated, user, currentStep, skipParentStep, setValue]);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft && !Object.keys(prefillData).length) {
        const parsed = JSON.parse(draft);
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof FormData, parsed[key]);
        });
      }
    } catch (err) {
      devError("RegistrationWizard: Failed to load draft", err);
    }
  }, [setValue, prefillData]);

  // Save draft to localStorage on change
  useEffect(() => {
    const subscription = watch((data) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        devError("RegistrationWizard: Failed to save draft", err);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Track form started
  useEffect(() => {
    Sentry.captureEvent({
      message: "Form Started",
      level: "info",
      tags: { flow: "registration" },
    });
  }, []);

  const handleNext = async () => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Please fix the errors before continuing");
      return;
    }

    Sentry.captureEvent({
      message: "Form Step Completed",
      level: "info",
      tags: { flow: "registration", step: currentStep },
    });

    // Mark current step as completed
    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
      // Re-validate with new schema
      clearErrors();
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      clearErrors();
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return {
    methods,
    currentStep,
    completedSteps,
    handleNext,
    handleBack,
  };
};

