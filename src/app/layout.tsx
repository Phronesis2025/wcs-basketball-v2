"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        <footer className="bg-navy py-4 text-center text-white">
          <p className="text-base font-inter">
            © 2025 WCS Basketball | Contact: info@wcsbasketball.com
          </p>
        </footer>
        {/* Vercel Analytics for user behavior tracking */}
        <Analytics />

        {/* Vercel Speed Insights for Core Web Vitals monitoring */}
        <SpeedInsights
          sampleRate={0.1}
        />
      </body>
    </html>
  );
}
