# Enable Leaked Password Protection

**Priority**: Medium  
**Category**: Security Enhancement  
**Status**: ⚠️ Needs Manual Configuration

## Issue Description

Supabase Auth can check user passwords against the "Have I Been Pwned" database to prevent users from using compromised passwords. This feature is currently **disabled** in your project.

## What is Have I Been Pwned?

Have I Been Pwned (HIBP) is a service that maintains a database of billions of passwords that have been exposed in data breaches. By enabling this feature, you prevent users from choosing passwords that are known to be compromised.

## Security Benefit

- **Prevents use of compromised passwords** that hackers already know
- **Reduces risk of credential stuffing attacks**
- **Improves overall account security**
- **User-friendly**: Only prevents weak/leaked passwords, doesn't block legitimate ones

## How to Enable

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: `htgkddahhgugesktujds`
3. Navigate to **Authentication** → **Policies**

### Step 2: Enable Leaked Password Protection

1. Look for the **"Password Strength"** section
2. Find the toggle for **"Leaked Password Protection"**
3. **Enable** the toggle
4. Save changes

### Step 3: Configure Password Requirements (Optional)

While you're in the settings, consider configuring:

- **Minimum password length**: 8-12 characters (recommended: 10)
- **Require uppercase letters**: Yes
- **Require lowercase letters**: Yes
- **Require numbers**: Yes
- **Require special characters**: Optional (better UX without)

## Impact on Users

### New User Registration

- Users will be prevented from choosing passwords found in breach databases
- A user-friendly error message will prompt them to choose a different password

### Existing Users

- **No impact on existing passwords** (they're already set)
- Next time they change their password, the check will apply

### Error Message Example

```
"This password has been found in a data breach and cannot be used. Please choose a different password."
```

## Technical Details

### How It Works

1. When a user creates/updates their password, Supabase:
   - Hashes the password using SHA-1
   - Sends only the first 5 characters of the hash to HIBP API
   - Receives a list of matching hashes
   - Checks if the full hash matches any compromised passwords
2. **Privacy Protection**:
   - The full password is never sent to HIBP
   - Only a partial hash is transmitted
   - HIBP cannot determine the actual password

### Performance Impact

- Negligible (< 100ms added to registration)
- Only affects registration and password change flows
- No impact on login performance

## Recommendation

✅ **Enable this feature** for enhanced security

**Priority Level**: Medium (not critical, but recommended)

## Documentation

For more details, see:

- [Supabase Password Security Docs](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3)

## Verification

After enabling, test with a known compromised password:

- Try to register with password: `password123`
- You should see an error preventing its use

## Notes

- This is a **manual configuration** in the Supabase Dashboard
- Cannot be enabled via SQL migration
- One-time setup, no maintenance required
- Recommended for all production applications
