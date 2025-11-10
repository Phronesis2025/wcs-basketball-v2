# Migration Instructions: Age Groups to Grade Levels

## Overview
This migration updates the `teams` table to use grade levels (2nd Grade through U18 High School) instead of age groups (U8-U18).

## Prerequisites
- Admin access to Supabase Dashboard
- Access to SQL Editor in Supabase

## Step-by-Step Instructions

### Step 1: Update the Database Constraint

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `htgkddahhgugesktujds`
3. **Navigate to**: SQL Editor (left sidebar)
4. **Create a new query** and paste the following SQL:

```sql
-- Drop the existing CHECK constraint on age_group
ALTER TABLE public.teams 
DROP CONSTRAINT IF EXISTS teams_age_group_check;

-- Add new CHECK constraint allowing grade level values
ALTER TABLE public.teams 
ADD CONSTRAINT teams_age_group_check 
CHECK (age_group = ANY (ARRAY[
  '2nd Grade'::text, 
  '3rd Grade'::text, 
  '4th Grade'::text, 
  '5th Grade'::text, 
  '6th Grade'::text, 
  '7th Grade'::text, 
  '8th Grade'::text, 
  'U18 (High School)'::text
]));
```

5. **Click "Run"** to execute the SQL

### Step 2: Migrate Existing Data

After updating the constraint, you have two options:

#### Option A: Use the Migration API (Recommended)

1. Call the migration API endpoint:
   ```
   POST /api/admin/migrate-teams-to-grades
   ```
   With your admin user ID in the `x-user-id` header.

2. This will automatically convert all existing teams:
   - U8 → 2nd Grade
   - U10 → 3rd Grade
   - U12 → 4th Grade
   - U14 → 5th Grade
   - U16 → 6th Grade
   - U18 → U18 (High School)

#### Option B: Run SQL Directly in Supabase

If you prefer to run the migration via SQL, paste this in the SQL Editor:

```sql
-- Migrate existing data from age groups to grade levels
UPDATE public.teams
SET age_group = CASE
  WHEN age_group = 'U8' THEN '2nd Grade'
  WHEN age_group = 'U10' THEN '3rd Grade'
  WHEN age_group = 'U12' THEN '4th Grade'
  WHEN age_group = 'U14' THEN '5th Grade'
  WHEN age_group = 'U16' THEN '6th Grade'
  WHEN age_group = 'U18' THEN 'U18 (High School)'
  ELSE age_group
END
WHERE age_group IN ('U8', 'U10', 'U12', 'U14', 'U16', 'U18');
```

### Step 3: Verify the Migration

Run this query to verify the migration was successful:

```sql
-- Check all teams have valid grade levels
SELECT 
  id,
  name,
  age_group,
  gender
FROM public.teams
WHERE age_group NOT IN (
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  'U18 (High School)'
);
```

**Expected Result**: This query should return 0 rows (all teams should have valid grade levels).

## RLS Policies

✅ **No RLS policy updates needed**

The existing RLS policies for the `teams` table don't reference specific `age_group` values. They are based on:
- User roles (admin, coach, authenticated)
- Public read access
- User ownership

Since the policies don't filter by `age_group` values, they will continue to work correctly after the migration.

## Rollback (If Needed)

If you need to rollback the migration, run:

```sql
-- Revert constraint to old age groups
ALTER TABLE public.teams 
DROP CONSTRAINT IF EXISTS teams_age_group_check;

ALTER TABLE public.teams 
ADD CONSTRAINT teams_age_group_check 
CHECK (age_group = ANY (ARRAY['U8'::text, 'U10'::text, 'U12'::text, 'U14'::text, 'U16'::text, 'U18'::text]));

-- Revert data (if you migrated it)
UPDATE public.teams
SET age_group = CASE
  WHEN age_group = '2nd Grade' THEN 'U8'
  WHEN age_group = '3rd Grade' THEN 'U10'
  WHEN age_group = '4th Grade' THEN 'U12'
  WHEN age_group = '5th Grade' THEN 'U14'
  WHEN age_group = '6th Grade' THEN 'U16'
  WHEN age_group = 'U18 (High School)' THEN 'U18'
  ELSE age_group
END
WHERE age_group IN ('2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', 'U18 (High School)');
```

## Notes

- The migration is **non-destructive** - it only updates the constraint and data values
- No data loss will occur
- All existing team relationships (players, coaches, schedules) remain intact
- The `grade_level` column remains unchanged (it's a separate field)

## Support

If you encounter any issues:
1. Check the Supabase logs for constraint violation errors
2. Verify all teams have valid `age_group` values before running the constraint update
3. Ensure you have admin privileges in Supabase


