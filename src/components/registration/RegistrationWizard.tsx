"use client";

import { FormProvider } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  type ParentBasicsFormData,
  type PlayerInfoFormData,
  type ReviewConsentFormData,
} from "@/lib/schemas/registrationSchema";
import { useRegistrationWizard } from "./hooks/useRegistrationWizard";
import { useZipValidation } from "./hooks/useZipValidation";
import { useRegistrationSubmission } from "./hooks/useRegistrationSubmission";
import { calculateAge } from "./utils/registrationUtils";
import StepIndicator from "./StepIndicator";
import ParentInfoStep from "./steps/ParentInfoStep";
import PlayerInfoStep from "./steps/PlayerInfoStep";
import ReviewConsentStep from "./steps/ReviewConsentStep";

type FormData = ParentBasicsFormData &
  PlayerInfoFormData &
  ReviewConsentFormData;

interface RegistrationWizardProps {
  skipParentStep?: boolean; // For add-child flow
  prefillData?: Partial<FormData>;
}

export default function RegistrationWizard({
  skipParentStep = false,
  prefillData = {},
}: RegistrationWizardProps) {
  const { user, isAuthenticated } = useAuth();

  // Use custom hooks for state management
  const wizardHook = useRegistrationWizard({
    skipParentStep,
    prefillData,
    user,
    isAuthenticated,
  });

  const { methods, currentStep, completedSteps, handleNext, handleBack } = wizardHook;
  const { errors, isValid } = methods.formState;
  const { watch } = methods;

  // Watch zip code for real-time validation
  const parentZip = watch("parent_zip");
  const zipValidation = useZipValidation({
    zipCode: parentZip || "",
    methods,
  });

  // Watch player birthdate for age calculation
  const playerBirthdate = watch("player_birthdate");
  const calculatedAge = calculateAge(playerBirthdate || "");

  // Watch checkbox value for submit button state
  const coppaConsent = watch("coppa_consent");

  // Use submission hook
  const submissionHook = useRegistrationSubmission({
    methods,
    isAuthenticated,
    userId: user?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submissionHook.submitRegistration();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            skipParentStep={skipParentStep}
          />

          {/* Step 1: Parent Basics */}
          {currentStep === 1 && !skipParentStep && (
            <ParentInfoStep
              methods={methods}
              errors={errors}
              isValid={isValid}
              isAuthenticated={isAuthenticated}
              userEmail={user?.email}
              zipValidationError={zipValidation.zipValidationError}
              isValidatingZip={zipValidation.isValidatingZip}
              onNext={handleNext}
            />
          )}

          {/* Step 2: Player Info */}
          {currentStep === 2 && (
            <PlayerInfoStep
              methods={methods}
              errors={errors}
              isValid={isValid}
              calculatedAge={calculatedAge}
              skipParentStep={skipParentStep}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {/* Step 3: Review & Consent */}
          {currentStep === 3 && (
            <ReviewConsentStep
              methods={methods}
              errors={errors}
              isValid={isValid}
              coppaConsentChecked={coppaConsent}
              loading={submissionHook.loading}
              submitted={submissionHook.submitted}
              onBack={handleBack}
            />
          )}
        </form>
      </FormProvider>
    </TooltipProvider>
  );
}
