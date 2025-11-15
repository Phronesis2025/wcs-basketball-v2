// src/components/ClientTeams.tsx
"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import TeamCard from "@/components/TeamCard";
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
    devLog("Setting up real-time subscription for teams...");
    const channel = supabase
      .channel("teams_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "teams",
        },
        (payload) => {
          devLog("Team change detected:", payload);

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
        devLog("Teams subscription status:", status);
        if (status === "SUBSCRIBED") {
          devLog("✅ Successfully subscribed to teams changes");
        } else if (status === "CHANNEL_ERROR") {
          devError("❌ Error subscribing to teams changes");
        } else if (status === "TIMED_OUT") {
          devLog("⏰ Teams subscription timed out");
        } else if (status === "CLOSED") {
          devLog("🔒 Teams subscription closed");
        }
      });

    return () => {
      devLog("Cleaning up teams subscription...");
      supabase.removeChannel(channel);
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
      <div className="bg-navy min-h-screen text-white">
        <section className="pt-20 pb-12 sm:pt-24" aria-label="Our Teams">
          <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-white text-base font-inter text-center">
              {error}
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (!uniqueTeams.length) {
    if (isLoading) {
      return (
        <div className="bg-navy min-h-screen text-white">
          <section className="pt-20 pb-12 sm:pt-24" aria-label="Our Teams">
            <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-white text-base font-inter text-center">
                Loading teams...
              </p>
            </div>
          </section>
        </div>
      );
    }
    if (queryError) {
      Sentry.captureMessage("Teams query error: " + String(queryError));
    }
    return (
      <div className="bg-navy min-h-screen text-white">
        <section className="pt-20 pb-12 sm:pt-24" aria-label="Our Teams">
          <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-white text-base font-inter text-center">
              No teams available.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white">
      <section
        ref={ref}
        className="pt-20 pb-12 sm:pt-24"
        aria-label="Our Teams"
      >
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold uppercase">
              Our Teams
            </h1>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="ml-4 p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg transition-colors duration-200"
              title="Refresh teams"
            >
              <svg
                className={`w-5 h-5 text-white ${
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
          <p className="text-white text-lg font-inter mb-8 text-center">
            Meet our competitive youth basketball teams for the 2025-2026
            season.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 space-y-4 md:space-y-0">
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
        </div>
      </section>
    </div>
  );
}
