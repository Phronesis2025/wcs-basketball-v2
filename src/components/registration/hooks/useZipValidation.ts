// src/components/registration/hooks/useZipValidation.ts
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { devError } from "@/lib/security";
import { extractApiErrorMessage, extractApiResponseData } from "@/lib/errorHandler";

interface UseZipValidationProps {
  zipCode: string;
  methods: UseFormReturn<any>;
}

export const useZipValidation = ({ zipCode, methods }: UseZipValidationProps) => {
  const [zipValidationError, setZipValidationError] = useState<string | null>(null);
  const [isValidatingZip, setIsValidatingZip] = useState(false);

  useEffect(() => {
    const validateZipCode = async () => {
      if (!zipCode || zipCode.trim().length < 5) {
        setZipValidationError(null);
        return;
      }

      // Check if it's a valid format first
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(zipCode.trim())) {
        setZipValidationError(null); // Let schema validation handle format errors
        return;
      }

      setIsValidatingZip(true);
      setZipValidationError(null);

      try {
        const response = await fetch("/api/verify-zip", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ zipCode: zipCode.trim() }),
        });

        if (!response.ok) {
          const errorMessage = await extractApiErrorMessage(response);
          throw new Error(errorMessage);
        }

        const zipVerification = await extractApiResponseData<{ allowed: boolean; error?: string }>(response);
        
        if (!zipVerification.allowed) {
          const errorMessage = zipVerification.error ||
            "Registration is currently limited to residents within 50 miles of Salina, Kansas.";
          setZipValidationError(errorMessage);
          // Also set error in form for validation
          methods.setError("parent_zip", {
            type: "manual",
            message: errorMessage,
          });
        } else {
          setZipValidationError(null);
          methods.clearErrors("parent_zip");
        }
      } catch (err) {
        devError("RegistrationWizard: Real-time zip validation error", err);
        // Don't show error on API failure, let user proceed
        setZipValidationError(null);
      } finally {
        setIsValidatingZip(false);
      }
    };

    // Debounce validation
    const timeoutId = setTimeout(validateZipCode, 500);
    return () => clearTimeout(timeoutId);
  }, [zipCode, methods]);

  return {
    zipValidationError,
    isValidatingZip,
  };
};

