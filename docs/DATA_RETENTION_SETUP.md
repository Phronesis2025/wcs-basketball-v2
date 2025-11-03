# Quick Setup Guide: Data Retention & Monitoring

## 🚀 Quick Start

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Required for cron jobs
CRON_SECRET=your-secure-random-string-here

# Already exists (for email alerts)
ADMIN_NOTIFICATIONS_TO=your-admin-email@example.com
```

### 2. Test the Functions

#### Test Database Monitoring

```bash
# Via API
curl http://localhost:3000/api/admin/database-monitor

# Or in browser
http://localhost:3000/api/admin/database-monitor
```

Expected response:
```json
{
  "success": true,
  "metrics": {
    "total_size_formatted": "16 MB",
    "used_percentage": 3.24,
    "remaining_formatted": "484 MB",
    "largest_table": "audit_logs"
  },
  "alert": {
    "alert_level": "OK",
    "message": "Database size is healthy..."
  }
}
```

#### Test Data Cleanup (Manual)

**⚠️ Warning**: This will delete old data! Test carefully.

```bash
curl -X POST http://localhost:3000/api/admin/cleanup-data \
  -H "Authorization: Bearer your-cron-secret"
```

### 3. Set Up Automated Cleanup

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-data",
      "schedule": "0 2 1 * *"
    },
    {
      "path": "/api/admin/database-monitor",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

Set environment variable in Vercel:
- `CRON_SECRET` = your secure random string

#### Option B: Supabase Cron Jobs

Run in Supabase SQL Editor:

```sql
-- Monthly cleanup (1st of month at 2 AM UTC)
SELECT cron.schedule(
  'monthly-data-cleanup',
  '0 2 1 * *',
  $$
  SELECT cleanup_old_audit_logs();
  SELECT cleanup_old_login_logs();
  SELECT cleanup_resolved_error_logs();
  $$
);

-- Weekly monitoring (Sundays at midnight UTC)
SELECT cron.schedule(
  'weekly-db-monitoring',
  '0 0 * * 0',
  $$
  SELECT * FROM check_database_size_alerts();
  $$
);
```

### 4. Set Up Email Alerts

Email alerts are automatically sent when:
- Database usage reaches **80%** (WARNING)
- Database usage reaches **90%** (CRITICAL)

Ensure `ADMIN_NOTIFICATIONS_TO` is set in your environment variables.

### 5. Manual Cleanup (if needed)

Run directly in Supabase SQL Editor:

```sql
-- Clean audit logs older than 12 months
SELECT * FROM cleanup_old_audit_logs();

-- Clean login logs older than 90 days
SELECT * FROM cleanup_old_login_logs();

-- Clean resolved errors older than 3 months
SELECT * FROM cleanup_resolved_error_logs();

-- Check current status
SELECT * FROM get_database_size_metrics();
SELECT * FROM check_database_size_alerts();
```

## 📊 Monitoring Dashboard

Create a simple admin dashboard page or add to existing club management:

```typescript
// In your admin page component
const checkDatabaseSize = async () => {
  const res = await fetch('/api/admin/database-monitor');
  const data = await res.json();
  // Display metrics.usage_percentage, metrics.remaining_formatted, etc.
};
```

## 🔔 Alert Thresholds

| Level | Usage | Action |
|-------|-------|--------|
| **OK** | < 50% | No action needed |
| **INFO** | 50-80% | Monitor growth rate |
| **WARNING** | 80-90% | Implement retention policies |
| **CRITICAL** | 90%+ | Immediate action required |

## 📝 Next Steps

1. ✅ Set `CRON_SECRET` environment variable
2. ✅ Test monitoring endpoint manually
3. ✅ Set up Vercel cron or Supabase cron jobs
4. ✅ Verify email alerts work (test by temporarily lowering threshold)
5. ✅ Add monitoring dashboard to admin panel (optional)

See [DATA_RETENTION_AND_MONITORING.md](./DATA_RETENTION_AND_MONITORING.md) for detailed documentation.

