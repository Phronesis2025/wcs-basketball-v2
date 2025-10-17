# Login Debugging Guide

## Overview

This guide helps you debug login issues in the WCS Basketball application. We've added comprehensive logging throughout the authentication flow to help identify exactly where issues occur.

## Debugging Steps

### 1. Check Browser Console

Open your browser's Developer Tools (F12) and go to the Console tab. Look for messages starting with:

- `🔐 [LOGIN DEBUG]` - Client-side login process
- `🔐 [SERVER DEBUG]` - Server-side API calls
- `🔐 [DASHBOARD DEBUG]` - Dashboard authentication checks

### 2. Check Terminal/Server Logs

Look at your development server terminal for server-side debug messages:

- `[DEV]` messages from the security module
- Server-side authentication logs
- Database connection errors

### 3. Test Login Flow

1. Go to `http://localhost:3000/coaches/login`
2. Enter credentials: `jason.boyer@wcs.com` / `test123`
3. Click Login
4. Watch console messages in real-time

## Expected Debug Flow

### Successful Login Should Show:

```
🔐 [LOGIN DEBUG] Starting login process...
🔐 [LOGIN DEBUG] Email: jason.boyer@wcs.com
🔐 [LOGIN DEBUG] Password length: 7
🔐 [LOGIN DEBUG] Sanitized email: jason.boyer@wcs.com
🔐 [LOGIN DEBUG] Sanitized password length: 7
🔐 [LOGIN DEBUG] Supabase URL: https://htgkddahhgugesktujds.supabase.co
🔐 [LOGIN DEBUG] Making request to /api/auth/login...
🔐 [SERVER DEBUG] Login API called
🔐 [SERVER DEBUG] Email: jason.boyer@wcs.com
🔐 [SERVER DEBUG] Password length: 7
🔐 [SERVER DEBUG] Attempting Supabase authentication...
🔐 [SERVER DEBUG] ✅ Login successful for user: [user-id]
🔐 [LOGIN DEBUG] Response status: 200
🔐 [LOGIN DEBUG] Response ok: true
🔐 [LOGIN DEBUG] ✅ Login successful!
🔐 [LOGIN DEBUG] Storing session in localStorage...
🔐 [LOGIN DEBUG] Dispatching auth state change event...
🔐 [LOGIN DEBUG] Setting timeout for navigation to dashboard...
🔐 [LOGIN DEBUG] Navigating to dashboard...
🔐 [DASHBOARD DEBUG] Starting dashboard authentication check...
🔐 [DASHBOARD DEBUG] Auth token exists: true
🔐 [DASHBOARD DEBUG] Is authenticated flag: true
🔐 [DASHBOARD DEBUG] ✅ User authenticated: [user-id]
```

## Common Issues and Solutions

### Issue 1: "Invalid email or password"

**Debug Messages to Look For:**

- `🔐 [SERVER DEBUG] ❌ Supabase auth error: [error message]`

**Possible Causes:**

- User doesn't exist in Supabase database
- Wrong password
- User account is disabled
- Database connection issues

**Solutions:**

1. Check Supabase Dashboard → Authentication → Users
2. Verify user exists and is active
3. Check if password is correct
4. Verify database connection

### Issue 2: "Database connection not configured"

**Debug Messages to Look For:**

- `🔐 [LOGIN DEBUG] ❌ Invalid Supabase URL`

**Solutions:**

1. Check `.env.local` file has correct `NEXT_PUBLIC_SUPABASE_URL`
2. Restart development server after changing environment variables
3. Verify Supabase project is active

### Issue 3: Login succeeds but doesn't navigate to dashboard

**Debug Messages to Look For:**

- `🔐 [LOGIN DEBUG] ✅ Login successful!` (but no navigation)
- `🔐 [DASHBOARD DEBUG] ❌ No auth token or authenticated flag`

**Possible Causes:**

- localStorage not being set properly
- Navigation timeout issues
- Dashboard authentication check failing

**Solutions:**

1. Check if localStorage is being set: `localStorage.getItem('supabase.auth.token')`
2. Check if auth state change event is dispatched
3. Verify dashboard authentication logic

### Issue 4: Dashboard loads but shows "Select Team"

**Debug Messages to Look For:**

- `🔐 [DASHBOARD DEBUG] ✅ User authenticated: [user-id]`
- `[DEV] Teams loaded: 0 teams`

**Possible Causes:**

- User has no teams assigned
- Database query issues
- User role/permissions issues

**Solutions:**

1. Check if user has teams in database
2. Verify user role in `coach_roles` table
3. Check database queries in actions.ts

## Supabase Dashboard Checks

### 1. Authentication → Users

- Verify user `jason.boyer@wcs.com` exists
- Check if user is "Active"
- Verify email is confirmed
- Check last sign-in time

### 2. Database → Tables

- Check `coach_roles` table for user permissions
- Check `teams` table for assigned teams
- Verify foreign key relationships

### 3. Logs → Auth Logs

- Look for failed login attempts
- Check for any authentication errors
- Verify successful logins

## Environment Variables Check

Verify these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://htgkddahhgugesktujds.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

## Network Tab Debugging

1. Open Developer Tools → Network tab
2. Try logging in
3. Look for:
   - `/api/auth/login` request (should return 200)
   - Any failed requests (red status codes)
   - Request/response details

## Quick Test Commands

### Check localStorage in Browser Console:

```javascript
// Check if auth data is stored
console.log("Auth token:", localStorage.getItem("supabase.auth.token"));
console.log("Authenticated:", localStorage.getItem("auth.authenticated"));

// Clear auth data for testing
localStorage.removeItem("supabase.auth.token");
localStorage.removeItem("auth.authenticated");
```

### Test Supabase Connection:

```javascript
// In browser console
fetch("/api/test-supabase")
  .then((r) => r.json())
  .then(console.log);
```

## Getting Help

If you're still having issues after following this guide:

1. **Copy all debug messages** from console and terminal
2. **Take screenshots** of any error messages
3. **Check Supabase Dashboard** for any errors or issues
4. **Verify environment variables** are correct
5. **Test with a fresh browser session** (clear cookies/localStorage)

The debug messages will show exactly where the authentication flow is failing, making it much easier to identify and fix the issue.
