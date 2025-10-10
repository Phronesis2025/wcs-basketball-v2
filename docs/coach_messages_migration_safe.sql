-- Safe Migration: Create Coach Messages and Replies Tables
-- This script handles existing tables gracefully
-- Created: December 2024
-- Purpose: Implement coaches message board functionality

-- 1. Create coach_messages table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  is_pinned boolean DEFAULT false,
  CONSTRAINT coach_messages_pkey PRIMARY KEY (id),
  CONSTRAINT coach_messages_author_id_fkey FOREIGN KEY (author_id) 
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- 2. Create coach_message_replies table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.coach_message_replies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  author_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT coach_message_replies_pkey PRIMARY KEY (id),
  CONSTRAINT coach_message_replies_message_id_fkey FOREIGN KEY (message_id) 
    REFERENCES public.coach_messages(id) ON DELETE CASCADE,
  CONSTRAINT coach_message_replies_author_id_fkey FOREIGN KEY (author_id) 
    REFERENCES public.users(id) ON DELETE CASCADE
);

-- 3. Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_coach_messages_created_at ON public.coach_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_messages_deleted_at ON public.coach_messages(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_coach_messages_is_pinned ON public.coach_messages(is_pinned) WHERE is_pinned = true;

CREATE INDEX IF NOT EXISTS idx_coach_message_replies_message_id ON public.coach_message_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_created_at ON public.coach_message_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_deleted_at ON public.coach_message_replies(deleted_at) WHERE deleted_at IS NULL;

-- 4. Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_message_replies ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Coaches and admins can view all messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Coaches and admins can create messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can update own messages, admins can update any" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can delete own messages, admins can delete any" ON public.coach_messages;

DROP POLICY IF EXISTS "Coaches and admins can view all replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Coaches and admins can create replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can update own replies, admins can update any" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can delete own replies, admins can delete any" ON public.coach_message_replies;

-- 6. Create RLS Policies for coach_messages
CREATE POLICY "Coaches and admins can view all messages"
  ON public.coach_messages FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Coaches and admins can create messages"
  ON public.coach_messages FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own messages, admins can update any"
  ON public.coach_messages FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Users can delete own messages, admins can delete any"
  ON public.coach_messages FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- 7. Create RLS Policies for coach_message_replies
CREATE POLICY "Coaches and admins can view all replies"
  ON public.coach_message_replies FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Coaches and admins can create replies"
  ON public.coach_message_replies FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own replies, admins can update any"
  ON public.coach_message_replies FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Users can delete own replies, admins can delete any"
  ON public.coach_message_replies FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- 8. Create function to update updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for updated_at (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_coach_messages_updated_at ON public.coach_messages;
DROP TRIGGER IF EXISTS update_coach_message_replies_updated_at ON public.coach_message_replies;

CREATE TRIGGER update_coach_messages_updated_at 
  BEFORE UPDATE ON public.coach_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coach_message_replies_updated_at 
  BEFORE UPDATE ON public.coach_message_replies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Grant necessary permissions
GRANT ALL ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_message_replies TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 11. Verify tables exist and show structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('coach_messages', 'coach_message_replies')
ORDER BY table_name, ordinal_position;
