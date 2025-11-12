# Plan Review Summary - Supabase Email Customization

**Date:** 2025-11-02  
**Plan Document:** `player.plan.md`  
**Status:** ⏳ **In Progress** - 3 of 6 steps completed

---

## 📋 Plan Overview

**Goal:** Use Supabase's confirmation email as the single "Welcome to WCS Basketball! Registration Received" email, eliminating duplicate emails to parents.

**Key Benefit:** Streamlined registration flow with one email instead of two separate emails.

---

## ✅ Completed Steps (3/6)

### 1. ✅ Customize Supabase Email Template (Dashboard)

- **Status:** COMPLETED
- **Location:** Supabase Dashboard → Authentication → Email Templates
- **HTML Template:** Created and configured
- **Issue:** Logo image not appearing in email
  - Logo needs to be fixed using one of three options (A, B, or C)
  - **Recommendation:** Use Option B (Base64 embedded image) for maximum compatibility

### 2. ✅ Configure Supabase Redirect URLs

- **Status:** COMPLETED
- **URLs Added:**
  - `http://localhost:3000/registration-success`
  - `http://localhost:3000/auth/callback`
  - `https://wcs-basketball-v2.vercel.app/registration-success`
  - `https://wcs-basketball-v2.vercel.app/auth/callback`

### 3. ✅ Registration Success Page

- **Status:** VERIFIED (needs re-verification after changes)
- **File:** `src/app/registration-success/page.tsx`
- **Current Features:**
  - Extracts player name from URL params ✅
  - Has link to parent profile ✅
  - **Needs:** Verification that auto-signin works correctly

---

## ⏳ Pending Steps (3/6)

### 4. ⏳ Update Registration Flow

**File:** `src/app/register/page.tsx`  
**Lines:** 188-191

**What Needs to Change:**

```typescript
// CURRENT CODE:
const { data: signUp, error: signErr } = await supabase.auth.signUp({
  email,
  password: password!,
});

// NEW CODE NEEDED:
// Get base URL dynamically for redirect (works in both dev and prod)
const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL ||
      "https://wcs-basketball-v2.vercel.app";

const { data: signUp, error: signErr } = await supabase.auth.signUp({
  email,
  password: password!,
  options: {
    data: {
      playerName: `${firstName} ${lastName}`,
      grade: grade,
      gender: gender,
    },
    emailRedirectTo: `${baseUrl}/registration-success?player=${encodeURIComponent(
      firstName
    )}`,
  },
});
```

**Why This Matters:**

- Stores player metadata in user account (accessible in email template)
- Sets up automatic redirect after email confirmation
- Works in both development and production environments

---

### 5. ⏳ Create Email Confirmation Callback Route

**File:** `src/app/auth/callback/route.ts` (NEW FILE)

**Purpose:** Handle the email confirmation link click and auto-sign-in the user.

**Implementation Needed:**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const player = requestUrl.searchParams.get("player");

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      // Redirect to registration success with player name
      const redirectUrl = new URL("/registration-success", requestUrl.origin);
      if (player) {
        redirectUrl.searchParams.set("player", player);
      }
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Error case - redirect to registration page
  return NextResponse.redirect(
    new URL("/register?error=confirmation_failed", requestUrl.origin)
  );
}
```

**What This Does:**

- Verifies the email confirmation token
- Automatically signs in the user
- Redirects to registration success page with player name

---

### 6. ⏳ Disable Parent Welcome Email

**File:** `src/app/api/register-player/route.ts`

**Change Needed:** Comment out the parent welcome email send (keep admin email active).

**Code to Modify:**

```typescript
// BEFORE:
await sendEmail(parent_email, parentEmailData.subject, parentEmailData.html);

// AFTER:
// Comment out parent email - now handled by Supabase confirmation email
// await sendEmail(
//   parent_email,
//   parentEmailData.subject,
//   parentEmailData.html
// );

// Keep admin email active (unchanged)
const adminEmail = process.env.ADMIN_NOTIFICATIONS_TO;
if (adminEmail) {
  // ... admin email code remains unchanged
}
```

---

## 🎯 Additional Requirements

### Hide Payment UI Until Approved & Paid

**File:** `src/components/parent/ChildDetailsCard.tsx`

**Requirements:**

- Hide payment elements until BOTH conditions are met:
  1. Player status is "approved" or "active"
  2. Player has at least one payment with status "paid" or "succeeded"

**What to Hide:**

- "Due $X" badge (top-right corner)
- "View Invoice" button
- Billing panel (remaining balance, total paid, next due date)
- All payment information

**What to Show:**

- For pending players: "Awaiting admin approval" message
- Basic player information only (name, grade, status badge)

**Implementation:**

- Create helper function: `isApprovedAndPaid(player, payments)`
- Conditionally render payment UI based on this check

---

## ⚠️ Outstanding Issues

### Logo Image Not Appearing in Email

**Current Issue:** Logo image not displaying in Supabase confirmation email.

**Solution Options:**

1. **Option A - Absolute Production URL** (Quick Fix)

   - Use: `https://wcs-basketball-v2.vercel.app/apple-touch-icon.png`
   - ✅ Simple
   - ❌ Won't work for localhost emails

2. **Option B - Base64 Embedded Image** (Recommended ⭐)

   - Convert logo to base64 string
   - Embed directly: `<img src="data:image/png;base64,...">`
   - ✅ Works everywhere (localhost & production)
   - ✅ Works in all email clients
   - ❌ Slightly increases email size (~5-10KB)

3. **Option C - CDN/Supabase Storage**
   - Upload to Supabase Storage or CDN
   - Use absolute URL from storage
   - ✅ Reliable and fast
   - ❌ Requires additional setup

**Recommendation:** Use **Option B (Base64)** for maximum compatibility.

**How to Get Base64:**

- Online tool: https://www.base64-image.de/
- Terminal: `cat public/apple-touch-icon.png | base64` (Mac/Linux)
- Or PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("public/apple-touch-icon.png"))` (Windows)

---

## 📊 Progress Summary

| Step                        | Status     | Priority | Estimated Time |
| --------------------------- | ---------- | -------- | -------------- |
| 1. Email Template           | ✅ Done    | -        | -              |
| 2. Redirect URLs            | ✅ Done    | -        | -              |
| 3. Registration Success     | ✅ Verify  | Medium   | 15 min         |
| 4. Update Registration Flow | ⏳ TODO    | High     | 30 min         |
| 5. Create Callback Route    | ⏳ TODO    | High     | 20 min         |
| 6. Disable Parent Email     | ⏳ TODO    | Medium   | 10 min         |
| 7. Fix Logo Image           | ⏸️ SKIPPED | Low      | -              |
| 8. Hide Payment UI          | ⏳ TODO    | Medium   | 45 min         |

**Total Remaining Work:** ~1.5 hours (Step 7 skipped - base64 would make email too long)

---

## 🚀 Recommended Implementation Order

1. **First:** Steps 4 & 5 (Registration flow + Callback) - Core functionality
2. **Second:** Step 6 (Disable parent email) - Complete email consolidation
3. **Third:** Step 8 (Hide payment UI) - UX improvement
4. **Fourth:** Step 7 (Fix logo) - Polish

---

## 🔍 Files to Review/Modify

### New Files:

- `src/app/auth/callback/route.ts` (create new)

### Modified Files:

- `src/app/register/page.tsx` (update signUp call)
- `src/app/api/register-player/route.ts` (comment out email)
- `src/components/parent/ChildDetailsCard.tsx` (hide payment UI)
- `src/app/registration-success/page.tsx` (verify auto-signin)

### Manual Configuration:

- Supabase Dashboard → Email Templates (fix logo)

---

## 📝 Testing Checklist

After implementation:

- [ ] New registration sends only Supabase confirmation email (no duplicate)
- [ ] Email contains player name from metadata
- [ ] Email logo displays correctly (after fix)
- [ ] Clicking email link confirms account and auto-signs in
- [ ] User redirected to `/registration-success?player=[name]`
- [ ] Registration success page displays player name correctly
- [ ] Payment UI hidden for unapproved/unpaid players
- [ ] Payment UI shown for approved/paid players
- [ ] Admin email still sent correctly
- [ ] Works in both localhost and production

---

## 💡 Next Actions

**Immediate:**

1. Restart Cursor to activate Stripe & Postman MCPs
2. Review implementation steps 4-6
3. Begin implementation in recommended order

**Follow-up:**

1. Fix logo image in email template
2. Update ChildDetailsCard to hide payment UI
3. Test complete registration flow end-to-end

---

**Last Updated:** 2025-11-02  
**Status:** Ready for implementation
