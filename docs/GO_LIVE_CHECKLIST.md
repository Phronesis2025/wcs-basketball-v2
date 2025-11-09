# 🚀 Go-Live Checklist - WCS Basketball v2.0

**Document Purpose**: Complete checklist of tasks and configurations needed before launching the site for the first time in production.

**Last Updated**: January 9, 2025  
**Status**: Pre-Launch Checklist  
**Version**: Updated for wcsbasketball.site domain and payment link configuration

---

## 📋 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Email Configuration](#email-configuration)
3. [Supabase Configuration](#supabase-configuration)
4. [Payment Configuration (Stripe)](#payment-configuration-stripe)
5. [Domain & DNS Setup](#domain--dns-setup)
6. [Security & Authentication](#security--authentication)
7. [Testing & Verification](#testing--verification)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Post-Launch Tasks](#post-launch-tasks)

---

## 🔐 Environment Variables

### Vercel Dashboard Configuration

**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

**Action Required**: Add all environment variables for Production, Preview, and Development environments.

#### ✅ Required Variables

```bash
# Supabase Configuration (CRITICAL)
NEXT_PUBLIC_SUPABASE_URL=https://htgkddahhgugesktujds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-production-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-production-service-role-key]

# Base URL (Note: Payment links now hardcode to https://www.wcsbasketball.site in production)
NEXT_PUBLIC_BASE_URL=https://www.wcsbasketball.site
# ⚠️ IMPORTANT: Code has been updated to always use https://www.wcsbasketball.site for payment links
# This environment variable is still used for other purposes, but payment links ignore it
```

**How to get Supabase keys:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `htgkddahhgugesktujds`
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep this secret!**

---

## 📧 Email Configuration

### Email Service Setup (Resend)

**Action Required**: Configure Resend API and email addresses for production.

#### ✅ Required Environment Variables

```bash
# Resend API Key
RESEND_API_KEY=re_[your-production-resend-api-key]

# Resend From Address
# Update this to your verified domain email address
RESEND_FROM="WCS Basketball <noreply@yourdomain.com>"
# OR if using Resend's test domain:
# RESEND_FROM="WCS Basketball <onboarding@resend.dev>"

# Admin Email Notifications
# ⚠️ IMPORTANT: Update this for production!
# For testing: Use your email only
ADMIN_NOTIFICATIONS_TO=your-email@example.com

# For production: Add all 3 admin emails (comma-separated)
# ADMIN_NOTIFICATIONS_TO=admin1@example.com,admin2@example.com,admin3@example.com
```

**How to configure:**

1. **Get Resend API Key:**
   - Go to [Resend Dashboard](https://resend.com/api-keys)
   - Create a new API key for production
   - Copy the key (starts with `re_`)

2. **Verify Domain (Recommended for Production):**
   - Go to [Resend Domains](https://resend.com/domains)
   - Add and verify your domain (e.g., `yourdomain.com`)
   - Update `RESEND_FROM` to use your verified domain
   - Example: `WCS Basketball <noreply@yourdomain.com>`

3. **Configure Admin Email Notifications:**
   - **For Testing Phase**: Set `ADMIN_NOTIFICATIONS_TO` to just your email
     ```
     ADMIN_NOTIFICATIONS_TO=your-email@example.com
     ```
   - **For Production Launch**: Update to include all 3 admin emails (comma-separated, no spaces)
     ```
     ADMIN_NOTIFICATIONS_TO=admin1@example.com,admin2@example.com,admin3@example.com
     ```
   - **How it works:**
     - Single email: Sends directly to that address
     - Multiple emails: Sends to first email, BCCs the others (maintains privacy)

**Email Flow When Player Signs Up:**
- ✅ Parent receives: Registration confirmation email with player details
- ✅ Admin(s) receive: Notification email with player and parent information for team assignment

**Email Flow When Payment is Received:**
- ✅ Parent receives: Payment confirmation email with receipt details
- ✅ Admin(s) receive: Payment confirmation notification with player, parent, and payment information

**Testing Checklist:**
- [ ] Test parent registration email is received
- [ ] Test admin notification email is received
- [ ] Test parent payment confirmation email is received
- [ ] Test admin payment confirmation email is received
- [ ] Verify email formatting and links work correctly
- [ ] Check spam folders
- [ ] Test with multiple admin emails (when ready for production)

---

## 🗄️ Supabase Configuration

### Authentication Settings

**Location**: Supabase Dashboard → Authentication → URL Configuration

#### ✅ Required Actions

1. **Configure Redirect URLs:**
   ```
   https://www.wcsbasketball.site/**
   https://www.wcsbasketball.site/auth/callback
   https://wcsbasketball.site/**
   https://wcsbasketball.site/auth/callback
   ```
   ⚠️ **IMPORTANT**: Both www and non-www versions must be added for OAuth redirects to work

2. **Set Site URL:**
   ```
   https://www.wcsbasketball.site
   ```
   ⚠️ **Use the www version** as the primary site URL

3. **Enable Email Provider:**
   - Go to **Authentication** → **Providers** → **Email**
   - Ensure **Enable email provider** is checked ✓
   - **Confirm email** setting:
     - **ON** (recommended for production) - Users must confirm email
     - **OFF** (for testing only) - Skip email confirmation

4. **Email Template Configuration:**
   - Go to **Authentication** → **Email Templates**
   - Verify custom email templates are configured
   - Test email delivery

### Database Configuration

**Action Required**: Verify database is production-ready

- [ ] All migrations applied
- [ ] Row Level Security (RLS) policies enabled
- [ ] Database backups configured
- [ ] Test data removed (if any)

---

## 💳 Payment Configuration (Stripe)

**Only required if using payment features**

### Stripe Setup

#### ✅ Required Environment Variables

```bash
# Stripe Live Keys (Production)
STRIPE_SECRET_KEY=sk_live_[your-live-secret-key]
STRIPE_PRICE_ANNUAL=price_[your-annual-price-id]
STRIPE_PRICE_MONTHLY=price_[your-monthly-price-id]
STRIPE_PRICE_QUARTERLY=price_[your-quarterly-price-id]  # Optional: Quarterly payment option
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]
```

**Action Required:**

1. **Get Stripe Live Keys:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to **Live mode** (toggle in top right)
   - Go to **Developers** → **API keys**
   - Copy **Secret key** (starts with `sk_live_`)

2. **Get Price IDs:**
   - Go to **Products** → Select your products
   - Copy **Price ID** for annual, monthly, and quarterly plans (if applicable)
   - Quarterly price can be either one-time or recurring subscription

3. **Configure Webhook:**
   - Go to **Developers** → **Webhooks**
   - Add endpoint: `https://www.wcsbasketball.site/api/stripe-webhook`
   - ⚠️ **IMPORTANT**: Use the new custom domain, not the old Vercel URL
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy **Signing secret** (starts with `whsec_`)

**Testing Checklist:**
- [ ] Test payment flow with Stripe test cards
- [ ] Verify webhook receives events
- [ ] Test payment confirmation emails
- [ ] Verify invoice generation

---

## 🌐 Domain & DNS Setup

### Custom Domain Configuration (Required for Production)

**Action Required**: Configure custom domain `wcsbasketball.site` for production

1. **Add Domain in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain: `www.wcsbasketball.site` and `wcsbasketball.site`
   - Follow DNS configuration instructions provided by Vercel

2. **Update Environment Variables:**
   - ⚠️ **IMPORTANT**: The code now hardcodes `https://www.wcsbasketball.site` for production payment links
   - `NEXT_PUBLIC_BASE_URL` is no longer used for payment links (code always uses new domain)
   - However, you may still want to set it for other purposes:
     ```
     NEXT_PUBLIC_BASE_URL=https://www.wcsbasketball.site
     ```

3. **DNS Configuration:**
   - Add A record or CNAME as instructed by Vercel
   - Wait for DNS propagation (can take up to 48 hours)
   - Verify domain is active in Vercel dashboard

4. **Payment Link Configuration:**
   - ✅ **Code automatically uses `https://www.wcsbasketball.site` in production**
   - Payment links in approval emails will use the new domain
   - Magic links will redirect to the new domain
   - No additional configuration needed - code is already updated

**SSL Certificate:**
- ✅ Automatically provided by Vercel (no action needed)

**Verification Checklist:**
- [ ] Domain added to Vercel (both www and non-www)
- [ ] DNS records configured correctly
- [ ] Domain shows as "Active" in Vercel dashboard
- [ ] SSL certificate issued (automatic)
- [ ] Test payment link in approval email uses `https://www.wcsbasketball.site`
- [ ] Test magic link redirects to new domain

---

## 🔒 Security & Authentication

### Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore` (verify it's not committed)
- [ ] Service role keys are kept secret
- [ ] API keys are rotated if they were ever exposed
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Security headers are configured (check `next.config.ts`)
- [ ] Row Level Security (RLS) is enabled in Supabase
- [ ] CSRF protection is enabled
- [ ] Rate limiting is configured (if applicable)

### Authentication Testing

- [ ] Test user registration flow
- [ ] Test email confirmation links
- [ ] Test login/logout
- [ ] Test password reset flow
- [ ] Test OAuth providers (if configured)
- [ ] Verify magic link emails work

---

## 🧪 Testing & Verification

### Pre-Launch Testing Checklist

#### Core Functionality

- [ ] **Homepage loads correctly**
  - Visit: `https://wcs-basketball-v2.vercel.app`
  - Check for console errors
  - Verify images load

- [ ] **Registration Flow**
  - [ ] New parent can register
  - [ ] Parent receives confirmation email
  - [ ] Admin receives notification email
  - [ ] Player record is created in database
  - [ ] Magic link authentication works

- [ ] **Login Flow**
  - [ ] Existing users can log in
  - [ ] Password reset works
  - [ ] Session persists correctly

- [ ] **Parent Dashboard**
  - [ ] Parent can view their profile
  - [ ] Parent can see their children
  - [ ] Parent can view payment history
  - [ ] Parent can update profile

- [ ] **Admin Dashboard**
  - [ ] Admin can log in
  - [ ] Admin can view player registrations
  - [ ] Admin can assign teams
  - [ ] Admin can approve/reject players

- [ ] **Payment Flow** (if applicable)
  - [ ] Checkout page loads
  - [ ] Payment processing works
  - [ ] Payment confirmation emails sent
  - [ ] Invoice generation works
  - [ ] ⚠️ **Payment links in approval emails use `https://www.wcsbasketball.site`** (not old Vercel URL)
  - [ ] Magic link redirects to new domain correctly

- [ ] **Email Functionality**
  - [ ] Registration emails sent
  - [ ] Admin notification emails sent
  - [ ] Payment confirmation emails sent
  - [ ] Email links work correctly
  - [ ] Email formatting looks good

#### Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

#### Mobile Testing

- [ ] Responsive design works on mobile
- [ ] Touch interactions work
- [ ] Forms are usable on mobile
- [ ] Navigation works on mobile

#### Performance Testing

- [ ] Page load times are acceptable
- [ ] Images are optimized
- [ ] No console errors or warnings
- [ ] API responses are fast

---

## 📊 Monitoring & Analytics

### Setup Monitoring Services

#### Optional Environment Variables

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=[your-sentry-dsn]

# Upstash Redis (if using)
UPSTASH_REDIS_REST_URL=[your-upstash-url]
UPSTASH_REDIS_REST_TOKEN=[your-upstash-token]

# UptimeRobot (if using)
UPTIMEROBOT_API_KEY=[your-uptimerobot-key]

# Cron Jobs
CRON_SECRET=[your-cron-secret]
```

**Action Required:**

1. **Vercel Analytics** (Recommended)
   - Enabled automatically in Vercel
   - Monitor: Page views, performance, errors

2. **Sentry Error Tracking** (Optional but Recommended)
   - Go to [Sentry Dashboard](https://sentry.io)
   - Create project
   - Copy DSN
   - Add to environment variables

3. **Uptime Monitoring** (Optional)
   - Set up UptimeRobot or similar service
   - Monitor your production URL
   - Configure alerts

**Monitoring Checklist:**
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring set up
- [ ] Alert notifications configured
- [ ] Log aggregation set up (if applicable)

---

## 📱 SMS Configuration (Twilio) - Optional

**Only required if using SMS notifications**

#### ✅ Environment Variables

```bash
TWILIO_SID=[your-twilio-sid]
TWILIO_AUTH_TOKEN=[your-twilio-auth-token]
TWILIO_PHONE=[your-twilio-phone-number]
ADMIN_PHONE=[your-admin-phone-number]
```

**Action Required:**
- [ ] Get Twilio credentials from Twilio Dashboard
- [ ] Add to Vercel environment variables
- [ ] Test SMS notifications

---

## ✅ Post-Launch Tasks

### Immediate Actions After Launch

1. **Monitor Initial Activity**
   - [ ] Watch for errors in Vercel logs
   - [ ] Check Sentry for new errors
   - [ ] Monitor email delivery
   - [ ] Check payment processing (if applicable)

2. **Verify Critical Functions**
   - [ ] Test complete registration flow
   - [ ] Verify emails are being sent
   - [ ] Check admin notifications
   - [ ] Test payment flow (if applicable)

3. **Communication**
   - [ ] Announce launch to team
   - [ ] Share admin credentials securely
   - [ ] Provide user support contact info

4. **Documentation**
   - [ ] Document any production-specific notes
   - [ ] Update runbooks if needed
   - [ ] Document any issues encountered

### First Week Monitoring

- [ ] Daily error log review
- [ ] Monitor email delivery rates
- [ ] Check payment success rates (if applicable)
- [ ] Review user feedback
- [ ] Monitor site performance
- [ ] Check database performance

### Ongoing Maintenance

- [ ] Regular security updates
- [ ] Database backups verified
- [ ] Monitor API rate limits
- [ ] Review and rotate credentials periodically
- [ ] Update dependencies as needed

---

## 🚨 Emergency Contacts & Rollback

### If Issues Occur

1. **Immediate Actions:**
   - Check Vercel deployment logs
   - Review Supabase logs
   - Check email service status
   - Review error tracking (Sentry)

2. **Rollback Procedure:**
   - Go to Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "Promote to Production"
   - Investigate issues in development

3. **Emergency Contacts:**
   - Vercel Support: [support@vercel.com](mailto:support@vercel.com)
   - Supabase Support: [support@supabase.com](mailto:support@supabase.com)
   - Resend Support: [support@resend.com](mailto:support@resend.com)

---

## 📝 Quick Reference

### Environment Variables Summary

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `ADMIN_NOTIFICATIONS_TO` ⚠️ **Update for production!**

**Optional:**
- Stripe variables (if using payments)
- Twilio variables (if using SMS)
- Sentry DSN (for error tracking)
- Monitoring service variables

### Key URLs

- **Production Site**: https://www.wcsbasketball.site
- **Vercel Deployment**: https://wcs-basketball-v2.vercel.app (redirects to custom domain)
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Resend Dashboard**: https://resend.com
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## ✅ Final Pre-Launch Checklist

Before going live, verify:

- [ ] All environment variables configured in Vercel
- [ ] Email service (Resend) configured and tested
- [ ] Admin email notifications configured correctly
  - [ ] Testing: Single admin email set
  - [ ] Production: All 3 admin emails added (comma-separated)
- [ ] Supabase redirect URLs configured (both www and non-www versions)
- [ ] Custom domain configured (`www.wcsbasketball.site`)
- [ ] Payment links verified to use new domain (not old Vercel URL)
- [ ] All core functionality tested
- [ ] Payment flow tested (if applicable)
- [ ] Error tracking configured
- [ ] Monitoring set up
- [ ] Backup and rollback plan ready
- [ ] Team notified and ready

---

**Ready to Launch?** 🚀

Once all checklist items are complete, you're ready to go live! Monitor closely for the first few hours and be ready to address any issues quickly.

**Good luck with your launch!** 🏀

