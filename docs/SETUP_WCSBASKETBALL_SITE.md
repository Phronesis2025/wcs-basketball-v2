# Setting Up wcsbasketball.site for Email

**Domain**: `wcsbasketball.site`  
**Registrar**: Namecheap  
**Purpose**: Verify domain in Resend to enable email sending to real recipients

---

## Step 1: Add Domain to Resend (5 minutes)

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Log in to your Resend account

2. **Add Your Domain**
   - Click **"Add Domain"** button
   - Enter: `wcsbasketball.site`
   - Click **"Add"**

3. **Get DNS Records**
   - Resend will show you DNS records that need to be added
   - You'll see something like:
     - **SPF Record** (TXT)
     - **DKIM Records** (2-3 TXT records)
     - **DMARC Record** (TXT) - optional but recommended
   - **Keep this page open** - you'll need these values

---

## Step 2: Add DNS Records in Namecheap (10 minutes)

1. **Log in to Namecheap**
   - Go to: https://www.namecheap.com
   - Log in to your account

2. **Access Domain List**
   - Click **"Domain List"** in the left sidebar
   - Find `wcsbasketball.site` in your list
   - Click **"Manage"** next to it

3. **Go to Advanced DNS**
   - Click on the **"Advanced DNS"** tab
   - You'll see a section for "Host Records"

4. **Add SPF Record (TXT)**
   - Click **"Add New Record"**
   - **Type**: Select `TXT Record`
   - **Host**: Enter `@` (or leave blank if Namecheap uses `@` for root)
   - **Value**: Enter the SPF value from Resend (usually: `v=spf1 include:resend.com ~all`)
   - **TTL**: Leave as default (usually `Automatic` or `30 min`)
   - Click **"Save"** (green checkmark)

5. **Add DKIM Records (TXT)**
   - Resend will provide 2-3 DKIM records
   - For each DKIM record:
     - Click **"Add New Record"**
     - **Type**: Select `TXT Record`
     - **Host**: Enter the hostname from Resend (e.g., `resend._domainkey` or similar)
     - **Value**: Enter the full DKIM value from Resend (long string)
     - **TTL**: Leave as default
     - Click **"Save"**
   - **Repeat for each DKIM record** Resend provides

6. **Add DMARC Record (TXT) - Optional but Recommended**
   - Click **"Add New Record"**
   - **Type**: Select `TXT Record`
   - **Host**: Enter `_dmarc`
   - **Value**: Enter `v=DMARC1; p=none; rua=mailto:dmarc@wcsbasketball.site`
   - **TTL**: Leave as default
   - Click **"Save"**

7. **Verify All Records Added**
   - You should now see:
     - 1 SPF record (TXT for `@`)
     - 2-3 DKIM records (TXT for `resend._domainkey` or similar)
     - 1 DMARC record (TXT for `_dmarc`)
   - **Note**: It's okay if you have other records (A, CNAME, etc.) - those won't interfere

---

## Step 3: Verify Domain in Resend (Wait 1-4 hours)

1. **Go Back to Resend Dashboard**
   - Return to: https://resend.com/domains
   - Find `wcsbasketball.site` in your domain list

2. **Click "Verify"**
   - Click the **"Verify"** button next to your domain
   - Resend will check your DNS records

3. **Wait for Verification**
   - Status will show as **"Pending"** initially
   - DNS propagation can take 1-4 hours (sometimes up to 48 hours, but usually faster)
   - You can click "Verify" again to re-check status

4. **Check Status**
   - Once verified, status will change to **"Verified"** ✅
   - You'll see a green checkmark

**⚠️ Important**: Don't proceed to Step 4 until status shows "Verified"!

---

## Step 4: Update Vercel Environment Variable (2 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Log in and select your project (`wcs-basketball-v2`)

2. **Navigate to Environment Variables**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in the left sidebar

3. **Find RESEND_FROM**
   - Look for the `RESEND_FROM` variable
   - Click the **pencil icon** (edit) next to it

4. **Update the Value**
   - **Current value**: `WCS Basketball <onboarding@resend.dev>`
   - **New value**: `WCS Basketball <noreply@wcsbasketball.site>`
   - Make sure to replace it exactly (keep the format with angle brackets)

5. **Select Environment**
   - Make sure **"Production"** is checked ✅
   - You can also check **"Preview"** if you want it for preview deployments
   - **Don't check "Development"** (keep using sandbox for local dev)

6. **Save**
   - Click **"Save"** button

---

## Step 5: Redeploy Application (Automatic or Manual)

### Option A: Automatic (Recommended)
- Vercel will automatically redeploy when you push to GitHub
- Or it may auto-redeploy after environment variable change

### Option B: Manual
1. Go to **"Deployments"** tab in Vercel
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Confirm redeployment

---

## Step 6: Test Email Sending (5 minutes)

1. **Test Registration Flow**
   - Go to your production site: https://wcs-basketball-v2.vercel.app/register
   - Register a new player with a **real email address** you can access
   - Complete the registration

2. **Check Emails**
   - **Parent email**: Should receive confirmation email at the actual email address (not phronesis700@gmail.com)
   - **Admin email**: Should receive notification at `phronesis700@gmail.com` (or whatever is in `ADMIN_NOTIFICATIONS_TO`)

3. **Check Resend Dashboard**
   - Go to: https://resend.com/emails
   - You should see sent emails with status "Delivered"
   - Check that emails are going to the correct recipients

---

## ✅ Verification Checklist

- [ ] Domain added to Resend
- [ ] SPF record added in Namecheap
- [ ] DKIM records added in Namecheap (all of them)
- [ ] DMARC record added in Namecheap (optional)
- [ ] Domain verified in Resend (status shows "Verified")
- [ ] `RESEND_FROM` updated in Vercel to `noreply@wcsbasketball.site`
- [ ] Application redeployed
- [ ] Test email sent successfully
- [ ] Email received at actual recipient address

---

## 🚨 Troubleshooting

### Domain Not Verifying?

1. **Check DNS Records**
   - Go back to Namecheap → Advanced DNS
   - Verify all records are exactly as Resend provided
   - Check for typos in hostnames or values

2. **Wait Longer**
   - DNS propagation can take up to 48 hours
   - Usually takes 1-4 hours
   - Try clicking "Verify" again after waiting

3. **Check Record Types**
   - Make sure SPF and DKIM are **TXT records** (not A or CNAME)
   - Make sure hostnames match exactly (case-sensitive)

4. **Use DNS Checker**
   - Visit: https://mxtoolbox.com/TXTLookup.aspx
   - Enter `wcsbasketball.site`
   - Check if your TXT records are visible

### Emails Still Not Sending?

1. **Check Domain Status**
   - Make sure domain shows "Verified" in Resend (not "Pending")

2. **Check RESEND_FROM**
   - Verify it's set to `noreply@wcsbasketball.site` (not `@resend.dev`)
   - Make sure you redeployed after changing it

3. **Check Resend Logs**
   - Go to Resend Dashboard → Emails
   - Look for error messages
   - Check delivery status

---

## 📝 Quick Reference

**Domain**: `wcsbasketball.site`  
**Email Address**: `noreply@wcsbasketball.site`  
**Resend Dashboard**: https://resend.com/domains  
**Namecheap DNS**: https://www.namecheap.com → Domain List → Manage → Advanced DNS  
**Vercel Environment Variables**: https://vercel.com → Your Project → Settings → Environment Variables

---

**Once verified, all emails will automatically route to real recipients!** 🎉

