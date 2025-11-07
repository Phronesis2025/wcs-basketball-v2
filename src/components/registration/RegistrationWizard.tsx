"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  parentBasicsSchema,
  playerInfoSchema,
  reviewConsentSchema,
  type ParentBasicsFormData,
  type PlayerInfoFormData,
  type ReviewConsentFormData,
} from "@/lib/schemas/registrationSchema";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { devLog, devError } from "@/lib/security";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/nextjs";

type Step = 1 | 2 | 3;
type FormData = ParentBasicsFormData & PlayerInfoFormData & ReviewConsentFormData;

interface RegistrationWizardProps {
  skipParentStep?: boolean; // For add-child flow
  prefillData?: Partial<FormData>;
}

const STORAGE_KEY = "wcs_registration_draft";

export default function RegistrationWizard({
  skipParentStep = false,
  prefillData = {},
}: RegistrationWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(skipParentStep ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    resolver: zodResolver(getSchemaForStep(currentStep)),
    mode: "onChange",
    defaultValues: {
      parent_first_name: prefillData.parent_first_name || user?.user_metadata?.full_name?.split(" ")[0] || user?.user_metadata?.name?.split(" ")[0] || "",
      parent_last_name: prefillData.parent_last_name || user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") || user?.user_metadata?.name?.split(" ").slice(1).join(" ") || "",
      parent_email: prefillData.parent_email || user?.email || "",
      parent_phone: prefillData.parent_phone || "",
      player_first_name: prefillData.player_first_name || "",
      player_last_name: prefillData.player_last_name || "",
      player_birthdate: prefillData.player_birthdate || "",
      player_grade: prefillData.player_grade || "",
      player_gender: (prefillData.player_gender as "Male" | "Female" | "Other") || "Male",
      player_experience: prefillData.player_experience || "1",
      coppa_consent: false,
      waiver_signed: false,
    },
  });

  const { handleSubmit, watch, formState: { errors, isValid }, trigger, getValues, setValue } = methods;

  // Pre-fill email and name when user is authenticated (from Google OAuth or existing session)
  // Moved after setValue is destructured from methods
  useEffect(() => {
    if (isAuthenticated && user?.email && currentStep === 1 && !skipParentStep) {
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

  const calculateAge = (birthdate: string): number | null => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getMinDate = (): string => {
    const today = new Date();
    const maxAge = new Date(today.getFullYear() - 8, today.getMonth(), today.getDate());
    return maxAge.toISOString().split("T")[0];
  };

  const getMaxDate = (): string => {
    const today = new Date();
    const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return minAge.toISOString().split("T")[0];
  };

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

    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step);
      // Re-validate with new schema
      methods.clearErrors();
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      methods.clearErrors();
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (loading || submitted) return;

    setLoading(true);
    try {
      Sentry.captureEvent({
        message: "Form Submitted",
        level: "info",
        tags: { flow: "registration" },
      });

      // Get user ID if authenticated
      let parentUserId: string | undefined;
      if (isAuthenticated && user) {
        parentUserId = user.id;
      }

      // Get all form values using getValues() since data parameter only contains current step's validated fields
      // Fallback to localStorage if getValues() doesn't have all fields (which can happen with step-based validation)
      let allFormData = getValues();
      try {
        const draft = localStorage.getItem(STORAGE_KEY);
        if (draft) {
          const draftData = JSON.parse(draft);
          // Merge: use getValues() for current step, localStorage for others
          allFormData = { ...draftData, ...allFormData };
        }
      } catch (err) {
        devError("RegistrationWizard: Failed to load draft for submission", err);
      }

      // For unauthenticated users (new parents), use magic-link flow which sends Supabase confirmation email
      if (!isAuthenticated || !parentUserId) {
        devLog("RegistrationWizard: Unauthenticated user, using magic-link flow");
        
        const payload = {
          parent_first_name: allFormData.parent_first_name,
          parent_last_name: allFormData.parent_last_name,
          parent_email: allFormData.parent_email,
          player_first_name: allFormData.player_first_name,
          player_last_name: allFormData.player_last_name,
          player_gender: allFormData.player_gender,
          player_birthdate: allFormData.player_birthdate,
          player_grade: allFormData.player_grade || undefined,
          player_experience: allFormData.player_experience || "1",
          coppa_consent: allFormData.coppa_consent,
        };
        
        devLog("RegistrationWizard: Magic-link payload", payload);
        
        const response = await fetch("/api/auth/magic-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send confirmation email");
        }

        // Clear draft
        localStorage.removeItem(STORAGE_KEY);

        setSubmitted(true);
        toast.success("Confirmation email sent! Check your email to complete registration.");

        Sentry.captureEvent({
          message: "Registration Complete (Magic Link)",
          level: "info",
          tags: { flow: "registration", type: "guest" },
        });

        // Redirect to registration pending page
        setTimeout(() => {
          router.push(`/registration-pending?player=${encodeURIComponent(allFormData.player_first_name)}`);
        }, 1500);
        return;
      }

      // For authenticated users (existing parents adding another child), use register-player API
      const response = await fetch("/api/register-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_user_id: parentUserId,
          parent_first_name: allFormData.parent_first_name,
          parent_last_name: allFormData.parent_last_name,
          parent_email: allFormData.parent_email,
          parent_phone: allFormData.parent_phone || undefined,
          player: {
            first_name: allFormData.player_first_name,
            last_name: allFormData.player_last_name,
            birthdate: allFormData.player_birthdate,
            grade: allFormData.player_grade || undefined,
            gender: allFormData.player_gender,
          },
          waiver_signed: allFormData.waiver_signed,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);

      setSubmitted(true);
      toast.success("Registration submitted successfully!");

      Sentry.captureEvent({
        message: "Registration Complete",
        level: "info",
        tags: { flow: "registration" },
      });

      // Redirect to profile
      setTimeout(() => {
        router.push("/parent/profile?registered=true");
      }, 1500);
    } catch (error) {
      devError("RegistrationWizard: Submit error", error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
      
      Sentry.captureEvent({
        message: "Form Submission Failed",
        level: "error",
        tags: { flow: "registration" },
      });
    } finally {
      setLoading(false);
    }
  };

  const playerBirthdate = watch("player_birthdate");
  const calculatedAge = calculateAge(playerBirthdate || "");
  
  // Watch checkbox values for submit button state
  const coppaConsent = watch("coppa_consent");
  const waiverSigned = watch("waiver_signed");
  const bothCheckboxesChecked = coppaConsent && waiverSigned;

  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step Indicator */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-8">
            {[1, 2, 3].map((step) => {
              if (skipParentStep && step === 1) return null;
              const stepNum = skipParentStep ? step - 1 : step;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;
              
              return (
                <div
                  key={step}
                  className={`
                    flex items-center gap-2 flex-1
                    ${isActive ? "text-red" : isCompleted ? "text-green-500" : "text-gray-400"}
                  `}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold
                      ${isActive ? "bg-red text-white" : isCompleted ? "bg-green-500 text-white" : "bg-gray-700 text-gray-400"}
                    `}
                  >
                    {isCompleted ? "✓" : step}
                  </div>
                  <span className="text-sm md:text-base">
                    {step === 1 ? "Parent Info" : step === 2 ? "Player Info" : "Review"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step 1: Parent Basics */}
          {currentStep === 1 && !skipParentStep && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bebas text-white mb-6">Parent Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    First Name <span className="text-red">*</span>
                  </label>
                  <input
                    {...methods.register("parent_first_name")}
                    type="text"
                    className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red disabled:opacity-70 min-h-[48px]"
                    placeholder="John"
                    aria-invalid={!!errors.parent_first_name}
                    aria-describedby={errors.parent_first_name ? "parent_first_name_error" : undefined}
                    aria-label="Parent first name"
                    autoComplete="given-name"
                  />
                  {errors.parent_first_name && (
                    <p id="parent_first_name_error" className="text-red text-sm mt-1">
                      {errors.parent_first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Last Name <span className="text-red">*</span>
                  </label>
                  <input
                    {...methods.register("parent_last_name")}
                    type="text"
                    className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red disabled:opacity-70 min-h-[48px]"
                    placeholder="Doe"
                    aria-invalid={!!errors.parent_last_name}
                    aria-label="Parent last name"
                    autoComplete="family-name"
                  />
                  {errors.parent_last_name && (
                    <p className="text-red text-sm mt-1">{errors.parent_last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Email <span className="text-red">*</span>
                  {isAuthenticated && user?.email && (
                    <span className="ml-2 text-xs text-green-400">(from your Google account)</span>
                  )}
                </label>
                <Controller
                  name="parent_email"
                  control={methods.control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                      placeholder={isAuthenticated && user?.email ? user.email : "john.doe@example.com"}
                      readOnly={isAuthenticated && !!user?.email}
                      aria-invalid={!!errors.parent_email}
                      aria-label="Parent email address"
                      autoComplete="email"
                      inputMode="email"
                      value={isAuthenticated && user?.email ? user.email : field.value || ""}
                      onChange={(e) => {
                        if (!(isAuthenticated && user?.email)) {
                          field.onChange(e);
                        }
                      }}
                    />
                  )}
                />
                {errors.parent_email && (
                  <p className="text-red text-sm mt-1">{errors.parent_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Phone (Optional)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2 text-gray-400 cursor-help">ℹ️</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>We'll use this to contact you about your player</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                <input
                  {...methods.register("parent_phone")}
                  type="tel"
                  className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                  placeholder="(555) 123-4567"
                  aria-invalid={!!errors.parent_phone}
                  aria-label="Parent phone number"
                  autoComplete="tel"
                  inputMode="tel"
                />
                {errors.parent_phone && (
                  <p className="text-red text-sm mt-1">{errors.parent_phone.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isValid}
                  className="flex-1 bg-red text-white font-bold py-3 rounded disabled:opacity-50 hover:bg-red/90 transition-colors min-h-[48px]"
                >
                  Next: Player Information
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Player Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bebas text-white mb-6">Player Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    First Name <span className="text-red">*</span>
                  </label>
                  <input
                    {...methods.register("player_first_name")}
                    type="text"
                    className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red"
                    placeholder="Jane"
                    aria-invalid={!!errors.player_first_name}
                  />
                  {errors.player_first_name && (
                    <p className="text-red text-sm mt-1">{errors.player_first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Last Name <span className="text-red">*</span>
                  </label>
                  <input
                    {...methods.register("player_last_name")}
                    type="text"
                    className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red"
                    placeholder="Doe"
                    aria-invalid={!!errors.player_last_name}
                  />
                  {errors.player_last_name && (
                    <p className="text-red text-sm mt-1">{errors.player_last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Date of Birth <span className="text-red">*</span>
                    {calculatedAge !== null && (
                      <span className="ml-2 text-green-500">(Age: {calculatedAge})</span>
                    )}
                  </label>
                  <input
                    {...methods.register("player_birthdate")}
                    type="date"
                    min={getMaxDate()}
                    max={getMinDate()}
                    className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                    aria-invalid={!!errors.player_birthdate}
                    aria-label="Player date of birth"
                    autoComplete="bday"
                  />
                  {errors.player_birthdate && (
                    <p className="text-red text-sm mt-1">{errors.player_birthdate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Gender <span className="text-red">*</span>
                  </label>
                  <select
                    {...methods.register("player_gender")}
                    className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                    aria-invalid={!!errors.player_gender}
                    aria-label="Player gender"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.player_gender && (
                    <p className="text-red text-sm mt-1">{errors.player_gender.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Grade (Optional)
                </label>
                <input
                  {...methods.register("player_grade")}
                  type="text"
                  className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red"
                  placeholder="5th, 6th, etc."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Experience Level <span className="text-red">*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2 text-gray-400 cursor-help">ℹ️</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Helps with team placement. 1 = No Experience, 5 = Competitive League</p>
                    </TooltipContent>
                  </Tooltip>
                </label>
                  <select
                    {...methods.register("player_experience")}
                    className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                    aria-invalid={!!errors.player_experience}
                    aria-label="Player experience level"
                  >
                  <option value="1">1: No Experience</option>
                  <option value="2">2: Some Basics</option>
                  <option value="3">3: Intermediate</option>
                  <option value="4">4: Advanced</option>
                  <option value="5">5: Competitive League</option>
                </select>
                {errors.player_experience && (
                  <p className="text-red text-sm mt-1">{errors.player_experience.message}</p>
                )}
              </div>

              {/* Fee Preview */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Estimated Fees</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Annual:</span>
                    <span className="text-white font-semibold">$360</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quarterly:</span>
                    <span className="text-white font-semibold">$90</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly:</span>
                    <span className="text-white font-semibold">$30</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span className="text-white font-semibold">Contact us</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {!skipParentStep && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-700 text-white font-bold py-3 rounded hover:bg-gray-600 transition-colors min-h-[48px]"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isValid}
                  className="flex-1 bg-red text-white font-bold py-3 rounded disabled:opacity-50 hover:bg-red/90 transition-colors min-h-[48px]"
                >
                  Next: Review & Submit
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Consent */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bebas text-white mb-6">Review & Consent</h2>

              {/* Review Summary */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
                <h3 className="text-lg font-semibold text-white mb-3">Registration Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Parent:</span>
                    <span className="text-white ml-2">
                      {getValues("parent_first_name")} {getValues("parent_last_name")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{getValues("parent_email")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Player:</span>
                    <span className="text-white ml-2">
                      {getValues("player_first_name")} {getValues("player_last_name")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Birthdate:</span>
                    <span className="text-white ml-2">{getValues("player_birthdate")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Gender:</span>
                    <span className="text-white ml-2">{getValues("player_gender")}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Experience:</span>
                    <span className="text-white ml-2">
                      {getValues("player_experience")} - {
                        getValues("player_experience") === "1" ? "No Experience" :
                        getValues("player_experience") === "2" ? "Some Basics" :
                        getValues("player_experience") === "3" ? "Intermediate" :
                        getValues("player_experience") === "4" ? "Advanced" :
                        "Competitive League"
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* COPPA Consent */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    {...methods.register("coppa_consent")}
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-800 text-red focus:ring-2 focus:ring-red min-w-[20px] min-h-[20px]"
                    aria-invalid={!!errors.coppa_consent}
                    aria-label="COPPA consent - Confirm player is your child/ward"
                  />
                  <span className="text-sm text-gray-300">
                    <span className="text-red">*</span> I confirm that {getValues("player_first_name") || "the player"} is my child/ward and I have the authority to register them for this program. (COPPA Compliance)
                  </span>
                </label>
                {errors.coppa_consent && (
                  <p className="text-red text-sm mt-2">{errors.coppa_consent.message}</p>
                )}
              </div>

              {/* Waiver */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    {...methods.register("waiver_signed")}
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-800 text-red focus:ring-2 focus:ring-red"
                  />
                  <span className="text-sm text-gray-300">
                    I have read and agree to the liability waiver (will be completed during approval process)
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-700 text-white font-bold py-3 rounded hover:bg-gray-600 transition-colors min-h-[48px]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || submitted || !isValid || !bothCheckboxesChecked}
                  className="flex-1 bg-red text-white font-bold py-3 rounded disabled:opacity-50 hover:bg-red/90 transition-colors min-h-[48px]"
                >
                  {loading ? "Submitting..." : submitted ? "Submitted!" : "Submit Registration"}
                </button>
              </div>
            </div>
          )}
        </form>
      </FormProvider>
    </TooltipProvider>
  );
}

