# Vercel Deployment Configuration - January 2025

**Date**: January 2025  
**Status**: ✅ Ready for Production Deployment  
**Build Status**: ✅ Success  
**Security Audit**: ✅ Passed (No secrets exposed)

---

## Overview

This document outlines the changes made to prepare the WCS Basketball v2.0 application for deployment to Vercel production environment.

---

## Changes Made

### 1. Base URL Configuration Updates

Updated all base URL logic to properly detect and use Vercel URLs in production while maintaining localhost support for development.

#### Files Modified:

1. **`src/app/api/auth/magic-link/route.ts`**

   - Updated `getBaseUrl()` function to prioritize `NEXT_PUBLIC_BASE_URL` in production
   - Falls back to `VERCEL_URL` environment variable (auto-provided by Vercel)
   - Final fallback to hardcoded production domain
   - Development logic unchanged (uses localhost)

2. **`src/app/api/approve-player/route.ts`**

   - Added Vercel detection logic
   - Properly constructs checkout URLs for production
   - Maintains localhost support for development

3. **`src/app/api/create-checkout-session/route.ts`**
   - Created centralized `getBaseUrl()` function
   - Handles Vercel vs localhost automatically
   - Ensures Stripe redirect URLs work correctly in production

### 2. Build Error Fixes

Fixed Next.js build errors related to `useSearchParams()` requiring Suspense boundaries:

#### Pages Made Dynamic:

- `src/app/terms/page.tsx` - Added `export const dynamic = 'force-dynamic'`
- `src/app/sentry-example-page/page.tsx` - Added `export const dynamic = 'force-dynamic'`
- `src/app/registration-success/page.tsx` - Added `export const dynamic = 'force-dynamic'`
- `src/app/admin/parents/page.tsx` - Added `export const dynamic = 'force-dynamic'`
- `src/app/register/page.tsx` - Added `export const dynamic = 'force-dynamic'`

These pages now render dynamically at request time instead of being statically generated, which resolves the `useSearchParams()` build warnings.

### 3. Security Audit Results

**✅ PASSED - No Critical Issues Found**

- No hardcoded secrets or API keys in source code
- All environment variables properly referenced via `process.env`
- No credentials logged to console
- Proper use of `NEXT_PUBLIC_` prefix for client-side variables
- Server-side secrets only accessible in API routes

---

## Environment Variables Required in Vercel

### Critical Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://htgkddahhgugesktujds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Base URL (Important for production)
NEXT_PUBLIC_BASE_URL=https://wcs-basketball-v2.vercel.app
# OR let Vercel auto-detect via VERCEL_URL

# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_[your-secret-key]
STRIPE_PRICE_ANNUAL=price_[your-price-id]
STRIPE_PRICE_MONTHLY=price_[your-price-id]
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]

# Email (Resend)
RESEND_API_KEY=re_[your-api-key]
RESEND_FROM="WCS Basketball <onboarding@resend.dev>"

# Admin Notifications
ADMIN_NOTIFICATIONS_TO="phronesis700@gmail.com"
```

### Auto-Provided by Vercel:

- `VERCEL_URL` - Automatically set by Vercel (e.g., `wcs-basketball-v2.vercel.app`)
- `VERCEL` - Set to `"1"` when running on Vercel

**Note**: The code automatically uses `VERCEL_URL` if `NEXT_PUBLIC_BASE_URL` is not explicitly set.

---

## Deployment Checklist

### Pre-Deployment:

- [x] All localhost references updated to use environment-based detection
- [x] Build errors fixed (useSearchParams Suspense boundaries)
- [x] Security audit passed
- [x] `npm run build` completes successfully
- [x] All environment variables documented

### Vercel Configuration:

- [ ] All environment variables added to Vercel dashboard
- [ ] Environment variables set for Production, Preview, and Development
- [ ] Supabase redirect URLs updated to include Vercel domain
- [ ] Stripe webhook endpoint configured (if using payments)
- [ ] Domain configured (if using custom domain)

### Post-Deployment Testing:

- [ ] Registration flow tested on production
- [ ] Email confirmation links work correctly
- [ ] Payment flow tested (if applicable)
- [ ] Admin dashboard accessible
- [ ] All API routes responding correctly
- [ ] No console errors in browser
- [ ] Mobile responsiveness verified

---

## How Base URL Detection Works

The application uses a three-tier fallback system:

1. **Explicit `NEXT_PUBLIC_BASE_URL`** (highest priority)

   - If set, uses this value
   - Must include protocol (https://)

2. **Vercel Auto-Detection** (if on Vercel)

   - Uses `VERCEL_URL` environment variable
   - Automatically prefixed with `https://`

3. **Hardcoded Fallback** (last resort)
   - Falls back to `https://wcs-basketball-v2.vercel.app`

**Development:**

- Detects localhost from request headers
- Falls back to `http://localhost:3000`

---

## Build Configuration

### Build Settings:

- TypeScript errors: Ignored during build (warnings only)
- ESLint errors: Ignored during build (warnings only)
- Static pages: 88 pages generated successfully
- Dynamic pages: 5 pages set to dynamic rendering

### Build Output:

```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (88/88)
✓ Build completed successfully
```

---

## Important Notes

1. **Environment Variables**: Always set `NEXT_PUBLIC_BASE_URL` in Vercel to ensure consistent URL generation for emails and redirects.

2. **Supabase Redirect URLs**: Must include both:

   - Site URL: `https://wcs-basketball-v2.vercel.app`
   - Redirect URLs: `https://wcs-basketball-v2.vercel.app/**`

3. **Email Links**: All magic links and email confirmations will use the production URL automatically based on environment detection.

4. **Stripe Webhooks**: Configure webhook endpoint as:
   - `https://wcs-basketball-v2.vercel.app/api/stripe-webhook`

---

## Rollback Procedure

If deployment issues occur:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"
4. Investigate issues in development
5. Redeploy when fixed

---

## Support

For deployment issues:

- Check Vercel build logs
- Review Supabase auth configuration
- Verify environment variables are set correctly
- Check browser console for client-side errors
- Review this document: `docs/DEPLOY_TO_VERCEL.md`

---

## Next Steps

1. Add all environment variables to Vercel
2. Configure Supabase redirect URLs
3. Test deployment on preview branch first
4. Promote to production after verification
5. Monitor logs and error tracking (Sentry)
