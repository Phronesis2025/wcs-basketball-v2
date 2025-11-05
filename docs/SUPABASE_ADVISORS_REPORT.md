# Supabase Advisors Report - January 2025

**Date**: January 2025  
**Status**: ✅ Performance Issues Fixed, Security Recommendation Documented

---

## Executive Summary

Supabase Advisors identified:
- ✅ **5 Performance Issues** (WARN level) - **ALL FIXED**
- ⚠️ **1 Security Recommendation** (WARN level) - Manual Dashboard Configuration Required
- ℹ️ **24 Unused Index Recommendations** (INFO level) - Low Priority

---

## ✅ Performance Issues Fixed

### RLS Performance Optimization

**Issue**: RLS policies using `auth.uid()` directly instead of `(select auth.uid())` cause re-evaluation for each row, leading to suboptimal query performance at scale.

**Tables Affected**:
- `public.imports` - 3 policies
- `public.performance_metrics` - 1 policy
- `public.web_vitals` - 1 policy

**Fix Applied**: ✅ Migration `fix_rls_performance_optimization_jan_2025.sql` applied

**Changes Made**:
- Replaced `auth.uid()` with `(SELECT auth.uid())` in all affected policies
- This prevents re-evaluation for each row and improves query performance
- All policies now use optimized pattern for better performance at scale

**Migration File**: `docs/database/fix_rls_performance_optimization_jan_2025.sql`

---

## ⚠️ Security Recommendation

### Leaked Password Protection Disabled

**Level**: WARN  
**Category**: SECURITY  
**Status**: Manual Action Required

**Issue**:  
Supabase Auth can check user passwords against the HaveIBeenPwned.org database to prevent users from using compromised passwords. This feature is currently **disabled** in your project.

**Impact**:  
- Users can currently choose passwords that have been exposed in data breaches
- Increased risk of credential stuffing attacks
- Reduced overall account security

**Solution**:  
Enable leaked password protection in Supabase Dashboard:
1. Navigate to **Authentication** → **Providers** → **Email**
2. Find **"Password Strength"** section
3. Enable **"Leaked Password Protection"** toggle
4. Save changes

**Note**: This feature requires Pro Plan or above on Supabase.

**Documentation**: See `docs/enable_leaked_password_protection.md` for detailed instructions.

**Priority**: Medium (recommended but not critical)

---

## ℹ️ Unused Index Recommendations

**Level**: INFO  
**Category**: PERFORMANCE  
**Status**: Low Priority - No Action Required

**Issue**:  
24 indexes have been identified as unused. These indexes may be candidates for removal to reduce storage and improve write performance.

**Recommendation**:  
- Monitor these indexes for future use
- Consider removing only if storage is a concern
- Keep indexes that may be used by future queries
- These are INFO level - not urgent

**Unused Indexes**:
- `coach_message_replies`: `idx_coach_message_replies_author_id`, `idx_coach_message_replies_message_id`
- `coach_messages`: `idx_coach_messages_author_id`, `idx_coach_messages_created_at`, `idx_coach_messages_deleted_at`, `idx_coach_messages_is_pinned`
- `error_logs`: `idx_error_logs_user_id`, `idx_error_logs_resolved_by`
- `news`: `idx_news_created_by`, `idx_news_team_id`
- `changelog`: `idx_changelog_created_by`, `idx_changelog_release_date`, `idx_changelog_category`
- `pending_registrations`: `idx_pending_registrations_expires`
- `message_notifications`: Multiple indexes (6 total)
- `users`: `idx_users_last_active_at`, `idx_users_role`
- `players`: `idx_players_is_deleted`
- `imports`: `imports_created_by_idx`, `imports_status_idx`, `imports_created_at_idx`
- `performance_metrics`: `idx_performance_metrics_route_path`
- `web_vitals`: `idx_web_vitals_page`, `idx_web_vitals_metric_name`, `idx_web_vitals_user_id`

**Action**: No immediate action required. These indexes may be used by future queries or are kept for potential performance benefits.

---

## Summary

### ✅ Completed

- **RLS Performance Optimization**: All 5 performance issues fixed
- **Migration Applied**: `fix_rls_performance_optimization_jan_2025.sql` successfully applied
- **Documentation**: All issues documented and tracked

### ⚠️ Pending Manual Action

- **Leaked Password Protection**: Requires manual enablement in Supabase Dashboard
- **Priority**: Medium (not critical, but recommended)

### ℹ️ Low Priority

- **Unused Indexes**: 24 indexes identified as unused (INFO level)
- **Action**: Monitor for future use, no immediate removal needed

---

## Next Steps

1. ✅ **Completed**: RLS performance optimizations applied
2. **Manual**: Enable leaked password protection in Supabase Dashboard (see `docs/enable_leaked_password_protection.md`)
3. **Optional**: Review unused indexes for potential removal (low priority)

---

## Related Documentation

- `docs/enable_leaked_password_protection.md` - Detailed guide for enabling leaked password protection
- `docs/database/fix_rls_performance_optimization_jan_2025.sql` - Migration file for RLS optimizations
- `docs/DB_SETUP.md` - Complete database schema documentation

---

**Last Updated**: January 2025  
**Next Review**: April 2025

