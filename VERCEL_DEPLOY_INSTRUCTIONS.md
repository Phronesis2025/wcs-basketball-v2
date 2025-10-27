# Quick Deploy Instructions for WCS Basketball v2.0

## Current Status

- ✅ Already deployed to: https://wcs-basketball-v2.vercel.app
- 📝 Recent changes need to be committed and pushed
- 🔧 RLS security fix applied to payments table

## To Deploy Your Latest Changes:

### 1. Commit and Push Your Changes

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: auth error handling, payment UI improvements, RLS for payments"

# Push to GitHub
git push origin main
```

### 2. Deploy to Vercel

**Option A: Automatic (if connected to GitHub)**

- Vercel will automatically deploy when you push to `main`
- Go to https://vercel.com/dashboard and wait for the deployment

**Option B: Manual Vercel CLI**

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Configure Environment Variables in Vercel

**CRITICAL:** If deploying a new project, add these to Vercel Dashboard:

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

#### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://htgkddahhgugesktujds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[get from Supabase Dashboard]
SUPABASE_SERVICE_ROLE_KEY=[get from Supabase Dashboard]
```

#### Optional Variables (if using payments):

```
STRIPE_SECRET_KEY=sk_[your-key]
STRIPE_PRICE_ANNUAL=price_[your-price-id]
STRIPE_PRICE_MONTHLY=price_[your-price-id]
STRIPE_WEBHOOK_SECRET=whsec_[your-secret]
NEXT_PUBLIC_BASE_URL=https://wcs-basketball-v2.vercel.app
```

### 4. Test After Deployment

1. Visit: https://wcs-basketball-v2.vercel.app
2. Test registration flow
3. Test login
4. Check browser console for errors
5. Verify profile page works

### 5. Supabase Configuration (Already Done ✅)

- ✅ Payments table RLS enabled
- ✅ User authentication working
- ⚠️ Email confirmation: Currently required

**To disable email confirmation for testing:**

1. Go to Supabase Dashboard
2. Authentication → Providers → Email
3. "Confirm email" → Toggle OFF
4. Users can now login without email confirmation

## What Changed:

1. **Auth Error Handling** (`src/hooks/useAuth.ts`)

   - Changed `devError` to `devLog` for "no session" messages
   - Prevents misleading error messages in console

2. **Admin Payment UI** (`src/app/admin/club-management/page.tsx`)

   - Removed metric boxes
   - Added "Clear All Data" button
   - Created new "Registrations" section
   - Side-by-side layout for tables

3. **Database Security** (already applied via MCP)
   - Enabled RLS on `payments` table
   - Added policies for parents and admins

## Notes:

- Your app is already deployed and working
- Just need to push the latest changes
- Vercel will auto-deploy on push (if connected)
- Check deployment logs if issues occur

## Rollback (if needed):

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

Or in Vercel Dashboard:

- Go to Deployments
- Find last working deployment
- Click "Promote to Production"
