# WCS Basketball v2.0 - Changelog

## 🚀 Version 2.10.14 - Combined Invoice Feature & Invoice Improvements

**Release Date**: January 9, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (115 pages generated successfully)

---

### ✨ Added

- **Combined Invoice Feature**:
  - **Feature**: Parents can now view and download a single invoice with all payments for all their children
  - **Implementation**: 
    - Created new API endpoint `/api/send-parent-invoice` that generates consolidated invoices
    - Added "View Full Invoice" button linking to payment page showing all children's payments
    - Added "Email Full Invoice" button that sends combined invoice PDF via email
    - Invoice table includes Player column showing first names for each payment
    - Displays all payments across multiple children and months in single invoice
  - **Files Modified**:
    - `src/app/api/send-parent-invoice/route.ts`: NEW - Combined invoice API endpoint
    - `src/components/parent/PaymentHistoryTable.tsx`: Added combined invoice buttons
    - `src/app/payment/[playerId]/page.tsx`: Updated to show all payments from all children
    - `src/lib/pdf/invoice.ts`: Updated to support Player column in PDF
  - **Impact**: Parents can now get a single comprehensive invoice for all their children instead of separate invoices per child

- **Invoice Back Button**:
  - **Feature**: Added back button to invoice page for easy navigation
  - **Implementation**: Button positioned between invoice content and checkout section, styled as standard gray button
  - **Files Modified**:
    - `src/app/payment/[playerId]/page.tsx`: Added back button with router.back() functionality
  - **Impact**: Improved navigation UX on invoice page

### 🔧 Fixed

- **Invoice Table Display Issue**:
  - **Issue**: Invoice table was not displaying payment information on HTML invoice page
  - **Root Cause**: Container had `overflow-hidden` and fixed height that was clipping table content
  - **Fix**: 
    - Removed `overflow-hidden` from container
    - Removed fixed height constraint
    - Added explicit `display: "table"` and `visibility: "visible"` styles
    - Updated payment fetching to use server-side API for reliable data access
  - **Files Modified**:
    - `src/app/payment/[playerId]/page.tsx`: Fixed container styles and payment data fetching
  - **Impact**: Invoice table now correctly displays all payment rows with dates, player names, descriptions, prices, quantities, and amounts

### 🔄 Changed

- **Team Logo Removal**:
  - **Change**: Removed team logos from all invoice forms (HTML and PDF)
  - **Implementation**: Removed team logo rendering code from both HTML invoice page and PDF generation
  - **Files Modified**:
    - `src/app/payment/[playerId]/page.tsx`: Removed team logo image from invoice header
    - `src/lib/pdf/invoice.ts`: Removed team logo embedding code
  - **Impact**: Cleaner invoice design with only WCS logo in header

- **Multiple Teams Invoice Display**:
  - **Change**: Invoice now hides Team line when parent has children on multiple teams
  - **Implementation**: Added `hasMultipleTeams` state that checks if children have different team_ids
  - **Files Modified**:
    - `src/app/payment/[playerId]/page.tsx`: Added team checking logic and conditional Team line display
  - **Impact**: Invoice only shows team information when all children are on the same team

- **Players Label Update**:
  - **Change**: Changed invoice label from "Children:" to "Players:" and display only first names
  - **Implementation**: Updated label text and extracted first names from full names using split(' ')[0]
  - **Files Modified**:
    - `src/app/payment/[playerId]/page.tsx`: Updated label and name display logic
  - **Impact**: More consistent terminology and cleaner display (e.g., "7 Players: Teegan, Tatum, Bernie..." instead of full names)

### 🔒 Security

- **Security Audit**: ✅ Passed
- **No new security issues introduced** in code changes
- All changes are UI/UX improvements and invoice generation with no security implications

### 📝 Documentation Updates

- `docs/CHANGELOG.md`: Added version 2.10.14 entry
- `docs/CHANGELOG_ENTRIES_FOR_SUPABASE.md`: Updated with new entries

---

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
