# Troubleshooting Email Routing After Domain Verification

**Issue**: Emails still going to `phronesis700@gmail.com` after domain verification and updating `RESEND_FROM`

---

## 🔍 Step 1: Verify Environment Variable in Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com → Your Project → Settings → Environment Variables

2. **Check RESEND_FROM Value**
   - Find `RESEND_FROM` in the list
   - **Current value should be**: `WCS Basketball <noreply@wcsbasketball.site>`
   - **Should NOT be**: `WCS Basketball <onboarding@resend.dev>`

3. **Verify Environment Selection**
   - Make sure **"Production"** is checked ✅
   - If you also want it for Preview, check that too

4. **If Wrong, Update It**
   - Click the edit/pencil icon
   - Change to: `WCS Basketball <noreply@wcsbasketball.site>`
   - Make sure Production is checked
   - Click "Save"

---

## 🔄 Step 2: Force Redeploy

**Important**: Environment variable changes require a new deployment!

1. **Go to Deployments Tab**
   - In Vercel Dashboard → Deployments

2. **Redeploy Latest**
   - Click "..." menu (three dots) on latest deployment
   - Click "Redeploy"
   - Confirm

3. **Wait for Deployment**
   - Wait for deployment to complete (usually 1-2 minutes)
   - Check that it shows "Ready" status

---

## 🧪 Step 3: Test and Check Logs

1. **Trigger a Test Email**
   - Register a new test player
   - Or trigger any email (approval, etc.)

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for log entries with "sendEmail: RESEND_FROM value"
   - You should see:
     ```
     RESEND_FROM: "WCS Basketball <noreply@wcsbasketball.site>"
     useSandboxSender: false
     ```

3. **If Still Wrong**
   - If logs show `useSandboxSender: true`, the environment variable isn't being picked up
   - See Step 4 below

---

## 🔧 Step 4: Common Issues and Fixes

### Issue A: Environment Variable Not Updated

**Symptom**: Logs show `useSandboxSender: true` or `RESEND_FROM` contains `@resend.dev`

**Fix**:
1. Double-check the value in Vercel (Step 1)
2. Make sure "Production" environment is selected
3. Redeploy (Step 2)
4. Clear Vercel build cache if needed (Settings → General → Clear Build Cache)

### Issue B: Deployment Didn't Pick Up New Variable

**Symptom**: Variable is correct in Vercel but logs show old value

**Fix**:
1. Force a new deployment (Step 2)
2. Wait for deployment to fully complete
3. Check logs again

### Issue C: Multiple Environment Variables

**Symptom**: Conflicting values in different environments

**Fix**:
1. Check all environments (Production, Preview, Development)
2. Make sure Production has the correct value
3. You can leave Preview/Development with `@resend.dev` for testing

### Issue D: Cached Build

**Symptom**: Changes not taking effect

**Fix**:
1. Go to Settings → General
2. Click "Clear Build Cache"
3. Redeploy

---

## ✅ Verification Checklist

- [ ] `RESEND_FROM` in Vercel = `WCS Basketball <noreply@wcsbasketball.site>`
- [ ] "Production" environment is checked
- [ ] Application has been redeployed after updating variable
- [ ] Deployment shows "Ready" status
- [ ] Logs show `useSandboxSender: false`
- [ ] Test email goes to actual recipient (not phronesis700@gmail.com)

---

## 📊 Expected Behavior

**Before Fix**:
- Logs: `useSandboxSender: true`
- Emails: All go to `phronesis700@gmail.com`
- Email body: Shows "[SANDBOX MODE]" banner

**After Fix**:
- Logs: `useSandboxSender: false`
- Emails: Go to actual recipients
- Email body: No sandbox banner

---

## 🚨 Still Not Working?

If after all steps emails still go to dev address:

1. **Check Resend Dashboard**
   - https://resend.com/domains
   - Verify domain shows "Verified" (not "Pending")

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

