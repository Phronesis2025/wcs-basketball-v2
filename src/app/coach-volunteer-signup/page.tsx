"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchTeams } from "@/lib/actions";
import type { Team } from "@/types/supabase";
import Input from "@/components/ui/input";
import { validateInput } from "@/lib/security";

export default function CoachVolunteerSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",

    // Address Information
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",

    // Role Selection
    role: "" as "coach" | "volunteer" | "",

    // Child on Team Information
    hasChildOnTeam: false,
    childName: "",
    childTeamId: "",

    // Additional Information
    experience: "",
    availability: "",
    whyInterested: "",

    // Safety/Background Check
    backgroundCheckConsent: false,
  });

  // Fetch teams on component mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const fetchedTeams = await fetchTeams();
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setTeamsLoading(false);
      }
    };
    loadTeams();
  }, []);

  // Handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Scroll to first error
  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        (element as HTMLElement).focus();
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const profanityErrorsList: string[] = [];

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.role) {
      newErrors.role =
        "Please select whether you want to be a coach or volunteer";
    }

    // Phone validation (if provided)
    if (
      formData.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Address validation (if any address field is filled, require all)
    const hasAnyAddress =
      formData.addressLine1 || formData.city || formData.state || formData.zip;
    if (hasAnyAddress) {
      if (!formData.addressLine1.trim()) {
        newErrors.addressLine1 = "Address line 1 is required";
      }
      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.state.trim()) {
        newErrors.state = "State is required";
      }
      if (!formData.zip.trim()) {
        newErrors.zip = "ZIP code is required";
      }
    }

    // Child on team validation
    if (formData.hasChildOnTeam) {
      if (!formData.childName.trim()) {
        newErrors.childName = "Child's name is required";
      }
      if (!formData.childTeamId) {
        newErrors.childTeamId = "Child's team is required";
      }
    }

    // Background check consent is required
    if (!formData.backgroundCheckConsent) {
      newErrors.backgroundCheckConsent = "Background check consent is required";
    }

    // Check for profanity in text fields
    const fieldsToCheck = [
      { value: formData.firstName, field: "firstName" },
      { value: formData.lastName, field: "lastName" },
      { value: formData.childName, field: "childName" },
      { value: formData.experience, field: "experience" },
      { value: formData.availability, field: "availability" },
      { value: formData.whyInterested, field: "whyInterested" },
      { value: formData.city, field: "city" },
      { value: formData.addressLine1, field: "addressLine1" },
      { value: formData.addressLine2, field: "addressLine2" },
    ];

    fieldsToCheck.forEach(({ value, field }) => {
      if (value && !validateInput(value, field).isValid) {
        profanityErrorsList.push(`${field} contains inappropriate content`);
      }
    });

    setErrors(newErrors);
    setProfanityErrors(profanityErrorsList);

    // Scroll to first error if validation fails
    if (Object.keys(newErrors).length > 0 || profanityErrorsList.length > 0) {
      setTimeout(() => scrollToFirstError(newErrors), 100);
    }

    return (
      Object.keys(newErrors).length === 0 && profanityErrorsList.length === 0
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/coach-volunteer-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          address_line1: formData.addressLine1.trim() || null,
          address_line2: formData.addressLine2.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          zip: formData.zip.trim() || null,
          role: formData.role,
          has_child_on_team: formData.hasChildOnTeam,
          child_name: formData.hasChildOnTeam
            ? formData.childName.trim()
            : null,
          child_team_id: formData.hasChildOnTeam ? formData.childTeamId : null,
          experience: formData.experience.trim() || null,
          availability: formData.availability.trim() || null,
          why_interested: formData.whyInterested.trim() || null,
          background_check_consent: formData.backgroundCheckConsent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to submit application. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success message
  if (submitted) {
    return (
      <div className="bg-navy min-h-screen text-white">
        <section
          className="pt-20 pb-12 sm:pt-24"
          aria-label="Application Submitted"
        >
          <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-8 mb-6">
                <h1 className="text-4xl font-bebas-bold-italic mb-4 text-green-400">
                  Application Submitted!
                </h1>
                <p className="text-lg text-gray-300 mb-6">
                  Thank you for your interest in becoming a{" "}
                  {formData.role === "coach" ? "coach" : "volunteer"} with WCS
                  Basketball!
                </p>
                <p className="text-gray-300 mb-6">
                  We have received your application and will review it shortly.
                  Our admin team will contact you via email to discuss next
                  steps.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-red text-white font-bebas font-bold px-8 py-3 rounded-lg text-xl uppercase tracking-wide hover:bg-red-700 transition-colors duration-200"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white">
      <section
        className="pt-20 pb-12 sm:pt-24"
        aria-label="Coach/Volunteer Signup"
      >
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold uppercase mb-4">
              Become a Coach or Volunteer
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-4">
              Join the WCS Basketball family and make a positive impact on young
              athletes. We're looking for dedicated coaches and volunteers who
              are passionate about basketball and committed to helping youth
              develop their skills, character, and love for the game.
            </p>
            <p className="text-gray-400 text-base max-w-3xl mx-auto">
              All applicants will undergo a background check to ensure the
              safety of our players. Please complete the form below to get
              started.
            </p>
          </div>

          {/* Form */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profanity Errors */}
              {profanityErrors.length > 0 && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 font-semibold mb-2">
                    Please correct the following:
                  </p>
                  <ul className="list-disc list-inside text-red-300">
                    {profanityErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400">{errors.submit}</p>
                </div>
              )}

              {/* Basic Information Section */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-white">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium mb-2"
                    >
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-2"
                    >
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium mb-2"
                    >
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="(555) 123-4567"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-white">
                  Address Information (Optional)
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="addressLine1"
                      className="block text-sm font-medium mb-2"
                    >
                      Address Line 1
                    </label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) =>
                        handleInputChange("addressLine1", e.target.value)
                      }
                      className={errors.addressLine1 ? "border-red-500" : ""}
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.addressLine1}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="addressLine2"
                      className="block text-sm font-medium mb-2"
                    >
                      Address Line 2
                    </label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) =>
                        handleInputChange("addressLine2", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium mb-2"
                      >
                        City
                      </label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium mb-2"
                      >
                        State
                      </label>
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        maxLength={2}
                        placeholder="CA"
                        className={errors.state ? "border-red-500" : ""}
                      />
                      {errors.state && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="zip"
                        className="block text-sm font-medium mb-2"
                      >
                        ZIP Code
                      </label>
                      <Input
                        id="zip"
                        name="zip"
                        type="text"
                        value={formData.zip}
                        onChange={(e) =>
                          handleInputChange("zip", e.target.value)
                        }
                        className={errors.zip ? "border-red-500" : ""}
                      />
                      {errors.zip && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.zip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-white">
                  Role Selection
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    I want to be a: *
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="coach"
                        checked={formData.role === "coach"}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className="mr-2 w-4 h-4"
                      />
                      <span>Coach</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value="volunteer"
                        checked={formData.role === "volunteer"}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className="mr-2 w-4 h-4"
                      />
                      <span>Volunteer</span>
                    </label>
                  </div>
                  {errors.role && (
                    <p className="text-red-400 text-sm mt-1">{errors.role}</p>
                  )}
                </div>
              </div>

              {/* Child on Team Section */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-white">
                  Child on Team
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.hasChildOnTeam}
                        onChange={(e) =>
                          handleInputChange("hasChildOnTeam", e.target.checked)
                        }
                        className="mr-2 w-4 h-4"
                      />
                      <span>I have a child on a WCS Basketball team</span>
                    </label>
                  </div>

                  {formData.hasChildOnTeam && (
                    <>
                      <div>
                        <label
                          htmlFor="childName"
                          className="block text-sm font-medium mb-2"
                        >
                          Child's Name *
                        </label>
                        <Input
                          id="childName"
                          name="childName"
                          type="text"
                          value={formData.childName}
                          onChange={(e) =>
                            handleInputChange("childName", e.target.value)
                          }
                          className={errors.childName ? "border-red-500" : ""}
                        />
                        {errors.childName && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.childName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="childTeamId"
                          className="block text-sm font-medium mb-2"
                        >
                          Child's Team *
                        </label>
                        <select
                          id="childTeamId"
                          name="childTeamId"
                          value={formData.childTeamId}
                          onChange={(e) =>
                            handleInputChange("childTeamId", e.target.value)
                          }
                          className={`w-full px-3 py-2 bg-navy text-white border border-gray-700 rounded focus:outline-none focus:border-red ${
                            errors.childTeamId ? "border-red-500" : ""
                          }`}
                          disabled={teamsLoading}
                        >
                          <option value="">Select a team</option>
                          {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name}{" "}
                              {team.age_group ? `(${team.age_group})` : ""}{" "}
                              {team.gender ? `- ${team.gender}` : ""}
                            </option>
                          ))}
                        </select>
                        {errors.childTeamId && (
                          <p className="text-red-400 text-sm mt-1">
                            {errors.childTeamId}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-white">
                  Additional Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium mb-2"
                    >
                      Experience (basketball, coaching, working with youth,
                      etc.)
                    </label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={(e) =>
                        handleInputChange("experience", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 bg-navy text-white border border-gray-700 rounded focus:outline-none focus:border-red font-inter text-sm"
                      placeholder="Tell us about your relevant experience..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="availability"
                      className="block text-sm font-medium mb-2"
                    >
                      Availability
                    </label>
                    <textarea
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={(e) =>
                        handleInputChange("availability", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-navy text-white border border-gray-700 rounded focus:outline-none focus:border-red font-inter text-sm"
                      placeholder="What days/times are you available? (e.g., Weekday evenings, Saturday mornings, etc.)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="whyInterested"
                      className="block text-sm font-medium mb-2"
                    >
                      Why are you interested in coaching/volunteering with WCS
                      Basketball?
                    </label>
                    <textarea
                      id="whyInterested"
                      name="whyInterested"
                      value={formData.whyInterested}
                      onChange={(e) =>
                        handleInputChange("whyInterested", e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 bg-navy text-white border border-gray-700 rounded focus:outline-none focus:border-red font-inter text-sm"
                      placeholder="Share your motivation and passion for working with young athletes..."
                    />
                  </div>
                </div>
              </div>

              {/* Background Check Consent */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-white">
                  Background Check Consent
                </h2>

                <div>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.backgroundCheckConsent}
                      onChange={(e) =>
                        handleInputChange(
                          "backgroundCheckConsent",
                          e.target.checked
                        )
                      }
                      className="mr-2 mt-1 w-4 h-4 flex-shrink-0"
                      required
                    />
                    <span>
                      I consent to a background check as part of the application
                      process. I understand that this is required for all
                      coaches and volunteers working with youth. *
                    </span>
                  </label>
                  {errors.backgroundCheckConsent && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.backgroundCheckConsent}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red text-white font-bebas font-bold px-8 py-3 rounded-lg text-xl uppercase tracking-wide hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
