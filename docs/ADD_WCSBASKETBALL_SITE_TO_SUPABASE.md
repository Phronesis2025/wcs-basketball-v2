# Add wcsbasketball.site to Supabase Redirect URLs

**Your New Site URL**: https://www.wcsbasketball.site/

---

## ✅ Step-by-Step Instructions

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project: `htgkddahhgugesktujds`
3. Navigate to: **Authentication** → **URL Configuration**

### Step 2: Add Your Custom Domain URLs

In the **"Redirect URLs"** section, add **BOTH** of these URLs:

1. **With www:**
   ```
   https://www.wcsbasketball.site/**
   ```

2. **Without www:**
   ```
   https://wcsbasketball.site/**
   ```

**Why both?** Users might access your site with or without `www.`, so add both to ensure OAuth and email links work in all cases.

### Step 3: Update Site URL (Recommended)

Set the **Site URL** to your custom domain:

```
https://www.wcsbasketball.site
```

This becomes the default redirect URL when no `redirectTo` parameter is specified.

### Step 4: Save Changes

Click **"Save"** at the bottom of the page.

---

## 📋 Complete Redirect URLs List

After adding, you should have:

```
✅ http://localhost:3000/**
✅ https://wcs-basketball-v2.vercel.app/**
✅ https://wcs-basketball-v2-phronesis2025s-projects.vercel.app/** (if still using)
✅ https://www.wcsbasketball.site/**  ← NEW
✅ https://wcsbasketball.site/**  ← NEW
```

---

## 🧪 Test After Adding

1. **Test OAuth Sign-In**:
   - Go to: https://www.wcsbasketball.site/register
   - Click "Sign in with Google"
   - Should redirect correctly after OAuth

2. **Test Email Confirmation**:
   - Register a new player
   - Click the confirmation link in email
   - Should redirect to https://www.wcsbasketball.site

3. **Check for Errors**:
   - Open browser console (F12)
   - Look for any "Invalid redirect URL" errors
   - Should see successful auth callbacks

---

## ⚠️ Important Notes

### Both www and non-www

- **Add both**: `www.wcsbasketball.site` and `wcsbasketball.site`
- **Why**: Users might type either version, and redirects need to work for both
- **Pattern**: Use `/**` at the end to allow all paths

### Vercel Domain vs Custom Domain

- **Vercel domain**: `https://wcs-basketball-v2.vercel.app/**` (keep this for preview deployments)
- **Custom domain**: `https://www.wcsbasketball.site/**` (your new production URL)
- **Both work**: You can keep both in the allowlist

---

## 🚀 Quick Checklist

- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Add `https://www.wcsbasketball.site/**` to Redirect URLs
- [ ] Add `https://wcsbasketball.site/**` to Redirect URLs
- [ ] Update Site URL to `https://www.wcsbasketball.site`
- [ ] Click "Save"
- [ ] Test OAuth sign-in on https://www.wcsbasketball.site
- [ ] Test email confirmation on https://www.wcsbasketball.site
- [ ] Verify no redirect errors

---

## 📝 What This Enables

After adding these URLs, the following will work on your custom domain:

✅ **Google OAuth Sign-In** - Users can sign in with Google  
✅ **Email Confirmations** - Magic link emails redirect correctly  
✅ **Auth Callbacks** - All authentication callbacks work  
✅ **Session Management** - User sessions persist correctly  

---

**That's it!** Once you add these URLs to Supabase, all authentication flows will work on https://www.wcsbasketball.site ✅

