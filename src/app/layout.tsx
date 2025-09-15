"use client";

import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <footer className="bg-navy py-4 text-center text-white">
          <p className="text-base font-inter">
            © 2025 WCS Basketball | Contact: info@wcsbasketball.com
          </p>
        </footer>
      </body>
    </html>
  );
}
