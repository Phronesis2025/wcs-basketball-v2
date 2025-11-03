# Fix: Supabase Email Redirect to Localhost

## Root Cause
The Supabase "Magic Link" email template currently uses:
```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

`{{ .ConfirmationURL }}` uses the Site URL from dashboard settings and doesn't respect the `redirectTo` parameter we pass in the code.

## Solution: Update Email Template

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**
4. Select: **Magic Link** template

### Step 2: Update the Template

**Replace the current template with:**

```html
<h2>Magic Link</h2>

<p>Follow this link to login:</p>

<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

**Important:** The `{{ .ConfirmationURL }}` variable should automatically include the `redirectTo` parameter when using `inviteUserByEmail`. However, if it's still not working, use this alternative:

**Alternative template (if above doesn't work):**

```html
<h2>Magic Link</h2>

<p>Follow this link to login:</p>

<p><a href="https://htgkddahhgugesktujds.supabase.co/auth/v1/verify?token_hash={{ .TokenHash }}&type=invite&redirect_to={{ .RedirectTo }}">Log In</a></p>
```

This manually constructs the confirmation URL using:
- `{{ .TokenHash }}` - The verification token
- `{{ .RedirectTo }}` - The redirect URL we set in code (will be `http://localhost:3000/auth/callback?...`)

### Step 3: Add Redirect URL to Allowlist
1. Go to: **Authentication** → **URL Configuration**
2. In "Redirect URLs" section, add:
   ```
   http://localhost:3000/**
   ```
3. Click **Save**

## Verification
After making these changes:
1. The email link should point to: `https://[supabase-url]/auth/v1/verify?token_hash=[hash]&type=invite&redirect_to=http://localhost:3000/auth/callback?...`
2. After clicking, it should redirect to: `http://localhost:3000/auth/callback?...`

## Current Code Status
✅ Code is correctly setting `redirectTo` to `http://localhost:3000/auth/callback?...`
✅ User has been deleted from Supabase
⏳ Waiting for email template update in Supabase Dashboard

