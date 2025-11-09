# Adding a New Site URL to Supabase Redirect List

**When to do this**: After deploying to a new domain/URL (e.g., new Vercel deployment, custom domain, staging environment)

---

## ✅ Quick Steps

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: `htgkddahhgugesktujds`
3. Navigate to: **Authentication** → **URL Configuration**

### Step 2: Add New URL to Redirect URLs

In the **"Redirect URLs"** section:

1. Click **"Add URL"** or the **"+"** button
2. Add your new site URL with wildcard pattern:
   ```
   https://your-new-site-url.vercel.app/**
   ```
   
   **Examples:**
   - New Vercel deployment: `https://wcs-basketball-v2-new.vercel.app/**`
   - Custom domain: `https://wcsbasketball.site/**`
   - Staging environment: `https://staging.wcsbasketball.site/**`

3. Click **"Save"**

### Step 3: Update Site URL (Optional)

**Note**: The Site URL is the default redirect when no `redirectTo` parameter is specified. You can:

- **Option A**: Keep the main production URL as Site URL
  - Site URL: `https://wcs-basketball-v2.vercel.app`
  - This is fine if you're using `redirectTo` in your code (which you are)

- **Option B**: Change Site URL to your new deployment
  - Only do this if the new URL is your new primary production URL
  - Site URL: `https://your-new-site-url.vercel.app`

---

## 📋 Current Redirect URLs (Recommended)

You should have these URLs in your allowlist:

```
http://localhost:3000/**
https://wcs-basketball-v2.vercel.app/**
https://wcs-basketball-v2-phronesis2025s-projects.vercel.app/**
https://www.wcsbasketball.site/**
https://wcsbasketball.site/**
```

**Note**: Add both `www.` and non-`www.` versions to cover all cases.

**Pattern**: Use `/**` at the end to allow all paths under that domain.

---

## 🔍 What URLs Need to Be Added?

Add **ALL** URLs where your app is accessible:

1. **Local Development**: `http://localhost:3000/**`
2. **Production (Main)**: `https://wcs-basketball-v2.vercel.app/**`
3. **Vercel Preview Deployments**: `https://wcs-basketball-v2-*.vercel.app/**` (if using wildcard)
   - OR add each preview URL individually
4. **Custom Domain**: `https://wcsbasketball.site/**` (if you have one)
5. **New Deployment**: `https://your-new-site-url.vercel.app/**`

---

## ⚠️ Important Notes

### Why This Matters

- **OAuth Redirects**: Google OAuth redirects need the URL in the allowlist
- **Email Confirmations**: Magic link emails need the URL in the allowlist
- **Session Callbacks**: Auth callbacks need the URL in the allowlist

### What Happens If You Don't Add It?

- ❌ OAuth sign-in will fail with redirect errors
- ❌ Email confirmation links won't work
- ❌ Users will see "Invalid redirect URL" errors

### Wildcard Pattern

Using `/**` at the end allows:
- ✅ All paths: `/register`, `/auth/callback`, `/parent/profile`, etc.
- ✅ All query parameters: `?oauth=success&email=...`
- ✅ All hash fragments: `#access_token=...`

---

## 🧪 Testing After Adding URL

1. **Test OAuth Sign-In**:
   - Go to your new site URL
   - Click "Sign in with Google"
   - Should redirect correctly after OAuth

2. **Test Email Confirmation**:
   - Register a new player
   - Click the confirmation link in email
   - Should redirect to your new site URL

3. **Check Browser Console**:
   - Look for any redirect errors
   - Should see successful auth callbacks

---

## 📝 Example Configuration

**Current Setup (Before Adding New URL):**
```
Redirect URLs:
- http://localhost:3000/**
- https://wcs-basketball-v2.vercel.app/**

Site URL:
- https://wcs-basketball-v2.vercel.app
```

**After Adding New URL:**
```
Redirect URLs:
- http://localhost:3000/**
- https://wcs-basketball-v2.vercel.app/**
- https://www.wcsbasketball.site/**  ← NEW
- https://wcsbasketball.site/**  ← NEW (non-www version)

Site URL:
- https://www.wcsbasketball.site (recommended for production)
```

---

## 🚀 Quick Checklist

- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Add new URL to Redirect URLs: `https://your-new-site-url.vercel.app/**`
- [ ] Click "Save"
- [ ] Test OAuth sign-in on new site
- [ ] Test email confirmation on new site
- [ ] Verify no redirect errors in browser console

---

## 💡 Pro Tip

If you're using Vercel preview deployments, you can add a wildcard pattern:
```
https://wcs-basketball-v2-*.vercel.app/**
```

However, Supabase may not support wildcards. In that case, you'll need to add each preview URL individually, or use the main production URL for all redirects.

---

**That's it!** Once you add the new URL to the allowlist, all authentication flows should work on your new deployment. ✅

