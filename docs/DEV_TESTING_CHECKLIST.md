# Development Mode Testing Checklist

**Before Testing in Dev Mode**

## ✅ Required Environment Variables (.env.local)

Make sure your `.env.local` file has these variables set:

```bash
# ============================================
# SUPABASE CONFIGURATION (REQUIRED)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ============================================
# BASE URL (REQUIRED for dev)
# ============================================
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ============================================
# EMAIL CONFIGURATION (REQUIRED)
# ============================================
RESEND_API_KEY=re_your_key_here
RESEND_FROM="WCS Basketball <onboarding@resend.dev>"
RESEND_DEV_TO="phronesis700@gmail.com"  # Only for admin emails in dev mode

# ============================================
# ADMIN NOTIFICATIONS (REQUIRED)
# ============================================
ADMIN_NOTIFICATIONS_TO="phronesis700@gmail.com"

# ============================================
# STRIPE (REQUIRED for payment testing)
# ============================================
STRIPE_SECRET_KEY=sk_test_...  # Use TEST keys for dev
STRIPE_PRICE_ANNUAL=price_...   # Test price ID
STRIPE_PRICE_MONTHLY=price_...  # Test price ID
STRIPE_WEBHOOK_SECRET=whsec_... # Test webhook secret
```

## ✅ Supabase Configuration

### 1. Redirect URLs
Go to Supabase Dashboard → Authentication → URL Configuration

**Add these redirect URLs:**
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/registration-success`
- `http://localhost:3000/parent/profile`
- `http://localhost:3000/checkout/*`
- `http://localhost:3000/payment/*`

### 2. Email Templates
- Verify Supabase email templates are configured
- Magic link emails should redirect to `http://localhost:3000`

## ✅ Stripe Configuration

### 1. Test Mode
- ✅ Use **TEST** keys (not live keys)
- ✅ `STRIPE_SECRET_KEY` should start with `sk_test_`
- ✅ Use test price IDs from Stripe Dashboard

### 2. Webhook Setup for Local Testing
For local webhook testing, you'll need to use Stripe CLI:

```bash
# Install Stripe CLI if not already installed
# Then run:
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

This will give you a webhook signing secret (starts with `whsec_`) - use this for `STRIPE_WEBHOOK_SECRET` in dev mode.

**Note**: Without Stripe CLI, webhooks won't work in local dev. You can still test the payment flow, but payment status updates won't happen automatically.

## ✅ Email Routing Verification

**Important**: With the new email routing logic:
- **Admin emails** → Go to `phronesis700@gmail.com` (only in dev mode with sandbox sender)
- **Parent emails** → Go to actual parent email addresses

**To verify email routing is working:**
1. Check that `ADMIN_NOTIFICATIONS_TO` is set to `phronesis700@gmail.com`
2. Check that `RESEND_FROM` includes `@resend.dev` (sandbox sender)
3. In dev mode, admin emails will be redirected to `RESEND_DEV_TO`
4. Parent emails will go to their actual addresses

## ✅ Database Verification

Before testing, verify:
- ✅ Supabase connection is working
- ✅ Database tables exist: `parents`, `players`, `pending_registrations`, `payments`
- ✅ You have admin access to approve players

## ✅ Development Server

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Verify it's running:**
   - Open: `http://localhost:3000`
   - Should see the homepage

3. **Check for errors:**
   - Check browser console for errors
   - Check terminal for server errors
   - Verify no missing environment variable warnings

## ✅ Quick Pre-Test Verification

Run these quick checks before starting full testing:

1. **Registration Page Loads:**
   - Go to: `http://localhost:3000/register`
   - ✅ Page loads without errors
   - ✅ Registration Wizard form is visible
   - ✅ "Sign in with Google" button is visible

2. **Admin Dashboard Access:**
   - Go to: `http://localhost:3000/admin/club-management`
   - ✅ Can log in as admin
   - ✅ Dashboard loads

3. **Email Service:**
   - Check that `RESEND_API_KEY` is set
   - Check that emails can be sent (you'll see this during testing)

## ⚠️ Important Notes for Dev Testing

1. **Email Delivery:**
   - Parent emails will go to actual email addresses (not phronesis700@gmail.com)
   - Admin emails will go to phronesis700@gmail.com
   - Make sure you have access to the test parent email addresses you use

2. **Stripe Test Mode:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any 5-digit ZIP

3. **Webhook Testing:**
   - If not using Stripe CLI, webhooks won't fire automatically
   - You can manually trigger webhook events in Stripe Dashboard
   - Or test payment flow without webhooks (payment will show as pending)

4. **Database Cleanup:**
   - Consider cleaning up test data after testing
   - Or use unique test emails for each test run

## 🚀 Ready to Test?

Once all items above are checked, you're ready to start testing!

Follow the step-by-step guide in: `docs/COMPLETE_REGISTRATION_FLOW_ROADMAP.md`

---

**Next Steps After Dev Testing:**
- Once dev testing is complete, we'll prepare for production deployment
- Production will require different environment variables and configuration
- **DO NOT publish until you explicitly ask**

