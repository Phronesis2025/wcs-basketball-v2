# Changelog Entries for Supabase Database

## Version 2.10.23 - About Page Values Cards Redesign & Mobile Optimization

**Release Date**: 2025-01-13

### Entries to Add:

1. **Added** - About Page Values Cards Redesign
   - Redesigned values cards with CodePen-style sliding text animation
   - Cards display value title as main text with description sliding in from bottom on hover/click
   - Added black background to bottom section on hover/click for better text readability
   - Cards display in 2 columns on mobile, 4 columns on desktop
   - Added border styling matching WCS Fanzone cards

2. **Added** - Mobile-Specific Features for Values Cards
   - Click-to-reveal animation for mobile (replaces hover on desktop)
   - Reduced font sizes for mobile to ensure all text fits
   - Optimized card heights and padding for mobile viewport

3. **Added** - AdSection on About Page
   - Added AdSection component to bottom of About page above footer
   - Displays rotating banner ads (CNC Ad and Animated Banner Ad)

4. **Changed** - About Page Styling
   - Changed background color to pure black
   - Reduced navbar blur effect for cleaner appearance

5. **Fixed** - Values Cards Mobile Behavior
   - Fixed click-triggered animations on mobile
   - Ensured filler text slides in correctly with black background
   - Fixed image overlay lightening on mobile click

6. **Security** - Security Review
   - Completed comprehensive security check - no new vulnerabilities found
   - NPM Audit: 1 high severity vulnerability (xlsx library - documented, no fix available)
   - Supabase Security Advisor: 1 WARN (leaked password protection - manual dashboard config required)
   - Supabase Performance Advisor: 24 INFO (unused indexes - low priority, no action needed)
   - All existing security measures verified and documented

---

**Note**: These entries should be added to the Supabase `changelog` table via the admin interface or API.
