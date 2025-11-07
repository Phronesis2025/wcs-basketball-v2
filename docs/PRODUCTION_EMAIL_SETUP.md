# Production Email Setup - Quick Fix

**Issue**: Emails not sending to real recipients in production  
**Cause**: Using Resend sandbox (`@resend.dev`) which only allows sending to account owner  
**Solution**: Verify a domain in Resend

---

## 🚀 Quick Steps to Fix

### 1. Verify Domain in Resend (5-10 minutes)

1. Go to [Resend Domains](https://resend.com/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `wcsbasketball.com`)
4. Add the DNS records Resend provides to your domain's DNS
5. Wait for verification (usually 1-4 hours, can take up to 48 hours)

### 2. Update Vercel Environment Variable (2 minutes)

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. Find `RESEND_FROM`
3. Update from:
   ```bash
   RESEND_FROM="WCS Basketball <onboarding@resend.dev>"
   ```
   To:
   ```bash
   RESEND_FROM="WCS Basketball <noreply@yourdomain.com>"
   ```
   (Replace `yourdomain.com` with your verified domain)

4. Make sure **"Production"** is selected
5. Click **"Save"**

### 3. Redeploy (Automatic or Manual)

- Vercel will auto-deploy on next push, OR
- Go to Deployments → Click "Redeploy" on latest deployment

### 4. Test

- Register a new player with a real email
- Check that parent receives confirmation email
- Check that admin receives notification email

---

## ✅ That's It!

Once your domain is verified and `RESEND_FROM` is updated, emails will automatically work for all recipients.

**See `docs/RESEND_DOMAIN_VERIFICATION_GUIDE.md` for detailed DNS setup instructions.**

