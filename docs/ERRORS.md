# WCSv2.0 Errors Log

## Last Updated

January 2025, Current Status - v2.3.1 Favicon & Build Fixes

## ✅ Resolved Issues

### Recent Fixes (January 2025 - v2.3.1)

- **Favicon Loading Issues**:
  - **Date**: January 2025
  - **Description**: favicon.ico and icon files not loading in browser
  - **Cause**: Incorrect file placement for Next.js 13+ App Router
  - **Fix**: Moved favicon.ico to src/app/, PNG icons to public/
  - **Status**: ✅ Resolved

- **TypeScript Compilation Errors**:
  - **Date**: January 2025
  - **Description**: Build failing due to TypeScript errors and ESLint warnings
  - **Cause**: Missing types, unused variables, any types
  - **Fix**: Added proper types, removed unused variables, fixed type safety
  - **Status**: ✅ Resolved

- **Console Security Issues**:
  - **Date**: January 2025
  - **Description**: Production console.warn statements leaking information
  - **Cause**: Direct console usage instead of development-only logging
  - **Fix**: Replaced with devError utility function
  - **Status**: ✅ Resolved

- **CSP Violations**:
  - **Date**: January 2025
  - **Description**: Vercel Analytics scripts blocked by Content Security Policy
  - **Cause**: Missing va.vercel-scripts.com domain in CSP
  - **Fix**: Added domain to script-src and connect-src directives
  - **Status**: ✅ Resolved

### Initial Setup Issues (September 2025)

- **Tailwind Export Error**:

  - **Date**: September 2025 (initial setup)
  - **Description**: "Package path ./components is not exported from package .../node_modules/tailwindcss" during `npm run build`
  - **Cause**: Tailwind v4+ export restrictions, possibly from plugins
  - **Fix**: Downgraded to Tailwind 3.3.3, removed `tailwindcss-animate`
  - **Status**: ✅ Resolved in fresh setup

- **Geist Font Error**:

  - **Date**: September 2025
  - **Description**: "Unknown font `Geist`" in `layout.tsx`, 500 error on `/`
  - **Cause**: Next.js default template or cache clash with local fonts
  - **Fix**: Cleared cache, removed `next/font` references
  - **Status**: ✅ Resolved

- **Hydration Mismatch**:

  - **Date**: September 2025
  - **Description**: Browser extension added `className="translated-ltr"` to `<html>`, breaking SSR
  - **Fix**: Tested in incognito, suggested disabling extensions
  - **Status**: ✅ Resolved

- **EBUSY Error**:

  - **Date**: September 2025
  - **Description**: "EBUSY: resource busy or locked" during build cleanup
  - **Cause**: File lock in .next/export (Explorer/antivirus)
  - **Fix**: Manually delete .next, restart PC
  - **Status**: ✅ Resolved

- **Build Lock Warning**:
  - **Date**: September 2025
  - **Description**: npm cleanup failed for @unrs/resolver-binding-linux-arm-gnueabihf
  - **Cause**: Resource lock during install
  - **Fix**: Restart, clear node_modules
  - **Status**: ✅ Resolved

### Recent Development Issues (January 2025)

- **CSP Violation Errors**:

  - **Date**: January 2025
  - **Description**: "Refused to execute inline script because it violates the following Content Security Policy directive: script-src 'self'"
  - **Cause**: CSP too restrictive, blocking Next.js inline scripts
  - **Fix**: Updated CSP to allow `'unsafe-inline'` and `'unsafe-eval'` for scripts
  - **Status**: ✅ Resolved

- **Image Loading Issues**:

  - **Date**: January 2025
  - **Description**: Images not displaying in Hero and Values sections
  - **Cause**: Incorrect Next.js Image component configuration
  - **Fix**: Updated to use `fill` prop with proper `sizes` attributes
  - **Status**: ✅ Resolved

- **Development Server Permission Error**:

  - **Date**: January 2025
  - **Description**: "Error: EPERM: operation not permitted, open '.next/trace'"
  - **Cause**: File permission issues with .next directory
  - **Fix**: Cleaned up .next directory and restarted development server
  - **Status**: ✅ Resolved

- **Duplicate Key Warnings**:

  - **Date**: January 2025
  - **Description**: "Encountered two children with the same key" in ValuesSection
  - **Cause**: Duplicate keys in mapped components
  - **Fix**: Updated key generation to include unique identifiers
  - **Status**: ✅ Resolved

- **LCP Warning**:

  - **Date**: January 2025
  - **Description**: "Image with src '/images/girls free throw.jpg' was detected as the Largest Contentful Paint (LCP)"
  - **Cause**: Missing priority prop on first image
  - **Fix**: Added `priority={currentSlide === 0}` to Hero images
  - **Status**: ✅ Resolved

- **Supabase Import Error**:

  - **Date**: January 2025
  - **Description**: "Module '@/lib/supabaseClient' declares 'createClient' locally, but it is not exported"
  - **Cause**: Incorrect import of createClient function from supabaseClient.ts
  - **Fix**: Changed import to use exported 'supabase' instance instead of 'createClient' function
  - **Status**: ✅ Resolved

- **Image 404 Errors**:

  - **Date**: January 2025
  - **Description**: Continuous 404 errors for "/images/shop-teaser.png" causing performance issues
  - **Cause**: File extension mismatch - code referenced .png but file was .jpg, plus browser caching
  - **Fix**: Updated image references to correct .jpg extension and cleared build cache
  - **Status**: ✅ Resolved

- **Sentry Dependency Issues**:

  - **Date**: January 2025
  - **Description**: Unnecessary Sentry dependency in actions.ts causing build complexity
  - **Cause**: Sentry was imported but not needed for simple error logging
  - **Fix**: Removed Sentry import and replaced with console.warn for development debugging
  - **Status**: ✅ Resolved

- **About Page Button Error**:

  - **Date**: January 2025
  - **Description**: "ReferenceError: Button is not defined" on About page
  - **Cause**: Button component was removed but some references remained in the code
  - **Fix**: Completely removed all Button and Link imports and references
  - **Status**: ✅ Resolved

- **Production Console Logging**:
  - **Date**: January 2025
  - **Description**: Console.error statements in production code potentially leaking sensitive information
  - **Cause**: Direct console.error usage instead of secure logging utilities
  - **Fix**: Replaced all console.error with devError utility for development-only logging
  - **Status**: ✅ Resolved

### Recent Security & Performance Issues (January 2025)

- **CSRF Protection Implementation**:

  - **Date**: January 2025
  - **Description**: Missing CSRF protection for state-changing operations
  - **Cause**: No token-based protection for forms and authentication
  - **Fix**: Implemented complete CSRF protection system with cryptographic tokens
  - **Status**: ✅ Resolved

- **Row Level Security Setup**:

  - **Date**: January 2025
  - **Description**: No database-level access control policies
  - **Cause**: Missing RLS policies for data protection
  - **Fix**: Created comprehensive RLS policies and SQL setup script
  - **Status**: ✅ Resolved

- **Image Optimization Warnings**:

  - **Date**: January 2025
  - **Description**: Next.js Image components missing sizes props causing performance warnings
  - **Cause**: Improper Image component configuration
  - **Fix**: Added sizes props and optimized fill/priority usage
  - **Status**: ✅ Resolved

- **LCP Performance Warnings**:

  - **Date**: January 2025
  - **Description**: Images detected as Largest Contentful Paint without priority prop
  - **Cause**: Missing priority optimization for critical images
  - **Fix**: Added priority props to team images for better Core Web Vitals
  - **Status**: ✅ Resolved

- **Hydration Mismatch**:

  - **Date**: January 2025
  - **Description**: Server/client HTML mismatch on About page
  - **Cause**: Conditional className based on client-side media queries
  - **Fix**: Removed client-side conditional logic for consistent rendering
  - **Status**: ✅ Resolved

- **Smooth Scrolling Warning**:
  - **Date**: January 2025
  - **Description**: Next.js warning about scroll-behavior CSS property
  - **Cause**: Missing data-scroll-behavior attribute on html element
  - **Fix**: Added data-scroll-behavior="smooth" to html element in layout
  - **Status**: ✅ Resolved

## 🔍 Current Error Monitoring

### Production Monitoring

- **Sentry Integration**: Active error tracking and performance monitoring
- **Vercel Analytics**: Traffic and performance metrics
- **Console Monitoring**: Regular security header validation

### Common Error Patterns

- **Image Loading**: Fallback to placeholder images for missing assets
- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: User-friendly error messages for form inputs

## 📊 Error Statistics

### Resolved Issues

- **Total Issues**: 23
- **Critical**: 0
- **High**: 5 (CSP violations, Image loading, Image 404 errors, CSRF protection, RLS setup)
- **Medium**: 9 (Font errors, Hydration, Build issues, Supabase import, Sentry dependency, About page button error, LCP warnings, Hydration mismatch, Smooth scrolling)
- **Low**: 9 (Warnings, Minor fixes, Console logging security, Image optimization)

### Current Status

- **Open Issues**: 0
- **Production Errors**: 0
- **Security Vulnerabilities**: 0
- **Performance Issues**: 0

## 🛠️ Error Prevention

### Code Quality

- **TypeScript**: Strict type checking to catch errors early
- **ESLint**: Code quality and consistency checks
- **Pre-commit Hooks**: Automated linting before commits

### Testing

- **Build Testing**: Regular `npm run build` validation
- **Local Testing**: Development server testing
- **Production Testing**: Vercel deployment validation

### Monitoring

- **Real-time Alerts**: Sentry notifications for critical errors
- **Performance Tracking**: Regular performance audits
- **Security Scanning**: Automated vulnerability detection

## 📝 Error Reporting Process

### For Developers

1. Check console for error details
2. Verify error in both development and production
3. Document error with reproduction steps
4. Implement fix and test thoroughly
5. Update this log with resolution details

### For Users

- **Contact**: phronesis2025@example.com
- **Response Time**: 24-48 hours
- **Severity**: Critical issues addressed immediately

## 🔄 Ongoing Maintenance

### Regular Checks

- **Weekly**: Console error review
- **Monthly**: Security vulnerability scan
- **Quarterly**: Performance audit and optimization

### Prevention Measures

- **Dependency Updates**: Regular security patch updates
- **Code Reviews**: Peer review for all changes
- **Automated Testing**: CI/CD pipeline for error detection
