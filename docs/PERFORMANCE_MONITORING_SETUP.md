# Performance Monitoring Setup Guide

## Overview

The application now includes comprehensive performance monitoring and uptime tracking:

1. **API Route Performance Tracking**: Automatically tracks response times for all API routes (server-side)
2. **Vercel Speed Insights**: Tracks Core Web Vitals (LCP, FID, CLS) from real users (client-side)
3. **Custom Core Web Vitals Tracking**: Client-side capture and database storage of all Core Web Vitals metrics (LCP, INP, CLS, FCP, TTFB)
4. **UptimeRobot Integration**: Fetches real uptime data from UptimeRobot monitoring service
5. **Real-time Analytics Dashboard**: Displays actual performance metrics in the admin dashboard

## Performance Monitoring Components

### 1. Vercel Speed Insights (Already Installed ✅)

**Status**: ✅ Installed and configured  
**Package**: `@vercel/speed-insights`  
**Location**: `src/app/layout.tsx`

**What it tracks:**
- **LCP (Largest Contentful Paint)**: How quickly the main content loads
- **FID (First Input Delay)**: How quickly the page responds to user interaction
- **CLS (Cumulative Layout Shift)**: Visual stability during page load

**Where to view data:**
- Vercel Dashboard → Your Project → **Speed Insights** tab
- Data is collected automatically from real users
- No additional configuration needed

**Note**: Speed Insights data is only available in the Vercel Dashboard. It cannot be accessed programmatically via API.

### 3. Custom Core Web Vitals Tracking (Client-Side Database Storage)

**Status**: ✅ Implemented and active  
**Package**: `web-vitals`  
**Location**: `src/components/WebVitalsTracker.tsx`

**What it tracks:**
- **LCP (Largest Contentful Paint)**: Time until the largest content element is rendered
- **INP (Interaction to Next Paint)**: Time from user interaction to visual response (replaces deprecated FID)
- **CLS (Cumulative Layout Shift)**: Visual stability score during page load
- **FCP (First Contentful Paint)**: Time until first content is rendered
- **TTFB (Time to First Byte)**: Server response time

**Where data is stored:**
- Database table: `web_vitals`
- Accessible via admin analytics dashboard → Monitor tab → Core Web Vitals section

**How it works:**
- Client-side component (`WebVitalsTracker`) captures metrics using the `web-vitals` library
- Metrics are sent to `/api/web-vitals` endpoint
- Data is stored in the database with page path, metric name, value, and session ID
- Admin dashboard displays average metrics from the last 24 hours
- Color-coded status indicators (Green: Good, Yellow: Needs Improvement, Red: Poor)
- Diagnostic information shows causes and fixes for poor metrics

**Where to view data:**
- Admin Dashboard → Monitor tab → **Core Web Vitals** section
- Shows real-time metrics with color-coded status
- Expandable diagnostic panels for metrics that need improvement

### 2. API Route Performance Tracking (Custom Implementation)

**What it tracks:**
- Response times for all API routes (server-side)
- HTTP status codes
- Route paths and methods

**Where data is stored:**
- Database table: `performance_metrics`
- Accessible via admin analytics dashboard

### 4. UptimeRobot Integration (Optional)

**What it tracks:**
- Website uptime percentage
- Monitor status (up/down)
- Historical uptime data

## How It Works

### Performance Tracking Architecture

**Server-Side (API Routes):**
- **Database Table**: `performance_metrics` stores API route response times
- **Automatic Tracking**: API routes wrapped with `withPerformanceTracking` automatically log their performance
- **Analytics**: Average response times are calculated from the last 24 hours of data
- **Shown in**: Admin dashboard → Monitor tab → Performance section

**Client-Side (Real User Monitoring):**
- **Vercel Speed Insights**: Automatically tracks Core Web Vitals from real users
- **Data Collection**: Happens client-side in the browser
- **Shown in**: Vercel Dashboard → Speed Insights tab
- **No API Access**: Data is only viewable in Vercel Dashboard

### UptimeRobot Integration

- **API Integration**: Fetches uptime percentage from UptimeRobot API
- **Fallback**: If API key is not configured, uses placeholder value (99.9%)
- **Real-time**: Updates every time the analytics dashboard is loaded
- **Shown in**: Admin dashboard → Monitor tab → System Health section

## Setup Instructions

### 1. Get Your UptimeRobot API Key

1. **Sign up for UptimeRobot** (Free tier available)
   - Go to [https://uptimerobot.com](https://uptimerobot.com)
   - Sign up for a free account (50 monitors, 5-minute checks)

2. **Get Your API Key**
   - Log in to UptimeRobot dashboard
   - Go to **My Settings** → **API Settings**
   - Click **Generate New API Key** or copy your existing key
   - The API key format: `u123456-7890abcdef1234567890abcdef`

3. **Add Monitors** (Optional but recommended)
   - Add your production website URL as a monitor
   - Set check interval to 5 minutes (free tier)
   - Monitor type: HTTP(s)

### 2. Configure Environment Variable

Add the UptimeRobot API key to your environment variables:

**Local Development** (`.env.local`):
```bash
UPTIMEROBOT_API_KEY=u123456-7890abcdef1234567890abcdef
```

**Production** (Vercel):
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `UPTIMEROBOT_API_KEY`
   - **Value**: Your UptimeRobot API key
   - **Environment**: Production, Preview, Development (as needed)

### 3. Verify Setup

1. **Check Analytics Dashboard**
   - Navigate to `/admin/club-management`
   - Click on the **Monitor** tab
   - Check the **System Health** section:
     - **Uptime**: Should show your actual uptime percentage (e.g., 99.9%)
     - **Response Time**: Should show average API response time
     - **Database**: Should show "Healthy"

2. **Check Performance Tracking**
   - The analytics API route (`/api/admin/analytics/stats`) is automatically tracked
   - After a few requests, you should see real response times instead of placeholders

## Performance Tracking Usage

### For New API Routes

To track performance for any API route, wrap it with `withPerformanceTracking`:

```typescript
import { withPerformanceTracking } from "@/lib/api-performance-wrapper";

export async function GET(request: NextRequest) {
  return withPerformanceTracking(request, async () => {
    // Your route logic here
    return NextResponse.json({ data: "result" });
  });
}
```

### Viewing Performance Metrics

### In Admin Dashboard

1. Navigate to `/admin/club-management`
2. Click on the **Monitor** tab
3. View **Performance** section:
   - **Load Time**: Average API response time (from `performance_metrics` table)
   - **Error Rate**: Calculated from error logs
   - **Uptime**: From UptimeRobot (if configured)

### In Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on **Speed Insights** tab
4. View Core Web Vitals:
   - **LCP**: Largest Contentful Paint
   - **FID**: First Input Delay
   - **CLS**: Cumulative Layout Shift

### Database Queries

Performance metrics are stored in the `performance_metrics` table and can be queried:

```sql
-- View average response times by route (last 24 hours)
SELECT 
  route_path,
  method,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) as request_count
FROM performance_metrics
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY route_path, method
ORDER BY avg_response_time DESC;
```

## Database Schema

### performance_metrics Table

```sql
CREATE TABLE performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_path text NOT NULL,
  method text NOT NULL,
  response_time_ms integer NOT NULL,
  status_code integer,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

**Indexes:**
- `idx_performance_metrics_route_path` on `route_path`
- `idx_performance_metrics_created_at` on `created_at DESC`

**RLS Policies:**
- Admins can read performance metrics
- System can insert performance metrics (via service_role)

### web_vitals Table

```sql
CREATE TABLE web_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_id text,
  session_id text,
  user_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

**Indexes:**
- `idx_web_vitals_metric_name` on `metric_name`
- `idx_web_vitals_created_at` on `created_at DESC`
- `idx_web_vitals_page` on `page`

**RLS Policies:**
- Admins can read web vitals data
- System can insert web vitals (via service_role)

## Troubleshooting

### UptimeRobot Not Showing Real Data

1. **Check API Key**: Verify `UPTIMEROBOT_API_KEY` is set correctly
2. **Check API Key Format**: Should start with `u` followed by numbers and letters
3. **Check Monitors**: Ensure you have active monitors in UptimeRobot
4. **Check API Status**: Verify UptimeRobot API is accessible (check their status page)

### Performance Metrics Not Being Tracked

1. **Check Database**: Verify `performance_metrics` table exists
2. **Check RLS**: Ensure service_role has insert permissions
3. **Check Logs**: Look for errors in server logs related to performance tracking
4. **Verify Tracking**: Check if routes are wrapped with `withPerformanceTracking`

### Slow Response Times

1. **Check Database**: Query the `performance_metrics` table to see actual response times
2. **Check Indexes**: Ensure indexes are created for fast queries
3. **Check Volume**: Too many metrics may slow down queries (consider cleanup job)

## Cleanup Recommendations

To prevent the `performance_metrics` table from growing too large, consider setting up a cleanup job:

```sql
-- Delete metrics older than 30 days
DELETE FROM performance_metrics
WHERE created_at < NOW() - INTERVAL '30 days';
```

Or set up a scheduled job (cron) to run this cleanup periodically.

## Data Sources Summary

| Metric | Source | Location | Access |
|--------|--------|----------|--------|
| **API Response Time** | Custom tracking | `performance_metrics` table | Admin Dashboard / Database |
| **Core Web Vitals (LCP, FID, CLS)** | Vercel Speed Insights | Vercel Dashboard | Vercel Dashboard only |
| **Core Web Vitals (LCP, INP, CLS, FCP, TTFB)** | Custom tracking | `web_vitals` table | Admin Dashboard / Database |
| **Uptime Percentage** | UptimeRobot API | UptimeRobot service | Admin Dashboard |
| **Error Rate** | Error logs | `error_logs` table | Admin Dashboard |
| **Database Health** | Health check | Supabase query | Admin Dashboard |

## Next Steps

1. **Verify Speed Insights**: Check Vercel Dashboard → Speed Insights tab after deployment
2. **Add More Monitors**: Set up UptimeRobot monitors for critical endpoints
3. **Track More Routes**: Wrap additional API routes with performance tracking
4. **Set Up Alerts**: Configure UptimeRobot alerts for downtime
5. **Monitor Trends**: Regularly check both Vercel Dashboard and admin dashboard for trends
6. **Compare Metrics**: Use server-side API metrics + client-side Speed Insights for comprehensive view

## Support

For issues or questions:
- **UptimeRobot**: [https://uptimerobot.com/support](https://uptimerobot.com/support)
- **Performance Tracking**: Check server logs for detailed error messages

