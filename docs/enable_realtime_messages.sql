-- Enable Realtime for Message Board Tables
-- This script enables real-time replication for the message board tables

-- Enable Realtime for coach_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_messages;

-- Enable Realtime for coach_message_replies table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_message_replies;

-- Verify the tables are added to the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('coach_messages', 'coach_message_replies');

-- Check if the tables exist and have the right structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('coach_messages', 'coach_message_replies')
ORDER BY table_name, ordinal_position;
