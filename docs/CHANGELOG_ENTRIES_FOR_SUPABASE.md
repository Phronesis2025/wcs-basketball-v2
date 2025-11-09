# Changelog Entries to Add to Supabase Database

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

