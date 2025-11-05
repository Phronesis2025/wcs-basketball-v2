// src/lib/excel-template.ts
// Utility to generate Excel template for player import

import * as XLSX from "xlsx";

/**
 * Generates an Excel template file with sample data
 * Returns a Buffer for server-side use
 */
export function generateExcelTemplate(): Buffer {
  // Define the template structure with headers
  const headers = [
    // Player basic info
    "player_external_id", // Optional: external system ID for matching
    "player_first_name",
    "player_last_name",
    "player_dob", // Format: YYYY-MM-DD
    "player_gender", // M/F/Other
    "jersey_number", // Optional
    "grade", // Optional
    "school_name", // Optional
    "shirt_size", // Optional
    "position_preference", // Optional
    "previous_experience", // Optional (1-5)
    // Player medical info
    "medical_allergies", // Optional
    "medical_conditions", // Optional
    "medical_medications", // Optional
    "doctor_name", // Optional
    "doctor_phone", // Optional
    "emergency_contact", // Optional
    "emergency_phone", // Optional
    // Team info
    "team_name",
    "season", // e.g., "2025-2026"
    // Parent 1 info
    "parent1_email",
    "parent1_first_name",
    "parent1_last_name",
    "parent1_phone", // Optional
    "parent1_relationship", // Mother/Father/Guardian
    "parent1_address_line1", // Optional
    "parent1_address_line2", // Optional
    "parent1_city", // Optional
    "parent1_state", // Optional
    "parent1_zip", // Optional
    "parent1_emergency_contact", // Optional
    "parent1_emergency_phone", // Optional
    // Parent 2 info (all optional)
    "parent2_email",
    "parent2_first_name",
    "parent2_last_name",
    "parent2_phone",
    "parent2_relationship",
    "parent2_address_line1",
    "parent2_address_line2",
    "parent2_city",
    "parent2_state",
    "parent2_zip",
    "parent2_emergency_contact",
    "parent2_emergency_phone",
  ];

  // Sample data rows (2-3 examples)
  const sampleRows = [
    [
      "EXT001", // player_external_id
      "John", // player_first_name
      "Doe", // player_last_name
      "2010-05-15", // player_dob
      "M", // player_gender
      "5", // jersey_number
      "5th", // grade
      "Lincoln Elementary", // school_name
      "Youth Medium", // shirt_size
      "Guard", // position_preference
      "3", // previous_experience
      "Peanuts", // medical_allergies
      "", // medical_conditions
      "", // medical_medications
      "Dr. Smith", // doctor_name
      "555-9999", // doctor_phone
      "Grandma Doe", // emergency_contact
      "555-9998", // emergency_phone
      "WCS Falcons", // team_name
      "2025-2026", // season
      "jane.doe@example.com", // parent1_email
      "Jane", // parent1_first_name
      "Doe", // parent1_last_name
      "555-0101", // parent1_phone
      "Mother", // parent1_relationship
      "123 Main St", // parent1_address_line1
      "Apt 4B", // parent1_address_line2
      "Springfield", // parent1_city
      "IL", // parent1_state
      "62701", // parent1_zip
      "Grandma Doe", // parent1_emergency_contact
      "555-9998", // parent1_emergency_phone
      "john.doe@example.com", // parent2_email
      "John", // parent2_first_name
      "Doe", // parent2_last_name
      "555-0102", // parent2_phone
      "Father", // parent2_relationship
      "", // parent2_address_line1
      "", // parent2_address_line2
      "", // parent2_city
      "", // parent2_state
      "", // parent2_zip
      "", // parent2_emergency_contact
      "", // parent2_emergency_phone
    ],
    [
      "EXT002", // player_external_id
      "Sarah", // player_first_name
      "Smith", // player_last_name
      "2011-08-22", // player_dob
      "F", // player_gender
      "12", // jersey_number
      "4th", // grade
      "Washington Elementary", // school_name
      "Youth Small", // shirt_size
      "Forward", // position_preference
      "2", // previous_experience
      "", // medical_allergies
      "", // medical_conditions
      "", // medical_medications
      "", // doctor_name
      "", // doctor_phone
      "", // emergency_contact
      "", // emergency_phone
      "WCS Eagles Elite", // team_name
      "2025-2026", // season
      "mary.smith@example.com", // parent1_email
      "Mary", // parent1_first_name
      "Smith", // parent1_last_name
      "555-0201", // parent1_phone
      "Guardian", // parent1_relationship
      "456 Oak Ave", // parent1_address_line1
      "", // parent1_address_line2
      "Springfield", // parent1_city
      "IL", // parent1_state
      "62702", // parent1_zip
      "", // parent1_emergency_contact
      "", // parent1_emergency_phone
      "", // parent2_email (empty)
      "", // parent2_first_name
      "", // parent2_last_name
      "", // parent2_phone
      "", // parent2_relationship
      "", // parent2_address_line1
      "", // parent2_address_line2
      "", // parent2_city
      "", // parent2_state
      "", // parent2_zip
      "", // parent2_emergency_contact
      "", // parent2_emergency_phone
    ],
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheetData = [headers, ...sampleRows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 18 }, // player_external_id
    { wch: 15 }, // player_first_name
    { wch: 15 }, // player_last_name
    { wch: 12 }, // player_dob
    { wch: 10 }, // player_gender
    { wch: 12 }, // jersey_number
    { wch: 10 }, // grade
    { wch: 20 }, // school_name
    { wch: 15 }, // shirt_size
    { wch: 15 }, // position_preference
    { wch: 18 }, // previous_experience
    { wch: 20 }, // medical_allergies
    { wch: 20 }, // medical_conditions
    { wch: 20 }, // medical_medications
    { wch: 15 }, // doctor_name
    { wch: 15 }, // doctor_phone
    { wch: 18 }, // emergency_contact
    { wch: 15 }, // emergency_phone
    { wch: 20 }, // team_name
    { wch: 15 }, // season
    { wch: 25 }, // parent1_email
    { wch: 15 }, // parent1_first_name
    { wch: 15 }, // parent1_last_name
    { wch: 15 }, // parent1_phone
    { wch: 18 }, // parent1_relationship
    { wch: 20 }, // parent1_address_line1
    { wch: 15 }, // parent1_address_line2
    { wch: 15 }, // parent1_city
    { wch: 10 }, // parent1_state
    { wch: 10 }, // parent1_zip
    { wch: 20 }, // parent1_emergency_contact
    { wch: 15 }, // parent1_emergency_phone
    { wch: 25 }, // parent2_email
    { wch: 15 }, // parent2_first_name
    { wch: 15 }, // parent2_last_name
    { wch: 15 }, // parent2_phone
    { wch: 18 }, // parent2_relationship
    { wch: 20 }, // parent2_address_line1
    { wch: 15 }, // parent2_address_line2
    { wch: 15 }, // parent2_city
    { wch: 10 }, // parent2_state
    { wch: 10 }, // parent2_zip
    { wch: 20 }, // parent2_emergency_contact
    { wch: 15 }, // parent2_emergency_phone
  ];
  worksheet["!cols"] = columnWidths;

  // Add worksheet to workbook with name "Players"
  XLSX.utils.book_append_sheet(workbook, worksheet, "Players");

  // Generate Excel file buffer
  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return excelBuffer;
}

