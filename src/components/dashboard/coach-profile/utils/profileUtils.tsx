// src/components/dashboard/coach-profile/utils/profileUtils.tsx

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string or null
 * @returns Formatted date string or "Never"
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Calculate days since last login/activity
 * @param lastActiveAt - Last active timestamp
 * @param lastLoginAt - Last login timestamp
 * @returns Number of days since last activity, or null if no activity
 */
export const getDaysSinceLogin = (
  lastActiveAt: string | null | undefined,
  lastLoginAt: string | undefined
): number | null => {
  const ref = lastActiveAt || lastLoginAt;
  if (!ref) return null;
  const lastLogin = new Date(ref);
  const now = new Date();

  // Set both dates to start of day for accurate day comparison
  const lastLoginDate = new Date(
    lastLogin.getFullYear(),
    lastLogin.getMonth(),
    lastLogin.getDate()
  );
  const todayDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const diffTime = todayDate.getTime() - lastLoginDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Format days since login to a human-readable string
 * @param days - Number of days
 * @returns Formatted string (e.g., "Today", "Yesterday", "3 days ago")
 */
export const formatDaysSinceLogin = (days: number | null): string => {
  if (days === null) return "";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

