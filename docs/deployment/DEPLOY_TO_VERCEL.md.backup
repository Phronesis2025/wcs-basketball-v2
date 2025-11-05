# Deploying WCS Basketball v2.0 to Vercel

## Prerequisites

✅ Your code is already on GitHub and working locally
✅ You have a Vercel account (connect your GitHub)

## Deployment Steps

### 1. Push Your Code to GitHub (if not already done)

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Connect Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

**CRITICAL:** Add these environment variables in Vercel Dashboard:

#### Supabase Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://htgkddahhgugesktujds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**How to get these values:**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `htgkddahhgugesktujds`
3. Go to Settings → API
4. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (secret!)

#### Stripe Variables (if using payments)

```
STRIPE_SECRET_KEY=sk_live_[your-secret-key]
STRIPE_PRICE_ANNUAL=price_[your-price-id]
STRIPE_PRICE_MONTHLY=price_[your-price-id]
STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

#### Additional Required Variables

```
NEXT_PUBLIC_BASE_URL=https://wcs-basketball-v2.vercel.app
```

#### Optional Environment Variables

```
# Email Service (Resend)
RESEND_API_KEY=re_[your-api-key]
RESEND_FROM="WCS Basketball <onboarding@resend.dev>"
ADMIN_NOTIFICATIONS_TO=admin@example.com

# SMS Service (Twilio)
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone_number
ADMIN_PHONE=your_admin_phone_number

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Cron Jobs
CRON_SECRET=your_cron_secret
```

### 4. Import Environment Variables in Vercel

1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add each variable one by one
4. Select "Production", "Preview", and "Development" for each
5. Click "Save"

### 5. Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Check build logs for any errors

## Post-Deployment Configuration

### 1. Configure Supabase Auth Redirect URLs

**CRITICAL:** Must configure these in Supabase Dashboard:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to allowed redirect URLs:
   ```
   https://your-app.vercel.app/**
   ```
3. Add site URL:
   ```
   https://your-app.vercel.app
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
2. Add endpoint: `https://your-app.vercel.app/api/stripe-webhook`
3. Copy the webhook signing secret
4. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`

## Testing the Deployment

### 1. Test Registration Flow

1. Navigate to your Vercel URL
2. Go to `/register`
3. Register a new user
4. Check if email confirmation is sent
5. If disabled, user should be auto-logged in

### 2. Test Authentication

1. Go to `/parent/login`
2. Sign in with test credentials
3. Verify profile page loads
4. Check console for errors

### 3. Test API Routes

1. Check `/api/parent/profile` returns data
2. Test admin routes (if applicable)
3. Monitor Vercel function logs

## Troubleshooting

### Build Fails

- Check Vercel build logs
- Ensure all environment variables are set
- Verify TypeScript/Next.js version compatibility

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

## Current Production URL

If already deployed, your URL should be:

- **Production:** https://wcs-basketball-v2.vercel.app

## Security Notes

⚠️ **Never commit environment variables to git**

- `.env.local` is in `.gitignore` ✓
- Only use Vercel dashboard for production secrets
- Rotate credentials if exposed

## Next Steps After Deployment

1. Update your production Supabase auth settings
2. Configure domain (optional)
3. Set up monitoring (Vercel Analytics)
4. Configure email sending service
5. Test payment flow (if applicable)
6. Run production smoke tests

## Rollback Plan

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"
4. Fix issues locally
5. Redeploy when ready

## Support

For issues:

- Check Vercel logs: Dashboard → Deployments → [deployment] → View Function Logs
- Check Supabase logs: Dashboard → Logs
- Review browser console errors
- Check this documentation: `docs/DEPLOY.md`
