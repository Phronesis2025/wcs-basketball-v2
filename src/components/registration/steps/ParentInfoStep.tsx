// src/components/registration/steps/ParentInfoStep.tsx
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ParentInfoStepProps {
  methods: UseFormReturn<any>;
  errors: any;
  isValid: boolean;
  isAuthenticated: boolean;
  userEmail?: string;
  zipValidationError: string | null;
  isValidatingZip: boolean;
  onNext: () => void;
}

export default function ParentInfoStep({
  methods,
  errors,
  isValid,
  isAuthenticated,
  userEmail,
  zipValidationError,
  isValidatingZip,
  onNext,
}: ParentInfoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bebas text-white mb-6">
        Parent Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            First Name <span className="text-[#FF0000]">*</span>
          </label>
          <input
            {...methods.register("parent_first_name")}
            type="text"
            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] disabled:opacity-70 min-h-[48px]"
            placeholder="John"
            aria-invalid={!!errors.parent_first_name}
            aria-describedby={
              errors.parent_first_name
                ? "parent_first_name_error"
                : undefined
            }
            aria-label="Parent first name"
            autoComplete="given-name"
          />
          {errors.parent_first_name && (
            <p
              id="parent_first_name_error"
              className="text-[#FF0000] text-sm mt-1"
            >
              {errors.parent_first_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Last Name <span className="text-[#FF0000]">*</span>
          </label>
          <input
            {...methods.register("parent_last_name")}
            type="text"
            className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] disabled:opacity-70 min-h-[48px]"
            placeholder="Doe"
            aria-invalid={!!errors.parent_last_name}
            aria-label="Parent last name"
            autoComplete="family-name"
          />
          {errors.parent_last_name && (
            <p className="text-[#FF0000] text-sm mt-1">
              {errors.parent_last_name.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Email <span className="text-[#FF0000]">*</span>
          {isAuthenticated && userEmail && (
            <span className="ml-2 text-xs text-green-400">
              (from your Google account)
            </span>
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
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] min-h-[48px]"
              placeholder={
                isAuthenticated && userEmail
                  ? userEmail
                  : "john.doe@example.com"
              }
              readOnly={isAuthenticated && !!userEmail}
              aria-invalid={!!errors.parent_email}
              aria-label="Parent email address"
              autoComplete="email"
              inputMode="email"
              value={
                isAuthenticated && userEmail
                  ? userEmail
                  : field.value || ""
              }
              onChange={(e) => {
                if (!(isAuthenticated && userEmail)) {
                  field.onChange(e);
                }
              }}
            />
          )}
        />
        {errors.parent_email && (
          <p className="text-[#FF0000] text-sm mt-1">
            {errors.parent_email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Phone (Optional)
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="ml-2 text-gray-400 cursor-help hover:text-gray-200 transition-colors">ℹ️</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>We'll use this to contact you about your player</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <input
          {...methods.register("parent_phone")}
          type="tel"
          className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] min-h-[48px]"
          placeholder="(555) 123-4567"
          aria-invalid={!!errors.parent_phone}
          aria-label="Parent phone number"
          autoComplete="tel"
          inputMode="tel"
        />
        {errors.parent_phone && (
          <p className="text-[#FF0000] text-sm mt-1">
            {errors.parent_phone.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-2">
          Zip Code <span className="text-[#FF0000]">*</span>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="ml-2 text-gray-400 cursor-help hover:text-gray-200 transition-colors">ℹ️</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>Used to verify you're within our service area (50 miles of Salina, Kansas)</p>
            </TooltipContent>
          </Tooltip>
        </label>
        <input
          {...methods.register("parent_zip")}
          type="text"
          className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] min-h-[48px]"
          placeholder="Enter your zip code"
          maxLength={10}
          aria-invalid={!!errors.parent_zip}
          aria-label="Parent zip code"
          autoComplete="postal-code"
          inputMode="numeric"
        />
        {isValidatingZip && (
          <p className="text-gray-400 text-sm mt-1">
            Verifying location...
          </p>
        )}
        {(errors.parent_zip || zipValidationError) && (
          <p className="text-[#FF0000] text-sm mt-1">
            {zipValidationError || errors.parent_zip?.message}
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid || !!zipValidationError || isValidatingZip}
          className="flex-1 bg-[#FF0000] text-white font-bold py-3 rounded disabled:opacity-50 hover:bg-[#FF0000]/90 transition-colors min-h-[48px]"
        >
          Next: Player Information
        </button>
      </div>
    </div>
  );
}

