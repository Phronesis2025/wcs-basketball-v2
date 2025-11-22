"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from "web-vitals";
import { devError, isDevelopment } from "@/lib/security";

/**
 * WebVitalsTracker Component
 * 
 * Captures Core Web Vitals and sends them to our API for storage.
 * This runs client-side and tracks real user performance metrics.
 * 
 * Note: Errors are silently handled to prevent console noise in production.
 * Analytics failures should not impact user experience.
 */
export default function WebVitalsTracker() {
  useEffect(() => {
    // Generate a session ID for this page load
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get current page path
    const page = window.location.pathname;

    // Function to send metric to our API
    const sendToAnalytics = (metric: Metric) => {
      // Use a fire-and-forget approach - don't await or catch errors
      // This prevents any errors from bubbling up and appearing in console
      fetch("/api/web-vitals", {
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
        keepalive: true, // Ensure request completes even if page unloads
      })
        .then((response) => {
          // Only log errors in development
          if (!response.ok && isDevelopment()) {
            response.text().then((errorText) => {
              devError(`Web vitals API returned error: ${response.status} ${errorText}`);
            }).catch(() => {
              // Ignore errors reading response
            });
          }
        })
        .catch((error) => {
          // Only log in development - silently fail in production
          if (isDevelopment()) {
            devError("Failed to send web vitals:", error);
          }
          // In production, completely silent - network errors are expected and shouldn't be logged
        });
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

