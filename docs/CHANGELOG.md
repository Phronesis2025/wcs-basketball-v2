# WCS Basketball v2.0 - Changelog

## 🚀 Version 2.10.21 - About Page Enhancements & Changelog Fix

**Release Date**: January 13, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (130 pages generated successfully)

---

### ✨ Added

- **About Page Visual Enhancements**:
  - Added historical team photo (IMG_9487.jpeg) to History section with black and white effect and gradient overlay
  - Added boys and girls team photos to Mission section with gradient overlays
  - Added four historical logos below hero section paragraph, evenly spaced
  - All images properly sized and styled to match page design
  - Files Modified:
    - `src/app/about/page.tsx`

### 🔧 Fixed

- **Changelog Loading Issue**:
  - Fixed changelog not loading in club management Monitor tab
  - Updated `fetchChangelog` function to properly extract data from wrapped API response
  - Now uses `extractApiResponseData` helper for consistent response handling
  - Files Modified:
    - `src/lib/changelogActions.ts`

### 📝 Documentation

- **Security Audit Update**:
  - Updated security audit documentation with January 13, 2025 review
  - No new security vulnerabilities found
  - Supabase advisors reviewed - same recommendations as previous review
  - Files Modified:
    - `docs/security/SECURITY_AUDITS.md`

### 🔒 Security

- **Security Review**:
  - Completed security check - no new vulnerabilities found
  - Supabase security advisor: 1 WARN (leaked password protection - manual dashboard config required)
  - Supabase performance advisor: 24 INFO (unused indexes - low priority, no action needed)
  - All existing security measures verified

---

## 🚀 Version 2.10.20 - About Page Redesign & Navbar Updates

**Release Date**: January 13, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (130 pages generated successfully)

---

### ✨ Added

- **About Page Redesign**:
  - Complete redesign of About page to match home page modern dark theme
  - New hero section with gradient text and improved typography
  - Mission section with badge, heading, and divider matching home page style
  - History section restructured with matching header format
  - Values section with improved card styling and hover effects
  - Background gradient effects and glassmorphism styling
  - Files Modified:
    - `src/app/about/page.tsx`

- **Navbar Consistency**:
  - Navbar now matches home page style on About page
  - Dark theme applied to About page navbar (matching home page)
  - Consistent styling across home and about pages
  - Mobile menu updated with dark theme support
  - Files Modified:
    - `src/components/Navbar.tsx`

### 🔧 Fixed

- **TypeScript Error**:
  - Fixed image property type error in About page values section
  - Added proper type checking for image property
  - Files Modified:
    - `src/app/about/page.tsx`

### 📝 Documentation

- **Security Audit Update**:
  - Updated security audit documentation with January 2025 review
  - Documented Supabase advisor findings (leaked password protection recommendation)
  - Documented unused index findings (INFO level, low priority)
  - Files Modified:
    - `docs/security/SECURITY_AUDITS.md`

### 🔒 Security

- **Security Review**:
  - Completed security check - no new vulnerabilities found
  - Supabase advisors reviewed - 1 recommendation (leaked password protection - manual dashboard config)
  - Performance advisors reviewed - 24 unused indexes (INFO level, no action required)
  - All existing security measures verified and documented

---

## 🚀 Version 2.10.19 - Practice Drill PDF Download Feature

**Release Date**: January 13, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (125 pages generated successfully)

---

### ✨ Added

- **Practice Drill PDF Download Feature**:
  - Added PDF download button to Practice drill modal header
  - Users can download formatted PDFs of any practice drill
  - PDFs include all drill details: skills, equipment, duration, benefits, and instructions
  - PDFs use Bebas font for headers and Inter font for body text, matching modal design
  - Files Created:
    - `src/lib/pdf/puppeteer-drill.ts`
    - `src/app/drills/[id]/page.tsx`
  - Files Modified:
    - `src/app/drills/page.tsx`
    - `src/app/api/generate-drill-pdf/route.ts`

- **Practice Drill PDF Generation API**:
  - Created server-side API route `/api/generate-drill-pdf` for PDF generation
  - Uses Puppeteer to render HTML drill page to PDF
  - Follows same PDF generation approach as invoice PDFs for consistency
  - Includes proper error handling, logging, and loading states
  - Files Created: `src/app/api/generate-drill-pdf/route.ts`

- **Print-Friendly Drill Page**:
  - Created server-side drill page at `/drills/[id]?print=1` for PDF generation
  - Page displays drill content optimized for PDF output
  - Matches modal layout exactly with all drill information
  - Includes category/difficulty badges, skills/equipment/duration with icons
  - Files Created: `src/app/drills/[id]/page.tsx`

- **Fontkit Dependency**:
  - Added fontkit package for custom font support in PDF generation
  - Initially attempted pdf-lib with custom fonts but switched to Puppeteer approach
  - Files Modified: `package.json`

### 🔧 Fixed

- **PDF Generation Build Error**:
  - Fixed "Module not found: Can't resolve 'fs'" error by moving PDF generation to server-side API route
  - Client component now calls API route instead of directly importing server-side code
  - Files Modified:
    - `src/app/api/generate-drill-pdf/route.ts`
    - `src/app/drills/page.tsx`

- **Server Component Styled-JSX Error**:
  - Fixed "'client-only' cannot be imported from a Server Component" error
  - Removed styled-jsx usage from server component
  - Files Modified: `src/app/drills/[id]/page.tsx`

### 🔄 Changed

- **PDF Generation Approach**:
  - Switched from pdf-lib to Puppeteer for drill PDF generation
  - Matches invoice PDF generation approach for consistency
  - Ensures exact visual match with web version
  - Files Modified:
    - `src/lib/pdf/puppeteer-drill.ts`
    - `src/app/api/generate-drill-pdf/route.ts`

- **PDF Content Cleanup**:
  - Removed test banner from PDF output
  - Removed footer from PDF output
  - Removed drill images from PDF output (videos still shown when not printing)
  - Added Puppeteer script to hide navigation elements
  - Files Modified: `src/lib/pdf/puppeteer-drill.ts`

---

## 🚀 Version 2.10.18 - Test Site Banner & Location Verification

**Release Date**: January 12, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (124 pages generated successfully)

---

### ✨ Added

- **Test Site Banner**:
  - Created dismissible banner indicating site is for testing only
  - Amber/yellow warning colors with sticky positioning above navbar
  - Dismiss state persisted in localStorage
  - Appears on all pages to prevent random sign-ups during testing
  - Files Created: `src/components/TestSiteBanner.tsx`
  - Files Modified: `src/app/layout.tsx`

- **Location Verification System**:
  - IP-based geolocation check (50-mile radius from Salina, Kansas)
  - Zip code verification with real-time validation
  - LocationGate component blocks out-of-region users
  - Server-side API route to avoid CORS issues
  - Fallback geocoding using OpenStreetMap Nominatim
  - Files Created:
    - `src/lib/locationVerification.ts`
    - `src/lib/zipCodeVerification.ts`
    - `src/components/LocationGate.tsx`
    - `src/app/api/verify-location/route.ts`
    - `src/app/api/verify-zip/route.ts`

- **Real-Time Zip Code Validation**:
  - Validation occurs as user types (500ms debounce)
  - Error messages display below field when out of radius
  - Submit/Next buttons disabled when zip code invalid
  - Integrated into registration and volunteer forms
  - Files Modified:
    - `src/components/registration/RegistrationWizard.tsx`
    - `src/app/coach-volunteer-signup/page.tsx`
    - `src/lib/schemas/registrationSchema.ts`

### 🔧 Fixed

- **Build Error - Coaches Login Page**:
  - Fixed missing closing div tag causing compilation error
  - Files Modified: `src/app/coaches/login/page.tsx`

- **Location Verification for Mobile Users**:
  - Improved handling of mobile IP geolocation inaccuracies
  - Added authentication bypass for already-logged-in users (admins/coaches)
  - Made location check more lenient (allows access if within radius OR in Kansas state)
  - Added bypass button for legitimate users who are incorrectly blocked
  - Files Modified:
    - `src/components/LocationGate.tsx`
    - `src/app/api/verify-location/route.ts`

### 🔄 Changed

- **Registration Form**:
  - Added zip code field with tooltip explanation
  - Integrated LocationGate wrapper for location check
  - Files Modified: `src/components/registration/RegistrationWizard.tsx`

- **Volunteer Form**:
  - Added real-time zip code validation
  - Integrated LocationGate wrapper
  - Files Modified: `src/app/coach-volunteer-signup/page.tsx`

- **API Routes**:
  - Added server-side zip code verification to all registration endpoints
  - Files Modified:
    - `src/app/api/auth/magic-link/route.ts`
    - `src/app/api/register-player/route.ts`
    - `src/app/api/coach-volunteer-signup/route.ts`

### 🔒 Security

- **RLS and Function Security Fixes**:
  - Enabled Row Level Security (RLS) on `basketball_facts` table with public read access policy
  - Fixed function search_path security issue for `update_updated_at_column` function
  - Addresses Supabase security advisor recommendations

---

## 🚀 Version 2.10.17 - Supabase Email Integration & Build Fixes

**Release Date**: January 11, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (122 pages generated successfully)

---

### ✨ Added

- **Supabase Email Template Documentation**:
  - Created comprehensive Supabase email template for player registration confirmation
  - Template uses user_metadata variables (playerName, grade, gender, parentFirstName)
  - Includes player information card, registration steps, and confirmation button
  - Matches design of Resend email template for consistency
  - File Created: `docs/SUPABASE_EMAIL_TEMPLATE.md`

### 🔄 Changed

- **Email Flow Consolidation**:
  - Disabled duplicate Resend email sends in auth callback route
  - Supabase "Invite User" email template now serves as single welcome/registration email
  - Resend email code preserved (commented out) for potential re-enablement
  - Files Modified: `src/app/auth/callback/route.ts`

### 🔧 Fixed

- **Next.js Build Error - useSearchParams Suspense**:
  - Fixed "useSearchParams() should be wrapped in a suspense boundary" error
  - Wrapped PaymentSelectContent component in Suspense boundary
  - Added loading fallback UI for better user experience
  - Files Modified: `src/app/payment/select/page.tsx`

---

## 🚀 Version 2.10.16 - Invoice PDF Generation & Email Improvements

**Release Date**: January 11, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (120 pages generated successfully)

---

### ✨ Added

- **Puppeteer PDF Generation**:
  - Replaced pdf-lib with Puppeteer for invoice PDF generation
  - PDFs now render directly from HTML invoice page using headless Chrome
  - Ensures exact visual match with web version
  - Added robust waiting logic for async data loading and React rendering
  - Supports both single player and combined parent invoices
  - Files Modified: `src/lib/pdf/puppeteer-invoice.ts`, `src/app/api/send-invoice/route.ts`, `src/app/api/send-parent-invoice/route.ts`

- **Next Payment Due Date in Invoice Emails**:
  - Added "Next Payment Due: MM/DD/YYYY" display in invoice emails
  - Replaced status badge with calculated due date
  - Calculated as 30 days after last paid payment or player creation date
  - For combined invoices, shows earliest due date across all children
  - Files Modified: `src/app/api/send-parent-invoice/route.ts`, `src/app/api/send-invoice/route.ts`

### 🔧 Fixed

- **Invoice PDF Data Population**:
  - Fixed invoice PDF generation not populating payment table data
  - Enhanced Puppeteer waiting logic to wait for API responses
  - Added React rendering completion checks
  - Verifies actual payment data appearance in table cells
  - Added comprehensive debug logging and table state verification
  - Files Modified: `src/lib/pdf/puppeteer-invoice.ts`, `src/app/payment/[playerId]/page.tsx`

- **Invoice PDF Footer Removal**:
  - Fixed footer elements appearing in invoice PDFs
  - Implemented dual approach: direct DOM element removal and CSS injection
  - Added invoice-footer class to footer elements
  - Added print-specific CSS rules
  - Prevents blank pages and ensures only invoice content appears in PDF
  - Files Modified: `src/lib/pdf/puppeteer-invoice.ts`, `src/app/payment/[playerId]/page.tsx`

### 🔄 Changed

- **Unified Invoice Email Functionality**:
  - Both "Email Full Invoice" button (billing tab) and "Email Invoice to Parent" button (payment page) now send the same combined invoice email
  - Updated email text format to match standard invoice format
  - Format: "Please find attached your combined invoice for all your children (X children). There is a remaining balance of $X.XX."
  - Files Modified: `src/app/payment/[playerId]/page.tsx`, `src/app/api/send-parent-invoice/route.ts`

- **Invoice Email Subject Lines**:
  - Improved subject lines for better readability
  - Combined invoices: "Your WCS Combined Invoice • X Players • Balance $X.XX" or "Paid in Full"
  - Single invoices: "Your WCS Invoice • PlayerName • Balance $X.XX" or "Paid in Full"
  - Files Modified: `src/app/api/send-parent-invoice/route.ts`, `src/app/api/send-invoice/route.ts`

- **Invoice Email Layout**:
  - Improved layout with better alignment
  - Changed info rows to use CSS grid (170px label column, flexible value column)
  - Consistent alignment across all email clients
  - Enhanced visual hierarchy and readability
  - Files Modified: `src/app/api/send-parent-invoice/route.ts`, `src/app/api/send-invoice/route.ts`

---

## 🚀 Version 2.10.15 - Responsive Scaling & UI Improvements

**Release Date**: January 10, 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅ (120 pages generated successfully)

---

### ✨ Added

- **Global Responsive Scaling System**:
  - Implemented CSS viewport-based scaling for fonts and images
  - Scales from 65% on mobile (375px) to 100% at 1920px+ using clamp()
  - Preserves all layout, functionality, and responsive breakpoints
  - Pure CSS solution with no JavaScript required
  - Files Modified: `src/app/globals.css`

- **Sign-Out Transition Page**:
  - Created `/parent/sign-out` page with thank you message
  - Displays appreciation for participation and support of WCS Basketball program
  - Auto-redirects to home after 4 seconds with manual "Return to Home" button
  - Files Modified: `src/app/parent/sign-out/page.tsx`, `src/components/Navbar.tsx`

### 🔄 Changed

- **Payment Tab Default State**: All collapsible sections now default to closed
- **Monitor Tab**: Section titles changed to white font color for better visibility
- **Parent Login**: Title changed to "Account login", subtitle updated to use "player's"
- **Parent Profile**: "Add Another Child" button changed to "Add Another Player"
- **Billing Tab**: Removed individual player invoices, only shows combined invoice
- **Payment History Table**: Removed Amount column on tablet view (visible only on xl screens 1280px+)

---

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
