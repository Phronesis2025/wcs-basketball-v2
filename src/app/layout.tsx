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
    "Westside Christian School Basketball - Developing champions on and off the court",
  keywords: "basketball, youth sports, Christian school, athletics, WCS",
  authors: [{ name: "WCS Basketball" }],
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
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
      "Westside Christian School Basketball - Developing champions on and off the court",
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
