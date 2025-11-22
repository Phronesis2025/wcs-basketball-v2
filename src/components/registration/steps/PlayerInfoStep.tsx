// src/components/registration/steps/PlayerInfoStep.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { getMinDate, getMaxDate } from "../utils/registrationUtils";

interface PlayerInfoStepProps {
  methods: UseFormReturn<any>;
  errors: any;
  isValid: boolean;
  calculatedAge: number | null;
  skipParentStep: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function PlayerInfoStep({
  methods,
  errors,
  isValid,
  calculatedAge,
  skipParentStep,
  onNext,
  onBack,
}: PlayerInfoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bebas text-white mb-6">
        Player Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            First Name <span className="text-[#FF0000]">*</span>
          </label>
          <input
            {...methods.register("player_first_name")}
            type="text"
            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
            placeholder="Jane"
            aria-invalid={!!errors.player_first_name}
          />
          {errors.player_first_name && (
            <p className="text-[#FF0000] text-sm mt-1">
              {errors.player_first_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Last Name <span className="text-[#FF0000]">*</span>
          </label>
          <input
            {...methods.register("player_last_name")}
            type="text"
            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
            placeholder="Doe"
            aria-invalid={!!errors.player_last_name}
          />
          {errors.player_last_name && (
            <p className="text-[#FF0000] text-sm mt-1">
              {errors.player_last_name.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Date of Birth <span className="text-[#FF0000]">*</span>
            {calculatedAge !== null && (
              <span className="ml-2 text-green-500">
                (Age: {calculatedAge})
              </span>
            )}
          </label>
          <input
            {...methods.register("player_birthdate")}
            type="date"
            min={getMaxDate()}
            max={getMinDate()}
            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] min-h-[48px]"
            aria-invalid={!!errors.player_birthdate}
            aria-label="Player date of birth"
            autoComplete="bday"
          />
          {errors.player_birthdate && (
            <p className="text-[#FF0000] text-sm mt-1">
              {errors.player_birthdate.message}
            </p>
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
            <p className="text-red text-sm mt-1">
              {errors.player_gender.message}
            </p>
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
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="ml-2 text-gray-400 cursor-help hover:text-gray-200 transition-colors">ℹ️</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>
                Helps with team placement. 1 = No Experience, 5 =
                Competitive League
              </p>
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
          <p className="text-red text-sm mt-1">
            {errors.player_experience.message}
          </p>
        )}
      </div>

      {/* Fee Preview */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">
          Estimated Fees
        </h3>
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
            onClick={onBack}
            className="flex-1 bg-gray-700 text-white font-bold py-3 rounded hover:bg-gray-600 transition-colors min-h-[48px]"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 bg-red text-white font-bold py-3 rounded disabled:opacity-50 hover:bg-red/90 transition-colors min-h-[48px]"
        >
          Next: Review & Submit
        </button>
      </div>
    </div>
  );
}

