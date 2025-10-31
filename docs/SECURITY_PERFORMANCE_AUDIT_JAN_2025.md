# 🔒 Supabase Security & Performance Audit Report

_Generated: January 2025_

## 🚨 CRITICAL SECURITY ISSUES

### 1. **Hardcoded Credentials in MCP Config** ✅ FIXED

**File**: `.cursor/mcp.json`
**Risk**: HIGH - Credentials exposed in version control
**Status**: ✅ **FIXED** - Updated to use environment variables

**Solution Applied**:

```json
{
  "env": {
    "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}",
    "SUPABASE_DB_PASSWORD": "${SUPABASE_DB_PASSWORD}",
    "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
  }
}
```

### 2. **Missing Database Migration** ⚠️ REQUIRES MANUAL ACTION

**Issue**: `acknowledged_at` column missing from `message_notifications` table
**Risk**: MEDIUM - Causes 400 errors in unread mention system
**Status**: ⚠️ **PENDING** - Requires manual application

**Action Required**: Apply this SQL in Supabase dashboard:

```sql
-- Add column to track if notification has been acknowledged
ALTER TABLE public.message_notifications
ADD COLUMN IF NOT EXISTS acknowledged_at timestamp with time zone;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_notifications_acknowledged
ON public.message_notifications(acknowledged_at);

CREATE INDEX IF NOT EXISTS idx_message_notifications_unread
ON public.message_notifications(mentioned_user_id, acknowledged_at)
WHERE acknowledged_at IS NULL;
```

### 3. **Overly Permissive RLS Policies** ⚠️ NEEDS REVIEW

**File**: `docs/fix_rls_policies_final.sql`
**Risk**: MEDIUM - Allows any authenticated user to modify messages
**Current Policy**:

```sql
CREATE POLICY "Allow all authenticated users to update messages"
  ON public.coach_messages FOR UPDATE
  USING (auth.role() = 'authenticated');
```

**Recommended Fix**:

```sql
-- More restrictive policy
CREATE POLICY "Users can update own messages, admins can update any"
  ON public.coach_messages FOR UPDATE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🔧 MEDIUM SECURITY ISSUES

### 4. **Inconsistent Input Validation**

**Files**: Multiple API routes
**Risk**: MEDIUM - Potential XSS and injection attacks

**Current State**: ✅ **GOOD** - Most routes use `sanitizeInput()`
**Example**:

```typescript
// src/app/api/drills/route.ts - GOOD
title: sanitizeInput(String(drillData.title || "").trim()),
```

**Recommendation**: Ensure ALL user inputs are sanitized before database operations.

### 5. **CSRF Protection Disabled**

**File**: `src/lib/security.ts`
**Risk**: MEDIUM - Temporarily disabled for debugging
**Status**: ⚠️ **DISABLED** - Needs re-enabling in production

**Action Required**: Re-enable CSRF protection:

```typescript
// Re-enable CSRF validation in production
if (process.env.NODE_ENV === "production") {
  const isValidCSRF = await validateCSRFToken(csrfToken);
  if (!isValidCSRF) {
    return createErrorResponse("Invalid CSRF token", 403);
  }
}
```

---

## ⚡ PERFORMANCE ISSUES

### 1. **Missing Database Indexes** ⚠️ HIGH IMPACT

**Risk**: HIGH - Slow queries, poor user experience

**Missing Indexes**:

```sql
-- Add these indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coach_messages_created_at ON coach_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_coach_messages_author_id ON coach_messages(author_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_deleted_at ON coach_messages(deleted_at);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_message_id ON coach_message_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_coach_message_replies_author_id ON coach_message_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_schedules_team_id ON schedules(team_id);
CREATE INDEX IF NOT EXISTS idx_team_updates_team_id ON team_updates(team_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_is_deleted ON players(is_deleted);
```

### 2. **N+1 Query Pattern** ⚠️ MEDIUM IMPACT

**File**: `src/app/teams/[id]/page.tsx`
**Issue**: Multiple separate API calls instead of optimized queries

**Current**:

```typescript
const [coachesData, schedulesData, updatesData] = await Promise.all([
  fetchCoachesByTeamId(resolvedParams.id),
  fetchSchedulesByTeamId(resolvedParams.id),
  fetchTeamUpdates(resolvedParams.id),
]);
```

**Recommended**: Single optimized query with joins

### 3. **Multiple Real-time Subscriptions** ⚠️ MEDIUM IMPACT

**Files**: Multiple components
**Issue**: Each component creates separate Supabase channels

**Current**: 5+ separate channels across the app
**Recommended**: Centralized real-time manager

### 4. **No Query Caching** ⚠️ MEDIUM IMPACT

**Issue**: Same data fetched repeatedly
**Solution**: Implement React Query or similar caching layer

### 5. **Large Data Sets Without Pagination** ⚠️ MEDIUM IMPACT

**Files**: `src/lib/analytics.ts`, `src/app/api/admin/players/route.ts`
**Issue**: Fetching all records at once

**Current**: `SELECT *` without LIMIT
**Recommended**: Implement pagination with `LIMIT` and `OFFSET`

---

## 🛠️ IMMEDIATE ACTION PLAN

### Phase 1: Critical Fixes (Today)

1. ✅ **COMPLETED**: Fix hardcoded credentials
2. ⚠️ **MANUAL**: Apply database migration for `acknowledged_at`
3. ⚠️ **REVIEW**: Strengthen RLS policies

### Phase 2: Performance Optimization (This Week)

1. **Add database indexes** (30 minutes)
2. **Implement query caching** (2-3 hours)
3. **Add pagination to large queries** (1-2 hours)

### Phase 3: Security Hardening (Next Week)

1. **Re-enable CSRF protection**
2. **Audit all input validation**
3. **Implement rate limiting**

---

## 📊 SECURITY SCORE: 7/10

- ✅ **Authentication**: Strong (Supabase Auth)
- ✅ **Input Sanitization**: Good (Mostly implemented)
- ⚠️ **Authorization**: Needs RLS policy review
- ⚠️ **CSRF Protection**: Disabled
- ✅ **HTTPS**: Enabled (Supabase)

## 📊 PERFORMANCE SCORE: 6/10

- ⚠️ **Database Queries**: Missing indexes
- ⚠️ **Caching**: Not implemented
- ⚠️ **Real-time**: Multiple subscriptions
- ✅ **Bundle Size**: Reasonable
- ⚠️ **Pagination**: Missing on large datasets

---

## 🎯 RECOMMENDED NEXT STEPS

1. **Apply the database migration** (manual action required)
2. **Add database indexes** (quick performance win)
3. **Review and strengthen RLS policies**
4. **Implement query caching with React Query**
5. **Add pagination to large data queries**

**Priority**: Fix the database migration first, then focus on performance optimizations.
