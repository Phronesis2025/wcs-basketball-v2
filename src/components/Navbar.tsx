"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient"; // No longer needed with custom auth
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { AuthPersistence } from "@/lib/authPersistence";
import { devLog, devError } from "@/lib/security";
import HandleAuthRedirect from "@/components/auth/HandleAuthRedirect";
import StartNowButton from "@/components/cta/StartNowButton";
import StartNowModal from "@/components/cta/StartNowModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // Store full user role
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Only track scroll for background changes (not for visibility - navbar is always visible now)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      // Don't check auth status if we're in the process of signing out
      if (isSigningOut) {
        devLog("Navbar: Skipping auth check - signing out");
        return;
      }

      // Check if we just signed out - keep flag longer to prevent re-authentication
      const justSignedOut = sessionStorage.getItem("auth.justSignedOut");
      if (justSignedOut) {
        devLog("Navbar: Skipping auth check - just signed out");
        setUser(null);
        setUserFullName(null);
        setIsAdmin(false);
        setUserRole(null);
        
        // Clear the flag after a longer delay to ensure no re-authentication
        // Check if flag timestamp is older than 10 seconds before clearing
        const flagTimestamp = sessionStorage.getItem("auth.justSignedOutTimestamp");
        const now = Date.now();
        if (flagTimestamp) {
          const timeSinceSignOut = now - parseInt(flagTimestamp);
          if (timeSinceSignOut > 10000) {
            // Only clear if more than 10 seconds have passed
            sessionStorage.removeItem("auth.justSignedOut");
            sessionStorage.removeItem("auth.justSignedOutTimestamp");
            devLog("Navbar: Cleared sign-out flag after 10 seconds");
          }
        } else {
          // If no timestamp, set one and keep flag for 10 seconds
          sessionStorage.setItem("auth.justSignedOutTimestamp", now.toString());
        }
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
        // Also verify token is not expired before restoring
        if (isAuthenticated && authToken && !isSigningOut) {
          try {
            const session = JSON.parse(authToken);
            // Check if token is expired
            if (session.expires_at) {
              const expiresAt = session.expires_at * 1000;
              const now = Date.now();
              if (now >= expiresAt) {
                // Token expired, don't restore
                devLog("Navbar: Token expired, not restoring from sessionStorage");
                sessionStorage.removeItem("auth.authenticated");
                sessionStorage.removeItem("supabase.auth.token");
                return;
              }
            }
            localStorage.setItem("auth.authenticated", isAuthenticated);
            localStorage.setItem("supabase.auth.token", authToken);
          } catch (parseError) {
            devError("Navbar: Error parsing session token:", parseError);
            // Don't restore if we can't parse the token
            return;
          }
        }
      }

      // Final check: make absolutely sure we're not signing out before proceeding
      const finalSignOutCheck = sessionStorage.getItem("auth.justSignedOut");
      if (finalSignOutCheck) {
        devLog("Navbar: Sign-out flag still present, aborting auth restoration");
        setUser(null);
        setUserFullName(null);
        setIsAdmin(false);
        setUserRole(null);
        return;
      }

      if (isAuthenticated && authToken) {
        try {
          const session = JSON.parse(authToken);
          
          // Verify token is not expired before restoring state
          if (session.expires_at) {
            const expiresAt = session.expires_at * 1000; // Convert to milliseconds
            const now = Date.now();
            if (now >= expiresAt) {
              devLog("Navbar: Token expired, clearing auth state");
              localStorage.removeItem("auth.authenticated");
              localStorage.removeItem("supabase.auth.token");
              sessionStorage.removeItem("auth.authenticated");
              sessionStorage.removeItem("supabase.auth.token");
              setUser(null);
              setUserFullName(null);
              setIsAdmin(false);
              setUserRole(null);
              return;
            }
          }
          
          // Before setting user state, verify the token is actually valid by checking with API
          // This prevents restoring state from stale/invalid tokens after sign-out
          try {
            const accessToken = session.access_token || session.user?.access_token;
            if (accessToken) {
              try {
                const verifyResponse = await fetch("/api/auth/user", {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
                
                if (!verifyResponse.ok) {
                  // Token is invalid, clear everything
                  devLog("Navbar: Token validation failed, clearing auth state");
                  localStorage.removeItem("auth.authenticated");
                  localStorage.removeItem("supabase.auth.token");
                  sessionStorage.removeItem("auth.authenticated");
                  sessionStorage.removeItem("supabase.auth.token");
                  setUser(null);
                  setUserFullName(null);
                  setIsAdmin(false);
                  setUserRole(null);
                  return;
                }
              } catch (fetchError) {
                // Network error - don't clear state, just log and continue
                devLog("Navbar: Network error verifying token (non-fatal):", fetchError);
                // Continue with session restoration despite network error
              }
            }
          } catch (verifyError) {
            devError("Navbar: Error verifying token:", verifyError);
            // If verification fails, don't restore state
            return;
          }

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
                const { extractApiResponseData } = await import("@/lib/errorHandler");
                const userData = await extractApiResponseData<{ role: string | null; password_reset: boolean | null }>(response);
                const role = userData.role; // Can be "admin", "coach", "parent", or null
                const isAdminUser = role === "admin";
                setIsAdmin(isAdminUser);
                setUserRole(role); // Store the full role
                // Cache the role for future use
                if (role) {
                  sessionStorage.setItem("navbarUserRole", role);
                } else {
                  sessionStorage.removeItem("navbarUserRole");
                }
                return isAdminUser;
              } else if (response.status === 404) {
                // User not in users table (likely a parent user)
                setIsAdmin(false);
                setUserRole(null); // Parent users have null role
                return false;
              }

              throw new Error(`Role check failed: ${response.status}`);
            } catch (error) {
              // Only log non-abort errors to reduce console noise, and log as debug (not error)
              if (error instanceof Error && error.name !== "AbortError") {
                devLog(
                  `Navbar admin role check attempt ${attempt} failed (non-fatal):`,
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
                devLog(
                  "Navbar: Admin role check failed after all attempts (non-fatal)"
                );
              }
              setIsAdmin(false);
              setUserRole(null); // Set role to null on error
              return false;
            }
          };

          // Only check role if we haven't cached it recently
          const cachedRoleCheck = sessionStorage.getItem("navbarRoleChecked");
          const cachedAdminStatus = sessionStorage.getItem("navbarAdminStatus");
          const cachedRole = sessionStorage.getItem("navbarUserRole");
          const lastCheck = cachedRoleCheck ? parseInt(cachedRoleCheck) : 0;
          const now = Date.now();

          // Load cached role if available (for immediate UI update)
          // Only load cache if we have valid auth data
          if (cachedRole && session?.user?.id) {
            setUserRole(cachedRole);
          } else if (!session?.user?.id) {
            // Clear cache if no valid session
            sessionStorage.removeItem("navbarUserRole");
            sessionStorage.removeItem("navbarAdminStatus");
            sessionStorage.removeItem("navbarRoleChecked");
          }

          // Always check role immediately for Club Management page
          if (isAdminDashboard) {
            checkAdminRole(session?.user?.id).then((adminStatus) => {
              devLog(
                "Navbar: Immediate admin check for Club Management:",
                adminStatus
              );
              // Role is already set in checkAdminRole function
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
              // Role is already cached in checkAdminRole function
              devLog("Navbar: Cached admin status:", adminStatus);
            });
            sessionStorage.setItem("navbarRoleChecked", now.toString());
          } else if (cachedAdminStatus !== null) {
            // Use cached admin status
            const cachedAdmin = cachedAdminStatus === "true";
            setIsAdmin(cachedAdmin);
            // Also use cached role if available
            if (cachedRole) {
              setUserRole(cachedRole);
            }
            // Only log in development mode
            devLog("Navbar: Using cached admin status:", cachedAdmin);
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

  // Check if we're on admin dashboard page (but we'll use regular navbar now)
  const isAdminDashboard = pathname === "/admin/club-management";

  const handleSignOut = async () => {
    try {
      devLog("Navbar: Starting comprehensive sign-out process");

      // Set signing out flag to prevent auth status checks
      setIsSigningOut(true);

      // Close mobile menu immediately
      setIsMobileMenuOpen(false);

      // Clear state immediately to prevent UI flicker
      setUser(null);
      setUserFullName(null);
      setIsAdmin(false);
      setUserRole(null);

      // Import supabase client for sign out
      const { supabase } = await import("@/lib/supabaseClient");

      // Sign out from Supabase with global scope to invalidate all sessions
      devLog("Navbar: Signing out from Supabase with global scope");
      try {
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error) {
          devError("Supabase sign out error:", error);
        } else {
          devLog("Navbar: Supabase sign out successful");
        }
      } catch (signOutErr) {
        devError("Supabase sign out exception:", signOutErr);
      }

      // Clear ALL authentication-related data using enhanced AuthPersistence utility
      devLog("Navbar: Clearing all auth data");
      AuthPersistence.clearAuthData();

      // Dispatch auth state change event immediately
      window.dispatchEvent(
        new CustomEvent("authStateChanged", {
          detail: { authenticated: false },
        })
      );

      // Force clear any remaining Supabase session from storage
      try {
        // Clear Supabase's own storage keys
        localStorage.removeItem("sb-htgkddahhgugesktujds-auth-token");
        sessionStorage.removeItem("sb-htgkddahhgugesktujds-auth-token");
        
        // Clear any other Supabase storage patterns
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("sb-") || key.includes("supabase")) {
            sessionStorage.removeItem(key);
          }
        });
        
        // Clear navbar role cache
        sessionStorage.removeItem("navbarUserRole");
        sessionStorage.removeItem("navbarAdminStatus");
        sessionStorage.removeItem("navbarRoleChecked");
      } catch (storageErr) {
        devError("Storage cleanup error:", storageErr);
      }

      devLog("Navbar: Sign-out complete, redirecting to home");

      // Set timestamp for sign-out flag to track when it was set
      sessionStorage.setItem("auth.justSignedOutTimestamp", Date.now().toString());

      // Use replace instead of href to prevent back button navigation to protected pages
      setTimeout(() => {
        // Clear localStorage flags (sessionStorage flags will persist across redirect)
        localStorage.removeItem("auth.signingOut");
        setIsSigningOut(false);

        // Keep sessionStorage flag for the new page to detect sign-out
        // It will be cleared by the new page after 5 seconds
        
        // Use replace to prevent back button navigation to authenticated state
        // Redirect to sign-out thank you page first, then it will redirect to home
        window.location.replace("/parent/sign-out");
      }, 500); // Reduced delay since we're doing thorough cleanup
    } catch (error) {
      devError("Error during sign out:", error);
      // Even if there's an error, still clear everything and redirect
      AuthPersistence.clearAuthData();
      
      // Dispatch event even on error
      window.dispatchEvent(
        new CustomEvent("authStateChanged", {
          detail: { authenticated: false },
        })
      );
      
      localStorage.removeItem("auth.signingOut");
      sessionStorage.removeItem("auth.justSignedOut");
      setIsSigningOut(false);

      // Force redirect even on error
      setTimeout(() => {
        window.location.replace("/");
      }, 500);
    }
  };

  // Standard site navigation (no admin links injected on regular pages)
  // Build base nav links
  const baseNavLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Teams", href: "/teams" },
    { name: "Schedules", href: "/schedules" },
    { name: "Drills", href: "/drills" },
  ];

  // Add "Profile" link for parents, "Coaches" link for admin/coach, or login for non-authenticated
  // Note: On club management page, we don't show these links in navbar
  let navLinks;
  if (isAdminDashboard) {
    // On club management page, don't show Coaches/Profile links in navbar
    navLinks = baseNavLinks;
  } else if (user) {
    // Only admin and coach roles see "Coaches" link
    // Everyone else (parent, null, or any other role) sees "Profile" link
    if (userRole === "admin" || userRole === "coach") {
      navLinks = [
        ...baseNavLinks,
        { name: "Coaches", href: "/admin/club-management?tab=coaches-dashboard" },
      ];
    } else {
      // All other users (parent, null role, or unknown role) see Profile link
      // Coaches link is explicitly NOT shown for non-admin/coach users
      navLinks = [
        ...baseNavLinks,
        { name: "Profile", href: "/parent/profile" },
      ];
    }
  } else {
    // Non-authenticated users see "Coaches" link to login
    navLinks = [...baseNavLinks, { name: "Coaches", href: "/coaches/login" }];
  }


  const isHome = pathname === "/";
  // Pages that should use the dark navbar style (matching home page)
  const isDarkPage = pathname === "/" || pathname === "/about";

  return (
    <>
      <Suspense fallback={null}>
        <HandleAuthRedirect />
      </Suspense>
      {/* Regular Navbar for all pages (including club management) */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 transition-all duration-300 ease-out ${
          // Dark pages (home, about): dark with border; Other pages: white with shadow
          isDarkPage
            ? "bg-[#030711]/80 backdrop-blur-md border-b border-white/5 z-40"
            : "bg-white/95 backdrop-blur-md shadow-lg z-50"
        }`}
      >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity duration-300"
              >
                <div
                  className={`p-1 rounded-md transition-all duration-300 ease-out w-14 h-7 sm:w-16 sm:h-8 relative ${
                    isHome
                      ? "bg-transparent"
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
                    isDarkPage
                      ? "text-white"
                      : "text-navy"
                  }`}
                >
                  World Class
                </span>
                <span
                  className={`hidden md:inline font-bebas text-lg transition-colors duration-300 ease-out ${
                    isDarkPage
                      ? "text-white"
                      : "text-navy"
                  }`}
                >
                  World Class
                </span>
              </Link>
              {/* Centered navigation links for homepage */}
              {isHome && (
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`font-inter font-medium text-xs transition-colors ${
                        pathname === link.href
                          ? "text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Regular right-aligned links for other pages (not home) */}
              {!isHome && (
                <div className="hidden md:flex items-center gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`font-inter font-medium text-sm transition-all duration-300 ease-out ${
                        isDarkPage
                          ? pathname === link.href
                            ? "text-white"
                            : "text-slate-400 hover:text-white"
                          : "hover:text-red text-navy"
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Auth buttons */}
              <div className="hidden md:flex items-center gap-3">
                {isDarkPage && user && (
                  <Link
                    href={
                      userRole === "coach" || userRole === "admin"
                        ? "/admin/club-management"
                        : "/parent/profile"
                    }
                    className="text-xs font-medium text-neutral-400 hover:text-white px-3 py-2 transition-colors font-inter"
                  >
                    Dashboard
                  </Link>
                )}
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className={`font-bold px-4 py-2 rounded transition duration-300 text-sm font-inter ${
                      isDarkPage
                        ? "bg-white text-black rounded-full hover:bg-neutral-200 hover:scale-[1.02]"
                        : "bg-navy text-white hover:bg-opacity-90"
                    }`}
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    {isDarkPage && (
                      <Link
                        href="/parent/login"
                        className="text-xs font-medium text-neutral-400 hover:text-white px-3 py-2 transition-colors font-inter"
                      >
                        Sign In
                      </Link>
                    )}
                    <button
                      onClick={() => setIsRegisterModalOpen(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all font-inter ${
                        isDarkPage
                          ? "bg-white text-black hover:bg-neutral-200 hover:scale-[1.02]"
                          : "bg-navy text-white hover:bg-opacity-90"
                      }`}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-md transition-all duration-300 ease-out ${
                  isDarkPage
                    ? "text-white hover:bg-white/10"
                    : "text-navy hover:bg-gray-100"
                }`}
                aria-label="Toggle mobile menu"
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
        </motion.nav>
      {/* Mobile Menu for all pages */}
      <div
        className={`fixed top-12 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className={isDarkPage ? "bg-[#030711]/95 backdrop-blur-md border-b border-white/10 shadow-lg" : "bg-white shadow-lg"}>
          <div className="max-w-7xl mx-auto px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block font-inter font-medium text-base rounded-md px-4 py-3 transition-all duration-200 text-center ${
                  isDarkPage
                    ? pathname === link.href
                      ? "text-white bg-white/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-navy hover:text-red hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className={`w-full font-inter font-medium text-base rounded-md px-4 py-3 transition-all duration-200 text-center ${
                  isDarkPage
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-navy hover:text-red hover:bg-gray-100"
                }`}
              >
                Sign Out
              </button>
            ) : (
              <div 
                className={`block font-inter font-medium text-base rounded-md px-4 py-3 transition-all duration-200 text-center ${
                  isDarkPage
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-navy hover:text-red hover:bg-gray-100"
                }`}
              >
                <StartNowButton 
                  variant="navbar" 
                  onOpen={() => setIsMobileMenuOpen(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Register Modal */}
      {isRegisterModalOpen && (
        <StartNowModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
        />
      )}
    </>
  );
}
