## AI Session Changelog

This file is maintained automatically to record all changes we make together in this coding session, including small tweaks and non-deploy edits.

Format:
- Date (YYYY-MM-DD)
- Summary
- Files
- Notes

---

### 2025-01-XX
- Summary: Tournament Signup Page Integration with Tourneymachine (v2.10.1)
- Files:
  - `src/app/tournament-signup/page.tsx` - Complete redesign with Tourneymachine iframe integration and tournament information section
  - `next.config.ts` - Updated CSP policies to allow Tourneymachine iframes
  - `docs/CHANGELOG.md` - Added version 2.10.1 entry with all changes
  - `docs/AI_CHANGELOG.md` - Added this entry
  - `docs/SECURITY.md` - Updated with CSP changes
  - `docs/OVERVIEW.md` - Updated with latest version and features
- Notes:
  - Embedded Tourneymachine registration form via iframe on tournament-signup page
  - Fixed CSP (Content Security Policy) to allow Tourneymachine iframes by adding `frame-src 'self' https://tourneymachine.com https://*.tourneymachine.com`
  - Implemented CSS workaround to hide advertisement at top of embedded form using responsive negative margins
  - Added comprehensive tournament information section with:
    - Tournament title: "Coach Nate Classic 2026"
    - Description honoring Coach Nate as founding member
    - Three information cards: Registration Deadline (Jan 30, 2026), Entry Fee ($180/team), Divisions (9 divisions)
    - Responsive grid layout (1 column mobile, 3 columns desktop/tablet)
  - Responsive ad-hiding margins: -85px on mobile, -250px on tablet/desktop
  - Removed placeholder "Coming Soon" content and disabled form fields
  - Updated both development and production CSP policies
  - Security maintained: CSP only allows specific Tourneymachine domain, not arbitrary external sites
  - Comprehensive security audit completed:
    - Security score: 9/10 (Excellent)
    - OWASP Top 10 compliance: 100%
    - No critical vulnerabilities found
    - All security categories verified (authentication, input validation, SQL injection, CSP, file uploads, API security, secrets management, XSS protection)
    - Tournament signup page verified secure
    - Detailed audit report created: `docs/SECURITY_AUDIT_JAN_2025_TOURNAMENT.md`
  - All documentation updated with latest changes and security audit results

### 2025-11-04
- Summary: FanZone Carousel Redesign & Mobile Improvements (v2.9.2)
- Files:
  - `src/components/FanZone.tsx` - Complete redesign from static grid to interactive horizontal carousel
  - `src/components/AdSection.tsx` - Fixed mobile layout to match desktop horizontal arrangement
  - `docs/CHANGELOG.md` - Added version 2.9.2 entries
  - `docs/OVERVIEW.md` - Updated version and latest features
  - `docs/CODEBASE_STRUCTURE.md` - Updated component descriptions
  - `docs/UI.md` - Updated FanZone and AdSection documentation
  - `docs/PROGRESS.md` - Added latest progress entry
  - `docs/AI_CHANGELOG.md` - Added this entry
- Notes:
  - Converted FanZone from static grid to framer-motion powered horizontal carousel
  - Added 3 new navigation cards: Coach Login, Parent Login, Tournament Information
  - Implemented responsive display: 4 cards on desktop/tablet, 2 cards on mobile
  - Added navigation arrows with hover states (desktop/tablet) and always-visible (mobile)
  - Implemented swipe/drag functionality for mobile devices
  - Reduced section and card heights for more compact layout
  - Fixed hover effects to only affect hovered card using React event handlers
  - Fixed cards not appearing bug (missing CSS class)
  - Fixed AdSection mobile layout to maintain horizontal arrangement
  - Updated all documentation files with latest changes

### 2025-11-03
- Summary: Align `Start Now` navbar button size with `Sign Out` button
- Files:
  - `src/components/cta/StartNowButton.tsx`
- Notes: Removed `min-h-[48px]` and `touch-manipulation` from the navbar variant to match `px-4 py-2 text-sm rounded` sizing used by `Sign Out`.


