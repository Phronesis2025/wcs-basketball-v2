"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from "web-vitals";

/**
 * WebVitalsTracker Component
 * 
 * Captures Core Web Vitals and sends them to our API for storage.
 * This runs client-side and tracks real user performance metrics.
 */
export default function WebVitalsTracker() {
  useEffect(() => {
    // Generate a session ID for this page load
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get current page path
    const page = window.location.pathname;

    // Function to send metric to our API
    const sendToAnalytics = async (metric: Metric) => {
      try {
        // Always track - web vitals are useful in both dev and production
        // The data will be stored in the database and can be filtered by environment if needed

        // Send to our API endpoint
        await fetch("/api/web-vitals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            metric_name: metric.name,
            metric_value: metric.value,
            metric_id: metric.id,
            session_id: sessionId,
            // Only include user_id if available (from auth)
            user_id: null, // Will be set server-side if user is authenticated
          }),
        });
      } catch (error) {
        // Silently fail - don't break the app if analytics fails
        console.error("Failed to send web vitals:", error);
      }
    };

    // Track all Core Web Vitals
    onCLS(sendToAnalytics); // Cumulative Layout Shift
    onFCP(sendToAnalytics); // First Contentful Paint
    onINP(sendToAnalytics); // Interaction to Next Paint (replaces deprecated FID)
    onLCP(sendToAnalytics); // Largest Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte
  }, []);

  // This component doesn't render anything
  return null;
}

