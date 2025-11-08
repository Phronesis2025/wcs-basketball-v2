# Step-by-Step Registration & Payment Flow Testing Guide

**Last Updated**: January 2025  
**Purpose**: Complete testing guide for end-to-end registration and payment flow

---

## 📋 Pre-Testing Setup

### Environment Variables Required

```bash
# Admin notifications (only admin emails go to this address)
ADMIN_NOTIFICATIONS_TO="phronesis700@gmail.com"

# Email service
RESEND_API_KEY=re_your_key_here
RESEND_FROM="WCS Basketball <onboarding@resend.dev>"
RESEND_DEV_TO="phronesis700@gmail.com"  # Only for admin emails in dev mode

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Development
# NEXT_PUBLIC_BASE_URL="https://wcs-basketball-v2.vercel.app"  # Production

# Stripe (for payment processing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email Routing Configuration

**⚠️ CRITICAL - Resend Domain Verification Required for Production**

**Current Issue**: Using Resend sandbox (`@resend.dev`) - **only allows sending to account owner** (`phronesis700@gmail.com`)

**To Fix Production Emails**:

1. Verify a domain in Resend (see `docs/RESEND_DOMAIN_VERIFICATION_GUIDE.md`)
2. Update `RESEND_FROM` in Vercel to use verified domain (e.g., `noreply@yourdomain.com`)
3. Redeploy application

**Email Routing**:

- **Sandbox Mode** (`@resend.dev`): ALL emails → `phronesis700@gmail.com` (current - production blocked)
- **Verified Domain Mode**: Emails → actual recipients (after domain verification)

**Quick Setup Guide**: See `docs/PRODUCTION_EMAIL_SETUP.md`

---

## 🧪 Test Scenario 1: New Parent Registration via Email

### Test Data

- **Parent Name**: Test Parent
- **Parent Email**: `testparent@example.com` (use a real email you can access)
- **Player Name**: Test Player
- **Player Birthdate**: 2010-01-15 (Age 14)
- **Player Grade**: 8
- **Player Gender**: Male

### Step 1: Initial Registration

1. **Navigate to Registration Page**

   - Go to: `http://localhost:3000/register`
   - Verify: Page loads with "Register Your Player" heading
   - Verify: Registration Wizard form is visible

2. **Fill Out Registration Form**

   - **Step 1 - Parent Information**:

     - First Name: `Test`
     - Last Name: `Parent`
     - Email: `testparent@example.com`
     - Phone: `555-123-4567`
     - Click "Next"

   - **Step 2 - Player Information**:

     - First Name: `Test`
     - Last Name: `Player`
     - Birthdate: `2010-01-15`
     - Grade: `8`
     - Gender: `Male`
     - Experience Level: `3`
     - Click "Next"

   - **Step 3 - Review & Consent**:
     - Check "I confirm this player is my child/ward" (COPPA consent)
     - Check "I agree to the waiver" (if applicable)
     - Click "Submit Registration"

3. **Verify Submission**
   - ✅ Success message: "Registration submitted successfully!"
   - ✅ Redirected to `/parent/profile?registered=true`

### Step 2: Email Confirmation

1. **Check Email Inbox** (`testparent@example.com`)

   - ✅ **Supabase Confirmation Email** received
   - ✅ Email contains magic link to confirm account
   - ✅ Link format: `http://localhost:3000/auth/callback?magic_link_token=...&player=Test Player`

2. **Click Confirmation Link**

   - ✅ Redirected to `/auth/callback`
   - ✅ Automatically signed in
   - ✅ Redirected to `/parent/profile?registered=true`

3. **Verify Database Records**

   - ✅ User created in `auth.users` table
   - ✅ Parent record created in `parents` table:
     - `email`: `testparent@example.com`
     - `first_name`: `Test`
     - `last_name`: `Parent`
     - `checkout_completed`: `false`
   - ✅ Player record created in `players` table:
     - `name`: `Test Player`
     - `status`: `pending`
     - `parent_email`: `testparent@example.com` ✅
   - ✅ `pending_registrations` record marked as merged

4. **Check Email Notifications**
   - ⚠️ **Parent Email**:
     - If using sandbox (`@resend.dev`): Goes to `phronesis700@gmail.com` (see intended recipient in email body)
     - If using verified domain: Goes to actual parent email (`testparent@example.com`)
   - ⚠️ **Admin Email**:
     - If using sandbox: Goes to `phronesis700@gmail.com`
     - If using verified domain: Goes to admin email(s) in `ADMIN_NOTIFICATIONS_TO`
   - **Note**: Until domain is verified, ALL emails go to `phronesis700@gmail.com` (Resend requirement)

### Step 3: Admin Approval

1. **Admin Login**

   - Navigate to: `http://localhost:3000/admin/club-management`
   - Login as admin user
   - Verify: Dashboard loads

2. **Find Pending Player**

   - Navigate to "Players" section
   - Find "Test Player" in pending list
   - Verify: Player status is `pending`

3. **Approve Player**

   - Select a team for the player (e.g., "WCS Eagles Elite")
   - Click "Approve" button
   - Verify: Success message appears
   - Verify: Player status changes to `approved` in database

4. **Check Email Notifications**
   - ✅ **Parent Email** (`testparent@example.com`): Approval email received
   - ✅ Approval email contains link to `/checkout/[playerId]`
   - ✅ Link is a magic link that auto-authenticates
   - ✅ **Admin Email** (`phronesis700@gmail.com`): No SMS (Twilio removed)

### Step 4: Complete Checkout Form

1. **Click Approval Email Link**

   - Click the link in the approval email
   - ✅ Redirected to `/checkout/[playerId]`
   - ✅ Automatically authenticated (magic link)
   - ✅ Checkout form is visible

2. **Fill Out Detailed Checkout Form**

   - **Address Information**:

     - Address Line 1: `123 Main Street`
     - Address Line 2: `Apt 4B`
     - City: `Springfield`
     - State: `IL`
     - ZIP: `62701`

   - **Guardian Information**:

     - Guardian Relationship: `Parent`
     - Emergency Contact Name: `Jane Parent`
     - Emergency Contact Phone: `555-987-6543`

   - **Medical Information**:

     - Allergies: `None`
     - Medical Conditions: `None`
     - Medications: `None`
     - Doctor Name: `Dr. Smith`
     - Doctor Phone: `555-111-2222`

   - **Consents**:

     - ✅ Photo Release Consent
     - ✅ Medical Treatment Consent
     - ✅ Participation Consent

   - **Player Details** (if updating):

     - School Name: `Springfield Middle School`
     - Shirt Size: `M`
     - Position Preference: `Guard`
     - Previous Experience: `3 years`

   - **Payment Selection**:

     - Select: `Annual ($360)`

   - **Password Setup** (if first time):
     - Password: `SecurePassword123!`
     - Confirm Password: `SecurePassword123!`

3. **Submit Checkout Form**

   - Click "Complete Registration & Proceed to Payment"
   - ✅ Form submits successfully
   - ✅ Redirected to Stripe checkout page

4. **Verify Database Updates**
   - ✅ `parents.checkout_completed`: `true`
   - ✅ `parents` table updated with address, medical, consent info
   - ✅ `players` table updated with school, shirt size, position
   - ✅ Payment record created with `status: "pending"`

### Step 5: Complete Payment

1. **Stripe Checkout**

   - On Stripe checkout page
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
   - Click "Pay"

2. **Payment Success**

   - ✅ Redirected to `/payment/success?player=[playerId]`
   - ✅ Success message displayed

3. **Verify Webhook Processing**

   - Wait 1-2 seconds for webhook
   - ✅ Payment record updated: `status: "paid"`
   - ✅ Player status updated: `status: "active"`

4. **Check Email Notifications**
   - ✅ **Parent Email** (`testparent@example.com`): Payment confirmation email received
   - ✅ Payment confirmation includes:
     - Payment receipt details
     - Team information
     - Practice schedule (next 2 weeks)
     - Game schedule (next 2 weeks)
     - Coach information
     - Equipment list
   - ✅ **Admin Email** (`phronesis700@gmail.com`): Payment notification received
   - ✅ **Parent Email** (`testparent@example.com`): Stripe receipt email (may be delayed in test mode)

---

## 🧪 Test Scenario 2: New Parent Registration via Gmail OAuth

### Test Data

- **Gmail Account**: Use a real Gmail account you can access
- **Player Name**: OAuth Test Player
- **Player Birthdate**: 2011-06-20 (Age 13)
- **Player Grade**: 7
- **Player Gender**: Female

### Step 1: OAuth Registration

1. **Navigate to Registration Page**

   - Go to: `http://localhost:3000/register`
   - Verify: "Sign in with Google" button is visible

2. **Click "Sign in with Google"**

   - ✅ Redirected to Google OAuth consent screen
   - Select Gmail account
   - Grant permissions
   - ✅ Redirected back to `/auth/callback?code=...`

3. **OAuth Callback Processing**

   - ✅ Supabase processes OAuth code
   - ✅ User session created
   - ✅ If no pending registration: Redirected to `/register?oauth=success&email=[gmail]`

4. **Complete Registration Form**

   - Form should be pre-filled with Gmail email
   - Fill out player information:
     - First Name: `OAuth Test`
     - Last Name: `Player`
     - Birthdate: `2011-06-20`
     - Grade: `7`
     - Gender: `Female`
     - Experience Level: `2`
   - Complete consents
   - Submit form

5. **Verify Registration**
   - ✅ Redirected to `/parent/profile?registered=true`
   - ✅ User is authenticated

### Step 2: Verify Database Records

1. **Check Database**

   - ✅ User created in `auth.users` with Gmail email
   - ✅ Parent record created:
     - `email`: Gmail address
     - `user_id`: Links to auth.users
   - ✅ Player record created:
     - `name`: `OAuth Test Player`
     - `status`: `pending`
     - `parent_email`: Gmail address ✅

2. **Check Email Notifications**
   - ✅ **Parent Email** (Gmail address): Registration confirmation email received
   - ✅ **Admin Email** (`phronesis700@gmail.com`): New registration notification received

### Step 3: Admin Approval (Same as Test Scenario 1, Step 3)

1. **Admin Approves Player**

   - Admin assigns team
   - Clicks "Approve"
   - ✅ Player status: `approved`

2. **Check Approval Email**
   - ✅ **Parent Email** (Gmail address): Approval email received
     - ⚠️ **Note**: If using sandbox (`@resend.dev`), email will go to `phronesis700@gmail.com` instead
   - ✅ Email contains magic link to checkout
   - ✅ Link uses Gmail address (not parents.email)

### Step 4: Complete Checkout & Payment (Same as Test Scenario 1, Steps 4-5)

1. **Complete Checkout Form**

   - Click approval email link
   - Fill out detailed form
   - Submit

2. **Complete Payment**

   - Stripe checkout
   - Payment success

3. **Verify Final State**
   - ✅ Player status: `active`
   - ✅ Payment status: `paid`
   - ✅ All emails received at Gmail address (not phronesis700@gmail.com)

---

## 📊 Testing Checklist

### Registration Flow

- [ ] Email registration creates pending_registrations record
- [ ] Supabase confirmation email sent to parent
- [ ] Email confirmation link works
- [ ] User account created after confirmation
- [ ] Parent and player records created
- [ ] `parent_email` set on player record
- [ ] Admin notification sent to phronesis700@gmail.com
- [ ] Parent confirmation email sent to actual parent email

### OAuth Flow

- [ ] Gmail OAuth redirects correctly
- [ ] OAuth callback processes correctly
- [ ] Registration form pre-fills with Gmail email
- [ ] User account created with Gmail email
- [ ] Parent record links to auth.users
- [ ] Player record created with Gmail as parent_email

### Admin Approval

- [ ] Admin can view pending players
- [ ] Admin can assign team
- [ ] Admin can approve player
- [ ] Player status changes to `approved`
- [ ] Approval email sent to parent (actual email, not phronesis700@gmail.com)
- [ ] Approval email link points to `/checkout/[playerId]`
- [ ] Magic link in approval email auto-authenticates

### Checkout Form

- [ ] Checkout form loads after approval
- [ ] All form fields are present
- [ ] Form validation works
- [ ] Form submission updates database
- [ ] `checkout_completed` set to `true`
- [ ] Stripe checkout session created
- [ ] Redirect to Stripe works

### Payment Processing

- [ ] Stripe checkout page loads
- [ ] Test payment succeeds
- [ ] Webhook processes payment
- [ ] Payment record updated to `paid`
- [ ] Player status updated to `active`
- [ ] Payment confirmation email sent to parent (actual email)
- [ ] Admin payment notification sent to phronesis700@gmail.com
- [ ] Stripe receipt email sent to parent (may be delayed in test mode)

### Email Routing Verification

- [ ] Admin emails go to phronesis700@gmail.com
- [ ] Parent confirmation emails go to actual parent email
- [ ] Approval emails go to actual parent email
- [ ] Payment confirmation emails go to actual parent email
- [ ] Admin notifications go to phronesis700@gmail.com

---

## 🐛 Known Issues & Resolutions

### Issue #1: Missing `parent_email` in Player Record ✅ RESOLVED

- **Status**: Fixed
- **Verification**: Check that `players.parent_email` is set after registration

### Issue #2: Admin Notification Missing ✅ RESOLVED

- **Status**: Fixed
- **Verification**: Admin email received at phronesis700@gmail.com after registration

### Issue #3: Approval Email Not Sent ✅ RESOLVED

- **Status**: Fixed
- **Verification**: Approval email sent even if `parent_email` was initially NULL

### Issue #4: Detailed Form Bypassed ✅ RESOLVED

- **Status**: Fixed
- **Verification**: Approval links point to `/checkout/[playerId]`, not `/payment/[playerId]`

### Issue #5: Stripe Receipt Email Delay ⚠️ PARTIALLY RESOLVED

- **Status**: Works in production, may be delayed in test mode
- **Verification**: Check parent email for Stripe receipt (may take a few minutes)

---

## 📝 Test Results Template

### Test Run: [Date]

**Test Scenario 1: Email Registration**

- Registration: ✅ / ❌
- Email Confirmation: ✅ / ❌
- Database Records: ✅ / ❌
- Admin Notification: ✅ / ❌
- Approval: ✅ / ❌
- Checkout Form: ✅ / ❌
- Payment: ✅ / ❌
- Final Emails: ✅ / ❌

**Test Scenario 2: Gmail OAuth**

- OAuth Flow: ✅ / ❌
- Registration: ✅ / ❌
- Database Records: ✅ / ❌
- Admin Notification: ✅ / ❌
- Approval: ✅ / ❌
- Checkout Form: ✅ / ❌
- Payment: ✅ / ❌
- Final Emails: ✅ / ❌

**Email Routing Verification**

- Admin emails to phronesis700@gmail.com: ✅ / ❌
- Parent emails to actual addresses: ✅ / ❌

**Issues Found:**

- [List any issues encountered]

---

## 🎯 Success Criteria

For a successful test run:

1. ✅ Both registration routes (Email and Gmail) work end-to-end
2. ✅ All database records created correctly
3. ✅ All emails sent to correct addresses:
   - Admin emails → phronesis700@gmail.com
   - Parent emails → actual parent email addresses
4. ✅ Admin approval process works
5. ✅ Checkout form collects all required information
6. ✅ Payment processing completes successfully
7. ✅ Player status progresses: `pending` → `approved` → `active`
8. ✅ Payment status progresses: `pending` → `paid`

---

**Document Version**: 2.0  
**Last Updated**: January 2025  
**Status**: Ready for Testing ✅
