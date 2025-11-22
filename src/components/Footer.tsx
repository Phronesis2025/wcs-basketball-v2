"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Teams", href: "/teams" },
    { name: "Schedules", href: "/schedules" },
    { name: "Coaches", href: "/coaches/login" },
    { name: "Drills", href: "/drills" },
  ];

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/wcsbasketball",
      icon: "facebook",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/wcsbasketball",
      icon: "instagram",
    },
    {
      name: "Twitter",
      href: "https://twitter.com/wcsbasketball",
      icon: "twitter",
    },
    {
      name: "YouTube",
      href: "https://youtube.com/wcsbasketball",
      icon: "youtube",
    },
  ];

  // Removed unused contactInfo variable

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Main Grid - both mobile and desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
          {/* Brand and Email Signup */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="font-semibold text-white font-inter">WCS</span>
            </Link>
            <h3 className="text-2xl text-white font-medium mb-6 font-inter">
              Join the legacy today.
            </h3>
            <form className="flex gap-2 max-w-xs">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors font-inter placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 font-inter">Quick Links</h4>
            <ul className="space-y-3 text-sm text-neutral-500">
              <li>
                <Link href="/teams" className="hover:text-white transition-colors font-inter">
                  Teams
                </Link>
              </li>
              <li>
                <Link href="/schedules" className="hover:text-white transition-colors font-inter">
                  Schedules
                </Link>
              </li>
              <li>
                <Link href="/drills" className="hover:text-white transition-colors font-inter">
                  Drills
                </Link>
              </li>
            </ul>
          </div>

          {/* Organization Links */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4 font-inter">Organization</h4>
            <ul className="space-y-3 text-sm text-neutral-500">
              <li>
                <Link href="/about" className="hover:text-white transition-colors font-inter">
                  About
                </Link>
              </li>
              <li>
                <Link href="/coaches/login" className="hover:text-white transition-colors font-inter">
                  Coaches Login
                </Link>
              </li>
              <li>
                <Link href="/tournament-signup" className="hover:text-white transition-colors font-inter">
                  Tournaments
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
        <p className="font-inter">© {currentYear} WCS Basketball. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors font-inter">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors font-inter">
            Terms
          </Link>
          <Link href="/code-of-conduct" className="hover:text-white transition-colors font-inter">
            Code of Conduct
          </Link>
          <Link href="/refund-policy" className="hover:text-white transition-colors font-inter">
            Refunds
          </Link>
        </div>
      </div>
    </footer>
  );
}
