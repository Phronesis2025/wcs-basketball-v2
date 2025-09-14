"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false); // State for scroll detection
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [user, setUser] = useState<string | null>(null); // State for logged-in user email

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Smooth transition with hysteresis to prevent flickering
          if (scrollY > 30) {
            setIsScrolled(true);
          } else if (scrollY <= 20) {
            setIsScrolled(false);
          }
          // Debug log
          console.log("Scroll Y:", scrollY, "isScrolled:", scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ? user.email || null : null);
    };
    fetchUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user.email || null);
      }
    );
    return () => authListener.subscription.unsubscribe(); // Cleanup listener
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/"; // Redirect to home on logout
  };

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "About", href: "/about" },
    { name: "Teams", href: "/teams" },
    { name: "Schedules", href: "/schedules" },
    { name: "Coaches", href: "/coaches" },
    { name: "Shop", href: "/shop" },
  ];

  // Debug log for isScrolled state
  console.log("Navbar render - isScrolled:", isScrolled);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1">
          {/* Reduced py-2 to py-1 for slimmer mobile */}
          <div className="flex items-center justify-between h-12">
            {/* Logo and Text */}
            <div className="flex items-center gap-2">
              <div
                className={`p-1 rounded-md transition-all duration-700 ease-out ${
                  isScrolled ? "bg-transparent" : "bg-white/10 backdrop-blur-sm"
                }`}
              >
                <img
                  src="/logo4.png"
                  alt="WCS Basketball Logo"
                  className="h-8 w-auto"
                />
              </div>
              {/* Mobile brand text */}
              <span
                className={`md:hidden font-bebas text-lg transition-colors duration-700 ease-out ${
                  isScrolled ? "text-navy" : "text-white drop-shadow-lg"
                }`}
              >
                World Class
              </span>
              <span
                className={`hidden md:inline font-bebas text-lg transition-colors duration-700 ease-out ${
                  isScrolled ? "text-navy" : "text-white drop-shadow-lg"
                }`}
              >
                WCS BASKETBALL
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-inter font-medium text-sm transition-all duration-700 ease-out hover:text-red ${
                    isScrolled ? "text-navy" : "text-white drop-shadow-lg"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Register Button for Desktop */}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="bg-[#002C51] text-white font-bold px-4 py-2 rounded hover:bg-opacity-90 transition duration-300 text-sm"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/register"
                  className="bg-[#002C51] text-white font-bold px-4 py-2 rounded hover:bg-opacity-90 transition duration-300 text-sm"
                >
                  Register
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md transition-all duration-700 ease-out ${
                isScrolled
                  ? "text-navy hover:bg-gray-100"
                  : "text-white hover:bg-white/20"
              }`}
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  filter: isScrolled
                    ? "none"
                    : "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - slide-in panel */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-navy/95 backdrop-blur-md transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Sliding drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 space-y-4">
            {/* Register link at top */}
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#002C51] text-white font-bold text-sm px-4 py-2 rounded hover:bg-opacity-90 transition duration-300"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/register"
                className="w-full bg-[#002C51] text-white font-bold text-sm px-4 py-2 rounded hover:bg-opacity-90 transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            )}

            {/* Other links */}
            <div className="pt-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block w-full text-left px-4 py-2 font-inter font-medium text-navy hover:text-red hover:bg-gray-100 rounded-lg transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
