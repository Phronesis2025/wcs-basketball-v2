-- Test Real-time Setup for Message Board
-- Run this in Supabase SQL Editor to check and fix real-time configuration

-- 1. Check if tables exist in the realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('coach_messages', 'coach_message_replies');

-- 2. If the above query returns no rows, add the tables to realtime
-- (Only run these if the above query returned no results)
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_message_replies;

-- 3. Verify the tables are now in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('coach_messages', 'coach_message_replies');

-- 4. Check if the tables have the right structure for realtime
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('coach_messages', 'coach_message_replies')
ORDER BY table_name, ordinal_position;

-- 5. Test by inserting a message (this should trigger realtime if configured correctly)
-- Uncomment the line below to test:
-- INSERT INTO public.coach_messages (author_id, author_name, content) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test User', 'Test message for realtime');
