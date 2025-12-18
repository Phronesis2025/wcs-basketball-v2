// src/lib/vercel-speed-insights.ts
"use server";

import { supabaseAdmin } from "./supabaseClient";
import { devLog, devError } from "./security";

/**
 * Get average Core Web Vitals for a time period from the database
 */
export async function getAverageWebVitals(
  hours: number = 24
): Promise<{
  lcp: number;
  fid: number;
  inp: number;
  cls: number;
  fcp: number;
  ttfb: number;
}> {
  try {
    if (!supabaseAdmin) {
      devError("Admin client not available for web vitals");
      return getDefaultWebVitals();
    }

    const since = new Date();
    since.setHours(since.getHours() - hours);

    // Fetch web vitals from the last N hours
    const { data, error } = await supabaseAdmin
      .from("web_vitals")
      .select("metric_name, metric_value")
      .gte("created_at", since.toISOString());

    if (error) {
      devError("Failed to fetch web vitals:", error);
      return getDefaultWebVitals();
    }

    if (!data || data.length === 0) {
      devLog("No web vitals data found, using defaults");
      return getDefaultWebVitals();
    }

    // Calculate averages by metric type
    const metrics: Record<string, number[]> = {
      LCP: [],
      FID: [],
      INP: [],
      CLS: [],
      FCP: [],
      TTFB: [],
    };

    data.forEach((row) => {
      const metricName = row.metric_name as keyof typeof metrics;
      if (metrics[metricName]) {
        metrics[metricName].push(Number(row.metric_value));
      }
    });

    // Calculate averages
    const calculateAverage = (values: number[]): number => {
      if (values.length === 0) return 0;
      const sum = values.reduce((a, b) => a + b, 0);
      return Math.round(sum / values.length);
    };

    return {
      lcp: metrics.LCP.length > 0 ? calculateAverage(metrics.LCP) : 2500,
      fid: metrics.FID.length > 0 ? calculateAverage(metrics.FID) : 100,
      inp: metrics.INP.length > 0 ? calculateAverage(metrics.INP) : 200, // INP replaces FID - default 200ms
      cls: metrics.CLS.length > 0
        ? Number(
            (metrics.CLS.reduce((a, b) => a + b, 0) / metrics.CLS.length).toFixed(
              2
            )
          )
        : 0.1,
      fcp: metrics.FCP.length > 0 ? calculateAverage(metrics.FCP) : 1800,
      ttfb: metrics.TTFB.length > 0 ? calculateAverage(metrics.TTFB) : 600,
    };
  } catch (err) {
    devError("Failed to get average web vitals:", err);
    return getDefaultWebVitals();
  }
}

/**
 * Get default web vitals (fallback values)
 */
function getDefaultWebVitals() {
  return {
    lcp: 2500, // Good: < 2500ms
    fid: 100, // Good: < 100ms
    inp: 200, // Good: < 200ms
    cls: 0.1, // Good: < 0.1
    fcp: 1800, // Good: < 1800ms
    ttfb: 600, // Good: < 600ms
  };
}

