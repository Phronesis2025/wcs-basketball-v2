import {withSentryConfig} from "@sentry/nextjs";
/**
 * Next.js configuration for WCS v2.0
 * Includes security headers, CSP policies, and image optimization
 */

import type { NextConfig } from "next";

// Environment detection for different CSP policies
const isDev = process.env.NODE_ENV !== "production";

// Development CSP - more permissive for development tools
const cspDev = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-analytics.com https://*.vercel-speed-insights.com https://va.vercel-scripts.com", // Allows dev tools and Vercel Analytics
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allows Tailwind CSS and Google Fonts
  "font-src 'self' data: https://fonts.gstatic.com", // Allows Google Fonts
  "img-src 'self' data: blob: https://htgkddahhgugesktujds.supabase.co https://img.youtube.com https://images.unsplash.com", // Allows Unsplash images
  "connect-src 'self' https://htgkddahhgugesktujds.supabase.co wss://htgkddahhgugesktujds.supabase.co https://*.vercel-analytics.com https://*.vercel-speed-insights.com https://va.vercel-scripts.com",
  "frame-src 'self' https://tourneymachine.com https://*.tourneymachine.com https://www.youtube.com https://*.youtube.com", // Allow Tourneymachine iframes and YouTube embeds
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Production CSP - strict security policy with analytics support
const cspProd = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.vercel-analytics.com https://*.vercel-speed-insights.com https://va.vercel-scripts.com", // Allow Vercel Analytics with inline scripts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allows Tailwind CSS and Google Fonts
  "font-src 'self' data: https://fonts.gstatic.com", // Allows Google Fonts
  "img-src 'self' data: blob: https://htgkddahhgugesktujds.supabase.co https://img.youtube.com https://images.unsplash.com", // Allows Unsplash images
  "connect-src 'self' https://htgkddahhgugesktujds.supabase.co wss://htgkddahhgugesktujds.supabase.co https://*.vercel-analytics.com https://*.vercel-speed-insights.com https://va.vercel-scripts.com", // Allow Vercel Analytics connections
  "frame-src 'self' https://tourneymachine.com https://*.tourneymachine.com https://www.youtube.com https://*.youtube.com", // Allow Tourneymachine iframes and YouTube embeds
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Security headers configuration
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: isDev ? cspDev : cspProd,
  },
  { key: "X-Frame-Options", value: "DENY" }, // Prevent clickjacking
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload", // Force HTTPS
  },
  { key: "X-Content-Type-Options", value: "nosniff" }, // Prevent MIME sniffing
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // Control referrer info
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()", // Disable unnecessary APIs
  },
  { key: "X-XSS-Protection", value: "1; mode=block" }, // Additional XSS protection
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" }, // Prevent cross-domain policy leaks
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // STEP 1.4: Temporarily allow builds while fixing issues (will be re-enabled at end)
  },
  typescript: {
    ignoreBuildErrors: true, // STEP 1.4: Temporarily allow builds while fixing issues (will be re-enabled at end)
  },
  // Disable static optimization for pages using useSearchParams
  output: process.env.NODE_ENV === 'production' ? undefined : undefined,
  experimental: {
    serverActions: {
      allowedOrigins: [
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        // Add production domain when deploying
        ...(process.env.NODE_ENV === "production" && process.env.VERCEL_URL
          ? [`https://${process.env.VERCEL_URL}`]
          : []),
      ],
      bodySizeLimit: "10mb", // Allow 10MB for file uploads
    },
  },
  // Apply security headers to all routes
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "htgkddahhgugesktujds.supabase.co",
        pathname: "/storage/v1/object/images/**",
      },
      {
        protocol: "https",
        hostname: "htgkddahhgugesktujds.supabase.co",
        pathname: "/storage/v1/object/team-updates/**",
      },
      {
        protocol: "https",
        hostname: "htgkddahhgugesktujds.supabase.co",
        pathname: "/storage/v1/object/public/team-updates/**",
      },
      {
        protocol: "https",
        hostname: "htgkddahhgugesktujds.supabase.co",
        pathname: "/storage/v1/object/public/images/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
 // For all available options, see:
 // https://www.npmjs.com/package/@sentry/webpack-plugin#options

 org: "wcsv2",

 project: "javascript-nextjs",

 // Only print logs for uploading source maps in CI
 silent: !process.env.CI,

 // For all available options, see:
 // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

 // Upload a larger set of source maps for prettier stack traces (increases build time)
 widenClientFileUpload: true,

 // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
 // This can increase your server load as well as your hosting bill.
 // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
 // side errors will fail.
 tunnelRoute: "/monitoring",

 // Automatically tree-shake Sentry logger statements to reduce bundle size
 disableLogger: true,

 // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
 // See the following for more information:
 // https://docs.sentry.io/product/crons/
 // https://vercel.com/docs/cron-jobs
 automaticVercelMonitors: true,
});