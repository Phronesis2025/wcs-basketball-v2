"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient"; // No longer needed with custom auth
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AuthPersistence } from "@/lib/authPersistence";
import { devLog } from "@/lib/security";

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
      // Don't check auth status if we're in the process of signing out
      if (isSigningOut) {
        devLog("Navbar: Skipping auth check - signing out");
        return;
      }

      // Check if we just signed out
      const justSignedOut = sessionStorage.getItem("auth.justSignedOut");
      if (justSignedOut) {
        devLog("Navbar: Skipping auth check - just signed out");
        setUser(null);
        setUserFullName(null);
        setIsAdmin(false);
        return;
      }

      // Try localStorage first, then sessionStorage as backup
      let isAuthenticated = localStorage.getItem("auth.authenticated");
      let authToken = localStorage.getItem("supabase.auth.token");

      // If localStorage is empty, try sessionStorage ONLY if not signing out
      if (!isAuthenticated || !authToken) {
        isAuthenticated = sessionStorage.getItem("auth.authenticated");
        authToken = sessionStorage.getItem("supabase.auth.token");

        // DO NOT restore to localStorage during sign-out
        // Only restore if we have valid data and not signing out
        if (isAuthenticated && authToken && !isSigningOut) {
          localStorage.setItem("auth.authenticated", isAuthenticated);
          localStorage.setItem("supabase.auth.token", authToken);
        }
      }

      if (isAuthenticated && authToken) {
        try {
          const session = JSON.parse(authToken);
          setUser(session?.user?.email || "authenticated");
          setUserFullName(session?.user?.user_metadata?.full_name || null);

          // Check if user is admin with retry logic
          const checkAdminRole = async (
            userId: string,
            attempt = 1
          ): Promise<boolean> => {
            const MAX_ATTEMPTS = 2; // Reduced attempts for navbar
            const RETRY_DELAY = 1000 * attempt;

            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout to 5 seconds

              const response = await fetch("/api/auth/check-role", {
                headers: { "x-user-id": userId },
                signal: controller.signal,
              });

              clearTimeout(timeoutId);

              if (response.ok) {
                const userData = await response.json();
                const isAdminUser = userData.role === "admin";
                setIsAdmin(isAdminUser);
                return isAdminUser;
              }

              throw new Error(`Role check failed: ${response.status}`);
            } catch (error) {
              // Only log non-abort errors to reduce console noise
              if (error instanceof Error && error.name !== "AbortError") {
                console.error(
                  `Navbar admin role check attempt ${attempt} failed:`,
                  error
                );
              }

              // If it's an abort error and we have more attempts, retry
              if (attempt < MAX_ATTEMPTS) {
                await new Promise((resolve) =>
                  setTimeout(resolve, RETRY_DELAY)
                );
                return checkAdminRole(userId, attempt + 1);
              }

              // If all attempts failed, set admin to false but don't log abort errors
              if (error instanceof Error && error.name !== "AbortError") {
                console.warn("Admin role check failed after all attempts");
              }
              setIsAdmin(false);
              return false;
            }
          };

          // Only check role if we haven't cached it recently
          const cachedRoleCheck = sessionStorage.getItem("navbarRoleChecked");
          const cachedAdminStatus = sessionStorage.getItem("navbarAdminStatus");
          const lastCheck = cachedRoleCheck ? parseInt(cachedRoleCheck) : 0;
          const now = Date.now();

          // Always check role immediately for Club Management page
          if (isAdminDashboard) {
            checkAdminRole(session?.user?.id).then((adminStatus) => {
              devLog(
                "Navbar: Immediate admin check for Club Management:",
                adminStatus
              );
            });
          } else if (now - lastCheck > 300000) {
            // Increased cache time to 5 minutes (300000ms)
            // Check role and cache the result
            checkAdminRole(session?.user?.id).then((adminStatus) => {
              // Cache the admin status after successful check
              sessionStorage.setItem(
                "navbarAdminStatus",
                adminStatus.toString()
              );
              devLog("Navbar: Cached admin status:", adminStatus);
            });
            sessionStorage.setItem("navbarRoleChecked", now.toString());
          } else if (cachedAdminStatus !== null) {
            // Use cached admin status
            const cachedAdmin = cachedAdminStatus === "true";
            setIsAdmin(cachedAdmin);
            // Only log in development mode
            if (process.env.NODE_ENV === "development") {
              console.log("Navbar: Using cached admin status:", cachedAdmin);
            }
          } else {
            // No cache available, check role
            checkAdminRole(session?.user?.id).then((adminStatus) => {
              devLog("Navbar: Fresh admin check result:", adminStatus);
            });
          }
        } catch {
          // Clear invalid auth data from both storages
          localStorage.removeItem("auth.authenticated");
          localStorage.removeItem("supabase.auth.token");
          sessionStorage.removeItem("auth.authenticated");
          sessionStorage.removeItem("supabase.auth.token");
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    };

    // Check auth status on mount
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth.authenticated" || e.key === "supabase.auth.token") {
        checkAuthStatus();
      }
    };

    // Listen for custom auth state change events
    const handleAuthStateChange = (e: CustomEvent) => {
      if (e.detail?.authenticated) {
        setUser(e.detail.user?.email || "authenticated");
        setUserFullName(e.detail.user?.user_metadata?.full_name || null);
      } else {
        setUser(null);
        setUserFullName(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "authStateChanged",
      handleAuthStateChange as EventListener
    );

    // Also check periodically in case of localStorage issues (reduced frequency)
    const interval = setInterval(checkAuthStatus, 30000); // Reduced from 5000ms to 30000ms (30 seconds)

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "authStateChanged",
        handleAuthStateChange as EventListener
      );
      clearInterval(interval);
    };
  }, [isSigningOut]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Hide navbar on coaches dashboard page
  if (pathname === "/coaches/dashboard") {
    return null;
  }

  // Check if we're on admin dashboard page
  const isAdminDashboard = pathname === "/admin/club-management";

  const handleSignOut = async () => {
    try {
      devLog("Navbar: Starting sign-out process");

      // Set signing out flag to prevent auth status checks
      setIsSigningOut(true);

      // Set flags to prevent auto sign-in
      localStorage.setItem("auth.signingOut", "true");
      sessionStorage.setItem("auth.justSignedOut", "true");

      // Clear state immediately
      setUser(null);
      setUserFullName(null);
      setIsAdmin(false);

      // Import supabase client for sign out
      const { supabase } = await import("@/lib/supabaseClient");

      // Sign out from Supabase - this will trigger SIGNED_OUT event
      devLog("Navbar: Signing out from Supabase");
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        console.error("Supabase sign out error:", error);
      }

      // Clear ALL authentication-related data using AuthPersistence utility
      devLog("Navbar: Clearing auth data");
      AuthPersistence.clearAuthData();

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("authStateChanged", {
          detail: { authenticated: false },
        })
      );

      devLog("Navbar: Sign-out complete, redirecting to home");

      // Use a longer delay to ensure everything is cleared
      setTimeout(() => {
        localStorage.removeItem("auth.signingOut");
        sessionStorage.removeItem("auth.justSignedOut");
        setIsSigningOut(false);
      }, 3000);

      // Perform hard redirect to home page to ensure complete sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Error during sign out:", error);
      // Even if there's an error, still clear everything and redirect
      AuthPersistence.clearAuthData();
      localStorage.removeItem("auth.signingOut");
      sessionStorage.removeItem("auth.justSignedOut");
      setIsSigningOut(false);
      window.location.href = "/";
    }
  };

  // Standard site navigation (no admin links injected on regular pages)
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Teams", href: "/teams" },
    { name: "Schedules", href: "/schedules" },
    {
      name: "Coaches",
      href: user ? "/admin/club-management" : "/coaches/login",
    },
    { name: "Drills", href: "/drills" },
  ];

  // Admin/Coach menu entries for Club Management page menu
  const adminMenuLinks = [
    { name: "Manage", href: "/admin/club-management?tab=overview" },
    { name: "Coach", href: "/admin/club-management?tab=coaches-dashboard" },
    { name: "Payments", href: "/admin/club-management?tab=payments" },
    { name: "Monitor", href: "/admin/club-management?tab=analytics" },
  ];
  const coachMenuLinks = [
    { name: "Manage", href: "/admin/club-management?tab=overview" },
    { name: "Coach", href: "/admin/club-management?tab=coaches-dashboard" },
  ];

  const isHome = pathname === "/";

  return (
    <>
      {isAdminDashboard ? (
        // Coaches Dashboard Style Navbar for Admin Dashboard
        <div className="bg-white/95 backdrop-blur-md shadow-lg">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1">
            <div className="flex items-center justify-between h-12">
              <Link
                href="/"
                className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity duration-300"
              >
                <div className="p-1 rounded-md transition-all duration-300 ease-out w-14 h-7 sm:w-16 sm:h-8 relative bg-transparent">
                  <Image
                    src="/logo4.png"
                    alt="WCS Basketball Logo"
                    fill
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="md:hidden font-bebas text-base sm:text-lg transition-colors duration-300 ease-out text-navy">
                  World Class
                </span>
                <span className="hidden md:inline font-bebas text-lg transition-colors duration-300 ease-out text-navy">
                  World Class
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-900 font-inter text-sm sm:text-base">
                  Coach{" "}
                  {(
                    userFullName?.split(" ").pop() ||
                    user?.split("@")[0]?.split(".").pop() ||
                    ""
                  )
                    .charAt(0)
                    .toUpperCase() +
                    (
                      userFullName?.split(" ").pop() ||
                      user?.split("@")[0]?.split(".").pop() ||
                      ""
                    )
                      .slice(1)
                      .toLowerCase()}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md transition-all duration-300 ease-out text-navy hover:bg-gray-100"
                  aria-label="Toggle menu"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
          </div>
        </div>
      ) : (
        // Regular Navbar for Home and other pages
        <motion.nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
            // Home page: transparent until scrolled; Other pages: always white
            isHome
              ? isScrolled
                ? "bg-white/95 backdrop-blur-md shadow-lg"
                : "bg-transparent"
              : "bg-white/95 backdrop-blur-md shadow-lg"
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
                    isHome && !isScrolled
                      ? "bg-navy/10 backdrop-blur-sm"
                      : "bg-transparent"
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
                    isHome && !isScrolled
                      ? "text-white drop-shadow-lg"
                      : "text-navy"
                  }`}
                >
                  World Class
                </span>
                <span
                  className={`hidden md:inline font-bebas text-lg transition-colors duration-300 ease-out ${
                    isHome && !isScrolled
                      ? "text-white drop-shadow-lg"
                      : "text-navy"
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
                      isHome && !isScrolled
                        ? "text-white drop-shadow-lg"
                        : "text-navy"
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
                  isHome && !isScrolled
                    ? "text-white hover:bg-navy/20"
                    : "text-navy hover:bg-gray-100"
                }`}
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    filter:
                      isHome && !isScrolled
                        ? "drop-shadow(0 0 2px rgba(0,0,0,0.5))"
                        : "none",
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
      )}
      <div
        className={`fixed top-12 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            {isAdminDashboard ? (
              // Admin Dashboard Menu (two columns layout)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Admin Dashboard */}
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Admin Dashboard
                  </div>
                  <ul className="space-y-3">
                    {(isAdmin ? adminMenuLinks : coachMenuLinks).map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="block text-navy font-bebas text-lg tracking-wide hover:text-red transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Navigation */}
                <div className="md:border-l md:border-gray-200 md:pl-8">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                    Navigation
                  </div>
                  <ul className="space-y-3">
                    {navLinks.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="block text-navy font-bebas text-lg tracking-wide hover:text-red transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={handleSignOut}
                        className="text-navy font-bebas text-lg tracking-wide hover:text-red transition-colors"
                      >
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              // Regular Mobile Menu for other pages
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
