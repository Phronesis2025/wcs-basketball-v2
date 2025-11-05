"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { devLog, devError } from "@/lib/security";
import toast from "react-hot-toast";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const guestSignupSchema = z.object({
  parent_first_name: z.string().min(1, "First name is required"),
  parent_last_name: z.string().min(1, "Last name is required"),
  parent_email: z.string().email("Invalid email address"),
  player_first_name: z.string().min(1, "First name is required"),
  player_last_name: z.string().min(1, "Last name is required"),
  player_gender: z.enum(["Male", "Female", "Other"]),
  player_birthdate: z.string().min(1, "Birthdate is required").refine(
    (date) => {
      const birth = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age >= 6 && age <= 18;
    },
    "Player must be between 6 and 18 years old"
  ),
  player_grade: z.string().optional(),
  player_experience: z.string().regex(/^[1-5]$/, "Experience level must be between 1 and 5"),
  coppa_consent: z.boolean().refine((val) => val === true, {
    message: "You must confirm the player is your child/ward",
  }),
});

type GuestSignupFormData = z.infer<typeof guestSignupSchema>;

export default function GuestSignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GuestSignupFormData>({
    resolver: zodResolver(guestSignupSchema),
    mode: "onChange",
  });

  const playerBirthdate = watch("player_birthdate");
  
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

  const calculatedAge = calculateAge(playerBirthdate || "");

  const getMinDate = (): string => {
    const today = new Date();
    const maxAge = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());
    return maxAge.toISOString().split("T")[0];
  };

  const getMaxDate = (): string => {
    const today = new Date();
    const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return minAge.toISOString().split("T")[0];
  };

  const onSubmit = async (data: GuestSignupFormData) => {
    if (loading) return;
    setLoading(true);

    try {
      devLog("GuestSignupForm: Submitting guest registration", { email: data.parent_email });

      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send magic link");
      }

      toast.success("Magic link sent! Check your email to complete registration.");
      devLog("GuestSignupForm: Magic link sent successfully");

      // Redirect to registration pending page
      const playerName = data.player_first_name || "";
      router.push(`/registration-pending${playerName ? `?player=${encodeURIComponent(playerName)}` : ""}`);
    } catch (error) {
      devError("GuestSignupForm: Submit error", error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-bebas text-white mb-6">Continue as Guest</h2>
        <p className="text-gray-300 mb-6">
          Provide minimal information to get started. We'll send you a confirmation link via email.
        </p>

        {/* Parent Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Parent Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                First Name <span className="text-red">*</span>
              </label>
              <input
                {...register("parent_first_name")}
                type="text"
                className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                placeholder="John"
                aria-invalid={!!errors.parent_first_name}
              />
              {errors.parent_first_name && (
                <p className="text-red text-sm mt-1">{errors.parent_first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Last Name <span className="text-red">*</span>
              </label>
              <input
                {...register("parent_last_name")}
                type="text"
                className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                placeholder="Doe"
                aria-invalid={!!errors.parent_last_name}
              />
              {errors.parent_last_name && (
                <p className="text-red text-sm mt-1">{errors.parent_last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Email <span className="text-red">*</span>
            </label>
            <input
              {...register("parent_email")}
              type="email"
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
              placeholder="john.doe@example.com"
              aria-invalid={!!errors.parent_email}
            />
            {errors.parent_email && (
              <p className="text-red text-sm mt-1">{errors.parent_email.message}</p>
            )}
          </div>
        </div>

        {/* Player Info */}
        <div className="space-y-4 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white">Player Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                First Name <span className="text-red">*</span>
              </label>
              <input
                {...register("player_first_name")}
                type="text"
                className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
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
                {...register("player_last_name")}
                type="text"
                className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
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
                {...register("player_birthdate")}
                type="date"
                min={getMaxDate()}
                max={getMinDate()}
                className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                aria-invalid={!!errors.player_birthdate}
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
                {...register("player_gender")}
                className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
                aria-invalid={!!errors.player_gender}
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
              {...register("player_grade")}
              type="text"
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
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
              {...register("player_experience")}
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red min-h-[48px]"
              aria-invalid={!!errors.player_experience}
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
        </div>

        {/* COPPA Consent */}
        <div className="pt-6 border-t border-gray-700">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              {...register("coppa_consent")}
              type="checkbox"
              className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-800 text-red focus:ring-2 focus:ring-red"
              aria-invalid={!!errors.coppa_consent}
            />
            <span className="text-sm text-gray-300">
              <span className="text-red">*</span> I confirm that the player is my child/ward and I have the authority to register them. (COPPA Compliance)
            </span>
          </label>
          {errors.coppa_consent && (
            <p className="text-red text-sm mt-2">{errors.coppa_consent.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red text-white font-bold py-3 rounded disabled:opacity-50 hover:bg-red/90 transition-colors min-h-[48px]"
          >
            {loading ? "Sending..." : "Send Confirmation Link"}
          </button>
        </div>
      </form>
    </TooltipProvider>
  );
}

