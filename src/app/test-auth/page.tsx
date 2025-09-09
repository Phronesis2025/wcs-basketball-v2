"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Team, SupabaseUser } from "@/types/supabase";

export default function TestAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
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
        if (error) console.error("Error fetching teams:", error);
        setTeams(data || []);
      }
    };
    fetchUser();
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: "testcoach@example.com",
      password: "WCSv2Test123!",
    });
    if (error) console.error("Sign-in error:", error);
    window.location.reload();
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign-out error:", error);
    window.location.reload(); // Reload to update state after logout
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
