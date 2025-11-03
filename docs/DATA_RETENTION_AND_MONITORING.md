# Data Retention and Database Monitoring Guide

**Last Updated**: October 31, 2025

## 📊 Overview

This guide covers data retention policies and monitoring for the WCS v2.0 Supabase database. These tools help manage database size and prevent hitting the 500 MB free tier limit.

## 🗑️ Data Retention Policies

### Retention Rules

| Table | Retention Period | Cleanup Function |
|-------|-----------------|------------------|
| `audit_logs` | 12 months | `cleanup_old_audit_logs()` |
| `login_logs` | 90 days | `cleanup_old_login_logs()` |
| `error_logs` | 3 months (resolved only) | `cleanup_resolved_error_logs()` |

### Manual Cleanup

Run these functions manually or via scheduled jobs:

```sql
-- Clean up old audit logs (older than 12 months)
SELECT * FROM cleanup_old_audit_logs();
-- Returns: deleted_count, freed_bytes

-- Clean up old login logs (older than 90 days)
SELECT * FROM cleanup_old_login_logs();
-- Returns: deleted_count, freed_bytes

-- Clean up resolved error logs (older than 3 months)
SELECT * FROM cleanup_resolved_error_logs();
-- Returns: deleted_count, freed_bytes
```

### Automated Cleanup Setup

#### Option 1: Supabase Cron Jobs (Recommended)

Create a cron job in Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run monthly cleanup (1st of each month at 2 AM UTC)
SELECT cron.schedule(
  'monthly-data-cleanup',
  '0 2 1 * *', -- Monthly on the 1st at 2 AM
  $$
  SELECT cleanup_old_audit_logs();
  SELECT cleanup_old_login_logs();
  SELECT cleanup_resolved_error_logs();
  $$
);
```

#### Option 2: Vercel Cron (if using Vercel)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-data",
      "schedule": "0 2 1 * *"
    }
  ]
}
```

Then create `/api/cron/cleanup-data/route.ts`:

```typescript
import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: auditResult } = await supabaseAdmin.rpc("cleanup_old_audit_logs");
    const { data: loginResult } = await supabaseAdmin.rpc("cleanup_old_login_logs");
    const { data: errorResult } = await supabaseAdmin.rpc("cleanup_resolved_error_logs");

    return NextResponse.json({
      success: true,
      audit_logs: auditResult,
      login_logs: loginResult,
      error_logs: errorResult,
    });
  } catch (error) {
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
```

## 📈 Database Monitoring

### Get Current Database Metrics

```sql
-- Get comprehensive database size metrics
SELECT * FROM get_database_size_metrics();
```

**Returns:**
- `total_size_bytes` - Current database size in bytes
- `total_size_formatted` - Human-readable size (e.g., "16 MB")
- `free_tier_limit_bytes` - 500 MB limit in bytes
- `free_tier_limit_formatted` - "500 MB"
- `used_percentage` - Percentage of limit used
- `remaining_bytes` - Remaining space in bytes
- `remaining_formatted` - Human-readable remaining space
- `largest_table` - Name of largest table
- `largest_table_size_bytes` - Size of largest table
- `largest_table_size_formatted` - Human-readable size
- `largest_table_rows` - Row count of largest table

### Check Alert Status

```sql
-- Check if database is approaching limits
SELECT * FROM check_database_size_alerts();
```

**Alert Levels:**
- `CRITICAL` - 90%+ usage (immediate action required)
- `WARNING` - 80-90% usage (consider retention policies)
- `INFO` - 50-80% usage (monitor growth)
- `OK` - <50% usage (healthy)

## 🔔 Setting Up Monitoring Alerts

### Option 1: Supabase Database Webhooks

1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook:
   - **Table**: Any (or create a trigger table)
   - **Event**: Database function execution
   - **URL**: Your monitoring endpoint

### Option 2: API Route with Scheduled Checks

Create `/api/admin/database-monitor/route.ts`:

```typescript
import { supabaseAdmin } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  // Verify admin access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: metrics } = await supabaseAdmin.rpc("get_database_size_metrics");
    const { data: alerts } = await supabaseAdmin.rpc("check_database_size_alerts");

    if (alerts?.[0]?.alert_level === "CRITICAL" || alerts?.[0]?.alert_level === "WARNING") {
      // Send email alert to admin
      const adminEmail = process.env.ADMIN_NOTIFICATIONS_TO;
      if (adminEmail) {
        await sendEmail(
          adminEmail,
          `Database Size Alert: ${alerts[0].alert_level}`,
          `
            <h2>Database Size Alert</h2>
            <p><strong>Level:</strong> ${alerts[0].alert_level}</p>
            <p><strong>Current Size:</strong> ${alerts[0].current_size_formatted}</p>
            <p><strong>Usage:</strong> ${alerts[0].usage_percentage}%</p>
            <p><strong>Message:</strong> ${alerts[0].message}</p>
            <p><strong>Largest Table:</strong> ${metrics?.[0]?.largest_table} (${metrics?.[0]?.largest_table_size_formatted})</p>
          `
        );
      }
    }

    return NextResponse.json({
      metrics: metrics?.[0],
      alert: alerts?.[0],
    });
  } catch (error) {
    return NextResponse.json({ error: "Monitoring failed" }, { status: 500 });
  }
}
```

### Option 3: Supabase Edge Functions (Cron)

Create an Edge Function that runs weekly:

```typescript
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: alerts } = await supabase.rpc('check_database_size_alerts')
  
  if (alerts?.[0]?.alert_level !== 'OK') {
    // Send notification (email, Slack, etc.)
  }

  return new Response(JSON.stringify(alerts), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## 📊 Table Size Monitoring

### Check All Table Sizes

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes,
  (xpath('/row/c/text()', query_to_xml(format('SELECT COUNT(*) AS c FROM %I.%I', schemaname, tablename), false, true, '')))[1]::text::int AS row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitor Growth Rate

Track growth over time:

```sql
-- Create a monitoring table to track size over time
CREATE TABLE IF NOT EXISTS database_size_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recorded_at timestamptz DEFAULT now(),
  total_size_bytes bigint,
  usage_percentage numeric,
  largest_table text,
  largest_table_size_bytes bigint
);

-- Function to record current metrics
CREATE OR REPLACE FUNCTION record_database_metrics()
RETURNS void AS $$
DECLARE
  metrics record;
BEGIN
  SELECT * INTO metrics FROM get_database_size_metrics() LIMIT 1;
  
  INSERT INTO database_size_history (
    total_size_bytes,
    usage_percentage,
    largest_table,
    largest_table_size_bytes
  ) VALUES (
    metrics.total_size_bytes,
    metrics.used_percentage,
    metrics.largest_table,
    metrics.largest_table_size_bytes
  );
END;
$$ LANGUAGE plpgsql;

-- Run weekly to track trends
-- Schedule: SELECT cron.schedule('record-db-metrics', '0 0 * * 0', 'SELECT record_database_metrics();');
```

## 🎯 Best Practices

1. **Run Cleanup Monthly**: Schedule retention cleanup on the 1st of each month
2. **Monitor Weekly**: Check database size metrics weekly
3. **Set Alerts**: Configure alerts at 50%, 80%, and 90% usage
4. **Review Growth**: Analyze growth trends quarterly
5. **Archive Before Delete**: Export old data to cloud storage before deletion (optional)

## 📝 Cleanup Log

After running cleanup functions, log the results:

```sql
CREATE TABLE IF NOT EXISTS cleanup_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cleanup_date timestamptz DEFAULT now(),
  table_name text,
  deleted_count bigint,
  freed_bytes bigint,
  retention_period text
);
```

Example logging:

```sql
-- After cleanup_old_audit_logs()
DO $$
DECLARE
  result record;
BEGIN
  SELECT * INTO result FROM cleanup_old_audit_logs();
  INSERT INTO cleanup_log (table_name, deleted_count, freed_bytes, retention_period)
  VALUES ('audit_logs', result.deleted_count, result.freed_bytes, '12 months');
END $$;
```

## 🔧 Maintenance Schedule

| Task | Frequency | When |
|------|-----------|------|
| Run cleanup functions | Monthly | 1st of month, 2 AM UTC |
| Check database metrics | Weekly | Every Sunday, midnight UTC |
| Review growth trends | Quarterly | Start of each quarter |
| Update retention policies | Annually | Based on usage patterns |

---

**Next Steps:**
1. Set up monthly cron job for cleanup
2. Configure weekly monitoring
3. Set up email/SMS alerts for critical levels
4. Review metrics monthly and adjust retention as needed

