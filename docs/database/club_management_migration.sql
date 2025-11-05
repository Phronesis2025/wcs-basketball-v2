
-- Club Management Migration
-- Adds players table for roster management

-- Players table for roster management
CREATE TABLE IF NOT EXISTS public.players (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  jersey_number integer,
  grade text,
  parent_name text,
  parent_email text,
  parent_phone text,
  emergency_contact text,
  emergency_phone text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT players_pkey PRIMARY KEY (id)
);

-- RLS policies for players table
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view players"
  ON public.players FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage players"
  ON public.players FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_team_id ON public.players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_name ON public.players(name);
CREATE INDEX IF NOT EXISTS idx_players_jersey_number ON public.players(jersey_number);

-- Add audit trigger for players table
CREATE TRIGGER audit_players_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.players
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
