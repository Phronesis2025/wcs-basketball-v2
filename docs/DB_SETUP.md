# WCSv2.0 Database Setup

## Schema

- **teams**:
  - id (UUID, PK)
  - name (TEXT, NOT NULL)
  - age_group (TEXT, CHECK U10-U18)
  - gender (TEXT, CHECK Boys/Girls)
  - coach_email (TEXT, NOT NULL)
  - grade_level (TEXT)
  - season (TEXT)
  - logo_url (TEXT)
- **schedules**:
  - id (UUID, PK)
  - team_id (UUID, FK to teams)
  - event_type (TEXT, CHECK Game/Practice)
  - date_time (TIMESTAMP)
  - location (TEXT)
  - opponent (TEXT)
  - created_at (TIMESTAMP, DEFAULT NOW)
- **users**:
  - id (UUID, PK)
  - email (TEXT, UNIQUE)
  - role (TEXT, CHECK coach/parent/admin)
  - created_at (TIMESTAMP, DEFAULT NOW)

## Seed Script

INSERT INTO teams (name, age_group, gender, coach_email, grade_level, season, logo_url)
VALUES
('WCS Warriors', 'U12', 'Boys', 'coach1@example.com', '6th', '2025-2026', '/logos/warriors.png'),
('WCS Sharks', 'U14', 'Girls', 'coach2@example.com', '8th', '2025-2026', '/logos/sharks.png');

## RLS Policies

CREATE POLICY "Public view teams" ON teams FOR SELECT TO public USING (true);
CREATE POLICY "Coaches edit own teams" ON teams FOR ALL TO authenticated USING (auth.email() = coach_email) WITH CHECK (auth.email() = coach_email);
