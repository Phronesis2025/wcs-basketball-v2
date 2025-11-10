# Changelog Entries to Add to Supabase Database

**Version**: 2.10.15  
**Release Date**: 2025-01-10

---

## Version 2.10.15 Entries

### Entry 1: Global Responsive Scaling System

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `added`
- **Description**: `Implemented global responsive scaling system for fonts and images. Added CSS viewport-based scaling using clamp() that scales from 65% on mobile (375px) to 100% at 1920px+. All fonts and images now scale proportionally based on screen size while preserving layout, functionality, and responsive breakpoints.`
- **Is Published**: `true`

### Entry 2: Payment Tab Default State

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `changed`
- **Description**: `Updated payment tab in club management: all collapsible sections (Payment Management, Registrations, Volunteer Submissions, Parent Payment Overview) now default to closed state instead of open.`
- **Is Published**: `true`

### Entry 3: Monitor Tab Section Titles

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `changed`
- **Description**: `Changed all section titles on Monitor tab to white font color for better visibility and consistency.`
- **Is Published**: `true`

### Entry 4: Parent Login Page Updates

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `changed`
- **Description**: `Updated parent login page: changed title from "Parent Login" to "Account login" and updated subtitle from "manage your children's registration" to "manage your player's registration".`
- **Is Published**: `true`

### Entry 5: Parent Profile Button Update

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `changed`
- **Description**: `Updated parent profile page: changed "Add Another Child" button text to "Add Another Player" for consistency with player terminology.`
- **Is Published**: `true`

### Entry 6: Billing Tab Simplification

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `changed`
- **Description**: `Simplified billing tab: removed individual player invoices section. Now only shows combined invoice with "View Full Invoice" and "Email Full Invoice" options. Updated description text to use "players" instead of "children".`
- **Is Published**: `true`

### Entry 7: Payment History Table Responsive Update

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `changed`
- **Description**: `Removed Amount column from payment history table on tablet view (hidden on screens up to 1279px, visible only on extra-large desktop screens 1280px+).`
- **Is Published**: `true`

### Entry 8: Sign-Out Transition Page

- **Version**: `2.10.15`
- **Release Date**: `2025-01-10`
- **Category**: `added`
- **Description**: `Created sign-out transition page at /parent/sign-out that displays thank you message for participation and support of WCS Basketball program. Page automatically redirects to home after 4 seconds with manual "Return to Home" button option.`
- **Is Published**: `true`

---

**Version**: 2.10.14  
**Release Date**: 2025-01-09

---

## Version 2.10.14 Entries

### Entry 1: Combined Invoice Feature

- **Version**: `2.10.14`
- **Release Date**: `2025-01-09`
- **Category**: `added`
- **Description**: `Added combined invoice feature allowing parents to view and download a single invoice with all payments for all their children. Created new API endpoint /api/send-parent-invoice that generates consolidated invoices. Added "View Full Invoice" and "Email Full Invoice" buttons to billing page. Invoice table now includes Player column showing first names, and displays all payments across multiple children and months.`
- **Is Published**: `true`

### Entry 2: Invoice Table Display Fix

- **Version**: `2.10.14`
- **Release Date**: `2025-01-09`
- **Category**: `fixed`
- **Description**: `Fixed invoice table not displaying payment information on HTML invoice page. Removed overflow-hidden container that was clipping table content. Added explicit display and visibility styles to ensure table is always visible. Updated payment fetching to use server-side API for reliable data access.`
- **Is Published**: `true`

### Entry 3: Team Logo Removal from Invoices

- **Version**: `2.10.14`
- **Release Date**: `2025-01-09`
- **Category**: `changed`
- **Description**: `Removed team logos from all invoice forms (HTML and PDF). Team logos no longer appear on invoices to simplify invoice design. WCS logo remains in header.`
- **Is Published**: `true`

### Entry 4: Multiple Teams Invoice Display

- **Version**: `2.10.14`
- **Release Date**: `2025-01-09`
- **Category**: `changed`
- **Description**: `Updated invoice to hide Team line when parent has children on multiple teams. Team information only displays when all children are on the same team.`
- **Is Published**: `true`

### Entry 5: Players Label Update

- **Version**: `2.10.14`
- **Release Date**: `2025-01-09`
- **Category**: `changed`
- **Description**: `Changed invoice label from "Children:" to "Players:" and updated display to show only first names (e.g., "7 Players: Teegan, Tatum, Bernie, Amelia, Oakly, Hannah, Stella").`
- **Is Published**: `true`

### Entry 6: Invoice Back Button

- **Version**: `2.10.14`
- **Release Date**: `2025-01-09`
- **Category**: `added`
- **Description**: `Added back button to invoice page positioned between invoice content and checkout section. Button styled as standard gray button matching app design, hidden in print mode.`
- **Is Published**: `true`

---

**Version**: 2.10.13  
**Release Date**: 2025-11-09

---

## Version 2.10.13 Entries

### Entry 1: Parent Profile Scroll Fix

- **Version**: `2.10.13`
- **Release Date**: `2025-11-09`
- **Category**: `fixed`
- **Description**: `Fixed parent profile page to always scroll to top on page load or refresh. Added useEffect hook that scrolls to top (0, 0) immediately when component mounts, ensuring users always start at the top of the page.`
- **Is Published**: `true`

### Entry 2: Team Selector Dropdown Fix

- **Version**: `2.10.13`
- **Release Date**: `2025-11-09`
- **Category**: `fixed`
- **Description**: `Fixed missing team selector dropdown when approving and assigning pending players. Dropdown now always shows for pending players, with fallback to all active teams if no compatible teams are found.`
- **Is Published**: `true`

### Entry 3: Enhanced Grade Normalization

- **Version**: `2.10.13`
- **Release Date**: `2025-11-09`
- **Category**: `added`
- **Description**: `Enhanced grade normalization to handle multiple input formats. Now accepts "5", "5th", or "5th grade" and normalizes all to "5th Grade" for consistent team compatibility checking.`
- **Is Published**: `true`

---

**Version**: 2.10.12  
**Release Date**: 2025-11-09

---

## Version 2.10.12 Entries

### Entry 1: Grade-Based Team Assignment System

- **Version**: `2.10.12`
- **Release Date**: `2025-11-09`
- **Category**: `added`
- **Description**: `Teams now use grade levels (2nd Grade through U18 High School) instead of age groups (U8-U18). Updated team creation/editing modal, player assignment logic, and validation functions to use grade-based compatibility. All existing teams migrated from age groups to grade levels.`
- **Is Published**: `true`

### Entry 2: Team Grade Level Dropdown Update

- **Version**: `2.10.12`
- **Release Date**: `2025-11-09`
- **Category**: `changed`
- **Description**: `Updated team creation and editing modal to show grade level dropdown (2nd Grade, 3rd Grade, 4th Grade, 5th Grade, 6th Grade, 7th Grade, 8th Grade, U18 High School) instead of age group dropdown (U8-U18).`
- **Is Published**: `true`

### Entry 3: Player-Team Compatibility Logic Update

- **Version**: `2.10.12`
- **Release Date**: `2025-11-09`
- **Category**: `changed`
- **Description**: `Changed player-team compatibility from age-based to grade-based. Players are now matched to teams based on their grade level instead of calculated age. U18 (High School) teams accept players in 9th-12th grade.`
- **Is Published**: `true`

### Entry 4: Database Migration - Age Groups to Grade Levels

- **Version**: `2.10.12`
- **Release Date**: `2025-11-09`
- **Category**: `changed`
- **Description**: `Database constraint updated to allow grade level values. All existing teams migrated: U8→2nd Grade, U10→3rd Grade, U12→4th Grade, U14→5th Grade, U16→6th Grade, U18→U18 (High School). Migration completed via Supabase MCP.`
- **Is Published**: `true`

### Entry 5: Grade Validation Functions

- **Version**: `2.10.12`
- **Release Date**: `2025-11-09`
- **Category**: `added`
- **Description**: `Created new validation functions: isGradeCompatible, getCompatibleTeamsByGrade, normalizePlayerGrade. Deprecated old age-based validation functions. Functions handle grade normalization and team compatibility checking.`
- **Is Published**: `true`

---

**Version**: 2.10.11  
**Release Date**: 2025-11-09

---

## Version 2.10.11 Entries

### Entry 1: Automatic Invoice PDF Attachments

- **Version**: `2.10.11`
- **Release Date**: `2025-11-09`
- **Category**: `added`
- **Description**: `Added automatic invoice PDF attachment to payment confirmation emails. Invoices are now automatically generated and attached when payments are completed (both one-time and recurring payments). The invoice matches the format shown on the payment page but only includes the current payment.`
- **Is Published**: `true`

### Entry 2: Email Utility Attachment Support

- **Version**: `2.10.11`
- **Release Date**: `2025-11-09`
- **Category**: `changed`
- **Description**: `Extended sendEmail utility function to support email attachments. Added optional attachments parameter that accepts base64-encoded file content for PDF attachments via Resend API. Improved error handling to throw errors for better visibility in webhook logs.`
- **Is Published**: `true`

### Entry 3: Invoice Data Generation Helper

- **Version**: `2.10.11`
- **Release Date**: `2025-11-09`
- **Category**: `added`
- **Description**: `Created generateSinglePaymentInvoiceData helper function in Stripe webhook handler to format invoice data for individual payments. Handles annual, monthly, and quarterly payment types with proper formatting.`
- **Is Published**: `true`

### Entry 4: Stripe Receipt Email Removal

- **Version**: `2.10.11`
- **Release Date**: `2025-11-09`
- **Category**: `changed`
- **Description**: `Removed all receipt_email parameters from Stripe checkout session creation. All payment confirmation emails are now sent exclusively via Resend instead of Stripe's automatic receipt emails. This ensures consistent branding and includes invoice PDF attachments.`
- **Is Published**: `true`

### Entry 5: Enhanced Webhook Email Logging

- **Version**: `2.10.11`
- **Release Date**: `2025-11-09`
- **Category**: `changed`
- **Description**: `Added detailed logging in Stripe webhook handlers for email sending attempts and failures. Logs now include recipient email, subject, attachment status, error messages, and stack traces for better debugging of email delivery issues.`
- **Is Published**: `true`

---

**Version**: 2.10.10  
**Release Date**: 2025-01-09

---

## Version 2.10.10 Entries

### Entry 1: Payment Link Domain Fix

- **Version**: `2.10.10`
- **Release Date**: `2025-01-09`
- **Category**: `fixed`
- **Description**: `Fixed payment links in approval emails to always use https://www.wcsbasketball.site instead of old Vercel URL. Updated approve-player, import-execute, and magic-link routes to hardcode new domain in production.`
- **Is Published**: `true`

### Entry 2: Go-Live Checklist Update

- **Version**: `2.10.10`
- **Release Date**: `2025-01-09`
- **Category**: `changed`
- **Description**: `Updated GO_LIVE_CHECKLIST.md with payment link configuration details, domain setup requirements, and verification steps for production deployment.`
- **Is Published**: `true`

---

## Security Audit Summary (Version 2.10.10)

### Security Findings

- **Overall Score**: 9/10 (Excellent)
- **Status**: ✅ Passed with recommendations
- **xlsx Dependency**: High severity vulnerabilities found (no fix available, acceptable risk for admin-only functionality)
- **Recommendation**: Enable Supabase leaked password protection
- **Code Review**: No hardcoded secrets or credentials found in modified files

### Performance Findings

- **Unused Indexes**: Informational only, no action required

---

**Version**: 2.10.9  
**Release Date**: 2025-01-09

---

## Version 2.10.9 Entries

### Entry 1: Font Preload Warnings Fix

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `fixed`
- **Description**: `Removed font preload links from layout to eliminate console warnings about preloaded fonts not being used. Fonts are loaded via @font-face in CSS.`
- **Is Published**: `true`

### Entry 2: Registration Wizard Step Numbering Fix

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `fixed`
- **Description**: `Fixed missing step number 2 in registration wizard when parent step is skipped. Steps now display correct numbers (1, 2) instead of (2, 3).`
- **Is Published**: `true`

### Entry 3: Registration Wizard Step Completion Logic Fix

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `fixed`
- **Description**: `Fixed step completion indicators to only show green checkmark after step is actually completed, not just because it's earlier in sequence.`
- **Is Published**: `true`

### Entry 4: Mobile Zoom Prevention for Message Board

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `fixed`
- **Description**: `Prevented unwanted screen zoom on mobile devices when typing in message board textareas by increasing font-size to 16px on mobile (prevents iOS Safari auto-zoom).`
- **Is Published**: `true`

### Entry 5: Pending Players Notification

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `added`
- **Description**: `Added blue notification circle on club management page showing count of pending players. Admins can click to navigate directly to registration section.`
- **Is Published**: `true`

### Entry 6: Unread Mentions Click Functionality

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `added`
- **Description**: `Added click functionality to unread mentions notifications and cards. Clicking scrolls to the specific message, expands it, and opens reply function automatically.`
- **Is Published**: `true`

### Entry 7: Registration Wizard Step Animation

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `added`
- **Description**: `Added pulsing animation behind active step circle in registration wizard for better visual feedback. Custom CSS animation with opacity and scale changes.`
- **Is Published**: `true`

### Entry 8: Registration Wizard Step Color Fix

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `changed`
- **Description**: `Fixed step colors: active step now shows red, inactive steps show gray, completed steps show green with checkmark.`
- **Is Published**: `true`

### Entry 9: Registration Form Terminology Update

- **Version**: `2.10.9`
- **Release Date**: `2025-01-09`
- **Category**: `changed`
- **Description**: `Updated registration form terminology from "child" to "player" throughout "Add Another Player" form and COPPA consent text for consistency.`
- **Is Published**: `true`

---

## Security Audit Summary (Version 2.10.9)

### Security Findings

- **Overall Score**: 9/10 (Excellent)
- **Status**: ✅ Passed with recommendations
- **xlsx Dependency**: High severity vulnerabilities found (no fix available, acceptable risk for admin-only functionality)
- **Recommendation**: Enable Supabase leaked password protection

### Performance Findings

- **Unused Indexes**: Informational only, no action required

---

**Version**: 2.10.8  
**Release Date**: 2025-01-08

---

## Version 2.10.8 Entries

### Entry 1: Coach Password Reset Fix

- **Version**: `2.10.8`
- **Release Date**: `2025-01-08`
- **Category**: `fixed`
- **Description**: `Fixed coach password reset failure in production. Replaced in-memory token storage with database-backed storage using password_reset_tokens table to support serverless environments.`
- **Is Published**: `true`

### Entry 2: Password Reset Token Database Table

- **Version**: `2.10.8`
- **Release Date**: `2025-01-08`
- **Category**: `added`
- **Description**: `Created password_reset_tokens database table for persistent storage of coach/admin password reset tokens, enabling password resets to work correctly in serverless production environments.`
- **Is Published**: `true`

### Entry 3: Password Input Accessibility Improvement

- **Version**: `2.10.8`
- **Release Date**: `2025-01-08`
- **Category**: `changed`
- **Description**: `Added autocomplete attributes to password input fields on coach reset password page to improve browser password manager compatibility and accessibility.`
- **Is Published**: `true`

---

**Version**: 2.10.7  
**Release Date**: 2025-01-08

---

## Entries to Add via Admin Dashboard

Go to: Admin Dashboard → Club Management → Changelog Tab → Add Entry

### Entry 1: Gmail OAuth Redirect Fix

- **Version**: `2.10.7`
- **Release Date**: `2025-01-08`
- **Category**: `fixed`
- **Description**: `Fixed Gmail OAuth redirect issue where users were redirected to /# instead of registration wizard. Added HandleAuthRedirect component to root layout to process OAuth hash fragments and redirect to registration page.`
- **Is Published**: `true`

### Entry 2: Vercel MCP Integration

- **Version**: `2.10.7`
- **Release Date**: `2025-01-08`
- **Category**: `added`
- **Description**: `Added Vercel MCP server integration for direct access to Vercel deployment management, logs, and environment variables through Cursor IDE.`
- **Is Published**: `true`

### Entry 3: OAuth Redirect Handler Enhancement

- **Version**: `2.10.7`
- **Release Date**: `2025-01-08`
- **Category**: `added`
- **Description**: `Added HandleAuthRedirect component to root layout (wrapped in Suspense) to ensure OAuth callbacks are processed on all pages, improving Gmail OAuth sign-up experience.`
- **Is Published**: `true`

### Entry 4: Build Fix - Suspense Boundary

- **Version**: `2.10.7`
- **Release Date**: `2025-01-08`
- **Category**: `fixed`
- **Description**: `Fixed build error by wrapping HandleAuthRedirect component in Suspense boundary to resolve useSearchParams() warning.`
- **Is Published**: `true`

---

## Supabase Advisor Findings

### Security Issues

1. **Leaked Password Protection Disabled** (WARN)
   - **Issue**: Supabase Auth leaked password protection is currently disabled
   - **Impact**: Users can use compromised passwords from HaveIBeenPwned.org
   - **Recommendation**: Enable in Supabase Dashboard → Authentication → Password Security
   - **Remediation**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
   - **Status**: ⚠️ Should be enabled for production

### Performance Issues

- **Unused Indexes** (INFO)
  - Multiple unused indexes detected (informational only)
  - These are indexes that haven't been used yet but may be needed for future queries
  - **Action**: Monitor and remove only if confirmed unnecessary
  - **Status**: ✅ No action required (informational)

---

## Notes

- The leaked password protection is a security enhancement that should be enabled
- Unused indexes are informational and don't require immediate action
- All code changes are client-side redirect improvements with no security implications
