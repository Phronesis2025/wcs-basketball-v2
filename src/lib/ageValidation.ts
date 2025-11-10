// Age and grade validation utilities for player-team matching

export interface AgeRange {
  min: number;
  max: number;
}

// Define age ranges for each team age group (flexible ranges)
// NOTE: These are kept for backward compatibility. New teams use grade levels.
export const TEAM_AGE_RANGES: Record<string, AgeRange> = {
  U8: { min: 6, max: 8 }, // 6-8 years old
  U10: { min: 8, max: 10 }, // 8-10 years old
  U12: { min: 10, max: 12 }, // 10-12 years old
  U14: { min: 12, max: 14 }, // 12-14 years old
  U16: { min: 14, max: 16 }, // 14-16 years old
  U18: { min: 16, max: 18 }, // 16-18 years old
};

// Valid grade levels for teams (stored in age_group field)
export const VALID_GRADE_LEVELS = [
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "U18 (High School)",
] as const;

// High school grades that map to U18 (High School)
export const HIGH_SCHOOL_GRADES = ["9th", "10th", "11th", "12th"];

/**
 * Normalize player grade to match team grade level format
 * Converts "2nd", "3rd", "5", "5th", "5th grade", etc. to "2nd Grade", "3rd Grade", "5th Grade", etc.
 * Also handles "9th", "10th", "11th", "12th" -> "U18 (High School)"
 */
export function normalizePlayerGrade(playerGrade: string | null | undefined): string | null {
  if (!playerGrade) return null;
  
  const grade = playerGrade.trim();
  
  // If already in full format, return as-is
  if (VALID_GRADE_LEVELS.includes(grade as any)) {
    return grade;
  }
  
  // Handle high school grades
  if (HIGH_SCHOOL_GRADES.some(hs => grade.toLowerCase().includes(hs.toLowerCase()))) {
    return "U18 (High School)";
  }
  
  // Handle plain numbers (e.g., "5" -> "5th Grade")
  const plainNumberMatch = grade.match(/^(\d+)$/);
  if (plainNumberMatch) {
    const num = parseInt(plainNumberMatch[1], 10);
    if (num >= 2 && num <= 8) {
      // Map numbers to ordinal suffixes
      const suffixes: Record<number, string> = {
        2: "nd",
        3: "rd",
        4: "th",
        5: "th",
        6: "th",
        7: "th",
        8: "th",
      };
      return `${num}${suffixes[num]} Grade`;
    }
  }
  
  // Convert short format to full format (e.g., "2nd" -> "2nd Grade", "5th" -> "5th Grade")
  // This also handles "5th grade" (case-insensitive)
  const gradeMatch = grade.match(/^(\d+)(st|nd|rd|th)(\s+grade)?$/i);
  if (gradeMatch) {
    const num = gradeMatch[1];
    const suffix = gradeMatch[2].toLowerCase();
    return `${num}${suffix} Grade`;
  }
  
  // If no match, return original (might be invalid, but let validation handle it)
  return grade;
}

/**
 * Check if a player's grade is compatible with a team's grade level
 * @param playerGrade - Player's grade (e.g., "2nd", "3rd Grade", "9th")
 * @param teamGradeLevel - Team's grade level stored in age_group (e.g., "2nd Grade", "U18 (High School)")
 * @returns Object with compatibility status and message
 */
export function isGradeCompatible(
  playerGrade: string | null | undefined,
  teamGradeLevel: string | null | undefined
): {
  compatible: boolean;
  message: string;
} {
  if (!playerGrade || !teamGradeLevel) {
    return {
      compatible: false,
      message: playerGrade 
        ? "Team grade level is not specified" 
        : "Player grade is required for team assignment",
    };
  }

  const normalizedPlayerGrade = normalizePlayerGrade(playerGrade);
  const normalizedTeamGrade = teamGradeLevel.trim();

  // Direct match
  if (normalizedPlayerGrade === normalizedTeamGrade) {
    return {
      compatible: true,
      message: `Player grade (${playerGrade}) matches team grade level (${normalizedTeamGrade})`,
    };
  }

  // Handle U18 (High School) - accepts 9th, 10th, 11th, 12th grades
  if (normalizedTeamGrade === "U18 (High School)") {
    const playerGradeLower = playerGrade.toLowerCase();
    const isHighSchool = HIGH_SCHOOL_GRADES.some(hs => 
      playerGradeLower.includes(hs.toLowerCase())
    );
    
    if (isHighSchool) {
      return {
        compatible: true,
        message: `Player grade (${playerGrade}) is compatible with U18 (High School) team`,
      };
    } else {
      return {
        compatible: false,
        message: `Player grade (${playerGrade}) is not compatible with U18 (High School) team. High school teams accept 9th-12th grade players.`,
      };
    }
  }

  // If player is high school grade but team is not U18
  const playerGradeLower = playerGrade.toLowerCase();
  const isPlayerHighSchool = HIGH_SCHOOL_GRADES.some(hs => 
    playerGradeLower.includes(hs.toLowerCase())
  );
  if (isPlayerHighSchool && normalizedTeamGrade !== "U18 (High School)") {
    return {
      compatible: false,
      message: `Player grade (${playerGrade}) is high school level but team is ${normalizedTeamGrade}. High school players should be assigned to U18 (High School) teams.`,
    };
  }

  // Grade mismatch
  return {
    compatible: false,
    message: `Player grade (${playerGrade}) does not match team grade level (${normalizedTeamGrade})`,
  };
}

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth string (YYYY-MM-DD format)
 * @returns Age in years
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Check if a player's age is compatible with a team's age group
 * @param playerAge - Player's age in years
 * @param teamAgeGroup - Team's age group (e.g., 'U10', 'U12')
 * @returns Object with compatibility status and message
 */
export function isAgeCompatible(
  playerAge: number,
  teamAgeGroup: string
): {
  compatible: boolean;
  message: string;
} {
  const ageRange = TEAM_AGE_RANGES[teamAgeGroup];

  if (!ageRange) {
    return {
      compatible: false,
      message: `Unknown age group: ${teamAgeGroup}`,
    };
  }

  if (playerAge < ageRange.min) {
    return {
      compatible: false,
      message: `Player is too young. ${teamAgeGroup} teams require ages ${ageRange.min}-${ageRange.max}, but player is ${playerAge} years old.`,
    };
  }

  if (playerAge > ageRange.max) {
    return {
      compatible: false,
      message: `Player is too old. ${teamAgeGroup} teams require ages ${ageRange.min}-${ageRange.max}, but player is ${playerAge} years old.`,
    };
  }

  return {
    compatible: true,
    message: `Player age (${playerAge}) is compatible with ${teamAgeGroup} team (ages ${ageRange.min}-${ageRange.max})`,
  };
}

/**
 * Validate date of birth
 * @param dateOfBirth - Date of birth string
 * @returns Object with validation status and message
 */
export function validateDateOfBirth(dateOfBirth: string): {
  valid: boolean;
  message: string;
  age?: number;
} {
  if (!dateOfBirth) {
    return {
      valid: false,
      message: "Date of birth is required",
    };
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return {
      valid: false,
      message: "Invalid date format",
    };
  }

  // Check if date is in the future
  if (birthDate > today) {
    return {
      valid: false,
      message: "Date of birth cannot be in the future",
    };
  }

  // Check if date is too far in the past (reasonable limit)
  const maxAge = 100;
  const minBirthDate = new Date();
  minBirthDate.setFullYear(today.getFullYear() - maxAge);

  if (birthDate < minBirthDate) {
    return {
      valid: false,
      message: "Date of birth is too far in the past",
    };
  }

  const age = calculateAge(dateOfBirth);

  return {
    valid: true,
    message: "Valid date of birth",
    age,
  };
}

/**
 * Check if a player's gender is compatible with a team's gender
 * @param playerGender - Player's gender
 * @param teamGender - Team's gender
 * @returns Object with compatibility status and message
 */
export function isGenderCompatible(
  playerGender: string,
  teamGender: string
): {
  compatible: boolean;
  message: string;
} {
  // If no gender specified for player, allow selection but show warning
  if (!playerGender) {
    return {
      compatible: true,
      message: `Please select player gender to ensure team compatibility`,
    };
  }

  // If team gender is "Mixed" or "Coed", any gender is compatible
  if (
    teamGender.toLowerCase() === "mixed" ||
    teamGender.toLowerCase() === "coed"
  ) {
    return {
      compatible: true,
      message: `Player gender (${playerGender}) is compatible with ${teamGender} team`,
    };
  }

  // Handle specific gender matching for Boys/Girls teams
  const playerGenderLower = playerGender.toLowerCase();
  const teamGenderLower = teamGender.toLowerCase();

  // Map player gender to team gender compatibility
  if (playerGenderLower === "male" && teamGenderLower === "boys") {
    return {
      compatible: true,
      message: `Player gender (${playerGender}) matches team gender (${teamGender})`,
    };
  }

  if (playerGenderLower === "female" && teamGenderLower === "girls") {
    return {
      compatible: true,
      message: `Player gender (${playerGender}) matches team gender (${teamGender})`,
    };
  }

  // If player gender doesn't match team gender, it's incompatible
  if (playerGenderLower === "male" && teamGenderLower === "girls") {
    return {
      compatible: false,
      message: `Player gender (${playerGender}) is not compatible with ${teamGender} team`,
    };
  }

  if (playerGenderLower === "female" && teamGenderLower === "boys") {
    return {
      compatible: false,
      message: `Player gender (${playerGender}) is not compatible with ${teamGender} team`,
    };
  }

  // Handle "Other" gender - allow with Mixed/Coed teams, but not with Boys/Girls teams
  if (playerGenderLower === "other") {
    if (teamGenderLower === "boys" || teamGenderLower === "girls") {
      return {
        compatible: false,
        message: `Player gender (${playerGender}) is not compatible with ${teamGender} team`,
      };
    }
    return {
      compatible: true,
      message: `Player gender (${playerGender}) is compatible with ${teamGender} team`,
    };
  }

  // Fallback for any other cases
  return {
    compatible: false,
    message: `Player gender (${playerGender}) does not match team gender (${teamGender})`,
  };
}

/**
 * Get compatible teams for a player's age and gender
 * @param playerAge - Player's age in years
 * @param playerGender - Player's gender
 * @param teams - Array of teams with age_group and gender properties
 * @returns Array of compatible teams
 * @deprecated Use getCompatibleTeamsByGrade instead for grade-based matching
 */
export function getCompatibleTeams(
  playerAge: number,
  playerGender: string,
  teams: Array<{ id: string; name: string; age_group: string; gender: string }>
): Array<{
  id: string;
  name: string;
  age_group: string;
  gender: string;
  compatible: boolean;
  message: string;
}> {
  return teams.map((team) => {
    const ageCompatibility = isAgeCompatible(playerAge, team.age_group);
    const genderCompatibility = isGenderCompatible(playerGender, team.gender);

    const compatible =
      ageCompatibility.compatible && genderCompatibility.compatible;

    let message = "";
    if (!ageCompatibility.compatible) {
      message = ageCompatibility.message;
    } else if (!genderCompatibility.compatible) {
      message = genderCompatibility.message;
    } else {
      message = `Player is compatible with this team`;
    }

    return {
      id: team.id,
      name: team.name,
      age_group: team.age_group,
      gender: team.gender,
      compatible,
      message,
    };
  });
}

/**
 * Get compatible teams for a player's grade and gender
 * @param playerGrade - Player's grade (e.g., "2nd", "3rd Grade", "9th")
 * @param playerGender - Player's gender
 * @param teams - Array of teams with age_group (storing grade level) and gender properties
 * @returns Array of compatible teams
 */
export function getCompatibleTeamsByGrade(
  playerGrade: string | null | undefined,
  playerGender: string,
  teams: Array<{ id: string; name: string; age_group: string; gender: string }>
): Array<{
  id: string;
  name: string;
  age_group: string;
  gender: string;
  compatible: boolean;
  message: string;
}> {
  return teams.map((team) => {
    const gradeCompatibility = isGradeCompatible(playerGrade, team.age_group);
    const genderCompatibility = isGenderCompatible(playerGender, team.gender);

    const compatible =
      gradeCompatibility.compatible && genderCompatibility.compatible;

    let message = "";
    if (!gradeCompatibility.compatible) {
      message = gradeCompatibility.message;
    } else if (!genderCompatibility.compatible) {
      message = genderCompatibility.message;
    } else {
      message = `Player is compatible with this team`;
    }

    return {
      id: team.id,
      name: team.name,
      age_group: team.age_group,
      gender: team.gender,
      compatible,
      message,
    };
  });
}
