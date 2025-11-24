# Changelog Entries for Supabase Database

## Version 2.10.22 - CNC Ad Enhancements & Security Audit

**Release Date**: 2025-01-13

### Entries to Add:

1. **Added** - CNC Ad Visual Enhancements
   - Added basketball bucket hat image to right side of CNC ad
   - Implemented soft blue background glow effect behind the image
   - Positioned image behind "COACH NATE CLASSIC" text for layered effect
   - Adjusted image positioning and glow intensity for optimal visual balance

2. **Fixed** - CNC Ad Image Positioning
   - Moved basketball bucket hat image further to the right
   - Softened the blue glow effect for more subtle appearance

3. **Security** - Security Review
   - Completed comprehensive security check - no new vulnerabilities found
   - NPM Audit: 1 high severity vulnerability (xlsx library - documented, no fix available)
   - Supabase Security Advisor: 1 WARN (leaked password protection - manual dashboard config required)
   - Supabase Performance Advisor: 24 INFO (unused indexes - low priority, no action needed)
   - All existing security measures verified and documented

---

**Note**: These entries should be added to the Supabase `changelog` table via the admin interface or API.
