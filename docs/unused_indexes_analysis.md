# Unused Indexes Analysis

**Generated**: January 2025  
**Status**: INFO (Not critical, but worth reviewing)

## Overview

Supabase detected 38 indexes that have not been used. This doesn't mean they're unnecessary—it means they haven't been used _yet_ in production queries.

## Why Indexes Might Be Unused

1. **Low Data Volume**: With limited data, Postgres may choose sequential scans over index scans
2. **New Feature**: The feature using this index hasn't been heavily used yet
3. **Query Pattern**: The application queries don't trigger these indexes
4. **Truly Unnecessary**: The index might be redundant or poorly designed

## Decision Matrix

### ✅ **KEEP These Indexes** (Critical for Future Performance)

These indexes will be important as data grows:

```sql
-- Message Board Indexes (will be critical as messages grow)
idx_coach_messages_author_id
idx_coach_messages_created_at
idx_coach_messages_deleted_at
idx_coach_messages_is_pinned
idx_coach_message_replies_author_id
idx_coach_message_replies_message_id
idx_coach_message_replies_deleted_at

-- Notification Indexes (already important for user experience)
idx_message_notifications_is_read
idx_message_notifications_message_id
idx_message_notifications_acknowledged
idx_message_notifications_unread

-- User/Auth Indexes (critical for login and permissions)
idx_users_role
idx_users_email
```

**Reasoning**: These support the message board feature, which will scale. Once you have 100+ messages, these indexes will be essential.

### 🟡 **MONITOR These Indexes** (Keep for Now)

```sql
-- Error/Audit Logging (useful for admin dashboard)
idx_error_logs_user_id
idx_error_logs_resolved_by

-- News System (depends on usage)
idx_news_created_by
idx_news_team_id

-- Player Management (will be used as roster grows)
idx_players_status
idx_players_is_deleted
```

**Reasoning**: These support admin features that may not be heavily used yet but will be valuable as the system matures.

### ⚠️ **CONSIDER REMOVING** (Evaluate Carefully)

None identified. All current indexes serve a purpose even if not yet used.

## Recommendation

**DO NOT REMOVE ANY INDEXES** at this time because:

1. **Low Data Volume**: You only have 44 users, 33 messages, and 23 replies—not enough for meaningful index usage statistics
2. **New System**: The application is still growing, and usage patterns will emerge
3. **Future-Proofing**: These indexes will become critical as data grows
4. **Low Cost**: Unused indexes have minimal performance impact with current data volume

## When to Revisit

Re-evaluate index usage when:

- You have 500+ messages
- You have 200+ users
- 6 months of production usage
- Query performance issues emerge

## Monitoring Query

Run this periodically to check index usage:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

## Conclusion

✅ **Action**: Keep all current indexes  
📊 **Status**: Monitor usage as data grows  
🔄 **Review Date**: Re-evaluate in 6 months or at 500+ messages
