// src/components/registration/utils/registrationUtils.tsx

/**
 * Calculate age from birthdate string
 * @param birthdate - ISO date string (YYYY-MM-DD)
 * @returns Age in years or null if invalid
 */
export const calculateAge = (birthdate: string): number | null => {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
};

/**
 * Get minimum date (8 years ago) for date input
 * @returns ISO date string (YYYY-MM-DD)
 */
export const getMinDate = (): string => {
  const today = new Date();
  const maxAge = new Date(
    today.getFullYear() - 8,
    today.getMonth(),
    today.getDate()
  );
  return maxAge.toISOString().split("T")[0];
};

/**
 * Get maximum date (18 years ago) for date input
 * @returns ISO date string (YYYY-MM-DD)
 */
export const getMaxDate = (): string => {
  const today = new Date();
  const minAge = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  return minAge.toISOString().split("T")[0];
};

/**
 * Get experience level label from value
 * @param value - Experience level value ("1" to "5")
 * @returns Human-readable label
 */
export const getExperienceLabel = (value: string): string => {
  switch (value) {
    case "1":
      return "No Experience";
    case "2":
      return "Some Basics";
    case "3":
      return "Intermediate";
    case "4":
      return "Advanced";
    case "5":
      return "Competitive League";
    default:
      return value;
  }
};

