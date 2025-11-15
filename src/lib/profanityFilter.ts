/**
 * Profanity Filter Utility for WCS v2.0
 *
 * This utility provides focused content filtering to detect and prevent
 * explicit curse words and inappropriate content in user inputs.
 * Only blocks truly offensive language, not legitimate words.
 */

import { devLog } from "./security";

/**
 * Focused list of explicit curse words only
 * Note: Slurs, hate speech, sexual/violent/drug terms are intentionally excluded.
 * Detection is whole-word only to avoid false positives like "of ages".
 */
const PROFANITY_WORDS = new Set([
  // Core profanity
  "fuck",
  "fucking",
  "fucked",
  "shit",
  "shitting",
  "bitch",
  "bitches",
  "asshole",
  "bastard",
  "dick",
  "cock",
  "pussy",
  "whore",
  "slut",

  // Common obfuscations (limited to curse words only)
  "f*ck",
  "f**k",
  "f***",
  "sh*t",
  "s**t",
  "a**hole",
  "b*tch",
  "b**ch",
  "d*ck",
  "d**k",
  "c*ck",
  "c**k",
  "p*ssy",
  "p**sy",
  "wh*re",
  "wh**e",
  "sl*t",
  "sl**t",
]);

/**
 * Common leet speak and obfuscation patterns
 */
const LEET_PATTERNS = [
  { pattern: /[0@]/g, replacement: "o" },
  { pattern: /[1!]/g, replacement: "i" },
  { pattern: /[3]/g, replacement: "e" },
  { pattern: /[4]/g, replacement: "a" },
  { pattern: /[5$]/g, replacement: "s" },
  { pattern: /[7]/g, replacement: "t" },
  { pattern: /[8]/g, replacement: "b" },
  { pattern: /[9]/g, replacement: "g" },
  { pattern: /[+]/g, replacement: "t" },
  { pattern: /[|]/g, replacement: "l" },
  { pattern: /[()]/g, replacement: "" },
  { pattern: /[.]/g, replacement: "" },
  { pattern: /[-_]/g, replacement: "" },
  { pattern: /[*]/g, replacement: "" },
];

/**
 * Normalize text by removing leet speak and special characters
 * @param text - The text to normalize
 * @returns Normalized text
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();

  // Apply leet speak transformations
  for (const { pattern, replacement } of LEET_PATTERNS) {
    normalized = normalized.replace(pattern, replacement);
  }

  // Remove extra spaces and special characters
  normalized = normalized.replace(/[^a-z0-9\s]/g, "");
  normalized = normalized.replace(/\s+/g, " ");

  return normalized.trim();
}

/**
 * Normalize text for spaced-out profanity detection
 * This removes spaces to catch attempts like "f u c k"
 */
function normalizeForSpacedProfanity(text: string): string {
  let normalized = text.toLowerCase();

  // Apply leet speak transformations
  for (const { pattern, replacement } of LEET_PATTERNS) {
    normalized = normalized.replace(pattern, replacement);
  }

  // Remove all spaces and special characters to catch spaced-out profanity
  normalized = normalized.replace(/[^a-z0-9]/g, "");

  return normalized;
}

/**
 * Check if text contains profanity or inappropriate content
 * @param text - The text to check
 * @returns Object with isProfane boolean and detected words array
 */
export function checkProfanity(text: string): {
  isProfane: boolean;
  detectedWords: string[];
  severity: "low" | "medium" | "high";
} {
  if (!text || typeof text !== "string") {
    return { isProfane: false, detectedWords: [], severity: "low" };
  }

  const normalizedText = normalizeText(text);
  const words = normalizedText.split(/\s+/);
  const detectedWords: string[] = [];

  // Check each word against profanity list
  for (const word of words) {
    if (word.length < 2) continue; // Skip single characters

    // Direct match only - remove partial matching to avoid false positives
    if (PROFANITY_WORDS.has(word)) {
      detectedWords.push(word);
      continue;
    }
  }

  // Disabled spaced-out detection to avoid false positives across word boundaries
  // (e.g., "of ages" previously triggered on "fag"). Intentional to "turn down" filter.

  // Determine severity
  let severity: "low" | "medium" | "high" = "low";
  if (detectedWords.length > 0) {
    const highSeverityWords = ["fuck", "shit", "bitch", "asshole"];
    const hasHighSeverity = detectedWords.some((word) =>
      highSeverityWords.some((highWord) => word.includes(highWord))
    );
    severity = hasHighSeverity
      ? "high"
      : detectedWords.length > 2
      ? "medium"
      : "low";
  }

  return {
    isProfane: detectedWords.length > 0,
    detectedWords: [...new Set(detectedWords)], // Remove duplicates
    severity,
  };
}

/**
 * Sanitize text by replacing profane words with asterisks
 * @param text - The text to sanitize
 * @returns Sanitized text with profane words replaced
 */
export function sanitizeProfanity(text: string): string {
  if (!text || typeof text !== "string") {
    return text;
  }

  const { isProfane, detectedWords } = checkProfanity(text);

  if (!isProfane) {
    return text;
  }

  let sanitized = text;

  // Replace detected words with asterisks
  for (const word of detectedWords) {
    const regex = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi"
    );
    sanitized = sanitized.replace(regex, "*".repeat(word.length));
  }

  return sanitized;
}

/**
 * Validate form input for profanity
 * @param fieldName - Name of the form field
 * @param value - The input value
 * @returns Validation result with error message if profane
 */
export function validateInputForProfanity(
  fieldName: string,
  value: string
): {
  isValid: boolean;
  errorMessage?: string;
  sanitizedValue?: string;
} {
  const { isProfane, severity, detectedWords } = checkProfanity(value);

  if (!isProfane) {
    return { isValid: true };
  }

  // Debug logging for development
  devLog(`Profanity detected in ${fieldName}:`, {
    value,
    detectedWords,
    severity,
  });

  const sanitizedValue = sanitizeProfanity(value);

  // Create error message with specific flagged words
  const flaggedWords = detectedWords.join(", ");
  let errorMessage = `The ${fieldName} contains inappropriate language. `;

  if (detectedWords.length === 1) {
    errorMessage += `The word "${flaggedWords}" is not allowed. `;
  } else {
    errorMessage += `The words "${flaggedWords}" are not allowed. `;
  }

  if (severity === "high") {
    errorMessage += "Please use appropriate language.";
  } else if (severity === "medium") {
    errorMessage += "Please review and use more appropriate language.";
  } else {
    errorMessage += "Please consider using more appropriate language.";
  }

  return {
    isValid: false,
    errorMessage,
    sanitizedValue,
  };
}

/**
 * Check if a message should be automatically rejected
 * @param text - The text to check
 * @returns True if message should be rejected
 */
export function shouldRejectMessage(text: string): boolean {
  const { isProfane, severity } = checkProfanity(text);
  return isProfane && severity === "high";
}
