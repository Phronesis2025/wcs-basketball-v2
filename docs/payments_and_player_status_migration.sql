-- Payments and Player Status Migration
-- Created: January 2025
-- Purpose: Add payment tracking and player status management
-- 
-- This migration:
-- 1. Adds status, waiver_signed, and stripe_customer_id fields to players table
-- 2. Creates payments table for tracking player payments via Stripe
-- 3. Adds indexes for performance
-- 4. Sets up Row Level Security (RLS) policies

-- =====================================================
-- 1. ADD NEW FIELDS TO PLAYERS TABLE
-- =====================================================

-- Add status field to track player registration status
-- Values: 'pending' | 'approved' | 'active'
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add waiver_signed field to track if waiver has been completed
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS waiver_signed boolean DEFAULT false;

-- Add stripe_customer_id to link player with Stripe customer record
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add comment for documentation
COMMENT ON COLUMN public.players.status IS 'Player registration status: pending, approved, or active';
COMMENT ON COLUMN public.players.waiver_signed IS 'Whether the player has signed the liability waiver';
COMMENT ON COLUMN public.players.stripe_customer_id IS 'Stripe customer ID for payment processing';

-- =====================================================
-- 2. CREATE PAYMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  player_id uuid NOT NULL,
  stripe_payment_id text,
  amount numeric NOT NULL,
  payment_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_player_id_fkey FOREIGN KEY (player_id) 
    REFERENCES public.players(id) ON DELETE CASCADE,
  CONSTRAINT payments_status_check CHECK (status IN ('pending', 'paid', 'failed')),
  CONSTRAINT payments_type_check CHECK (payment_type IN ('annual', 'monthly', 'custom'))
);

-- Add comments for documentation
COMMENT ON TABLE public.payments IS 'Tracks player payments via Stripe';
COMMENT ON COLUMN public.payments.player_id IS 'Foreign key to players table';
COMMENT ON COLUMN public.payments.stripe_payment_id IS 'Stripe Checkout Session ID or Invoice ID';
COMMENT ON COLUMN public.payments.amount IS 'Payment amount in dollars';
COMMENT ON COLUMN public.payments.payment_type IS 'Type of payment: annual, monthly, or custom';
COMMENT ON COLUMN public.payments.status IS 'Payment status: pending, paid, or failed';

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for players status (filtering by player status)
CREATE INDEX IF NOT EXISTS idx_players_status ON public.players(status);

-- Index for stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_players_stripe_customer_id ON public.players(stripe_customer_id);

-- Index for payments by player (lookup all payments for a player)
CREATE INDEX IF NOT EXISTS idx_payments_player_id ON public.payments(player_id);

-- Index for payments by status (query pending/failed payments)
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Index for payments by created_at (sorting by date)
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Index for Stripe payment ID lookups (webhook processing)
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_id ON public.payments(stripe_payment_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view payments (but this is typically restricted)
-- Admins should handle payment viewing through authenticated routes
CREATE POLICY "Public can view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert payments
CREATE POLICY "Admins can insert payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Policy: Only admins can update payments
CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Policy: Only admins can delete payments (for corrections)
CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- =====================================================
-- 5. CREATE UPDATED_AT TRIGGER (OPTIONAL)
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS payments_updated_at_trigger ON public.payments;
CREATE TRIGGER payments_updated_at_trigger
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- =====================================================
-- 6. VERIFICATION NOTES
-- =====================================================

-- After running this migration, verify:
-- 1. New columns exist in players table: SELECT column_name FROM information_schema.columns WHERE table_name = 'players';
-- 2. Payments table exists: SELECT * FROM information_schema.tables WHERE table_name = 'payments';
-- 3. RLS policies are active: SELECT * FROM pg_policies WHERE tablename = 'payments';
-- 4. Indexes are created: SELECT indexname FROM pg_indexes WHERE tablename IN ('players', 'payments');

