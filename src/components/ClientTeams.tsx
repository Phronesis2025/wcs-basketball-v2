// src/components/ClientTeams.tsx
"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import TeamCard from "@/components/TeamCard";
import AdSection from "@/components/AdSection";
import * as Sentry from "@sentry/nextjs";
import { Team } from "@/types/supabase";
import { useTeams } from "@/hooks/useTeams";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";

interface ClientTeamsProps {
  initialTeams: Team[];
  error?: string | null;
}

export default function ClientTeams({ initialTeams, error }: ClientTeamsProps) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  // Fetch teams via React Query with caching; fall back to initialTeams
  const {
    data: queryTeams,
    isLoading,
    error: queryError,
    refetch,
    isRefetching,
  } = useTeams();

  // Update local state when query data changes
  useEffect(() => {
    if (queryTeams && queryTeams.length) {
      setTeams(queryTeams);
    }
  }, [queryTeams]);

  // Set up real-time subscriptions for team changes
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      if (process.env.NODE_ENV === "development") {
        devLog("Setting up real-time subscription for teams...");
      }
      
      channel = supabase
        .channel("teams_changes")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "teams",
          },
          (payload) => {
            if (process.env.NODE_ENV === "development") {
              devLog("Team change detected:", payload);
            }

            if (payload.eventType === "INSERT" && payload.new.is_active) {
              // New team added and is active
              setTeams((prev) => {
                const exists = prev.some((team) => team.id === payload.new.id);
                if (!exists) {
                  return [...prev, payload.new as Team].sort((a, b) =>
                    a.name.localeCompare(b.name)
                  );
                }
                return prev;
              });
            } else if (payload.eventType === "UPDATE") {
              // Team updated - check if it became active or inactive
              const updatedTeam = payload.new as Team;
              setTeams((prev) => {
                if (updatedTeam.is_active) {
                  // Team became active - add it if not already present
                  const exists = prev.some((team) => team.id === updatedTeam.id);
                  if (!exists) {
                    return [...prev, updatedTeam].sort((a, b) =>
                      a.name.localeCompare(b.name)
                    );
                  } else {
                    // Update existing team
                    return prev
                      .map((team) =>
                        team.id === updatedTeam.id ? updatedTeam : team
                      )
                      .sort((a, b) => a.name.localeCompare(b.name));
                  }
                } else {
                  // Team became inactive - remove it
                  return prev.filter((team) => team.id !== updatedTeam.id);
                }
              });
            } else if (payload.eventType === "DELETE") {
              // Team deleted - remove it
              setTeams((prev) =>
                prev.filter((team) => team.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe((status) => {
          // Only log in development - suppress WebSocket errors in production
          if (process.env.NODE_ENV === "development") {
            devLog("Teams subscription status:", status);
            if (status === "SUBSCRIBED") {
              devLog("✅ Successfully subscribed to teams changes");
            } else if (status === "TIMED_OUT") {
              devLog("⏰ Teams subscription timed out");
            } else if (status === "CLOSED") {
              devLog("🔒 Teams subscription closed");
            }
          }
          // Silently handle CHANNEL_ERROR in production to avoid console spam
        });
    } catch (error) {
      // Silently fail - realtime is optional and failures shouldn't break the app
      if (process.env.NODE_ENV === "development") {
        devLog("Realtime subscription failed, continuing without it");
      }
    }

    return () => {
      if (channel) {
        try {
          if (process.env.NODE_ENV === "development") {
            devLog("Cleaning up teams subscription...");
          }
          supabase.removeChannel(channel);
        } catch (error) {
          // Silently fail on cleanup
        }
      }
    };
  }, []);

  // Periodic refresh to ensure teams are up-to-date
  useEffect(() => {
    const interval = setInterval(() => {
      devLog("Periodic refresh: fetching teams...");
      refetch();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [refetch]);

  const uniqueTeams = teams.filter(
    (team, index, self) => index === self.findIndex((t) => t.name === team.name)
  );

  if (error) {
    Sentry.captureMessage("Teams page error: " + error);
    return (
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>
        <section className="relative mx-auto max-w-7xl px-6 text-center" aria-label="Our Teams">
          <p className="text-slate-400 text-base font-inter">
            {error}
          </p>
        </section>
      </main>
    );
  }

  if (!uniqueTeams.length) {
    if (isLoading) {
      return (
        <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
          {/* Background Gradients */}
          <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
            <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
          </div>
          <section className="relative mx-auto max-w-7xl px-6 text-center" aria-label="Our Teams">
            <p className="text-slate-400 text-base font-inter">
              Loading teams...
            </p>
          </section>
        </main>
      );
    }
    if (queryError) {
      Sentry.captureMessage("Teams query error: " + String(queryError));
    }
    return (
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>
        <section className="relative mx-auto max-w-7xl px-6 text-center" aria-label="Our Teams">
          <p className="text-slate-400 text-base font-inter">
            No teams available.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section
        ref={ref}
        className="relative mx-auto max-w-7xl px-6"
        aria-label="Our Teams"
      >
        <div className="text-center mb-16">
          <h1 className="mb-8 text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter relative z-20">
            Our Teams
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl font-inter mb-6">
            Meet our competitive youth basketball teams for the 2025-2026
            season. Each team is carefully selected and coached to compete at the highest tournament level, 
            focusing on fundamental skills, teamwork, and character development. From 2nd grade through 8th grade, 
            our boys and girls teams represent World Class Sports with dedication, discipline, and a commitment to excellence 
            both on and off the court.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 bg-blue-600/20 hover:bg-blue-600/30 disabled:bg-gray-600/20 border border-white/10 rounded-lg transition-colors duration-200"
              title="Refresh teams"
            >
              <svg
                className={`w-5 h-5 text-slate-300 ${
                  isRefetching ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {uniqueTeams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={
                isMobile
                  ? {}
                  : { y: -8, transition: { duration: 0.3, ease: "easeOut" } }
              }
            >
              <TeamCard team={team} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ad Section - Above Footer */}
      <div className="mt-16 md:mt-24">
        <AdSection />
      </div>
    </main>
  );
}
