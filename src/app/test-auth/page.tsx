"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Team, SupabaseUser } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { isProduction, devError } from "@/lib/security";
import { useCSRF } from "@/hooks/useCSRF";
import { validateCSRFToken } from "@/lib/security";

export default function TestAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const { csrfToken, isLoading: csrfLoading, error: csrfError } = useCSRF();

  useEffect(() => {
    // Security: Block access in production environment
    if (isProduction()) {
      return;
    }

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data, error } = await supabase
          .from("teams")
          .select(
            "id, name, age_group, gender, grade_level, logo_url, season, coach_names, video_url, team_image"
          )
          .eq("coach_email", user.email);
        if (error) {
          Sentry.captureException(error);
          devError("Error fetching teams:", error);
        }
        setTeams(
          (data || []).map((team) => ({
            ...team,
            coach_names: team.coach_names || [],
            video_url: team.video_url || null,
            team_image: team.team_image || null,
            is_active: true,
          }))
        );
      }
    };
    fetchUser();
  }, []);

  // Security: Block access in production environment
  if (isProduction()) {
    return (
      <div className="bg-navy min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bebas mb-4">Access Denied</h1>
          <p className="text-lg mb-6">
            This page is not available in production.
          </p>
        </div>
      </div>
    );
  }

  const signIn = async () => {
    try {
      // CSRF Protection: Validate token before proceeding
      if (!csrfToken) {
        alert("CSRF token not available. Please try again.");
        return;
      }

      const email = prompt("Enter email:");
      const password = prompt("Enter password:");

      if (!email || !password) {
        alert("Email and password are required");
        return;
      }

      // Validate CSRF token before authentication
      const expectedToken = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("csrf-token="))
        ?.split("=")[1];

      if (!expectedToken) {
        alert("CSRF token not found. Please refresh and try again.");
        return;
      }

      const isValidToken = validateCSRFToken(
        csrfToken,
        decodeURIComponent(expectedToken)
      );
      if (!isValidToken) {
        alert("Security validation failed. Please refresh and try again.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      window.location.reload();
    } catch (error) {
      Sentry.captureException(error);
      devError("Sign-in error:", error);
    }
  };

  const signOut = async () => {
    try {
      // CSRF Protection: Validate token before proceeding
      if (!csrfToken) {
        alert("CSRF token not available. Please try again.");
        return;
      }

      // Validate CSRF token before sign out
      const expectedToken = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith("csrf-token="))
        ?.split("=")[1];

      if (!expectedToken) {
        alert("CSRF token not found. Please refresh and try again.");
        return;
      }

      const isValidToken = validateCSRFToken(
        csrfToken,
        decodeURIComponent(expectedToken)
      );
      if (!isValidToken) {
        alert("Security validation failed. Please refresh and try again.");
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.reload(); // Reload to update state after logout
    } catch (error) {
      Sentry.captureException(error);
      devError("Sign-out error:", error);
    }
  };

  return (
    <div className="bg-navy p-4 min-h-screen">
      {/* CSRF Status Indicator */}
      <div className="mb-4 p-2 bg-gray-800 rounded text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white">CSRF Protection:</span>
          {csrfLoading ? (
            <span className="text-yellow-400">Loading...</span>
          ) : csrfError ? (
            <span className="text-red-400">Error: {csrfError}</span>
          ) : csrfToken ? (
            <span className="text-green-400">Active ✓</span>
          ) : (
            <span className="text-red-400">Inactive</span>
          )}
        </div>
        {csrfToken && (
          <div className="text-xs text-gray-400 mt-1">
            Token: {csrfToken.substring(0, 16)}...
          </div>
        )}
      </div>

      {user ? (
        <div>
          <h1 className="text-2xl font-bebas text-white">
            Logged in as {user.email}
          </h1>
          <h2 className="text-xl font-inter text-white mt-4">Teams:</h2>
          <ul className="mt-2">
            {teams.map((team) => (
              <li key={team.name} className="font-inter text-white">
                {team.name} ({team.age_group}, {team.gender})
              </li>
            ))}
          </ul>
          <button
            onClick={signOut}
            className="mt-4 bg-red text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={signIn}
          className="bg-red text-white px-4 py-2 rounded"
        >
          Sign In as Test Coach
        </button>
      )}
    </div>
  );
}
