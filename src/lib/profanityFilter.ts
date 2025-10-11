/**
 * Profanity Filter Utility for WCS v2.0
 *
 * This utility provides comprehensive content filtering to detect and prevent
 * inappropriate language, profanity, and sexual content in user inputs.
 */

/**
 * Comprehensive list of inappropriate words and phrases
 * Categories: profanity, sexual content, hate speech, violence
 */
const PROFANITY_WORDS = new Set([
  // Common profanity
  "damn",
  "hell",
  "crap",
  "shit",
  "fuck",
  "bitch",
  "ass",
  "asshole",
  "bastard",
  "piss",
  "pissed",
  "dick",
  "cock",
  "pussy",
  "whore",
  "slut",
  "fag",
  "faggot",
  "nigger",
  "nigga",
  "retard",
  "retarded",

  // Sexual content
  "sex",
  "sexual",
  "porn",
  "pornography",
  "masturbat",
  "orgasm",
  "penis",
  "vagina",
  "breast",
  "boob",
  "tits",
  "nude",
  "naked",
  "strip",
  "stripper",
  "prostitut",
  "hooker",
  "escort",

  // Violence and threats
  "kill",
  "murder",
  "suicide",
  "bomb",
  "explosive",
  "weapon",
  "gun",
  "shoot",
  "stab",
  "stabbed",
  "blood",
  "violence",
  "threat",
  "threaten",
  "harm",
  "hurt",
  "injure",

  // Hate speech
  "hate",
  "racist",
  "racism",
  "discriminat",
  "prejudice",
  "supremacist",
  "nazi",
  "hitler",
  "genocide",

  // Drug-related
  "drug",
  "cocaine",
  "heroin",
  "marijuana",
  "weed",
  "cannabis",
  "meth",
  "crack",
  "addict",
  "overdose",
  "high",
  "stoned",

  // Additional variations and common misspellings
  "f*ck",
  "f**k",
  "f***",
  "sh*t",
  "s**t",
  "a**",
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
  "f*g",
  "f**g",
  "f***ot",
  "n*gger",
  "n**ger",
  "n***a",
  "r*tard",
  "r**ard",
  "r***ard",
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

    // Direct match
    if (PROFANITY_WORDS.has(word)) {
      detectedWords.push(word);
      continue;
    }

    // Check for partial matches (for compound words) using word boundaries
    for (const profaneWord of PROFANITY_WORDS) {
      // Use word boundary regex to avoid false positives like "pass" matching "ass"
      const wordBoundaryRegex = new RegExp(
        `\\b${profaneWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      );
      if (wordBoundaryRegex.test(word)) {
        detectedWords.push(word);
        break;
      }
    }
  }

  // Determine severity
  let severity: "low" | "medium" | "high" = "low";
  if (detectedWords.length > 0) {
    const highSeverityWords = [
      "fuck",
      "shit",
      "bitch",
      "nigger",
      "faggot",
      "kill",
      "murder",
    ];
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
  const { isProfane, severity } = checkProfanity(value);

  if (!isProfane) {
    return { isValid: true };
  }

  const sanitizedValue = sanitizeProfanity(value);

  let errorMessage = `The ${fieldName} contains inappropriate language. `;

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
