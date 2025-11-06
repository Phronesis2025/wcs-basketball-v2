# Vercel Deployment Guide - WCS Basketball v2.0

**Last Updated**: January 2025  
**Status**: ✅ Production Ready  
**Production URL**: https://wcs-basketball-v2.vercel.app

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring & Analytics](#monitoring--analytics)

---

## Prerequisites

✅ Your code is already on GitHub and working locally  
✅ You have a Vercel account (connect your GitHub)  
✅ All environment variables documented  
✅ Build completes successfully locally (`npm run build`)

---

## Quick Start

### 1. Connect Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 2. Configure Environment Variables

See [Environment Variables](#environment-variables) section below for complete list.

### 3. Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Check build logs for any errors

---

## Environment Variables

### Required Variables

**CRITICAL:** Add these environment variables in Vercel Dashboard:

#### Supabase Configuration

```
NEXT_PUBLIC_SUPABASE_URL=https://htgkddahhgugesktujds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**How to get these values:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `htgkddahhgugesktujds`
3. Go to Settings → API
4. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (secret!)

#### Base URL

```
NEXT_PUBLIC_BASE_URL=https://wcs-basketball-v2.vercel.app
```

**Note**: The code automatically uses `VERCEL_URL` if `NEXT_PUBLIC_BASE_URL` is not set.

### Optional Variables

#### Stripe (if using payments)

```
STRIPE_SECRET_KEY=sk_live_[your-secret-key]
STRIPE_PRICE_ANNUAL=price_[your-price-id]
STRIPE_PRICE_MONTHLY=price_[your-price-id]
STRIPE_PRICE_QUARTERLY=price_[your-quarterly-price-id]  # Optional: Quarterly payment option
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]
```

#### Email Service (Resend)

```
RESEND_API_KEY=re_[your-api-key]
RESEND_FROM="WCS Basketball <onboarding@resend.dev>"
ADMIN_NOTIFICATIONS_TO=admin@example.com
```

#### SMS Service (Twilio)

```
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone_number
ADMIN_PHONE=your_admin_phone_number
```

#### Monitoring & Analytics

```
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
UPTIMEROBOT_API_KEY=your_uptimerobot_api_key_here
```

#### Cron Jobs

```
CRON_SECRET=your_cron_secret_here
```

### Auto-Provided by Vercel

- `VERCEL_URL` - Automatically set by Vercel (e.g., `wcs-basketball-v2.vercel.app`)
- `VERCEL` - Set to `"1"` when running on Vercel

---

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Import Environment Variables in Vercel

1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add each variable one by one
4. Select "Production", "Preview", and "Development" for each
5. Click "Save"

### 3. Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Check build logs for any errors

---

## Post-Deployment Configuration

### 1. Configure Supabase Auth Redirect URLs

**CRITICAL:** Must configure these in Supabase Dashboard:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to allowed redirect URLs:
   ```
   https://wcs-basketball-v2.vercel.app/**
   ```
3. Add site URL:
   ```
   https://wcs-basketball-v2.vercel.app
   ```

### 2. Enable Email Authentication in Production

Currently, email confirmation is required. To disable it for easier testing:

1. Go to Supabase Dashboard → Authentication → Providers
2. Email provider settings:
   - **Enable email provider** ✓
   - **Confirm email** → Set to "OFF" for testing (not recommended in production)
   - **OR** keep it ON and ensure users check their email

### 3. Configure Stripe Webhook (if using payments)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://wcs-basketball-v2.vercel.app/api/stripe-webhook`
3. Copy the webhook signing secret
4. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`

---

## Base URL Detection

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

### Build Settings

- **TypeScript errors**: Ignored during build (warnings only)
- **ESLint errors**: Ignored during build (warnings only)
- **Static pages**: 88 pages generated successfully
- **Dynamic pages**: 5 pages set to dynamic rendering

### Build Output

```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (88/88)
✓ Build completed successfully
```

---

## Troubleshooting

### Build Fails

- Check Vercel build logs
- Ensure all environment variables are set
- Verify TypeScript/Next.js version compatibility
- Run `npm run build` locally to identify issues

### Authentication Not Working

- Check Supabase redirect URLs are configured
- Verify environment variables are set correctly
- Check browser console for errors
- Review Supabase auth logs in dashboard

### Environment Variables Not Loading

- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side
- Redeploy after adding new variables
- Check Vercel environment variable scope (Production/Preview/Development)

### Email Confirmation Issues

- Check Supabase email settings
- Verify SMTP is configured in Supabase
- Check spam folder
- Temporarily disable email confirmation for testing

### 404 Errors

- Verify file paths and routing
- Check Next.js routing configuration
- Ensure all pages are properly exported
- Clear Vercel cache and redeploy

### Performance Issues

- Optimize images with Next.js Image component
- Implement lazy loading for components
- Review bundle size and code splitting
- Check CDN configuration

---

## Monitoring & Analytics

### Vercel Analytics

- **Traffic**: Page views and user sessions
- **Performance**: Core Web Vitals tracking
- **Errors**: JavaScript errors and exceptions
- **Real User Monitoring**: Actual user experience data

### Sentry Integration

- **Error Tracking**: Real-time error monitoring
- **Performance**: Application performance monitoring
- **Alerts**: Automated error notifications
- **Debugging**: Detailed error context and stack traces

### Custom Performance Tracking

- **API Route Performance**: Stored in `performance_metrics` table
- **Core Web Vitals**: Client-side capture stored in `web_vitals` table
- **Uptime Monitoring**: UptimeRobot integration
- **Admin Dashboard**: View all metrics in Monitor tab

---

## Production Checklist

✅ All environment variables added to Vercel  
✅ Supabase redirect URLs configured  
✅ Email provider configured  
✅ Stripe webhooks configured (if using payments)  
✅ Custom domain configured (optional)  
✅ SSL certificate active (automatic with Vercel)  
✅ Build completes successfully  
✅ Test registration flow  
✅ Test login flow  
✅ Test profile page  
✅ Monitor logs for errors

---

## Rollback Procedure

If deployment issues occur:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"
4. Investigate issues in development
5. Redeploy when fixed

---

## Security Notes

⚠️ **Never commit environment variables to git**

- `.env.local` is in `.gitignore` ✓
- Only use Vercel dashboard for production secrets
- Rotate credentials if exposed
- `.cursor/mcp.json` is in `.gitignore` ✓

---

## Support

For deployment issues:

- **Vercel Logs**: Dashboard → Deployments → [deployment] → View Function Logs
- **Supabase Logs**: Dashboard → Logs
- **Browser Console**: Check for client-side errors
- **Documentation**: See `docs/ENVIRONMENT_SETUP.md` for environment variable details

---

## Next Steps After Deployment

1. Update your production Supabase auth settings
2. Configure domain (optional)
3. Set up monitoring (Vercel Analytics)
4. Configure email sending service
5. Test payment flow (if applicable)
6. Run production smoke tests

