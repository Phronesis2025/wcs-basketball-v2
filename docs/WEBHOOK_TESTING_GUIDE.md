# Stripe Webhook Testing Guide

## 🔍 Where to Check Logs

### Local Development:

1. **Terminal/Console** where your dev server is running (`npm run dev`)
   - Look for: `[DEV]` and `[DEV ERROR]` messages
   - All webhook logs appear here

### Production (Vercel):

1. **Vercel Dashboard** → Your Project → **Functions** → Click on a function → **Logs** tab
2. **Vercel CLI**: `vercel logs --follow`

## 🧪 Testing Steps

### Step 1: Test Payment Lookup

Use the test endpoint to verify your payment record exists:

```bash
# Replace with your actual session ID
curl "http://localhost:3000/api/stripe-webhook/test?session_id=cs_test_a1zpyR8lVQOWLrLKhoH1EmJ1DYzoZIMgLh7WjidGNWLn5wG4uKcp2FXuWT"
```

Or open in browser:

```
http://localhost:3000/api/stripe-webhook/test?session_id=cs_test_a1zpyR8lVQOWLrLKhoH1EmJ1DYzoZIMgLh7WjidGNWLn5wG4uKcp2FXuWT
```

**Expected Response:**

```json
{
  "found": true,
  "payment": {
    "id": "...",
    "status": "pending",
    "amount": "360",
    "payment_type": "annual"
  },
  "player": {
    "name": "...",
    "parent_email": "...",
    "team_name": "..."
  }
}
```

### Step 2: Test Webhook Locally with Stripe CLI

If you're running locally, Stripe can't reach `localhost`. Use Stripe CLI:

```bash
# Install Stripe CLI (if not installed)
# Windows: https://github.com/stripe/stripe-cli/releases
# Or use: scoop install stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook signing secret that appears (starts with whsec_)
# Add it to your .env.local as STRIPE_WEBHOOK_SECRET
```

Then trigger a test payment, and you'll see webhooks forwarded to your local server.

### Step 3: Check Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Find your webhook endpoint
3. Click on recent events
4. Check the response - if it shows errors, that's why emails aren't being sent

### Step 4: Test Production Webhook

If deployed to Vercel:

1. **Verify Webhook is Configured:**

   - Stripe Dashboard → Developers → Webhooks
   - Endpoint: `https://your-domain.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`
   - Check "Recent events" tab for failed attempts

2. **Check Environment Variables in Vercel:**

   - Vercel Dashboard → Project → Settings → Environment Variables
   - Verify `STRIPE_WEBHOOK_SECRET` is set correctly

3. **Test with a Real Payment:**
   - Complete a test checkout
   - Check Stripe Dashboard → Webhooks → Recent events
   - Should show successful webhook delivery

## 🔧 Manual Webhook Testing

You can manually trigger a webhook using Stripe CLI:

```bash
# Trigger the exact event
stripe trigger checkout.session.completed

# Or forward a specific event ID
stripe events resend evt_1SNZIyB2WuesLU9gUgCP5s4Z
```

## ✅ Verification Checklist

- [ ] Payment record exists in database with correct `stripe_payment_id`
- [ ] Webhook endpoint is configured in Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` environment variable is set correctly
- [ ] Webhook events are being received (check Stripe Dashboard)
- [ ] No signature verification errors in logs
- [ ] Payment status updates from "pending" to "paid"
- [ ] Player status updates to "active"
- [ ] Emails are being sent (check `RESEND_API_KEY` is set)

## 🐛 Common Issues

### "Invalid signature" error

- **Cause**: `STRIPE_WEBHOOK_SECRET` doesn't match Stripe's secret
- **Fix**: Copy the correct secret from Stripe Dashboard → Webhooks → Signing secret

### "No payment found"

- **Cause**: Payment record doesn't exist or `stripe_payment_id` doesn't match
- **Fix**: Use test endpoint to verify payment lookup

### Webhooks not reaching server

- **Local**: Use Stripe CLI `stripe listen --forward-to`
- **Production**: Check webhook URL is correct in Stripe Dashboard

### Emails not sending

- **Check**: `RESEND_API_KEY` environment variable is set
- **Check**: Terminal/logs for email sending errors
- **Check**: `ADMIN_NOTIFICATIONS_TO` is configured for admin emails
