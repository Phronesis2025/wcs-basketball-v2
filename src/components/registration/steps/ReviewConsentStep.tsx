// src/components/registration/steps/ReviewConsentStep.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { getExperienceLabel } from "../utils/registrationUtils";

interface ReviewConsentStepProps {
  methods: UseFormReturn<any>;
  errors: any;
  isValid: boolean;
  bothCheckboxesChecked: boolean;
  loading: boolean;
  submitted: boolean;
  onBack: () => void;
}

export default function ReviewConsentStep({
  methods,
  errors,
  isValid,
  bothCheckboxesChecked,
  loading,
  submitted,
  onBack,
}: ReviewConsentStepProps) {
  const getValues = methods.getValues;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bebas text-white mb-6">
        Review & Consent
      </h2>

      {/* Review Summary */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
        <h3 className="text-lg font-semibold text-white mb-3">
          Registration Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Parent:</span>
            <span className="text-white ml-2">
              {getValues("parent_first_name")}{" "}
              {getValues("parent_last_name")}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">
              {getValues("parent_email")}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Player:</span>
            <span className="text-white ml-2">
              {getValues("player_first_name")}{" "}
              {getValues("player_last_name")}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Birthdate:</span>
            <span className="text-white ml-2">
              {getValues("player_birthdate")}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Gender:</span>
            <span className="text-white ml-2">
              {getValues("player_gender")}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Experience:</span>
            <span className="text-white ml-2">
              {getValues("player_experience")} -{" "}
              {getExperienceLabel(getValues("player_experience"))}
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
            aria-label="COPPA consent - Confirm player is your player/ward"
          />
          <span className="text-sm text-gray-300">
            <span className="text-red">*</span> I confirm that{" "}
            {getValues("player_first_name") || "the player"} is my
            player/ward and I have the authority to register them for
            this program. (COPPA Compliance)
          </span>
        </label>
        {errors.coppa_consent && (
          <p className="text-red text-sm mt-2">
            {errors.coppa_consent.message}
          </p>
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
            I have read and agree to the liability waiver (will be
            completed during approval process)
          </span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-700 text-white font-bold py-3 rounded hover:bg-gray-600 transition-colors min-h-[48px]"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={
            loading || submitted || !isValid || !bothCheckboxesChecked
          }
          className="flex-1 bg-red text-white font-bold py-3 rounded disabled:opacity-50 hover:bg-red/90 transition-colors min-h-[48px]"
        >
          {loading
            ? "Submitting..."
            : submitted
            ? "Submitted!"
            : "Submit Registration"}
        </button>
      </div>
    </div>
  );
}

