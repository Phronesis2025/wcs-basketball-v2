-- Fix RLS policies for message deletion
-- The current policies use FOR UPDATE but should work for soft deletes
-- However, let's ensure they're properly set up

-- Drop existing delete policies
DROP POLICY IF EXISTS "Users can delete own messages, admins can delete any" ON public.coach_messages;
DROP POLICY IF EXISTS "Users can delete own replies, admins can delete any" ON public.coach_message_replies;

-- Create proper delete policies for soft deletes (UPDATE operations)
CREATE POLICY "Users can delete own messages, admins can delete any"
  ON public.coach_messages FOR UPDATE
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

-- Also ensure we have proper SELECT policies that filter out deleted messages
DROP POLICY IF EXISTS "Coaches and admins can view all messages" ON public.coach_messages;
DROP POLICY IF EXISTS "Coaches and admins can view all replies" ON public.coach_message_replies;

CREATE POLICY "Coaches and admins can view all messages"
  ON public.coach_messages FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Coaches and admins can view all replies"
  ON public.coach_message_replies FOR SELECT
  USING (deleted_at IS NULL);
