"use client";

import React from "react";

export default function DevAuthClear() {
  const clearAllAuth = () => {
    // Clear all authentication data
    localStorage.removeItem("supabase.auth.token");
    localStorage.removeItem("auth.authenticated");
    localStorage.removeItem("login_attempts");
    localStorage.removeItem("login_timestamp");

    sessionStorage.removeItem("supabase.auth.token");
    sessionStorage.removeItem("auth.authenticated");
    sessionStorage.removeItem("navbarRoleChecked");
    sessionStorage.removeItem("navbarAdminStatus");

    // Dispatch auth state change event
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { authenticated: false },
      })
    );

    // Reload the page
    window.location.reload();
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={clearAllAuth}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm font-medium"
        title="Clear all authentication data (Development only)"
      >
        🚪 Clear Auth
      </button>
    </div>
  );
}
