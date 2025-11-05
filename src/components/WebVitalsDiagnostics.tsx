"use client";

import { useState } from "react";

interface DiagnosticInfo {
  metric: string;
  threshold: { good: number; needsImprovement: number };
  causes: string[];
  fixes: string[];
}

const diagnosticInfo: Record<string, DiagnosticInfo> = {
  LCP: {
    metric: "LCP (Largest Contentful Paint)",
    threshold: { good: 2500, needsImprovement: 4000 },
    causes: [
      "Slow server response times",
      "Render-blocking JavaScript or CSS",
      "Large images or media files",
      "Slow resource load times",
      "Client-side rendering delays",
    ],
    fixes: [
      "Optimize server response times (use CDN, caching)",
      "Remove render-blocking resources",
      "Optimize images (use WebP, lazy loading, proper sizing)",
      "Preload critical resources",
      "Use Next.js Image component for automatic optimization",
      "Consider server-side rendering for faster initial load",
    ],
  },
  INP: {
    metric: "INP (Interaction to Next Paint)",
    threshold: { good: 200, needsImprovement: 500 },
    causes: [
      "Heavy JavaScript execution",
      "Long-running tasks blocking the main thread",
      "Large event handlers",
      "Third-party scripts blocking interactions",
      "Inefficient React re-renders",
    ],
    fixes: [
      "Break up long tasks using setTimeout or requestIdleCallback",
      "Debounce or throttle event handlers",
      "Optimize React components (use React.memo, useMemo, useCallback)",
      "Lazy load non-critical JavaScript",
      "Move heavy computations to Web Workers",
      "Reduce third-party script impact",
    ],
  },
  CLS: {
    metric: "CLS (Cumulative Layout Shift)",
    threshold: { good: 0.1, needsImprovement: 0.25 },
    causes: [
      "Images without dimensions (width/height)",
      "Ads, embeds, or iframes without dimensions",
      "Dynamically injected content",
      "Web fonts causing FOIT/FOUT",
      "Actions that trigger DOM changes",
    ],
    fixes: [
      "Set width and height attributes on all images",
      "Reserve space for ads and embeds",
      "Use aspect-ratio CSS property",
      "Preload web fonts with font-display: swap",
      "Avoid inserting content above existing content",
      "Use transform animations instead of properties that trigger layout",
    ],
  },
  FCP: {
    metric: "FCP (First Contentful Paint)",
    threshold: { good: 1800, needsImprovement: 3000 },
    causes: [
      "Slow server response times",
      "Render-blocking CSS",
      "Large HTML payload",
      "Slow DNS lookup or connection",
      "Blocking JavaScript execution",
    ],
    fixes: [
      "Optimize server response times",
      "Inline critical CSS",
      "Remove render-blocking resources",
      "Use HTTP/2 or HTTP/3",
      "Enable compression (gzip/brotli)",
      "Minimize HTML size",
      "Use CDN for faster delivery",
    ],
  },
  TTFB: {
    metric: "TTFB (Time to First Byte)",
    threshold: { good: 600, needsImprovement: 800 },
    causes: [
      "Slow server response times",
      "Database query delays",
      "Server-side processing overhead",
      "Network latency",
      "DNS resolution delays",
      "SSL/TLS handshake delays",
    ],
    fixes: [
      "Optimize database queries (add indexes, use connection pooling)",
      "Implement server-side caching",
      "Use a CDN to reduce latency",
      "Optimize API routes (reduce processing time)",
      "Use edge functions for faster responses",
      "Enable HTTP/2 or HTTP/3",
      "Consider serverless functions for better scaling",
    ],
  },
};

interface WebVitalsDiagnosticProps {
  metricName: string;
  value: number;
  status: "good" | "needsImprovement" | "poor";
}

export default function WebVitalsDiagnostic({
  metricName,
  value,
  status,
}: WebVitalsDiagnosticProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = diagnosticInfo[metricName];

  if (status === "good" || !info) {
    return null;
  }

  const isPoor = status === "poor";

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-xs transition-colors ${
          isPoor
            ? "text-[red] hover:text-[red]/90"
            : "text-yellow-400 hover:text-yellow-300"
        }`}
      >
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-white">
          {isPoor ? "⚠️ Poor" : "⚠️ Needs Improvement"} - Click for details
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 p-4 bg-gray-900/80 border border-gray-700 rounded-lg text-sm">
          <div className="mb-3">
            <p className="text-gray-300 mb-1">
              <strong className="text-white">{info.metric}</strong> is{" "}
              <span
                className={
                  isPoor
                    ? "text-[red] font-semibold"
                    : "text-yellow-400 font-semibold"
                }
              >
                {isPoor ? "poor" : "needs improvement"}
              </span>
            </p>
            <p className="text-gray-400 text-xs">
              Current: {value}
              {metricName === "CLS" ? "" : "ms"} | Good: &lt;{" "}
              {info.threshold.good}
              {metricName === "CLS" ? "" : "ms"}
            </p>
          </div>

          <div className="mb-4">
            <h4
              className={`${
                isPoor ? "text-[red]" : "text-yellow-400"
              } font-semibold mb-2 text-xs uppercase`}
            >
              Common Causes:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
              {info.causes.map((cause, index) => (
                <li key={index}>{cause}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-green-400 font-semibold mb-2 text-xs uppercase">
              Recommended Fixes:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
              {info.fixes.map((fix, index) => (
                <li key={index}>{fix}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
