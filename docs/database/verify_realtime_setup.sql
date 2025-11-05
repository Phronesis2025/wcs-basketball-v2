-- Verify Real-time Setup for Message Board
-- Run this in Supabase SQL Editor to check the current state

-- 1. Check if tables exist in the realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('coach_messages', 'coach_message_replies');

-- 2. If no results above, add the tables to realtime
-- (Only run these if the above query returned no results)
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_message_replies;

-- 3. Verify the tables are now in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('coach_messages', 'coach_message_replies');

-- 4. Check if the tables have the right structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('coach_messages', 'coach_message_replies')
ORDER BY table_name, ordinal_position;

-- 5. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('coach_messages', 'coach_message_replies')
ORDER BY tablename;
