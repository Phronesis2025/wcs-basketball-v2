// Development script to clear all authentication data
// Run this in your browser's console or as a bookmark

function clearAllAuthData() {
  console.log("🧹 Clearing all authentication data...");

  // Clear localStorage
  localStorage.removeItem("auth.authenticated");
  localStorage.removeItem("supabase.auth.token");
  localStorage.removeItem("login_attempts");
  localStorage.removeItem("login_timestamp");

  // Clear sessionStorage
  sessionStorage.removeItem("auth.authenticated");
  sessionStorage.removeItem("supabase.auth.token");
  sessionStorage.removeItem("navbarRoleChecked");
  sessionStorage.removeItem("navbarAdminStatus");

  // Clear any other auth-related keys
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes("auth") ||
        key.includes("supabase") ||
        key.includes("session"))
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });

  // Dispatch auth state change event
  window.dispatchEvent(
    new CustomEvent("authStateChanged", {
      detail: { authenticated: false },
    })
  );

  console.log("✅ All authentication data cleared!");
  console.log("🔄 Reloading page...");

  // Reload the page
  window.location.reload();
}

// Run the function
clearAllAuthData();
