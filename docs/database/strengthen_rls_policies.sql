-- Strengthen RLS Policies for Better Security
-- This addresses the overly permissive policies identified in the security audit

-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow all authenticated users to view non-deleted messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Allow all authenticated users to insert messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Allow all authenticated users to update messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can delete own messages, admins can delete any" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can update own messages, admins can update any" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Coaches and admins can view all messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Coaches and admins can view non-deleted messages" ON public.coach_messages;

DROP POLICY IF EXISTS "Allow all authenticated users to view non-deleted replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Allow all authenticated users to insert replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Allow all authenticated users to update replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can delete own replies, admins can delete any" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can update own replies, admins can update any" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can view own replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Users can insert own replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Coaches and admins can view all replies" ON public.coach_message_replies;
DROP POLICY IF EXISTS "Coaches and admins can view non-deleted replies" ON public.coach_message_replies;

-- Create more restrictive policies for coach_messages
CREATE POLICY "Coaches and admins can view non-deleted messages"
  ON public.coach_messages FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND deleted_at IS NULL
    AND (
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'coach')
      )
    )
  );

CREATE POLICY "Coaches and admins can insert messages"
  ON public.coach_messages FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Users can update own messages, admins can update any"
  ON public.coach_messages FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() = author_id OR 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can delete own messages, admins can delete any"
  ON public.coach_messages FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() = author_id OR 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Create more restrictive policies for coach_message_replies
CREATE POLICY "Coaches and admins can view non-deleted replies"
  ON public.coach_message_replies FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Coaches and admins can insert replies"
  ON public.coach_message_replies FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Users can update own replies, admins can update any"
  ON public.coach_message_replies FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() = author_id OR 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can delete own replies, admins can delete any"
  ON public.coach_message_replies FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND (
      auth.uid() = author_id OR 
      EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Ensure RLS is enabled on both tables
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;
