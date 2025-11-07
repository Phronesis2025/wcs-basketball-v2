# Resend Domain Verification Guide

**Purpose**: Enable sending emails to real recipients in production (not just sandbox)

---

## 🎯 The Problem

Resend's sandbox mode (`@resend.dev` sender) **only allows sending emails to the account owner's email** (`phronesis700@gmail.com`). To send emails to any recipient, you must verify a domain.

---

## ✅ Solution: Verify Your Domain in Resend

### Step 1: Access Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Log in with your Resend account
3. Navigate to **"Domains"** section

### Step 2: Add Your Domain

1. Click **"Add Domain"** button
2. Enter your domain (e.g., `wcsbasketball.com` or `westcoastsports.com`)
3. Click **"Add"**

### Step 3: Add DNS Records

Resend will provide you with DNS records to add. You'll need to add these to your domain's DNS settings:

#### Required DNS Records:

1. **SPF Record** (TXT record):

   ```
   v=spf1 include:resend.com ~all
   ```

   - **Host/Name**: `@` (or your domain root)
   - **Type**: `TXT`
   - **Value**: `v=spf1 include:resend.com ~all`

2. **DKIM Records** (Multiple TXT records):

   - Resend will provide 2-3 DKIM records
   - Each will have a specific hostname (e.g., `resend._domainkey`)
   - Add each as a TXT record with the provided values

3. **DMARC Record** (Optional but recommended):
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```
   - **Host/Name**: `_dmarc`
   - **Type**: `TXT`
   - **Value**: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

### Step 4: Verify DNS Records

1. After adding DNS records, go back to Resend Dashboard
2. Click **"Verify"** on your domain
3. Resend will check your DNS records
4. **Note**: DNS propagation can take 24-48 hours, but usually happens within a few hours

### Step 5: Wait for Verification

- Status will show as **"Pending"** while DNS propagates
- Once verified, status changes to **"Verified"** ✅
- You can now send emails from addresses on this domain!

---

## 🔧 Update Environment Variables

Once your domain is verified, update your Vercel environment variables:

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Update `RESEND_FROM`:

   ```bash
   # OLD (Sandbox - only works for phronesis700@gmail.com):
   RESEND_FROM="WCS Basketball <onboarding@resend.dev>"

   # NEW (Verified Domain - works for all recipients):
   RESEND_FROM="WCS Basketball <noreply@yourdomain.com>"
   ```

   Replace `yourdomain.com` with your verified domain.

3. **Important**: Make sure to:
   - Select **"Production"** environment
   - Click **"Save"**
   - **Redeploy** your application (or wait for auto-deploy)

---

## 📧 Email Address Options

Once your domain is verified, you can use any email address on that domain:

- `noreply@yourdomain.com` (recommended for automated emails)
- `info@yourdomain.com`
- `support@yourdomain.com`
- `notifications@yourdomain.com`

**Example**:

```bash
RESEND_FROM="WCS Basketball <noreply@wcsbasketball.com>"
```

---

## 🔍 How to Check if Domain is Verified

1. Go to [Resend Domains](https://resend.com/domains)
2. Find your domain in the list
3. Check the status:
   - ✅ **"Verified"** = Ready to send emails
   - ⏳ **"Pending"** = Waiting for DNS verification
   - ❌ **"Failed"** = DNS records incorrect or missing

---

## 🧪 Testing After Verification

1. **Update `RESEND_FROM` in Vercel** to use your verified domain
2. **Redeploy** your application
3. **Test registration flow**:
   - Register a new player with a real email address
   - Check that parent receives confirmation email
   - Check that admin receives notification email
4. **Check Resend Dashboard** → **"Emails"** tab to see sent emails and delivery status

---

## ⚠️ Important Notes

1. **DNS Propagation**: Can take up to 48 hours, but usually 1-4 hours
2. **Domain Verification**: Must be completed before emails will work
3. **Email Address**: Must match your verified domain (can't use `@resend.dev` in production)
4. **Testing**: You can test with sandbox (`@resend.dev`) in development, but production needs verified domain

---

## 🚨 Troubleshooting

### Emails Still Not Sending?

1. **Check Domain Status**: Make sure domain shows "Verified" in Resend
2. **Check `RESEND_FROM`**: Must use your verified domain, not `@resend.dev`
3. **Check DNS Records**: Verify all DNS records are correctly added
4. **Check Resend Logs**: Go to Resend Dashboard → Emails → Check for error messages
5. **Wait for DNS**: If just added DNS records, wait a few hours for propagation

### Still Getting "validation_error"?

- Make sure `RESEND_FROM` uses your verified domain
- Make sure domain status is "Verified" (not "Pending")
- Make sure you've redeployed after updating environment variables

---

## 📚 Additional Resources

- [Resend Domain Documentation](https://resend.com/docs/dashboard/domains/introduction)
- [Resend DNS Records Guide](https://resend.com/docs/dashboard/domains/introduction#dns-records)
- [Resend Email API Documentation](https://resend.com/docs/api-reference/emails/send-email)

---

**Once your domain is verified and `RESEND_FROM` is updated, emails will automatically route to actual recipients in production!** ✅
