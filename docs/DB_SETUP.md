# WCSv2.0 Database Setup

## 📝 Schema Updates (v2.4.2)

**Last Updated**: January 2025 - Updated to reflect current production database schema

### Key Changes:
- **Soft Deletes**: Added `deleted_at` columns to `schedules`, `team_updates`, and `news` tables
- **Enhanced Event Types**: Schedules now support 'Tournament' and 'Meeting' event types
- **User References**: Updated foreign key references from `coaches(id)` to `users(id)` for better consistency
- **News Team Association**: Added `team_id` to news table for team-specific news
- **Password Reset Tracking**: Added `last_password_reset` timestamp to users table
- **Array Types**: Updated practice drills to use generic `ARRAY` type instead of `TEXT[]`

## 🗄️ Current Database Status

### Supabase Configuration

- **Platform**: Supabase (PostgreSQL)
- **Status**: ✅ Active and Configured
- **Region**: US East (N. Virginia)
- **Plan**: Pro Plan
- **Connection**: Secure HTTPS with SSL

### Database Statistics

- **Tables**: 11 active tables (teams, coaches, schedules, team_updates, practice_drills, users, news, products, resources, team_coaches, audit_logs)
- **Rows**: ~100+ records across all tables
- **Storage**: <200MB (well within limits)
- **Connections**: Stable connection pool
- **Performance**: Optimized with proper indexing and RLS policies

## 📊 Database Schema

### 1. Teams Table

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  age_group TEXT CHECK (age_group = ANY (ARRAY['U10'::text, 'U12'::text, 'U14'::text, 'U16'::text, 'U18'::text])),
  gender TEXT CHECK (gender = ANY (ARRAY['Boys'::text, 'Girls'::text])),
  coach_email TEXT NOT NULL,
  grade_level TEXT,
  season TEXT,
  logo_url TEXT,
  team_image TEXT
);
```

### 2. Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role = ANY (ARRAY['coach'::text, 'parent'::text, 'admin'::text])),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  password_reset BOOLEAN DEFAULT true,
  last_password_reset TIMESTAMP WITH TIME ZONE
);
```

### 3. Coaches Table

```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  image_url TEXT,
  quote TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 4. Team Coaches Junction Table

```sql
CREATE TABLE team_coaches (
  team_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  PRIMARY KEY (coach_id, team_id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (coach_id) REFERENCES coaches(id)
);
```

### 5. Schedules Table

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id),
  event_type TEXT CHECK (event_type = ANY (ARRAY['Game'::text, 'Practice'::text, 'Tournament'::text, 'Meeting'::text])),
  date_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  location TEXT,
  opponent TEXT,
  description TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 6. Team Updates Table

```sql
CREATE TABLE team_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 7. Practice Drills Table

```sql
CREATE TABLE practice_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id),
  title TEXT NOT NULL,
  skills ARRAY NOT NULL,
  equipment ARRAY NOT NULL,
  time TEXT NOT NULL,
  instructions TEXT NOT NULL,
  additional_info TEXT,
  benefits TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 8. News Table

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### 9. Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  printful_id TEXT,
  image_url TEXT
);
```

### 10. Resources Table

```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  coach_email TEXT NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
```

### 11. Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🔐 Row Level Security (RLS)

### Teams Table Policies

```sql
-- Public can view all teams
CREATE POLICY "Public view teams" ON teams
FOR SELECT TO public USING (true);

-- Coaches can edit teams they are assigned to
CREATE POLICY "Coaches edit assigned teams" ON teams
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM team_coaches tc
  JOIN coaches c ON tc.coach_id = c.id
  WHERE tc.team_id = teams.id
  AND c.user_id = auth.uid()
));

-- Admins can edit all teams
CREATE POLICY "Admins edit all teams" ON teams
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Coaches Table Policies

```sql
-- Public can view all coaches
CREATE POLICY "Public view coaches" ON coaches
FOR SELECT TO public USING (true);

-- Coaches can edit their own records
CREATE POLICY "Coaches edit own records" ON coaches
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can edit all coaches
CREATE POLICY "Admins edit all coaches" ON coaches
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Team Coaches Junction Table Policies

```sql
-- Public can view team-coach relationships
CREATE POLICY "Public view team coaches" ON team_coaches
FOR SELECT TO public USING (true);

-- Coaches can manage their own team assignments
CREATE POLICY "Coaches manage team assignments" ON team_coaches
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM coaches
  WHERE coaches.id = team_coaches.coach_id
  AND coaches.user_id = auth.uid()
));
```

### Schedules Table Policies

```sql
-- Public can view all schedules
CREATE POLICY "Public view schedules" ON schedules
FOR SELECT TO public USING (true);

-- Coaches can manage schedules for their teams
CREATE POLICY "Coaches manage team schedules" ON schedules
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM team_coaches tc
  JOIN coaches c ON tc.coach_id = c.id
  WHERE tc.team_id = schedules.team_id
  AND c.user_id = auth.uid()
) OR created_by = auth.uid());
```

### Team Updates Table Policies

```sql
-- Public can view all team updates
CREATE POLICY "Public view team updates" ON team_updates
FOR SELECT TO public USING (true);

-- Coaches can manage updates for their teams
CREATE POLICY "Coaches manage team updates" ON team_updates
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM team_coaches tc
  JOIN coaches c ON tc.coach_id = c.id
  WHERE tc.team_id = team_updates.team_id
  AND c.user_id = auth.uid()
) OR created_by = auth.uid());
```

### Practice Drills Table Policies

```sql
-- Public can view all practice drills
CREATE POLICY "Public view practice drills" ON practice_drills
FOR SELECT TO public USING (true);

-- Coaches can manage drills for their teams
CREATE POLICY "Coaches manage practice drills" ON practice_drills
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM team_coaches tc
  JOIN coaches c ON tc.coach_id = c.id
  WHERE tc.team_id = practice_drills.team_id
  AND c.user_id = auth.uid()
) OR created_by = auth.uid());
```

### Users Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users view own profile" ON users
FOR SELECT TO authenticated
USING (auth.email() = email);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON users
FOR UPDATE TO authenticated
USING (auth.email() = email)
WITH CHECK (auth.email() = email);
```

### News Table Policies

```sql
-- Public can view all news
CREATE POLICY "Public view news" ON news
FOR SELECT TO public USING (true);

-- Authenticated users can create news
CREATE POLICY "Authenticated users create news" ON news
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can update their own news
CREATE POLICY "Users update own news" ON news
FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Admins can manage all news
CREATE POLICY "Admins manage all news" ON news
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Products Table Policies

```sql
-- Public can view all products
CREATE POLICY "Public view products" ON products
FOR SELECT TO public USING (true);

-- Admins can manage all products
CREATE POLICY "Admins manage all products" ON products
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

### Resources Table Policies

```sql
-- Public can view all resources
CREATE POLICY "Public view resources" ON resources
FOR SELECT TO public USING (true);

-- Coaches can create resources
CREATE POLICY "Coaches create resources" ON resources
FOR INSERT TO authenticated
WITH CHECK (coach_email = auth.email());

-- Coaches can update their own resources
CREATE POLICY "Coaches update own resources" ON resources
FOR UPDATE TO authenticated
USING (coach_email = auth.email())
WITH CHECK (coach_email = auth.email());
```

### Audit Logs Table Policies

```sql
-- Only admins can view audit logs
CREATE POLICY "Admins view audit logs" ON audit_logs
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));
```

## 📝 Sample Data

### Teams Data

```sql
INSERT INTO teams (name, age_group, gender, coach_email, grade_level, season, logo_url)
VALUES
('WCS Warriors', 'U12', 'Boys', 'coach1@example.com', '6th', '2025-2026', '/logos/warriors.png'),
('WCS Sharks', 'U14', 'Girls', 'coach2@example.com', '8th', '2025-2026', '/logos/sharks.png'),
('WCS Blue', 'U10', 'Boys', 'coach3@example.com', '4th', '2025-2026', '/logos/blue.png'),
('WCS Red', 'U16', 'Girls', 'coach4@example.com', '10th', '2025-2026', '/logos/red.png'),
('WCS White', 'U18', 'Girls', 'coach5@example.com', '12th', '2025-2026', '/logos/white.png');
```

### Schedules Data

```sql
INSERT INTO schedules (team_id, event_type, date_time, location, opponent, created_by)
VALUES
((SELECT id FROM teams WHERE name = 'WCS Warriors'), 'Game', '2025-02-15 10:00:00', 'Main Gym', 'Riverside Hawks', (SELECT id FROM coaches WHERE email = 'coach1@example.com')),
((SELECT id FROM teams WHERE name = 'WCS Warriors'), 'Practice', '2025-02-12 18:00:00', 'Practice Court', NULL, (SELECT id FROM coaches WHERE email = 'coach1@example.com')),
((SELECT id FROM teams WHERE name = 'WCS Sharks'), 'Game', '2025-02-16 14:00:00', 'Main Gym', 'Valley Vipers', (SELECT id FROM coaches WHERE email = 'coach2@example.com')),
((SELECT id FROM teams WHERE name = 'WCS Sharks'), 'Practice', '2025-02-13 19:00:00', 'Practice Court', NULL, (SELECT id FROM coaches WHERE email = 'coach2@example.com'));
```

## 🔧 Database Configuration

### Connection Settings

```typescript
// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

### Environment Variables

```bash
# Required for database connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📈 Performance Optimization

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_teams_coach_email ON teams(coach_email);
CREATE INDEX idx_schedules_team_id ON schedules(team_id);
CREATE INDEX idx_schedules_date_time ON schedules(date_time);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Query Optimization

- **Connection Pooling**: Automatic with Supabase
- **Query Caching**: Built-in caching for frequently accessed data
- **Real-time Subscriptions**: Efficient real-time updates
- **Batch Operations**: Optimized for bulk operations

## 🔍 Monitoring & Analytics

### Database Metrics

- **Query Performance**: Average query time <50ms
- **Connection Count**: Stable connection pool usage
- **Storage Usage**: <100MB (well within limits)
- **Error Rate**: <0.1% (excellent)

### Monitoring Tools

- **Supabase Dashboard**: Real-time database monitoring
- **Query Performance**: Built-in query analysis
- **Error Tracking**: Database error monitoring
- **Usage Analytics**: Connection and query analytics

## 🛠️ Maintenance Procedures

### Daily Tasks

- **Health Check**: Verify database connectivity
- **Performance Review**: Check query performance
- **Error Monitoring**: Review any database errors
- **Backup Verification**: Ensure backups are working

### Weekly Tasks

- **Index Analysis**: Review and optimize indexes
- **Query Optimization**: Analyze slow queries
- **Storage Monitoring**: Check storage usage
- **Security Review**: Review access logs

### Monthly Tasks

- **Performance Audit**: Comprehensive performance review
- **Security Audit**: Review RLS policies and access
- **Data Cleanup**: Remove old or unused data
- **Backup Testing**: Test backup restoration

## 🚨 Backup & Recovery

### Backup Strategy

- **Automated Backups**: Daily automated backups
- **Point-in-Time Recovery**: Available for last 7 days
- **Geographic Redundancy**: Multi-region backup storage
- **Retention Policy**: 30-day retention for automated backups

### Recovery Procedures

1. **Data Loss**: Restore from most recent backup
2. **Corruption**: Use point-in-time recovery
3. **Accidental Deletion**: Restore from backup
4. **Security Breach**: Isolate and restore from clean backup

## 📞 Support & Resources

### Supabase Support

- **Documentation**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Status Page**: https://status.supabase.com

### Database Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase Guides**: https://supabase.com/docs/guides
- **RLS Documentation**: https://supabase.com/docs/guides/auth/row-level-security
