# Excel Player Import - Implementation Summary

**Date:** 2025-01-XX  
**Status:** ✅ Complete

## Overview

This document describes the Excel player import feature that allows admins to bulk import players, parents, and teams from an Excel file directly into the Supabase database.

## Features Implemented

### 1. Excel Template Generation
- **Location:** `src/lib/excel-template.ts`
- **API:** `/api/admin/import/template`
- Admins can download a pre-formatted Excel template with sample data
- Template includes all required columns and example rows

### 2. Excel File Parsing & Validation
- **Location:** `src/lib/excel-parser.ts`
- **API:** `/api/admin/import/parse`
- Parses `.xlsx` files and validates:
  - Required fields (player name, DOB, gender, team, season, parent email)
  - Email format validation
  - Date format validation (YYYY-MM-DD)
  - Field normalization and error collection

### 3. Preview/Diff UI
- **Location:** `src/app/api/admin/import/preview/route.ts`
- **UI:** `src/app/admin/import/page.tsx`
- Shows preview of changes before import:
  - **New**: New records to be created
  - **Update**: Existing records to be updated
  - **No Change**: Records that match existing data
  - **Error**: Records with validation errors
- Displays proposed changes for review

### 4. Import Execution
- **Location:** `src/app/api/admin/import/execute/route.ts`
- Performs idempotent upserts:
  - **Teams**: Matched by (name, season), creates if not exists
  - **Parents**: Matched by email (unique), creates if not exists
  - **Players**: Matched by `external_id` (if provided) or (name + DOB), creates/updates accordingly
- Links players to teams and parents
- Handles batch processing (100 rows at a time)

### 5. Parent Invite Emails
- Automatically sends Supabase Auth invites to new parents
- Uses `inviteUserByEmail()` API
- Redirects to `/parent/profile` after email confirmation
- Includes metadata about the import

### 6. Import Logging
- **Migration:** `docs/migrations/add_external_id_and_imports_table.sql`
- Creates `imports` table to track import jobs
- Logs success/failure counts, errors, and timestamps
- RLS policies ensure only admins can view logs

## Database Changes

### New Columns
- `players.external_id` (text, unique, nullable) - For matching with external systems

### New Tables
- `imports` - Tracks import job history
  - Columns: id, status, created_by, summary_json, error_json, started_at, finished_at

### Constraints
- `players.external_id` has unique index (allows nulls)
- `parents.email` is unique (enforced by existing schema)
- `teams.name` is unique (note: if seasons matter, include season in team name)

## Security

- All endpoints require admin authentication
- Admin role checked via `users.role = 'admin'`
- Uses `supabaseAdmin` service role for database operations
- RLS policies on `imports` table restrict access to admins only

## Excel Template Format

### Required Columns
- `player_first_name`, `player_last_name`
- `player_dob` (YYYY-MM-DD format)
- `player_gender` (M/F/Other)
- `team_name`, `season`
- `parent1_email`, `parent1_first_name`, `parent1_last_name`

### Optional Columns
- `player_external_id` - For deterministic matching
- `jersey_number`
- `parent1_phone`, `parent1_relationship`
- `parent2_email`, `parent2_first_name`, `parent2_last_name`, `parent2_phone`, `parent2_relationship`

## Usage Flow

1. **Download Template**: Admin clicks "Download Template" button
2. **Fill Excel**: Admin fills template with player data
3. **Upload**: Admin uploads filled Excel file
4. **Preview**: System parses file and shows preview of changes
5. **Review**: Admin reviews preview (new/update/no change/error status)
6. **Import**: Admin clicks "Import All Rows" to execute
7. **Results**: System shows summary (created/updated counts, errors)

## Known Limitations

1. **Team Name Uniqueness**: `teams.name` is unique, so if you need the same team name for different seasons, include the season in the team name (e.g., "U14 Boys Elite - 2025 Spring")

2. **Single Parent Link**: Players currently link to one `parent_id`. Parent 2 is created in the database but not linked to the player. This is a schema limitation.

3. **Coach Email Requirement**: Teams require a `coach_email`. The import uses `ADMIN_NOTIFICATIONS_TO` or a placeholder. Admins should update coach assignments after import.

4. **Claim Flow**: Claim-code flow for parents without email in file is deferred to a future enhancement. Current implementation requires email addresses.

## API Endpoints

### GET `/api/admin/import/template`
- Downloads Excel template
- Requires admin authentication

### POST `/api/admin/import/parse`
- Parses uploaded Excel file
- Returns validation errors and warnings
- Requires admin authentication

### POST `/api/admin/import/preview`
- Generates preview of import changes
- Compares with existing database records
- Requires admin authentication

### POST `/api/admin/import/execute`
- Executes the import
- Creates/updates players, parents, teams
- Sends invite emails to new parents
- Requires admin authentication

## Files Created/Modified

### New Files
- `src/lib/excel-template.ts` - Template generation
- `src/lib/excel-parser.ts` - Excel parsing and validation
- `src/app/api/admin/import/template/route.ts` - Template download API
- `src/app/api/admin/import/parse/route.ts` - Parse API
- `src/app/api/admin/import/preview/route.ts` - Preview API
- `src/app/api/admin/import/execute/route.ts` - Import execution API
- `src/app/admin/import/page.tsx` - Import UI page
- `docs/migrations/add_external_id_and_imports_table.sql` - Database migration

### Modified Files
- `src/components/Navbar.tsx` - Added "Import" link to admin menu
- `package.json` - Added `xlsx` dependency

## Testing Checklist

- [ ] Download template and verify format
- [ ] Upload valid Excel file with all required fields
- [ ] Verify preview shows correct new/update/no change status
- [ ] Execute import and verify data in database
- [ ] Verify new parents receive invite emails
- [ ] Test with existing players (should update, not duplicate)
- [ ] Test with external_id matching
- [ ] Test error handling (invalid email, missing fields, etc.)
- [ ] Verify import logs are created in `imports` table
- [ ] Test admin-only access (non-admins should be blocked)

## Next Steps / Future Enhancements

1. **Claim Code Flow**: Allow parents without email to claim their player using a code
2. **Multiple Parents**: Support linking multiple parents to a player
3. **Team Season Handling**: Better handling of teams across seasons
4. **Import History UI**: Display past imports with details
5. **Dry Run Mode**: Preview-only mode that doesn't actually import
6. **Duplicate Detection**: Enhanced duplicate detection and resolution UI
7. **Batch Invite Emails**: Queue invite emails for background processing

## Dependencies

- `xlsx@0.18.5` - Excel file parsing and generation

