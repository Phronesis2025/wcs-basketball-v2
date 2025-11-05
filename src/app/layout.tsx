import React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import HomepageLayout from "../components/HomepageLayout";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import QueryProvider from "../components/QueryProvider"; // Re-enabled
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";
import ConditionalFooter from "../components/ConditionalFooter";
import WebVitalsTracker from "../components/WebVitalsTracker";

export const metadata: Metadata = {
  title: "WCS Basketball - Where Champions Start",
  description:
    "World Class Sports Basketball - Developing champions on and off the court",
  keywords: "basketball, youth sports, Christian school, athletics, WCS",
  authors: [{ name: "WCS Basketball" }],
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: "WCS Basketball - Where Champions Start",
    description:
      "World Class Sports Basketball - Developing champions on and off the court",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Favicon for all devices */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />

        {/* iOS specific favicon support */}
        <link
          rel="apple-touch-icon-precomposed"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Windows/Android specific */}
        <meta
          name="msapplication-TileImage"
          content="/android-chrome-192x192.png"
        />
        <meta name="msapplication-TileColor" content="#1e40af" />

        {/* iOS specific meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WCS Basketball" />

        {/* Android specific meta tags */}
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta
          name="msapplication-TileImage"
          content="/android-chrome-192x192.png"
        />

        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Performance: preconnect/dns-prefetch for Supabase storage */}
        <link
          rel="preconnect"
          href="https://htgkddahhgugesktujds.supabase.co"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://htgkddahhgugesktujds.supabase.co"
        />

        {/* Preload critical fonts for faster FCP */}
        <link
          rel="preload"
          href="/fonts/BebasNeue-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Inter-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />

        {/* Preload critical hero image for faster LCP */}
        <link
          rel="preload"
          href="/hero-basketball.jpg"
          as="image"
          fetchPriority="high"
        />

        {/* Note: No preload for animated flames to avoid LCP impact */}
      </head>
      <body>
        <QueryProvider>
          <ScrollToTop />
          <HomepageLayout />
          {children}
          <ConditionalFooter />
          {/* Vercel Analytics for user behavior tracking */}
          <Analytics />

          {/* Vercel Speed Insights for Core Web Vitals monitoring */}
          <SpeedInsights />

          {/* Custom Web Vitals Tracker - stores metrics in our database */}
          <WebVitalsTracker />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#4ade80",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
