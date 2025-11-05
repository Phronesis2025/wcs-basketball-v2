-- Check Message Board Tables Status
-- Run this to see what tables and policies currently exist

-- 1. Check if tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('coach_messages', 'coach_message_replies')
ORDER BY tablename;

-- 2. Check table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('coach_messages', 'coach_message_replies')
ORDER BY table_name, ordinal_position;

-- 3. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('coach_messages', 'coach_message_replies')
ORDER BY tablename, policyname;

-- 4. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('coach_messages', 'coach_message_replies')
ORDER BY tablename;

-- 5. Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('coach_messages', 'coach_message_replies')
ORDER BY tablename, indexname;
