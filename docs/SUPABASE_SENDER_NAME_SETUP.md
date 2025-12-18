# Supabase Email Sender Name Setup

## How to Change Sender Name from "Supabase Auth" to "WCS Basketball"

The sender name for Supabase emails is controlled in the Supabase Dashboard, not in the email template code.

### Step 1: Access Supabase Email Settings

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Settings**
4. Scroll down to the **"SMTP Settings"** or **"Email"** section

### Step 2: Update Sender Name

**Option A: If Using Supabase Default Email Service**

1. Look for **"Sender Name"** or **"From Name"** field
2. Change from: `Supabase Auth`
3. Change to: `WCS Basketball`
4. Click **Save**

**Note:** If you don't see a "Sender Name" field, Supabase may be using a default that cannot be changed without custom SMTP.

### Step 3: Configure Custom SMTP (If Sender Name Field Not Available)

If the sender name cannot be changed with the default service, you'll need to set up custom SMTP:

1. In **Authentication** → **Settings** → **SMTP Settings**
2. Enable **"Custom SMTP"**
3. Configure your SMTP provider (e.g., Resend, SendGrid, etc.)
4. Set **"From Email"** to: `noreply@wcsbasketball.site` (or your verified domain)
5. Set **"From Name"** to: `WCS Basketball`
6. Click **Save**

### Step 4: Verify Changes

1. Trigger a test registration email
2. Check the email sender field
3. It should now show: `WCS Basketball <noreply@yourdomain.com>` instead of `Supabase Auth <noreply@mail.app.supabase.io>`

## Important Notes

- **Default Supabase Service**: The default email service may have limitations on changing the sender name
- **Custom SMTP Required**: For full control, you may need to use custom SMTP with a verified domain
- **Domain Verification**: If using custom SMTP, ensure your domain is verified with your email provider
- **Template Updates**: The email template HTML has been updated to use black headers with white text, matching your site design

## Related Files

- Email template: `supabase-email-template.html`
- Documentation: `docs/SUPABASE_EMAIL_TEMPLATE.md`
- Resend email templates: `src/lib/emailTemplates.ts`

