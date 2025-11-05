-- Secure RPC to soft-delete a coach message
-- Run this in Supabase SQL editor

-- 1) Create function (owner runs it, enforces author check inside)
CREATE OR REPLACE FUNCTION public.soft_delete_coach_message(
  p_message_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow the author to soft-delete their own message
  UPDATE public.coach_messages
  SET deleted_at = now()
  WHERE id = p_message_id
    AND author_id = auth.uid();

  -- Optionally, raise if nothing was updated (not author or not found)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_author_or_not_found' USING ERRCODE = '42501';
  END IF;
END;
$$;

-- 2) Allow authenticated users to call the function
GRANT EXECUTE ON FUNCTION public.soft_delete_coach_message(uuid) TO authenticated;

-- Note: SECURITY DEFINER causes the function to run with the function owner's
-- privileges, bypassing table RLS. We still enforce author ownership via the
-- author_id = auth.uid() predicate.


