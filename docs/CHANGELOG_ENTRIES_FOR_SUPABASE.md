# Changelog Entries to Add to Supabase Database

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

