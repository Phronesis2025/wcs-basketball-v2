<!-- e4c99d8a-cbec-454c-9566-e8e0ebe8f972 68c87faa-c7a8-489f-82d0-e7e14815dd64 -->
# Customize Supabase Confirmation Email as Welcome Email

## Goal

Use Supabase's confirmation email as the single "Welcome to WCS Basketball! Registration Received" email, eliminating duplicate emails to parents.

## Implementation Steps

### 1. Customize Supabase Email Template (Dashboard) ✅ COMPLETED

- ✅ **COMPLETED**: Email template set up in Supabase Dashboard
- ✅ **COMPLETED**: HTML template provided and configured
- ⚠️ **ISSUE**: Logo image not appearing in email

**Logo Image Fix Options:**

**Option A - Use Absolute Production URL (Recommended for Quick Fix):**
- Update the logo `src` in the email template from:
  ```html
  <img src="{{ .SiteURL }}/apple-touch-icon.png" ...>
  ```
  To:
  ```html
  <img src="https://wcs-basketball-v2.vercel.app/apple-touch-icon.png" ...>
  ```
- **Pros**: Always works, no dependency on email client resolving relative URLs
- **Cons**: Hardcoded to production URL (won't work for localhost emails)

**Option B - Base64 Embedded Image (Most Reliable):**
- Convert `public/apple-touch-icon.png` to base64
- Embed directly in HTML:
  ```html
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." ...>
  ```
- **Pros**: No external URL needed, works in all email clients, works everywhere
- **Cons**: Increases email size slightly (~5-10KB)
- **How to get base64**: Use online tool like https://www.base64-image.de/ or run: `cat public/apple-touch-icon.png | base64` in terminal

**Option C - Use CDN or Supabase Storage URL:**
- Upload logo to Supabase Storage or a CDN
- Use absolute URL from storage/CDN
- **Pros**: Reliable, fast loading, can update without changing template
- **Cons**: Requires additional setup

**Recommended**: Use **Option B (Base64)** for maximum compatibility across all email clients and environments.

**To implement Option B:**
1. Get base64 string of `public/apple-touch-icon.png`
2. Replace the `<img src="{{ .SiteURL }}/apple-touch-icon.png" ...>` line in Supabase email template
3. Use: `<img src="data:image/png;base64,[YOUR_BASE64_STRING]" ...>`

### 2. Update Registration Flow (`src/app/register/page.tsx`) ⏳ TODO

- Update `supabase.auth.signUp()` call to include:
  - `options.data` with player metadata (playerName, grade, gender)
  - `options.emailRedirectTo` with registration success URL
  - Dynamic base URL detection (works for both localhost and production)
  
**Specific Code Change (lines 188-191):**

**Current code:**
```typescript
const { data: signUp, error: signErr } = await supabase.auth.signUp({
  email,
  password: password!,
});
```

**New code (replace with):**
```typescript
// Get base URL dynamically for redirect (works in both dev and prod)
const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_BASE_URL || 'https://wcs-basketball-v2.vercel.app');

const { data: signUp, error: signErr } = await supabase.auth.signUp({
  email,
  password: password!,
  options: {
    data: {
      playerName: `${firstName} ${lastName}`,
      grade: grade,
      gender: gender,
    },
    emailRedirectTo: `${baseUrl}/registration-success?player=${encodeURIComponent(firstName)}`,
  },
});
```

**What this does:**
- Stores player info in user metadata (accessible in email template via `{{ .Data.playerName }}`)
- Sets redirect URL that works in both development and production
- Automatically redirects to registration success page after email confirmation

### 3. Handle Email Confirmation Callback ⏳ TODO

- Create callback route: `src/app/auth/callback/route.ts` (if not exists)
- On confirmation:
  - Auto-sign in the user
  - Extract player name from URL params or user metadata
  - Redirect to `/registration-success?player=[playerName]`

**Implementation:**
```typescript
// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const player = requestUrl.searchParams.get('player');
  
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });
    
    if (!error) {
      // Redirect to registration success with player name
      const redirectUrl = new URL('/registration-success', requestUrl.origin);
      if (player) {
        redirectUrl.searchParams.set('player', player);
      }
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Error case - redirect to registration page
  return NextResponse.redirect(new URL('/register?error=confirmation_failed', requestUrl.origin));
}
```

### 4. Disable Parent Welcome Email (`src/app/api/register-player/route.ts`) ⏳ TODO

- Comment out the parent email send (keep the code but don't execute)
- Keep admin email notification active
- Add comment explaining it's handled by Supabase confirmation email

**Code change:**
```typescript
// Comment out parent email - now handled by Supabase confirmation email
// await sendEmail(
//   parent_email,
//   parentEmailData.subject,
//   parentEmailData.html
// );

// Keep admin email active
const adminEmail = process.env.ADMIN_NOTIFICATIONS_TO;
if (adminEmail) {
  // ... admin email code remains unchanged
}
```

### 5. Update Registration Success Page (`src/app/registration-success/page.tsx`) ✅ VERIFY

- ✅ Already extracts player name from URL params
- ✅ Already has link to parent profile
- **Verify**: Ensure it handles auto-signin state correctly
- **Test**: After email confirmation, user should be automatically signed in

### 6. Configure Supabase Redirect URLs ✅ COMPLETED

- ✅ **COMPLETED**: Redirect URLs configured in Supabase Dashboard
- Added URLs for both localhost:3000 and production:
  - `http://localhost:3000/registration-success`
  - `http://localhost:3000/auth/callback`
  - `https://wcs-basketball-v2.vercel.app/registration-success`
  - `https://wcs-basketball-v2.vercel.app/auth/callback`

## Files to Modify

**Modified Files:**

- ✅ `supabase-email-template.html` - Template created and uploaded to Supabase
- ⏳ `src/app/register/page.tsx` - Add emailRedirectTo with player name and metadata
- ⏳ `src/app/api/register-player/route.ts` - Comment out parent email send
- ✅ `src/app/registration-success/page.tsx` - Verify it works with auto-signin
- ⏳ `src/components/parent/ChildDetailsCard.tsx` - Hide payment UI until approved and paid

**New Files (if needed):**

- ⏳ `src/app/auth/callback/route.ts` - Handle email confirmation callback

**Manual Configuration:**

- ✅ Supabase Dashboard - Email template customization (COMPLETED)
- ✅ Supabase Dashboard - Redirect URL configuration (COMPLETED)
- ⚠️ Supabase Dashboard - Fix logo image in email template (TODO)

## Additional Requirements

### Hide Payment UI Until Approved & Paid

**Component**: `src/components/parent/ChildDetailsCard.tsx`

- **Hide all payment-related elements** until player meets conditions:
  - "Due $X" badge (top-right corner)
  - "View Invoice" button
  - Billing panel (remaining balance, total paid, next due date)
  - All payment information

- **Show payment UI only when BOTH conditions are met**:

  1. Player status is "approved" or "active"
  2. Player has at least one payment with status "paid" or "succeeded"

- **Display pending message** when not approved/paid:
  - Show "Awaiting admin approval" or similar message
  - Only show basic player information (name, grade, status badge)

- **Implementation approach**:
  - Create helper function: `isApprovedAndPaid(player, payments)` 
  - Conditionally render payment UI based on this check
  - For pending players, show appropriate messaging instead

## Important Notes

- **Player Name in Email**: Player name is now accessible in email template via `{{ .Data.playerName }}` when user metadata is set during signup
- **Email Confirmation Flow**: 

  1. User signs up → Supabase sends confirmation email (now our Welcome email)
  2. User clicks link → Confirmed → Auto-signed in → Redirected to `/registration-success?player=[name]`
  3. User sees success page with link to profile

- **Admin Email**: Will continue to be sent as normal (unchanged)
- **Logo Image**: Currently not displaying - use Option B (Base64) for best results

## Next Steps

1. ⚠️ Fix logo image in Supabase email template (choose Option A, B, or C above)
2. ⏳ Update `src/app/register/page.tsx` with new signup code
3. ⏳ Create `src/app/auth/callback/route.ts` for email confirmation handling
4. ⏳ Comment out parent email in `src/app/api/register-player/route.ts`
5. ⏳ Update `ChildDetailsCard.tsx` to hide payment UI until approved and paid

