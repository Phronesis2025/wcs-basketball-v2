-- Migration: Update teams table to use grade levels instead of age groups
-- Date: January 2025
-- Description: Changes the age_group CHECK constraint to allow grade level values
--              instead of U8-U18 age group values

-- Step 1: Drop the existing CHECK constraint on age_group
ALTER TABLE public.teams 
DROP CONSTRAINT IF EXISTS teams_age_group_check;

-- Step 2: Add new CHECK constraint allowing grade level values
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

-- Step 3: Optional - Migrate existing data (run this after updating the constraint)
-- This will convert existing U8-U18 values to grade levels
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

-- Note: RLS policies should not need updates as they typically don't reference
-- specific age_group values, but check your policies to be sure.


