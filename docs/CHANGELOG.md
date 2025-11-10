# WCS Basketball v2.0 - Changelog

## 🚀 Version 2.10.13 - Parent Profile Scroll Fix & Team Selector Improvements

**Release Date**: November 9, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (114 pages generated successfully)

---

### 🔧 Fixed

- **Parent Profile Page Scroll Position**:
  - **Issue**: When users refreshed the parent profile page, the browser would maintain the previous scroll position instead of starting at the top
  - **Fix**: Added `useEffect` hook that scrolls to top (0, 0) immediately when the component mounts
  - **Implementation**: Uses `window.scrollTo({ top: 0, left: 0, behavior: 'instant' })` for instant scroll without animation
  - **Files Modified**:
    - `src/app/parent/profile/page.tsx`: Added scroll-to-top effect on component mount
  - **Impact**: Parent profile page now always starts at the top on page load or refresh, improving user experience

- **Team Selector Dropdown Missing on Player Approval**:
  - **Issue**: Team selector dropdown was not showing when approving and assigning pending players
  - **Root Cause**: Dropdown was conditionally rendered only when `compatibleTeams.length > 0`, which could be empty if no compatible teams were found
  - **Fix**: 
    - Team selector dropdown now always shows for pending players
    - If compatible teams are found, shows filtered list
    - If no compatible teams found, shows all active teams as fallback with warning message
    - Improved team filtering logic to handle cases where player has no grade/gender data
  - **Files Modified**:
    - `src/components/dashboard/PlayerPaymentModal.tsx`: Updated team selector logic to always display for pending players
  - **Impact**: Admins can now always assign teams to pending players, even when compatibility filtering returns no results

### ✨ Added

- **Enhanced Grade Normalization**:
  - **Feature**: Grade normalization now handles multiple input formats for the same grade level
  - **Implementation**: Updated `normalizePlayerGrade` function to handle:
    - Plain numbers: "5" → "5th Grade"
    - Ordinal format: "5th" → "5th Grade"
    - Full format: "5th grade" → "5th Grade" (case-insensitive)
  - **Files Modified**:
    - `src/lib/ageValidation.ts`: Enhanced grade normalization with plain number and case-insensitive matching
  - **Impact**: More flexible grade input handling - users can enter "5", "5th", or "5th grade" and all will be correctly normalized to "5th Grade"

### 🔒 Security

- **Security Audit**: ✅ Passed
- **No new security issues introduced** in code changes
- All changes are UI/UX improvements and input normalization with no security implications

### 📝 Documentation Updates

- `docs/CHANGELOG.md`: Added version 2.10.13 entry
- `docs/CHANGELOG_ENTRIES_FOR_SUPABASE.md`: Updated with new entries

---

## 🚀 Version 2.10.12 - Grade-Based Team Assignment System

**Release Date**: November 9, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (114 pages generated successfully)

---

### ✨ Added

- **Grade-Based Team Assignment**:
  - **Feature**: Teams now use grade levels (2nd Grade through U18 High School) instead of age groups (U8-U18)
  - **Implementation**: 
    - Updated team creation/editing modal to show grade level dropdown instead of age group
    - Created new validation functions: `isGradeCompatible`, `getCompatibleTeamsByGrade`, `normalizePlayerGrade`
    - Updated player assignment logic to use grade-based compatibility instead of age-based
    - Added migration API endpoint to convert existing teams from age groups to grade levels
  - **Grade Levels**: 
    - 2nd Grade, 3rd Grade, 4th Grade, 5th Grade, 6th Grade, 7th Grade, 8th Grade, U18 (High School)
  - **Files Modified**:
    - `src/components/dashboard/AddTeamModal.tsx`: Updated dropdown to show grade levels
    - `src/lib/ageValidation.ts`: Added grade-based validation functions, deprecated age-based ones
    - `src/components/dashboard/AddPlayerModal.tsx`: Updated to use grade compatibility
    - `src/components/dashboard/PlayerPaymentModal.tsx`: Updated team filtering for pending players
    - `src/app/api/admin/create-team/route.ts`: Updated validation for grade levels
    - `src/app/api/admin/teams/[id]/route.ts`: Updated validation for grade levels
    - `src/app/api/admin/migrate-teams-to-grades/route.ts`: NEW - Migration endpoint
  - **Impact**: Teams are now organized by school grade level, making it easier for parents to understand team assignments

### 🔧 Changed

- **Team Age Group to Grade Level Migration**:
  - Database constraint updated to allow grade level values instead of age groups
  - All existing teams migrated from U8-U18 to corresponding grade levels:
    - U8 → 2nd Grade
    - U10 → 3rd Grade
    - U12 → 4th Grade
    - U14 → 5th Grade
    - U16 → 6th Grade
  - U18 → U18 (High School)
  - Migration completed via Supabase MCP: `migrate_teams_age_groups_to_grades_complete`
  - **Files Created**:
    - `docs/migrations/2025-01-migrate-age-groups-to-grades.sql`: SQL migration script
    - `docs/migrations/MIGRATION_INSTRUCTIONS.md`: Step-by-step migration guide
  - **Impact**: Existing teams automatically converted to new grade-based system

- **Player-Team Compatibility Logic**:
  - Changed from age-based compatibility to grade-based compatibility
  - Players are now matched to teams based on their grade level instead of calculated age
  - U18 (High School) teams accept players in 9th-12th grade
  - **Files Modified**:
    - `src/lib/ageValidation.ts`: Complete rewrite of compatibility logic
    - `src/components/dashboard/AddPlayerModal.tsx`: Updated validation warnings
    - `src/components/dashboard/PlayerPaymentModal.tsx`: Updated team filtering
  - **Impact**: More accurate team assignments based on school grade levels

### 🔒 Security

- **Security Audit**: ✅ Passed
- **No new security issues introduced** in code changes
- **Database Migration**: Completed safely with constraint updates
- **RLS Policies**: No changes needed - existing policies don't reference specific age_group values
- All changes are UI, validation, and database schema improvements with no security implications

### 📝 Documentation Updates

- `docs/CHANGELOG.md`: Added version 2.10.12 entry
- `docs/CHANGELOG_ENTRIES_FOR_SUPABASE.md`: Updated with new entries
- `docs/DB_SETUP.md`: Updated teams table schema documentation
- `docs/migrations/2025-01-migrate-age-groups-to-grades.sql`: Created migration script
- `docs/migrations/MIGRATION_INSTRUCTIONS.md`: Created migration guide

---
