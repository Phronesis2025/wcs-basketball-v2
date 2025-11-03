# Fixing Supabase Email Redirect URL for Development

## Issue
The email confirmation link is redirecting to the production URL (`https://wcs-basketball-v2-phronesis2025s-projects.vercel.app/`) instead of localhost (`http://localhost:3000`).

## Solution

### Option 1: Update Supabase Dashboard Settings (Recommended)

1. **Go to Supabase Dashboard** → Your Project → Authentication → URL Configuration
2. **Add to Redirect URLs allowlist:**
   - `http://localhost:3000/**`
   - This allows any path under localhost:3000

3. **Site URL:**
   - Keep the production URL as the Site URL (this is the default)
   - The `redirectTo` parameter in code will override it

### Option 2: Update Magic Link Email Template (If Option 1 doesn't work)

If Supabase still uses the Site URL instead of `redirectTo`, update the Magic Link email template:

1. **Go to Supabase Dashboard** → Authentication → Email Templates
2. **Edit the "Magic Link" template**
3. **Current template:**
   ```html
   <h2>Magic Link</h2>
   <p>Follow this link to login:</p>
   <p><a href="{{ .ConfirmationURL }}">Log In</a></p>
   ```

4. **Update to use `{{ .RedirectTo }}` variable:**
   ```html
   <h2>Magic Link</h2>
   <p>Follow this link to login:</p>
   <p><a href="{{ .ConfirmationURL }}">Log In</a></p>
   ```
   (Note: `{{ .ConfirmationURL }}` should already include the redirect, but if it doesn't work, we may need to construct the URL manually)

### Option 3: Custom URL Construction (If Options 1 & 2 don't work)

If Supabase is still using Site URL, we can construct the confirmation URL manually in the template:

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="https://htgkddahhgugesktujds.supabase.co/auth/v1/verify?token_hash={{ .TokenHash }}&type=invite&redirect_to={{ .RedirectTo }}">Log In</a></p>
```

## Current Code Status

The code is already correctly setting `redirectTo` to `http://localhost:3000/auth/callback?...` when in development mode. The issue is that Supabase's email template might be using the Site URL instead of respecting the `redirectTo` parameter.

## Next Steps

1. ✅ Code updated to use `http://localhost:3000` in development
2. ⏳ **You need to**: Add `http://localhost:3000/**` to Supabase Redirect URLs allowlist
3. ⏳ **If still not working**: Update the Magic Link email template as described above

