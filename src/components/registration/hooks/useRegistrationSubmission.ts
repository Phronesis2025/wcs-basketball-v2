// src/components/registration/hooks/useRegistrationSubmission.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { devLog, devError } from "@/lib/security";
import { extractApiErrorMessage, extractApiResponseData } from "@/lib/errorHandler";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/nextjs";

type FormData = any; // Will be properly typed from registrationSchema

interface UseRegistrationSubmissionProps {
  methods: UseFormReturn<FormData>;
  isAuthenticated: boolean;
  userId?: string;
}

export const useRegistrationSubmission = ({
  methods,
  isAuthenticated,
  userId,
}: UseRegistrationSubmissionProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitRegistration = async () => {
    if (loading || submitted) return;

    setLoading(true);
    try {
      Sentry.captureEvent({
        message: "Form Submitted",
        level: "info",
        tags: { flow: "registration" },
      });

      // Get all form values using getValues() since data parameter only contains current step's validated fields
      // Fallback to localStorage if getValues() doesn't have all fields (which can happen with step-based validation)
      let allFormData = methods.getValues();
      try {
        const draft = localStorage.getItem("wcs_registration_draft");
        if (draft) {
          const draftData = JSON.parse(draft);
          // Merge: use getValues() for current step, localStorage for others
          allFormData = { ...draftData, ...allFormData };
        }
      } catch (err) {
        devError(
          "RegistrationWizard: Failed to load draft for submission",
          err
        );
      }

      // Verify zip code is within service area (double-check, but real-time validation should have caught this)
      if (allFormData.parent_zip) {
        try {
          const response = await fetch("/api/verify-zip", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ zipCode: allFormData.parent_zip.trim() }),
          });

          if (!response.ok) {
            const errorMessage = await extractApiErrorMessage(response);
            throw new Error(errorMessage);
          }

          const zipVerification = await extractApiResponseData<{ allowed: boolean; error?: string }>(response);
          
          if (!zipVerification.allowed) {
            // Set error on the zip code field
            const errorMessage = zipVerification.error ||
              "Registration is currently limited to residents within 50 miles of Salina, Kansas.";
            methods.setError("parent_zip", {
              type: "manual",
              message: errorMessage,
            });
            setLoading(false);
            // Scroll to the zip code field
            setTimeout(() => {
              const zipField = document.querySelector('[name="parent_zip"]');
              if (zipField) {
                zipField.scrollIntoView({ behavior: "smooth", block: "center" });
                (zipField as HTMLElement).focus();
              }
            }, 100);
            return;
          }
        } catch (err) {
          devError("RegistrationWizard: Zip code verification error", err);
          methods.setError("parent_zip", {
            type: "manual",
            message: "Unable to verify location. Please try again.",
          });
          setLoading(false);
          return;
        }
      }

      // For unauthenticated users (new parents), use magic-link flow which sends Supabase confirmation email
      if (!isAuthenticated || !userId) {
        devLog(
          "RegistrationWizard: Unauthenticated user, using magic-link flow"
        );

        const payload = {
          parent_first_name: allFormData.parent_first_name,
          parent_last_name: allFormData.parent_last_name,
          parent_email: allFormData.parent_email,
          parent_zip: allFormData.parent_zip,
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
          const errorMessage = await extractApiErrorMessage(response);
          throw new Error(errorMessage);
        }

        // Clear draft
        localStorage.removeItem("wcs_registration_draft");

        setSubmitted(true);
        toast.success(
          "Confirmation email sent! Check your email to complete registration."
        );

        Sentry.captureEvent({
          message: "Registration Complete (Magic Link)",
          level: "info",
          tags: { flow: "registration", type: "guest" },
        });

        // Redirect to registration pending page
        setTimeout(() => {
          router.push(
            `/registration-pending?player=${encodeURIComponent(
              allFormData.player_first_name
            )}`
          );
        }, 1500);
        return;
      }

      // For authenticated users (existing parents adding another child), use register-player API
      const response = await fetch("/api/register-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_user_id: userId,
          parent_first_name: allFormData.parent_first_name,
          parent_last_name: allFormData.parent_last_name,
          parent_email: allFormData.parent_email,
          parent_phone: allFormData.parent_phone || undefined,
          parent_zip: allFormData.parent_zip,
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
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      // Clear draft
      localStorage.removeItem("wcs_registration_draft");

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
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );

      Sentry.captureEvent({
        message: "Form Submission Failed",
        level: "error",
        tags: { flow: "registration" },
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitted,
    submitRegistration,
  };
};

