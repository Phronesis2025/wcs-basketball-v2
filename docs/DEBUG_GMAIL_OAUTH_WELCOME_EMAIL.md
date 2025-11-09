# Debug: Gmail OAuth Welcome Email Not Reaching Parent

**Issue**: Welcome email not going to new player/parent email after Gmail OAuth registration

**Date**: January 2025

---

## 🔍 Root Cause Analysis

### How Gmail OAuth Registration Works

1. **User clicks "Sign in with Google"** → OAuth callback happens
2. **OAuth callback** (`/auth/callback?code=...`) → Checks for pending registration
3. **If NO pending registration** → Redirects to `/register?oauth=success&email=...`
4. **User fills out registration form** → Submits to `/api/register-player`
5. **Welcome email sent** → `/api/register-player` calls `sendEmail()` (lines 162-166)

### Email Routing Logic

The `sendEmail()` function in `src/lib/email.ts` checks:

```typescript
const useSandboxSender = RESEND_FROM.includes("@resend.dev");
```

**If `RESEND_FROM` contains `@resend.dev`:**
- ✅ Email IS sent
- ❌ But ALL emails are redirected to `phronesis700@gmail.com`
- This is a Resend sandbox limitation

**If `RESEND_FROM` uses verified domain (e.g., `noreply@wcsbasketball.site`):**
- ✅ Email IS sent
- ✅ Email goes to actual recipient (parent's Gmail address)

---

## 🚨 Most Likely Issue

**The `RESEND_FROM` environment variable in Vercel production is still set to:**
```
WCS Basketball <onboarding@resend.dev>
```

**Instead of:**
```
WCS Basketball <noreply@wcsbasketball.site>
```

---

## ✅ Step-by-Step Fix

### Step 1: Verify Environment Variable in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com
   - Navigate to your project: `wcs-basketball-v2`
   - Go to **Settings** → **Environment Variables**

2. **Find `RESEND_FROM`**
   - Look for the variable in the list
   - Check its current value

3. **Expected Value**
   - ✅ **Correct**: `WCS Basketball <noreply@wcsbasketball.site>`
   - ❌ **Wrong**: `WCS Basketball <onboarding@resend.dev>`

4. **Check Environment Selection**
   - Make sure **"Production"** is checked ✅
   - If you also want it for Preview, check that too

### Step 2: Update if Wrong

1. **Click the edit/pencil icon** next to `RESEND_FROM`
2. **Change the value to**: `WCS Basketball <noreply@wcsbasketball.site>`
3. **Make sure "Production" is checked**
4. **Click "Save"**

### Step 3: Force Redeploy

**CRITICAL**: Environment variable changes require a new deployment!

1. **Go to Deployments Tab**
   - In Vercel Dashboard → **Deployments**

2. **Redeploy Latest**
   - Click **"..."** menu (three dots) on latest deployment
   - Click **"Redeploy"**
   - Confirm

3. **Wait for Deployment**
   - Wait for deployment to complete (usually 1-2 minutes)
   - Check that it shows **"Ready"** status

### Step 4: Test and Verify

1. **Register a New Test Player via Gmail OAuth**
   - Go to registration page
   - Click "Sign in with Google"
   - Complete registration form
   - Submit

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → **Logs**
   - Look for log entries with `"sendEmail: RESEND_FROM value"`
   - You should see:
     ```
     RESEND_FROM: "WCS Basketball <noreply@wcsbasketball.site>"
     useSandboxSender: false
     ```

3. **Check Email Delivery**
   - Check the parent's Gmail inbox
   - Email should be there (not in `phronesis700@gmail.com`)

---

## 🔧 Troubleshooting

### Issue A: Logs Show `useSandboxSender: true`

**Symptom**: Logs show `useSandboxSender: true` even after updating `RESEND_FROM`

**Fix**:
1. Double-check the value in Vercel (Step 1)
2. Make sure "Production" environment is selected
3. Redeploy (Step 3)
4. Clear Vercel build cache if needed:
   - Settings → General → **Clear Build Cache**
   - Then redeploy

### Issue B: Variable Correct but Still Not Working

**Symptom**: Variable is correct in Vercel but emails still go to dev address

**Fix**:
1. Force a new deployment (Step 3)
2. Wait for deployment to fully complete
3. Check logs again
4. Try waiting 10-15 minutes (DNS/Resend caching)

### Issue C: Multiple Environment Variables

**Symptom**: Conflicting values in different environments

**Fix**:
1. Check all environments (Production, Preview, Development)
2. Make sure Production has the correct value
3. You can leave Preview/Development with `@resend.dev` for testing

---

## 📊 Expected Behavior

### Before Fix:
- Logs: `useSandboxSender: true`
- Emails: All go to `phronesis700@gmail.com`
- Email body: Shows `[SANDBOX MODE]` banner

### After Fix:
- Logs: `useSandboxSender: false`
- Emails: Go to actual recipients (parent's Gmail)
- Email body: No sandbox banner

---

## 🧪 Verification Checklist

- [ ] `RESEND_FROM` in Vercel = `WCS Basketball <noreply@wcsbasketball.site>`
- [ ] "Production" environment is checked
- [ ] Application has been redeployed after updating variable
- [ ] Deployment shows "Ready" status
- [ ] Logs show `useSandboxSender: false`
- [ ] Test email goes to actual recipient (not phronesis700@gmail.com)
- [ ] Welcome email received in parent's Gmail inbox

---

## 📝 Code Reference

**File**: `src/lib/email.ts`
- **Line 34**: `const useSandboxSender = RESEND_FROM.includes("@resend.dev");`
- **Lines 52-55**: If `useSandboxSender` is true, all emails go to `RESEND_DEV_TO`

**File**: `src/app/api/register-player/route.ts`
- **Lines 162-166**: Welcome email is sent to `parent_email` after registration

**File**: `src/app/auth/callback/route.ts`
- **Lines 467-669**: Gmail OAuth callback handler
- **Lines 554-596**: Welcome email sent when pending registration is merged

---

## 🚨 Still Not Working?

If after all steps emails still go to dev address:

1. **Check Resend Dashboard**
   - https://resend.com/domains
   - Verify domain `wcsbasketball.site` shows **"Verified"** (not "Pending")

2. **Check Resend Email Logs**
   - https://resend.com/emails
   - Look for error messages
   - Check delivery status

3. **Verify DNS Records**
   - All 4 DNS records should be in Vercel DNS
   - Domain should be verified in Resend

4. **Contact Support**
   - If everything looks correct but still not working, there may be a caching issue
   - Try waiting 10-15 minutes and test again

---

**Most Common Issue**: Environment variable updated but deployment not triggered. Always redeploy after changing environment variables!

