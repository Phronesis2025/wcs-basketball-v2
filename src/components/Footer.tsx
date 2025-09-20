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
    { name: "Coaches", href: "/coaches" },
    { name: "Shop", href: "/shop" },
    { name: "News", href: "/news" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Code of Conduct", href: "/code-of-conduct" },
    { name: "Refund Policy", href: "/refund-policy" },
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

  const contactInfo = {
    email: "info@wcsbasketball.com",
    phone: "(555) 123-4567",
    address: "123 Basketball Court, Sports City, SC 12345",
  };

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-6 relative">
                <Image
                  src="/logo4.png"
                  alt="WCS Basketball Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <span className="font-bebas text-xl">WCS BASKETBALL</span>
            </div>
            <p className="text-gray-300 text-sm font-inter mb-4">
              Developing world-class basketball players through fundamentals,
              discipline, and character building. Join our community of
              champions.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-inter">
                <span className="font-semibold">Email:</span>{" "}
                {contactInfo.email}
              </p>
              <p className="text-sm font-inter">
                <span className="font-semibold">Phone:</span>{" "}
                {contactInfo.phone}
              </p>
              <p className="text-sm font-inter">
                <span className="font-semibold">Address:</span>{" "}
                {contactInfo.address}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bebas text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-inter"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bebas text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-inter"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bebas text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
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
            <div className="text-sm text-gray-300 font-inter">
              <p className="mb-2">
                Stay updated with our latest news and events!
              </p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
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
