import { z } from "zod";

// Step 1: Parent Basics Schema
export const parentBasicsSchema = z.object({
  parent_first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  parent_last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  parent_email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  parent_phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-()+]+$/.test(val),
      "Invalid phone number format"
    ),
  parent_zip: z
    .string()
    .min(5, "Zip code is required")
    .max(10, "Invalid zip code format")
    .regex(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
});

// Step 2: Player Info Schema
export const playerInfoSchema = z.object({
  player_first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  player_last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  player_birthdate: z
    .string()
    .min(1, "Birthdate is required")
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const calculatedAge =
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ? age - 1
            : age;
        return calculatedAge >= 6 && calculatedAge <= 18;
      },
      "Player must be between 6 and 18 years old"
    ),
  player_grade: z.string().optional(),
  player_gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Gender is required",
  }),
  player_experience: z
    .string()
    .regex(/^[1-5]$/, "Experience level must be between 1 and 5"),
});

// Step 3: Review & Consent Schema
export const reviewConsentSchema = z.object({
  coppa_consent: z.boolean().refine((val) => val === true, {
    message: "You must confirm the player is your child/ward",
  }),
  waiver_signed: z.boolean().default(false),
});

// Combined Registration Schema
export const registrationSchema = parentBasicsSchema
  .merge(playerInfoSchema)
  .merge(reviewConsentSchema);

// Type exports
export type ParentBasicsFormData = z.infer<typeof parentBasicsSchema>;
export type PlayerInfoFormData = z.infer<typeof playerInfoSchema>;
export type ReviewConsentFormData = z.infer<typeof reviewConsentSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;

