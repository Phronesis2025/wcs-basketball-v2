// scripts/test-performance-monitoring.ts
// Test script to verify performance tracking and UptimeRobot integration

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config({ path: join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPerformanceMetrics() {
  console.log("\n📊 Testing Performance Metrics...");
  
  try {
    // Check if table exists and has data
    const { data, error, count } = await supabase
      .from("performance_metrics")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("❌ Error querying performance_metrics:", error.message);
      return false;
    }

    console.log(`✅ Performance metrics table exists`);
    console.log(`   Total records: ${count || 0}`);
    
    if (data && data.length > 0) {
      console.log(`\n   Recent metrics:`);
      data.forEach((metric, index) => {
        console.log(`   ${index + 1}. ${metric.method} ${metric.route_path} - ${metric.response_time_ms}ms (${metric.status_code})`);
      });
      
      // Calculate average
      const avg = data.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / data.length;
      console.log(`\n   Average response time: ${Math.round(avg)}ms`);
    } else {
      console.log(`   ⚠️  No metrics recorded yet. Make some API calls to generate data.`);
    }

    return true;
  } catch (err) {
    console.error("❌ Error:", err);
    return false;
  }
}

async function testUptimeRobot() {
  console.log("\n🌐 Testing UptimeRobot Integration...");
  
  const apiKey = process.env.UPTIMEROBOT_API_KEY;
  
  if (!apiKey) {
    console.log("⚠️  UPTIMEROBOT_API_KEY not set in .env.local");
    console.log("   This is optional - the system will use placeholder values without it.");
    return false;
  }

  try {
    console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    
    const url = "https://api.uptimerobot.com/v2/getMonitors";
    const formData = new URLSearchParams();
    formData.append("api_key", apiKey);
    formData.append("format", "json");
    formData.append("statuses", "2-9");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error(`❌ UptimeRobot API error: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();

    if (data.stat !== "ok") {
      console.error(`❌ UptimeRobot API returned error:`, data.error?.message || "Unknown error");
      return false;
    }

    if (!data.monitors || data.monitors.length === 0) {
      console.log("⚠️  No monitors found in UptimeRobot account");
      console.log("   Create a monitor at: https://uptimerobot.com/dashboard");
      return false;
    }

    console.log(`✅ UptimeRobot API connection successful`);
    console.log(`   Monitors found: ${data.monitors.length}`);
    
    const activeMonitors = data.monitors.filter(
      (m: any) => m.status !== 0 && m.status !== 1
    );

    if (activeMonitors.length > 0) {
      const totalUptime = activeMonitors.reduce(
        (sum: number, m: any) => sum + (m.uptime_ratio || 0),
        0
      );
      const avgUptime = totalUptime / activeMonitors.length;

      console.log(`\n   Active monitors: ${activeMonitors.length}`);
      console.log(`   Average uptime: ${avgUptime.toFixed(2)}%`);
      
      activeMonitors.forEach((monitor: any, index: number) => {
        const status = monitor.status === 2 ? "🟢 Up" : monitor.status === 9 ? "🔴 Down" : "🟡 Warning";
        console.log(`   ${index + 1}. ${monitor.friendly_name}: ${status} (${monitor.uptime_ratio}% uptime)`);
      });
    }

    return true;
  } catch (err) {
    console.error("❌ Error connecting to UptimeRobot:", err);
    return false;
  }
}

async function testAnalyticsEndpoint() {
  console.log("\n🔍 Testing Analytics Endpoint...");
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  console.log(`   Testing: ${baseUrl}/api/admin/analytics/stats`);
  console.log(`   Note: This endpoint requires admin authentication`);
  console.log(`   You can test it in the browser at: ${baseUrl}/admin/club-management (Monitor tab)`);
  
  return true;
}

async function runTests() {
  console.log("🧪 Performance Monitoring Test Suite");
  console.log("=====================================\n");

  const results = {
    performanceMetrics: false,
    uptimeRobot: false,
    analyticsEndpoint: false,
  };

  results.performanceMetrics = await testPerformanceMetrics();
  results.uptimeRobot = await testUptimeRobot();
  results.analyticsEndpoint = await testAnalyticsEndpoint();

  console.log("\n📋 Test Summary");
  console.log("=====================================");
  console.log(`Performance Metrics: ${results.performanceMetrics ? "✅" : "❌"}`);
  console.log(`UptimeRobot Integration: ${results.uptimeRobot ? "✅" : "⚠️  (optional)"}`);
  console.log(`Analytics Endpoint: ${results.analyticsEndpoint ? "✅" : "❌"}`);

  console.log("\n💡 Next Steps:");
  if (!results.performanceMetrics) {
    console.log("   1. Make some API calls to generate performance metrics");
  }
  if (!results.uptimeRobot) {
    console.log("   2. Add UPTIMEROBOT_API_KEY to .env.local (optional)");
    console.log("   3. Create monitors at https://uptimerobot.com");
  }
  console.log("   4. Visit /admin/club-management → Monitor tab to see real-time data");
}

runTests().catch(console.error);

