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
    { name: "Tournament", href: "/tournament-signup" },
    { name: "Register", href: "/club-registration" },
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
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {/* Logo - Centered at top */}
          <div className="flex justify-center">
            <div className="w-40 h-20 relative">
              <Image
                src="/logo.png"
                alt="WCS Basketball Logo"
                fill
                sizes="192px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Quick Links - Centered */}
          <div className="text-center">
            <h3 className="font-bebas text-lg mb-3 text-white">QUICK LINKS</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 max-w-xs mx-auto justify-items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-inter"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Stay Updated Text and Button - Centered */}
          <div className="text-center">
            <p className="text-white font-inter text-sm mb-3">
              Stay updated with the latest WCS news and events.
            </p>
            <Link
              href="/register"
              className="inline-block bg-red text-white px-5 py-2 rounded hover:bg-red/90 transition-colors duration-200 text-sm font-medium"
            >
              Join Our Community
            </Link>
          </div>

          {/* Follow Us - Centered */}
          <div className="text-center">
            <h3 className="font-bebas text-lg mb-3 text-white">FOLLOW US</h3>
            <div className="flex justify-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200">
                    <span className="text-sm font-bold">
                      {social.icon === "facebook" && "f"}
                      {social.icon === "instagram" && "ig"}
                      {social.icon === "twitter" && "t"}
                      {social.icon === "youtube" && "yt"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-3 gap-6 items-center">
          {/* Quick Links - Left */}
          <div>
            <h3 className="font-bebas text-lg mb-3 text-white">QUICK LINKS</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-inter"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Logo - Center */}
          <div className="flex justify-center">
            <div className="w-32 h-16 relative">
              <Image
                src="/logo.png"
                alt="WCS Basketball Logo"
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Follow Us - Right */}
          <div className="text-right">
            <h3 className="font-bebas text-lg mb-3 text-white">FOLLOW US</h3>
            <div className="flex justify-end space-x-3 mb-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                  aria-label={`Follow us on ${social.name}`}
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200">
                    <span className="text-xs font-bold">
                      {social.icon === "facebook" && "f"}
                      {social.icon === "instagram" && "ig"}
                      {social.icon === "twitter" && "t"}
                      {social.icon === "youtube" && "yt"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-sm text-white font-inter mb-3">
              <p className="mb-1">
                Stay updated with the latest WCS news and events.
              </p>
            </div>
            <div className="flex justify-end">
              <Link
                href="/register"
                className="inline-block bg-red text-white px-4 py-2 rounded hover:bg-red/90 transition-colors duration-200 text-sm font-medium"
              >
                Join Our Community
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-gray-300 font-inter">
              © {currentYear} WCS Basketball. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-gray-300 font-inter">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                href="/code-of-conduct"
                className="hover:text-white transition-colors duration-200"
              >
                Code of Conduct
              </Link>
              <Link
                href="/refund-policy"
                className="hover:text-white transition-colors duration-200"
              >
                Refunds
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
