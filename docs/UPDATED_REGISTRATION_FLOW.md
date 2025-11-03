# Updated Registration Flow - Detailed Form Before Payment

**Date**: November 2, 2025  
**Change**: Collect detailed form information BEFORE payment is received

---

## ✅ Changes Applied

### 1. Updated Approval Email Link ✅
- **File**: `src/app/api/approve-player/route.ts`
- **Change**: Approval email now links to `/checkout/[playerId]` instead of `/payment/[playerId]`
- **Reason**: Ensures detailed form is completed before payment

### 2. Updated Status Timeline Link ✅
- **File**: `src/components/parent/StatusTimeline.tsx`
- **Change**: "Complete Payment →" button now links to `/checkout/[playerId]`
- **Button Text**: Changed to "Complete Registration & Payment →" for clarity

### 3. Payment Page Auto-Redirect ✅
- **File**: `src/app/payment/[playerId]/page.tsx`
- **Behavior**: Already implemented - automatically redirects to `/checkout/[playerId]` if `checkout_completed` is false
- **Status**: No changes needed

### 4. Checkout Form Submission ✅
- **File**: `src/app/api/checkout/complete-form/route.ts`
- **Behavior**: Sets `checkout_completed: true` and redirects to `/payment/[playerId]`
- **Status**: Already working correctly

---

## 📋 Complete Flow

### Step 1: New Parent Registration
1. Parent fills out registration form (name, email, player info)
2. Form submitted → `/api/auth/magic-link`
3. Supabase sends confirmation email
4. Parent clicks email link → Confirms account
5. `pending_registration` merged → `parents` and `players` tables created
6. Player status: `pending`

### Step 2: Admin Approval
1. Admin reviews player in Payments tab
2. Admin approves player → `/api/approve-player`
3. **NEW**: Approval email sent to parent with link to `/checkout/[playerId]`
4. Player status: `pending` → `approved`
5. **Note**: `parent_email` is now fetched from `parents` table if missing

### Step 3: Detailed Form (CHECKOUT)
1. Parent clicks approval email link → `/checkout/[playerId]`
2. Parent fills detailed form:
   - Address (line1, line2, city, state, zip)
   - Guardian relationship
   - Emergency contact info
   - Medical information (allergies, conditions, medications)
   - Doctor information
   - Consent forms (photo release, medical treatment, participation)
   - Player details (school, shirt size, position preference, experience)
3. Form submitted → `/api/checkout/complete-form`
4. `checkout_completed` set to `true` on `parents` table
5. Redirects to `/payment/[playerId]`

### Step 4: Payment
1. Payment page loads → Checks `checkout_completed`
   - If `false`: Redirects to `/checkout/[playerId]` (shouldn't happen after Step 3)
   - If `true`: Shows invoice and payment options
2. Parent selects payment type (Annual, Monthly, Custom)
3. Parent clicks "Proceed to Checkout"
4. Stripe checkout session created → `/api/create-checkout-session`
5. Parent redirected to Stripe checkout
6. Payment completed → Webhook updates payment status
7. Receipt sent via Stripe

---

## 🔧 Technical Details

### Database Schema
- **`parents.checkout_completed`**: Boolean flag tracking if detailed form is completed
- **Default**: `false` (must complete form before payment)
- **Set to `true`**: When `/api/checkout/complete-form` is called successfully

### API Routes
1. **`/api/approve-player`**:
   - Sends approval email with `/checkout/[playerId]` link
   - Fetches `parent_email` from `parents` table if missing

2. **`/api/checkout/complete-form`**:
   - Updates `parents` table with detailed information
   - Sets `checkout_completed: true`
   - Updates/creates player with additional details
   - Returns `player_id` for redirect

3. **`/api/parent/checkout-status`**:
   - Returns `checkout_completed` status
   - Used by payment page to determine if redirect is needed

4. **`/api/create-checkout-session`**:
   - Requires `player.parent_email` to be set
   - Creates Stripe checkout session
   - Returns Stripe checkout URL

### Components
1. **`StatusTimeline`**: Shows "Complete Registration & Payment →" link for approved players
2. **`ChildDetailsCard`**: Shows payment buttons (already redirects via payment page)
3. **`CheckoutPage`**: Detailed form UI for collecting all information

---

## ✅ Testing Checklist

### Test 1: New Parent Registration
- [ ] Parent registers with player info
- [ ] Email confirmation received
- [ ] Profile page shows "Pending Review"

### Test 2: Admin Approval
- [ ] Admin approves player
- [ ] Approval email sent to parent
- [ ] Email link points to `/checkout/[playerId]`
- [ ] Player status: `approved`

### Test 3: Detailed Form (CHECKOUT)
- [ ] Parent clicks approval email link
- [ ] Checkout form loads at `/checkout/[playerId]`
- [ ] All form fields available:
  - Address fields
  - Emergency contact
  - Medical information
  - Doctor information
  - Consent checkboxes
  - Player details (school, shirt size, etc.)
- [ ] Form submission successful
- [ ] Redirects to `/payment/[playerId]`
- [ ] `checkout_completed` set to `true`

### Test 4: Payment
- [ ] Payment page loads (does NOT redirect to checkout)
- [ ] Invoice shows correct amount ($360)
- [ ] Payment options available (Annual, Monthly, Custom)
- [ ] "Proceed to Checkout" button works
- [ ] Stripe checkout session created
- [ ] Redirects to Stripe checkout
- [ ] Payment can be completed

### Test 5: Direct Payment Link (Should Redirect)
- [ ] Parent navigates directly to `/payment/[playerId]` before checkout
- [ ] Payment page detects `checkout_completed: false`
- [ ] Automatically redirects to `/checkout/[playerId]`

---

## 🐛 Known Issues Fixed

### Issue 1: `parent_email` Missing
- **Problem**: Player records created without `parent_email`
- **Fix**: `merge-pending-registration` now sets `parent_email` during player creation
- **Additional Fix**: `approve-player` now fetches `parent_email` if missing

### Issue 2: Approval Email Not Sent
- **Problem**: Approval email not sent when `parent_email` was NULL
- **Fix**: Added logic to fetch `parent_email` from `parents` table before sending

---

## 📝 Environment Variables Required

```bash
# Base URL (for email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Development
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # Production

# Admin notification email
ADMIN_NOTIFICATIONS_TO=admin@example.com

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (for admin notifications)
RESEND_API_KEY=re_...
```

---

## 🎯 Next Steps for Testing

1. **Start dev server**: Already running ✅
2. **Clear browser storage**: User will clear manually
3. **Test from beginning**: 
   - New parent registration
   - Admin approval
   - Detailed form completion
   - Payment processing
4. **Verify**: All detailed form data saved correctly
5. **Verify**: Payment only accessible after form completion

