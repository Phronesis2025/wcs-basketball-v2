"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Team, SupabaseUser } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { isProduction } from "@/lib/security";

export default function TestAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

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
          .select("name, age_group, gender")
          .eq("coach_email", user.email);
        if (error) {
          Sentry.captureException(error);
          console.error("Error fetching teams:", error);
        }
        setTeams(data || []);
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
      const email = prompt("Enter email:");
      const password = prompt("Enter password:");

      if (!email || !password) {
        alert("Email and password are required");
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
      console.error("Sign-in error:", error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.reload(); // Reload to update state after logout
    } catch (error) {
      Sentry.captureException(error);
      console.error("Sign-out error:", error);
    }
  };

  return (
    <div className="bg-navy p-4 min-h-screen">
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
