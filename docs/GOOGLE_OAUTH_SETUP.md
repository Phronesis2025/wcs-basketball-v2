# Google OAuth Setup Guide

## Fixing the redirect_uri_mismatch Error

When using Supabase's Google OAuth, you need to configure the **Supabase callback URL** in Google's OAuth settings, not your app's URL.

## Step 1: Get Your Supabase Project URL

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (htgkddahhgugesktujds)
3. Go to **Settings** → **API**
4. Copy your **Project URL** (e.g., `https://htgkddahhgugesktujds.supabase.co`)

## Step 2: Configure Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one if needed)
5. In **Authorized redirect URIs**, add:

```
https://htgkddahhgugesktujds.supabase.co/auth/v1/callback
```

**Important:** This is Supabase's callback URL, NOT your app's URL!

## Step 3: Configure Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - **Client ID (for OAuth)**: Your Google OAuth Client ID
   - **Client Secret (for OAuth)**: Your Google OAuth Client Secret

## Step 4: Configure Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your site URLs to **Redirect URLs**:
   - For local development: `http://localhost:3000/**`
   - For production: `https://wcs-basketball-v2.vercel.app/**`
   - For any custom domain: `https://yourdomain.com/**`

3. Set **Site URL**:
   - For local: `http://localhost:3000`
   - For production: `https://wcs-basketball-v2.vercel.app`

## Step 5: Get Google OAuth Credentials

If you haven't created a Google OAuth app yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Configure OAuth consent screen (if first time)
7. Application type: **Web application**
8. Name: "World Class Sports" (or your app name)
9. **Authorized redirect URIs**: Add `https://htgkddahhgugesktujds.supabase.co/auth/v1/callback`
10. Click **Create**
11. Copy the **Client ID** and **Client Secret**

## Step 6: Add Credentials to Supabase

1. In Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret**
3. Click **Save**

## Step 7: Test

1. Try signing in with Google on your app
2. The redirect should now work correctly
3. Check browser console for any errors

## Troubleshooting

### Still Getting redirect_uri_mismatch?

1. **Verify the redirect URI** in Google Cloud Console exactly matches:
   ```
   https://htgkddahhgugesktujds.supabase.co/auth/v1/callback
   ```
   - Must be exact (no trailing slashes, correct protocol)

2. **Wait a few minutes** - Google OAuth changes can take 5-10 minutes to propagate

3. **Check Supabase logs**:
   - Go to Supabase Dashboard → **Logs** → **Auth Logs**
   - Look for OAuth errors

4. **Verify environment variables**:
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is set correctly
   - Should be: `https://htgkddahhgugesktujds.supabase.co`

5. **Clear browser cache** and try again

### Multiple Environments

If you have multiple environments (dev, staging, prod), you may need separate Google OAuth apps, OR use the same Supabase project (recommended) and just configure multiple redirect URLs in Supabase.

## Summary

The key point: **Google sees Supabase's callback URL, not your app's URL**. Configure `https://[your-project].supabase.co/auth/v1/callback` in Google OAuth, then Supabase will redirect to your app after authentication.

