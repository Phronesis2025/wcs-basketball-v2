// src/lib/excel-parser.ts
// Utility to parse and validate Excel files for player import

import * as XLSX from "xlsx";

// Types for parsed Excel data
export interface ParsedPlayerRow {
  rowNumber: number; // 1-based row number (excluding header)
  player_external_id?: string;
  player_first_name: string;
  player_last_name: string;
  player_dob: string; // YYYY-MM-DD format
  player_gender: string; // M/F/Other
  jersey_number?: string;
  grade?: string;
  school_name?: string;
  shirt_size?: string;
  position_preference?: string;
  previous_experience?: string;
  medical_allergies?: string;
  medical_conditions?: string;
  medical_medications?: string;
  doctor_name?: string;
  doctor_phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  team_name: string;
  season: string;
  parent1_email: string;
  parent1_first_name: string;
  parent1_last_name: string;
  parent1_phone?: string;
  parent1_relationship?: string;
  parent1_address_line1?: string;
  parent1_address_line2?: string;
  parent1_city?: string;
  parent1_state?: string;
  parent1_zip?: string;
  parent1_emergency_contact?: string;
  parent1_emergency_phone?: string;
  parent2_email?: string;
  parent2_first_name?: string;
  parent2_last_name?: string;
  parent2_phone?: string;
  parent2_relationship?: string;
  parent2_address_line1?: string;
  parent2_address_line2?: string;
  parent2_city?: string;
  parent2_state?: string;
  parent2_zip?: string;
  parent2_emergency_contact?: string;
  parent2_emergency_phone?: string;
}

export interface ValidationError {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ParsedExcelData {
  rows: ParsedPlayerRow[];
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Type for raw Excel row data from XLSX library
type RawExcelRow = Record<string, string | number | undefined>;

// Type for normalized row data (all fields optional, matching ParsedPlayerRow structure)
interface NormalizedRowData {
  player_external_id?: string;
  player_first_name?: string;
  player_last_name?: string;
  player_dob?: string;
  player_gender?: string;
  jersey_number?: string;
  grade?: string;
  school_name?: string;
  shirt_size?: string;
  position_preference?: string;
  previous_experience?: string;
  medical_allergies?: string;
  medical_conditions?: string;
  medical_medications?: string;
  doctor_name?: string;
  doctor_phone?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  team_name?: string;
  season?: string;
  parent1_email?: string;
  parent1_first_name?: string;
  parent1_last_name?: string;
  parent1_phone?: string;
  parent1_relationship?: string;
  parent1_address_line1?: string;
  parent1_address_line2?: string;
  parent1_city?: string;
  parent1_state?: string;
  parent1_zip?: string;
  parent1_emergency_contact?: string;
  parent1_emergency_phone?: string;
  parent2_email?: string;
  parent2_first_name?: string;
  parent2_last_name?: string;
  parent2_phone?: string;
  parent2_relationship?: string;
  parent2_address_line1?: string;
  parent2_address_line2?: string;
  parent2_city?: string;
  parent2_state?: string;
  parent2_zip?: string;
  parent2_emergency_contact?: string;
  parent2_emergency_phone?: string;
}

/**
 * Parses an Excel file and returns structured data with validation
 */
export function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        // Parse Excel file
        const workbook = XLSX.read(data, { type: "binary" });

        // Find the "Players" sheet or use first sheet
        const sheetName = workbook.SheetNames.find(
          (name) => name.toLowerCase() === "players"
        ) || workbook.SheetNames[0];

        if (!sheetName) {
          reject(new Error("No sheets found in Excel file"));
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "", // Default value for empty cells
          raw: false, // Return as strings for consistent parsing
        }) as RawExcelRow[];

        // Validate and parse rows
        const rows: ParsedPlayerRow[] = [];
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        jsonData.forEach((row: RawExcelRow, index: number) => {
          const rowNumber = index + 2; // +2 because row 1 is header, Excel rows are 1-based

          // Normalize field names (handle variations in header names)
          const normalizedRow = normalizeRowData(row);

          // Validate required fields
          const rowErrors = validateRow(normalizedRow, rowNumber);
          errors.push(...rowErrors);

          // If there are critical errors, skip this row
          const criticalErrors = rowErrors.filter(
            (e) => e.field.startsWith("player_") || e.field === "team_name"
          );
          if (criticalErrors.length > 0) {
            return; // Skip this row
          }

          // Add warnings for optional but recommended fields
          const rowWarnings = validateRowWarnings(normalizedRow, rowNumber);
          warnings.push(...rowWarnings);

          // Parse and add valid row
          rows.push({
            rowNumber,
            player_external_id: normalizedRow.player_external_id?.trim() || undefined,
            player_first_name: normalizedRow.player_first_name?.trim() || "",
            player_last_name: normalizedRow.player_last_name?.trim() || "",
            player_dob: normalizedRow.player_dob?.trim() || "",
            player_gender: normalizedRow.player_gender?.trim() || "",
            jersey_number: normalizedRow.jersey_number?.trim() || undefined,
            grade: normalizedRow.grade?.trim() || undefined,
            school_name: normalizedRow.school_name?.trim() || undefined,
            shirt_size: normalizedRow.shirt_size?.trim() || undefined,
            position_preference: normalizedRow.position_preference?.trim() || undefined,
            previous_experience: normalizedRow.previous_experience?.trim() || undefined,
            medical_allergies: normalizedRow.medical_allergies?.trim() || undefined,
            medical_conditions: normalizedRow.medical_conditions?.trim() || undefined,
            medical_medications: normalizedRow.medical_medications?.trim() || undefined,
            doctor_name: normalizedRow.doctor_name?.trim() || undefined,
            doctor_phone: normalizedRow.doctor_phone?.trim() || undefined,
            emergency_contact: normalizedRow.emergency_contact?.trim() || undefined,
            emergency_phone: normalizedRow.emergency_phone?.trim() || undefined,
            team_name: normalizedRow.team_name?.trim() || "",
            season: normalizedRow.season?.trim() || "",
            parent1_email: normalizedRow.parent1_email?.trim() || "",
            parent1_first_name: normalizedRow.parent1_first_name?.trim() || "",
            parent1_last_name: normalizedRow.parent1_last_name?.trim() || "",
            parent1_phone: normalizedRow.parent1_phone?.trim() || undefined,
            parent1_relationship: normalizedRow.parent1_relationship?.trim() || undefined,
            parent1_address_line1: normalizedRow.parent1_address_line1?.trim() || undefined,
            parent1_address_line2: normalizedRow.parent1_address_line2?.trim() || undefined,
            parent1_city: normalizedRow.parent1_city?.trim() || undefined,
            parent1_state: normalizedRow.parent1_state?.trim() || undefined,
            parent1_zip: normalizedRow.parent1_zip?.trim() || undefined,
            parent1_emergency_contact: normalizedRow.parent1_emergency_contact?.trim() || undefined,
            parent1_emergency_phone: normalizedRow.parent1_emergency_phone?.trim() || undefined,
            parent2_email: normalizedRow.parent2_email?.trim() || undefined,
            parent2_first_name: normalizedRow.parent2_first_name?.trim() || undefined,
            parent2_last_name: normalizedRow.parent2_last_name?.trim() || undefined,
            parent2_phone: normalizedRow.parent2_phone?.trim() || undefined,
            parent2_relationship: normalizedRow.parent2_relationship?.trim() || undefined,
            parent2_address_line1: normalizedRow.parent2_address_line1?.trim() || undefined,
            parent2_address_line2: normalizedRow.parent2_address_line2?.trim() || undefined,
            parent2_city: normalizedRow.parent2_city?.trim() || undefined,
            parent2_state: normalizedRow.parent2_state?.trim() || undefined,
            parent2_zip: normalizedRow.parent2_zip?.trim() || undefined,
            parent2_emergency_contact: normalizedRow.parent2_emergency_contact?.trim() || undefined,
            parent2_emergency_phone: normalizedRow.parent2_emergency_phone?.trim() || undefined,
          });
        });

        resolve({
          rows,
          errors,
          warnings,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Normalizes row data by handling various header name formats
 */
function normalizeRowData(row: RawExcelRow): NormalizedRowData {
  const normalized: NormalizedRowData = {};

  // Map various possible column names to standard names
  const fieldMappings: Record<string, string[]> = {
    player_external_id: ["player_external_id", "external_id", "id"],
    player_first_name: ["player_first_name", "first_name", "player_firstname"],
    player_last_name: ["player_last_name", "last_name", "player_lastname"],
    player_dob: ["player_dob", "dob", "date_of_birth", "birthdate"],
    player_gender: ["player_gender", "gender"],
    jersey_number: ["jersey_number", "jersey", "number"],
    grade: ["grade", "player_grade", "grade_level"],
    school_name: ["school_name", "school", "player_school"],
    shirt_size: ["shirt_size", "size"],
    position_preference: ["position_preference", "position", "preferred_position"],
    previous_experience: ["previous_experience", "experience", "player_experience"],
    medical_allergies: ["medical_allergies", "allergies"],
    medical_conditions: ["medical_conditions", "conditions"],
    medical_medications: ["medical_medications", "medications"],
    doctor_name: ["doctor_name", "doctor"],
    doctor_phone: ["doctor_phone", "doctor_phone_number"],
    emergency_contact: ["emergency_contact", "emergency_contact_name"],
    emergency_phone: ["emergency_phone", "emergency_contact_phone"],
    team_name: ["team_name", "team", "teamname"],
    season: ["season"],
    parent1_email: ["parent1_email", "parent_email", "parent1email"],
    parent1_first_name: ["parent1_first_name", "parent1_firstname", "parent_first_name"],
    parent1_last_name: ["parent1_last_name", "parent1_lastname", "parent_last_name"],
    parent1_phone: ["parent1_phone", "parent_phone", "parent1phone"],
    parent1_relationship: ["parent1_relationship", "parent_relationship"],
    parent1_address_line1: ["parent1_address_line1", "parent1_address", "parent_address_line1", "parent_address"],
    parent1_address_line2: ["parent1_address_line2", "parent_address_line2"],
    parent1_city: ["parent1_city", "parent_city"],
    parent1_state: ["parent1_state", "parent_state"],
    parent1_zip: ["parent1_zip", "parent_zip", "parent1_postal_code"],
    parent1_emergency_contact: ["parent1_emergency_contact", "parent1_emergency_contact_name"],
    parent1_emergency_phone: ["parent1_emergency_phone", "parent1_emergency_contact_phone"],
    parent2_email: ["parent2_email", "parent2email"],
    parent2_first_name: ["parent2_first_name", "parent2_firstname"],
    parent2_last_name: ["parent2_last_name", "parent2_lastname"],
    parent2_phone: ["parent2_phone", "parent2phone"],
    parent2_relationship: ["parent2_relationship"],
    parent2_address_line1: ["parent2_address_line1", "parent2_address"],
    parent2_address_line2: ["parent2_address_line2"],
    parent2_city: ["parent2_city"],
    parent2_state: ["parent2_state"],
    parent2_zip: ["parent2_zip", "parent2_postal_code"],
    parent2_emergency_contact: ["parent2_emergency_contact"],
    parent2_emergency_phone: ["parent2_emergency_phone"],
  };

  // Find matching field for each standard name
  Object.keys(fieldMappings).forEach((standardName) => {
    const possibleNames = fieldMappings[standardName];
    for (const possibleName of possibleNames) {
      const value = row[possibleName];
      if (value !== undefined && value !== "") {
        normalized[standardName as keyof NormalizedRowData] = String(value);
        break;
      }
    }
  });

  return normalized;
}

/**
 * Validates a single row and returns errors
 */
function validateRow(row: NormalizedRowData, rowNumber: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required player fields
  if (!row.player_first_name?.trim()) {
    errors.push({
      rowNumber,
      field: "player_first_name",
      message: "Player first name is required",
    });
  }

  if (!row.player_last_name?.trim()) {
    errors.push({
      rowNumber,
      field: "player_last_name",
      message: "Player last name is required",
    });
  }

  if (!row.player_dob?.trim()) {
    errors.push({
      rowNumber,
      field: "player_dob",
      message: "Player date of birth is required",
    });
  } else {
    // Validate date format (YYYY-MM-DD)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(row.player_dob.trim())) {
      errors.push({
        rowNumber,
        field: "player_dob",
        message: "Date of birth must be in YYYY-MM-DD format",
      });
    } else {
      // Validate date is valid
      const date = new Date(row.player_dob.trim());
      if (isNaN(date.getTime())) {
        errors.push({
          rowNumber,
          field: "player_dob",
          message: "Invalid date format",
        });
      }
    }
  }

  if (!row.player_gender?.trim()) {
    errors.push({
      rowNumber,
      field: "player_gender",
      message: "Player gender is required (M/F/Other)",
    });
  } else {
    const gender = row.player_gender.trim().toUpperCase();
    if (!["M", "F", "OTHER", "MALE", "FEMALE"].includes(gender)) {
      errors.push({
        rowNumber,
        field: "player_gender",
        message: "Gender must be M, F, or Other",
      });
    }
  }

  // Required team fields
  if (!row.team_name?.trim()) {
    errors.push({
      rowNumber,
      field: "team_name",
      message: "Team name is required",
    });
  }

  if (!row.season?.trim()) {
    errors.push({
      rowNumber,
      field: "season",
      message: "Season is required",
    });
  }

  // Required parent1 fields
  if (!row.parent1_email?.trim()) {
    errors.push({
      rowNumber,
      field: "parent1_email",
      message: "Parent 1 email is required",
    });
  } else {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.parent1_email.trim())) {
      errors.push({
        rowNumber,
        field: "parent1_email",
        message: "Invalid email format",
      });
    }
  }

  if (!row.parent1_first_name?.trim()) {
    errors.push({
      rowNumber,
      field: "parent1_first_name",
      message: "Parent 1 first name is required",
    });
  }

  if (!row.parent1_last_name?.trim()) {
    errors.push({
      rowNumber,
      field: "parent1_last_name",
      message: "Parent 1 last name is required",
    });
  }

  // Validate parent2 if provided (all or nothing)
  if (row.parent2_email?.trim() || row.parent2_first_name?.trim() || row.parent2_last_name?.trim()) {
    if (!row.parent2_email?.trim()) {
      errors.push({
        rowNumber,
        field: "parent2_email",
        message: "Parent 2 email is required if other parent 2 fields are provided",
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.parent2_email.trim())) {
        errors.push({
          rowNumber,
          field: "parent2_email",
          message: "Invalid email format for parent 2",
        });
      }
    }

    if (!row.parent2_first_name?.trim()) {
      errors.push({
        rowNumber,
        field: "parent2_first_name",
        message: "Parent 2 first name is required if parent 2 is provided",
      });
    }

    if (!row.parent2_last_name?.trim()) {
      errors.push({
        rowNumber,
        field: "parent2_last_name",
        message: "Parent 2 last name is required if parent 2 is provided",
      });
    }
  }

  return errors;
}

/**
 * Validates optional fields and returns warnings
 */
function validateRowWarnings(row: NormalizedRowData, rowNumber: number): ValidationError[] {
  const warnings: ValidationError[] = [];

  // Warn if jersey_number is missing (optional but recommended)
  if (!row.jersey_number?.trim()) {
    warnings.push({
      rowNumber,
      field: "jersey_number",
      message: "Jersey number is recommended but optional",
    });
  }

  // Warn if parent1_relationship is missing
  if (!row.parent1_relationship?.trim()) {
    warnings.push({
      rowNumber,
      field: "parent1_relationship",
      message: "Parent 1 relationship is recommended but optional",
    });
  }

  return warnings;
}

