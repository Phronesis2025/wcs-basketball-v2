-- Critical Database Migration: Add acknowledged_at column and indexes
-- This fixes the 400 error in the unread mention notification system

-- Add column to track if notification has been acknowledged
ALTER TABLE public.message_notifications
ADD COLUMN IF NOT EXISTS acknowledged_at timestamp with time zone;

-- Add index for performance on acknowledged_at queries
CREATE INDEX IF NOT EXISTS idx_message_notifications_acknowledged 
ON public.message_notifications(acknowledged_at);

-- Add composite index for unread queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_message_notifications_unread 
ON public.message_notifications(mentioned_user_id, acknowledged_at) 
WHERE acknowledged_at IS NULL;

-- Add additional performance indexes for message board queries
CREATE INDEX IF NOT EXISTS idx_coach_messages_created_at ON coach_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_coach_messages_author_id ON coach_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_deleted_at ON coach_messages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_coach_messages_is_pinned ON coach_messages(is_pinned);

-- Add indexes for message replies
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_message_id ON coach_message_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_author_id ON coach_message_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_deleted_at ON coach_message_replies(deleted_at);

-- Add indexes for frequently queried tables
CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_team_updates_team_id ON team_updates(team_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_is_deleted ON players(is_deleted);

-- Add indexes for user queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verify the migration was successful
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'message_notifications' 
AND column_name = 'acknowledged_at';
