# Environment Variables Setup Guide

## Security Best Practices for Environment Variables

This guide explains how to properly set up environment variables for the WCS v2.0 project to ensure security and proper configuration.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# ============================================
# REQUIRED - Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://htgkddahhgugesktujds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ============================================
# REQUIRED - Base URL Configuration
# ============================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Production: https://wcs-basketball-v2.vercel.app

# ============================================
# OPTIONAL - Payment Integration (Stripe)
# ============================================
# STRIPE_SECRET_KEY=sk_live_[your-secret-key]
# STRIPE_PRICE_ANNUAL=price_[your-price-id]
# STRIPE_PRICE_MONTHLY=price_[your-price-id]
# STRIPE_PRICE_QUARTERLY=price_[your-quarterly-price-id]  # Optional: Quarterly payment option
# STRIPE_WEBHOOK_SECRET=whsec_[your-webhook-secret]

# ============================================
# OPTIONAL - Email Service (Resend)
# ============================================
# RESEND_API_KEY=re_[your-api-key]
# RESEND_FROM="WCS Basketball <onboarding@resend.dev>"
# ADMIN_NOTIFICATIONS_TO=admin@example.com

# ============================================
# OPTIONAL - SMS Service (Twilio)
# ============================================
# TWILIO_SID=your_twilio_sid
# TWILIO_AUTH_TOKEN=your_twilio_token
# TWILIO_PHONE=your_twilio_phone_number
# ADMIN_PHONE=your_admin_phone_number

# ============================================
# OPTIONAL - Monitoring & Analytics
# ============================================
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
# UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
# UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
# UPTIMEROBOT_API_KEY=your_uptimerobot_api_key_here

# ============================================
# OPTIONAL - Cron Jobs
# ============================================
# CRON_SECRET=your_cron_secret_here
```

## Security Features

This setup supports comprehensive security features including:

- **CSRF Protection**: Cryptographic token-based protection for all forms
- **Row Level Security**: Database-level access control via Supabase RLS policies
- **Enhanced Security Headers**: XSS protection, clickjacking prevention, and more
- **Input Validation**: Email format, password strength, and sanitization
- **Rate Limiting**: Client-side protection against brute force attacks
- **Audit Logging**: Security event tracking and monitoring

## Security Rules

### ✅ DO:

- Create `.env.local` file (this is already in .gitignore)
- Use descriptive variable names
- Add comments explaining what each variable is for
- Keep sensitive keys secure and never share them

### ❌ DON'T:

- Never commit `.env.local` to version control
- Never hardcode secrets in your source code
- Never share environment variables in chat or email
- Never use the same keys across different environments

## How to Get Your Keys

### Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

### Sentry

1. Go to your Sentry project settings
2. Navigate to Client Keys (DSN)
3. Copy the DSN value

### Upstash Redis

1. Go to your Upstash console
2. Select your Redis database
3. Copy the REST URL and REST Token

## Environment-Specific Configuration

- **Development**: Use `.env.local` for local development
- **Production**: Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- **Testing**: Use `.env.test` for testing environments

## Verification

After setting up your environment variables, restart your development server:

```bash
npm run dev
```

Check the browser console to ensure no "Missing environment variables" errors appear.

## Troubleshooting

If you see errors about missing environment variables:

1. Verify the `.env.local` file exists in the project root
2. Check that variable names match exactly (case-sensitive)
3. Restart your development server
4. Ensure there are no extra spaces or quotes around values

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] Environment variables are properly validated
- [ ] Different keys for different environments
- [ ] Regular rotation of sensitive keys
