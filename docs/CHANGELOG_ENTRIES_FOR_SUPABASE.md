# Changelog Entries for Supabase Database

## Version 2.10.28 - Login Pages Redesign

**Release Date**: 2025-01-25

### Entries to Add:

1. **Changed** - Parent Login Page Redesign
   - Updated to match About/Home page styling
   - Changed background from navy to black with gradient overlay
   - Applied gradient text effect to title matching About page
   - Updated form inputs and buttons to match new design
   - Changed color scheme from red accents to blue for consistency

2. **Changed** - Coaches Login Page Redesign
   - Updated to match About/Home page styling
   - Added black background with gradient overlay
   - Applied gradient text effect to title
   - Updated form styling to match new design
   - Changed color scheme to blue for consistency

3. **Changed** - Animated Gradient Border Effect
   - Added animated gradient border to both login cards
   - Uses WCS blue (#002C51, #004080) and red (#D91E18) colors
   - Continuous 3-second animation loop

4. **Fixed** - Parent Login Navigation
   - Fixed session handling to properly set session in Supabase client
   - Added proper session persistence using AuthPersistence
   - Added auth state change event dispatch for navbar updates
   - Changed navigation from router.push to router.replace to prevent back button issues

5. **Added** - AuthPersistence Integration
   - Added AuthPersistence to parent login for proper session management
   - Ensures consistent authentication state across the application

---

## Version 2.10.27 - Team Page Title Visual Enhancements

**Release Date**: 2025-01-25

### Entries to Add:

1. **Changed** - Team Page Title Gradient Effect
   - Applied same gradient effect from About page to team page title
   - Gradient transitions from white to white/50 opacity (top to bottom)
   - Works seamlessly with existing text-stroke and shadow effects

2. **Changed** - Mobile Shadow Adjustments
   - Reduced shadow offsets on mobile devices (screens ≤767px)
   - Changed shadow offsets from 0.5px-15px to 0.3px-8px range
   - Shadows now appear closer to text for better readability on mobile
   - Desktop shadows remain unchanged

3. **Added** - White Spotlight Effect
   - Added white spotlight effect behind team page title
   - Visible on both desktop and mobile devices
   - Uses radial gradient with blur for soft glow effect
   - Positioned absolutely behind text with z-index layering

---

## Version 2.10.24 - Homepage & Drills Page Redesign

**Release Date**: 2025-01-13

### Entries to Add:

1. **Added** - Homepage Background Updates
   - Changed homepage background to pure black
   - Removed parallax background image effect
   - Removed grain texture effect

2. **Added** - Drills Page Redesign
   - Redesigned drills page to match About page styling
   - Updated background to pure black with gradient effect
   - Added AdSection component at bottom of page

3. **Added** - Drill Cards Redesign
   - Redesigned drill cards with modern image-first layout
   - Cards now display image at top with content below
   - Added dark gradient overlay on images that lightens on hover
   - Added play button overlay for YouTube videos on hover
   - Cards match logo marquee container styling
   - Improved hover effects with image zoom and gradient transitions

4. **Changed** - Homepage Section Backgrounds
   - Changed all section backgrounds to pure black
   - Removed top and bottom borders from all sections
   - Updated Hero, Stats, Today's Events, Programs, Logo Marquee, Player Testimonials, Team Updates, and Quote sections

5. **Changed** - Navbar Styling
   - Updated Navbar to use dark styling on Drills page (matching About page)

6. **Fixed** - Drill Cards Consistency
   - Ensured "View Details" button is consistently positioned at bottom of each card
   - Fixed card heights and content spacing for uniform appearance

7. **Security** - Security Review
   - Completed comprehensive security check - no new vulnerabilities found
   - NPM Audit: 1 high severity vulnerability (xlsx library - documented, no fix available)
   - Supabase Security Advisor: 1 WARN (leaked password protection - manual dashboard config required)
   - Supabase Performance Advisor: 24 INFO (unused indexes - low priority, no action needed)
   - All existing security measures verified and documented

---

**Note**: These entries should be added to the Supabase `changelog` table via the admin interface or API.
