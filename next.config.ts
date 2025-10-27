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
  "style-src 'self' 'unsafe-inline'", // Allows Tailwind CSS
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://htgkddahhgugesktujds.supabase.co",
  "connect-src 'self' https://htgkddahhgugesktujds.supabase.co wss://htgkddahhgugesktujds.supabase.co https://*.vercel-analytics.com https://*.vercel-speed-insights.com https://va.vercel-scripts.com",
  "frame-src 'none'",
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
  "style-src 'self' 'unsafe-inline'", // Allows Tailwind CSS
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://htgkddahhgugesktujds.supabase.co",
  "connect-src 'self' https://htgkddahhgugesktujds.supabase.co wss://htgkddahhgugesktujds.supabase.co https://*.vercel-analytics.com https://*.vercel-speed-insights.com https://va.vercel-scripts.com", // Allow Vercel Analytics connections
  "frame-src 'none'",
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
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
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
    ],
  },
};

export default nextConfig;
