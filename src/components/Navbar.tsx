"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient"; // No longer needed with custom auth
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setIsScrolled(currentScrollY > 30);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const checkAuthStatus = () => {
      const isAuthenticated = localStorage.getItem('auth.authenticated');
      const authToken = localStorage.getItem('supabase.auth.token');
      
      if (isAuthenticated && authToken) {
        try {
          const session = JSON.parse(authToken);
          setUser(session?.user?.email || 'authenticated');
        } catch {
          // Clear invalid auth data
          localStorage.removeItem('auth.authenticated');
          localStorage.removeItem('supabase.auth.token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Check auth status on mount
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth.authenticated' || e.key === 'supabase.auth.token') {
        checkAuthStatus();
      }
    };

    // Listen for custom auth state change events
    const handleAuthStateChange = (e: CustomEvent) => {
      if (e.detail?.authenticated) {
        setUser(e.detail.user?.email || 'authenticated');
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);

    // Also check periodically in case of localStorage issues
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Hide navbar on coaches dashboard page
  if (pathname === "/coaches/dashboard") {
    return null;
  }

  const handleSignOut = async () => {
    // Clear our custom auth data
    localStorage.removeItem('auth.authenticated');
    localStorage.removeItem('supabase.auth.token');
    setUser(null);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { authenticated: false } 
    }));
    
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Teams", href: "/teams" },
    { name: "Schedules", href: "/schedules" },
    { name: "Coaches", href: "/coaches/login" },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1">
          <div className="flex items-center justify-between h-12">
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity duration-300"
            >
              <div
                className={`p-1 rounded-md transition-all duration-300 ease-out w-14 h-7 sm:w-16 sm:h-8 relative ${
                  isScrolled ? "bg-transparent" : "bg-navy/10 backdrop-blur-sm"
                }`}
              >
                <Image
                  src="/logo4.png"
                  alt="WCS Basketball Logo"
                  fill
                  sizes="(max-width: 640px) 56px, 64px"
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={`md:hidden font-bebas text-base sm:text-lg transition-colors duration-300 ease-out ${
                  isScrolled ? "text-navy" : "text-white drop-shadow-lg"
                }`}
              >
                World Class
              </span>
              <span
                className={`hidden md:inline font-bebas text-lg transition-colors duration-300 ease-out ${
                  isScrolled ? "text-navy" : "text-white drop-shadow-lg"
                }`}
              >
                World Class
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-inter font-medium text-sm transition-all duration-300 ease-out hover:text-red ${
                    isScrolled ? "text-navy" : "text-white drop-shadow-lg"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="bg-navy text-white font-bold px-4 py-2 rounded hover:bg-opacity-90 transition duration-300 text-sm"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/club-registration"
                  className="bg-navy text-white font-bold px-4 py-2 rounded hover:bg-opacity-90 transition duration-300 text-sm"
                >
                  Register
                </Link>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md transition-all duration-300 ease-out ${
                isScrolled
                  ? "text-navy hover:bg-gray-100"
                  : "text-white hover:bg-navy/20"
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
                  d={
                    isMobileMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </motion.nav>
      <div
        className={`fixed top-12 left-0 right-0 z-50 md:hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-navy font-inter font-medium text-base hover:text-red hover:bg-gray-100 rounded-md px-4 py-3 transition-all duration-200 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-navy font-inter font-medium text-base hover:text-red hover:bg-gray-100 rounded-md px-4 py-3 transition-all duration-200 text-center"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/club-registration"
                className="block text-navy font-inter font-medium text-base hover:text-red hover:bg-gray-100 rounded-md px-4 py-3 transition-all duration-200 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
