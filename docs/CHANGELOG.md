# WCS Basketball v2.0 - Changelog

## 🚀 Version 2.10.5 - Unread Mentions Notification System

**Release Date**: January 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅

---

### ✨ Added

- **Unread Mentions Notification System**:
  - Added toast notification when admin/coach logs in or opens club management page with unread mentions
  - Toast shows count of unread mentions (e.g., "You have 2 unread mention(s)")
  - Toast appears once per session to avoid duplicate notifications
  - Red circle indicator with unread count displayed next to user's name in club management header
  - Circle positioned in upper right of user name, horizontally aligned
  - Circle shows unread mention count in white text, centered inside
  - Circle is clickable and navigates to Profile tab, opens Messages section, and scrolls to message board
  - Circle automatically hides when all mentions are marked as read
  - Real-time updates when mentions are marked as read in message board

- **Navigation Enhancements**:
  - Clicking red circle navigates from any tab to Profile tab
  - Automatically opens Messages section in Profile tab
  - Smooth scroll to top of message board
  - Retry mechanism ensures messages section is loaded before scrolling

### 🎨 Changed

- **UI/UX Improvements**:
  - Removed existing "unread mention" badge from Messages section in CoachProfile
  - Replaced with red circle indicator in page header for better visibility
  - Increased user name text size to `text-2xl` for better readability
  - Red circle size set to `1.5em` to match text height
  - Circle uses `bg-[red]` color format for consistency

### 🔧 Technical Details

- **Files Modified**:
  - `src/app/admin/club-management/page.tsx`: Added toast notification, red circle indicator, navigation logic, and callback for mention read events
  - `src/components/dashboard/CoachProfile.tsx`: Removed badge, added `initialSection` prop support, added `onMentionRead` callback prop
  - `src/components/dashboard/MessageBoard.tsx`: Added `onMentionRead` callback prop to notify parent when mentions are marked as read

- **State Management**:
  - Added `initialProfileSection` state to track which section to open
  - Added `hasShownToastRef` to prevent duplicate toast notifications
  - Added callback chain: MessageBoard → CoachProfile → ClubManagement to refresh unread count

- **Features**:
  - Toast notification uses `sessionStorage` to track if shown in current session
  - Red circle visibility controlled by `unreadMentions > 0` condition
  - Smooth scroll with retry mechanism (up to 10 attempts) to ensure section is loaded
  - Automatic count refresh when mentions are marked as read

### 📝 Documentation Updates

- `docs/CHANGELOG.md`: Added version 2.10.5 entry
- `docs/UI.md`: Updated with unread mentions notification system details
- `docs/MESSAGE_BOARD_SETUP.md`: Updated with notification features

---

## 🚀 Version 2.10.4 - Resources Management Enhancements

**Release Date**: January 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅

---

### ✨ Added

- **Resources Section Enhancements**:
  - Added overwrite confirmation modal when uploading files with existing names
  - Added delete functionality for resources (admin-only) with confirmation in download modal
  - Created new `resources` Supabase storage bucket for document storage
  - Added API endpoints for resource management: `/api/resources/list`, `/api/resources/upload`, `/api/resources/upload-logo`, `/api/resources/download`, `/api/resources/delete`
  - Implemented categorized resource display: Documents, Team Logos, and Club Logos
  - Added card-based grid layout for resource display with image previews and document icons
  - Added download confirmation modal showing file details (name, size, preview)

- **File Upload Improvements**:
  - Overwrite confirmation dialog when uploading files with duplicate names
  - Support for team logo uploads with automatic filename generation (`logo-{team-name}.ext`)
  - Support for club logo uploads with timestamp-based filenames
  - Document upload support for PDF, DOC, DOCX, XLS, XLSX, TXT, CSV formats (10MB limit)
  - Image upload support for team/club logos (5MB limit)

### 🎨 Changed

- **UI/UX Improvements**:
  - Changed download button color from red to blue (`bg-blue-600`) in DownloadConfirmModal
  - Changed delete button to use `[red]` formatting for consistency
  - Improved modal sizing and scroll prevention (background doesn't scroll when modal is open)
  - Fixed modal height on desktop to ensure buttons are always visible
  - Resource cards now show image previews for logos and document icons for files

- **Performance Optimizations**:
  - Removed unnecessary preload for `hero-basketball.jpg` (used as CSS background and video poster)
  - Fixed browser warning about unused preloaded resource

### 🐛 Fixed

- **Resource Management**:
  - Fixed URL parsing error when listing resources (changed to direct Supabase storage access)
  - Fixed modal syntax errors in UploadDocumentModal and UploadLogoModal
  - Fixed resource categorization logic for team vs club logos based on filename patterns

### 🔒 Security

- **Security Audit**: ✅ PASSED
  - All file uploads validated for type and size
  - Admin-only access enforced for upload and delete operations
  - Row Level Security (RLS) policies configured for storage buckets
  - No exposed API keys or secrets
  - **Known Issue**: `xlsx` package has high severity vulnerability (no fix available)
    - Risk mitigated: Only admins can use Excel import feature
    - File uploads are validated and restricted
    - Monitoring for package updates

### 🔧 Technical Details

- **Files Modified**:
  - `src/components/dashboard/CoachProfile.tsx`: Added Resources section with categorized display
  - `src/components/dashboard/ResourceCard.tsx`: NEW - Card component for resource display
  - `src/components/dashboard/UploadDocumentModal.tsx`: NEW - Document upload modal with overwrite confirmation
  - `src/components/dashboard/UploadLogoModal.tsx`: NEW - Logo upload modal with overwrite confirmation
  - `src/components/dashboard/DownloadConfirmModal.tsx`: Added delete button and updated button colors
  - `src/lib/actions.ts`: Added `listResources`, `uploadResourceDocument`, `downloadResourceFile` server actions
  - `src/app/api/resources/list/route.ts`: NEW - API endpoint for listing resources
  - `src/app/api/resources/upload/route.ts`: NEW - API endpoint for document uploads
  - `src/app/api/resources/upload-logo/route.ts`: NEW - API endpoint for logo uploads
  - `src/app/api/resources/download/route.ts`: NEW - API endpoint for download URLs
  - `src/app/api/resources/delete/route.ts`: NEW - API endpoint for file deletion
  - `src/app/api/resources/check-exists/route.ts`: NEW - API endpoint for checking file existence
  - `src/app/layout.tsx`: Removed unnecessary preload for hero-basketball.jpg

- **Database Changes**:
  - Created new `resources` storage bucket in Supabase
  - Configured RLS policies for public read and admin-only write access

### 📝 Documentation Updates

- `docs/CHANGELOG.md`: Added version 2.10.4 entry
- `docs/CLUB_MANAGEMENT_SYSTEM.md`: Updated with Resources section documentation

---

## 🚀 Version 2.10.3 - Registration Flow Fixes & Email Routing

**Release Date**: January 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅

---

### 🐛 Fixed

- **Registration Flow Email Issues**:
  - Fixed missing parent and admin emails after registration confirmation
  - Added merge logic for Supabase confirmation emails (`token_hash` handler)
  - Fixed email routing in dev mode - all emails now go to `phronesis700@gmail.com` (Resend sandbox requirement)
  - Added parent confirmation and admin notification emails to both `token_hash` and `magic_link_token` handlers
  - Fixed missing `parent_email` on player records during merge (required for Stripe checkout)

- **Registration Redirect Issues**:
  - Fixed redirect from `/registration-ending` to `/registration-pending` after form submission
  - Fixed redirect URL hash fragments (`#`) appearing in callback URLs
  - Changed redirect destination from `/parent/profile?registered=true#` to `/registration-success?player=[name]`
  - Removed hash fragments from Supabase magic link redirects

- **Email Routing**:
  - Updated email routing logic to comply with Resend sandbox limitations
  - In dev mode with sandbox sender (`@resend.dev`), ALL emails route to `phronesis700@gmail.com`
  - Original intended recipients shown in email body for context
  - Production mode (with verified domain) will route emails to actual recipients

### 🗑️ Removed

- **GuestSignupForm Component**:
  - Removed `GuestSignupForm.tsx` component and all references
  - Removed guest signup UI from registration page
  - Simplified registration flow to use only `RegistrationWizard`

- **Twilio SMS Integration**:
  - Removed Twilio imports and SMS notification code from `approve-player` API
  - Removed Twilio imports and SMS notification code from `register-player` API
  - Removed Twilio dependency (no longer needed)

### 🎨 Changed

- **Registration Page**:
  - Removed "Quick Sign Up" section (Google OAuth button and sign-in link)
  - Simplified UI to show only Registration Wizard form
  - Cleaner, more focused registration experience

- **Email Configuration**:
  - Updated email routing to handle Resend sandbox mode correctly
  - Dev mode: All emails → `phronesis700@gmail.com` (sandbox requirement)
  - Production mode: Emails → actual recipients (with verified domain)

### ✨ Added

- **Enhanced Email Notifications**:
  - Parent confirmation emails now sent after successful registration merge
  - Admin notification emails sent for all registration paths
  - Email sending added to both Supabase confirmation and custom magic link flows

- **Testing Documentation**:
  - Created `docs/DEV_TESTING_CHECKLIST.md` - comprehensive pre-testing checklist
  - Updated `docs/COMPLETE_REGISTRATION_FLOW_ROADMAP.md` - converted to step-by-step testing guide
  - Added email routing verification steps

### 🔒 Security

- **Security Audit**: ✅ PASSED
  - No exposed API keys or secrets
  - All environment variables properly used
  - No hardcoded credentials
  - Email routing securely handles dev/prod modes

### 📊 Supabase Advisors

- **Security Recommendations**:
  - ⚠️ Leaked Password Protection disabled (optional feature, medium priority)
  - **Status**: INFO level - optional security enhancement
  - **Remediation**: Can be enabled in Supabase Dashboard → Authentication → Password Security

- **Performance Recommendations**:
  - ℹ️ 24 unused indexes detected (INFO level - low priority)
  - **Status**: No immediate action required
  - **Note**: Indexes may be used in future queries or by application logic
  - No critical performance issues detected

### 🔧 Technical Details

- **Files Modified**:
  - `src/lib/email.ts`: Updated email routing for Resend sandbox compliance
  - `src/app/auth/callback/route.ts`: Added merge logic and email sending for Supabase confirmations
  - `src/app/register/page.tsx`: Removed GuestSignupForm and Quick Sign Up section
  - `src/app/api/approve-player/route.ts`: Removed Twilio SMS code
  - `src/app/api/register-player/route.ts`: Removed Twilio SMS code
  - `src/components/registration/GuestSignupForm.tsx`: DELETED

- **Database Changes**:
  - No schema changes required
  - All fixes use existing table structure

### 📝 Documentation Updates

- `docs/CHANGELOG.md`: Added version 2.10.3 entry
- `docs/CHANGELOG_REGISTRATION_FLOW.md`: Updated with latest fixes
- `docs/COMPLETE_REGISTRATION_FLOW_ROADMAP.md`: Converted to testing guide
- `docs/DEV_TESTING_CHECKLIST.md`: Created comprehensive testing checklist

---

## 🚀 Version 2.10.2 - Practice Drills Enhancements & YouTube Integration

**Release Date**: January 2025  
**Status**: Production Ready ✅  
**Security Score**: 9/10 (Excellent) 🔒  
**Build Status**: Clean Build ✅

---

### ✨ Added

- **Global Practice Drills Support**:
  - Added `is_global` field to `practice_drills` table
  - Admins and coaches can now create drills visible to all teams
  - Removed restriction preventing creation of global drills
  - Global drills automatically appear for all teams when viewing drills

- **YouTube Video Integration for Practice Drills**:
  - Added `youtube_url` field to `practice_drills` table
  - YouTube URL input field in drill creation/editing modal
  - Automatic YouTube thumbnail extraction and display on drill cards
  - Embedded YouTube video player in drill details modal
  - YouTube utilities for video ID extraction, thumbnail URLs, and embed URLs
  - Video section with proper styling in drill details modal

- **Content Security Policy Updates**:
  - Added `img.youtube.com` to allowed image domains in Next.js config
  - Added `https://www.youtube.com` and `https://*.youtube.com` to `frame-src` CSP directive
  - Updated both development and production CSP policies
  - Enables YouTube thumbnail images and embedded videos

### 🎨 Changed

- **Practice Drill Display**:
  - Drill cards now prioritize YouTube thumbnails over uploaded images
  - Drill details modal shows embedded YouTube video when URL is provided
  - Video section added with consistent styling matching other modal sections
  - Full-width video player with proper aspect ratio

- **Profanity Filter**:
  - Removed "explosive" from profanity filter (false positive for sports terminology)
  - Word is now allowed in drill descriptions and other fields

### 🐛 Fixed

- **Practice Drill Creation**:
  - Fixed error preventing creation of global drills ("All Teams" selection)
  - Global drills now properly saved with `team_id = null` and `is_global = true`
  - Updated drill fetching to include global drills for all teams

- **YouTube Integration**:
  - Fixed missing `getYouTubeEmbedUrl` import in drills page
  - Fixed CSP blocking YouTube iframes
  - Fixed Next.js Image component error for YouTube thumbnails

### ⚡ Performance Improvements

- **Database Optimization**:
  - Added indexes for foreign keys on `coach_volunteer_applications` table:
    - `idx_coach_volunteer_applications_child_team_id`
    - `idx_coach_volunteer_applications_reviewed_by`
  - Optimized RLS policies on `coach_volunteer_applications`:
    - Updated "Admins can view all applications" policy to use `(SELECT auth.uid())` pattern
    - Updated "Admins can update applications" policy to use `(SELECT auth.uid())` pattern
  - Improved query performance by preventing auth function re-evaluation per row

### 🔒 Security

- **Security Audit**: ✅ PASSED
  - No exposed API keys or secrets
  - All YouTube integrations properly secured
  - CSP policies updated securely (only specific YouTube domains allowed)
  - Input validation maintained for YouTube URLs

### 📊 Supabase Advisors

- **Performance Issues Fixed**:
  - ✅ Fixed 2 unindexed foreign keys on `coach_volunteer_applications`
  - ✅ Fixed 2 RLS performance issues (auth function re-evaluation)
  - ℹ️ 24 unused indexes detected (INFO level - low priority, no immediate action required)

- **Security Recommendations**:
  - ⚠️ Leaked Password Protection disabled (optional feature, requires manual dashboard configuration)
  - **Priority**: Medium (recommended but not critical)

### 🔧 Technical Details

- **Database Migrations**:
  - `add_is_global_to_practice_drills`: Added `is_global` boolean column
  - `add_youtube_url_to_practice_drills`: Added `youtube_url` text column
  - `fix_coach_volunteer_applications_performance`: Added indexes and optimized RLS policies

- **Files Modified**:
  - `src/lib/profanityFilter.ts`: Removed "explosive" from filter list
  - `src/types/supabase.ts`: Updated `PracticeDrill` type with `youtube_url` and `is_global`
  - `src/lib/drillActions.ts`: Updated to support global drills and YouTube URLs
  - `src/app/admin/club-management/page.tsx`: Removed global drill restriction, added YouTube URL field
  - `src/app/api/drills/route.ts`: Updated to handle `is_global` and `youtube_url`
  - `src/app/drills/page.tsx`: Added YouTube thumbnail and video display
  - `src/lib/youtubeUtils.ts`: NEW - YouTube utility functions
  - `next.config.ts`: Updated CSP for YouTube integration

---
