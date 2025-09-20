import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        {/* Additional favicon meta tags for mobile devices */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
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

        {/* Additional mobile favicon support */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="msapplication-TileImage"
          content="/android-chrome-192x192.png"
        />
        <meta name="msapplication-config" content="/browserconfig.xml" />

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
      </head>
      <body>
        <ScrollToTop />
        <Navbar />
        {children}
        <Footer />
        {/* Vercel Analytics for user behavior tracking */}
        <Analytics />

        {/* Vercel Speed Insights for Core Web Vitals monitoring */}
        <SpeedInsights sampleRate={0.1} />
      </body>
    </html>
  );
}
