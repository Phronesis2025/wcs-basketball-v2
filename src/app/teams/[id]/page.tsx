// src/app/teams/[id]/page.tsx
"use client";
import React from "react";
import { notFound } from "next/navigation";
import {
  fetchTeamById,
  fetchCoachesByTeamId,
  fetchSchedulesByTeamId,
  fetchTeamUpdates,
} from "../../../lib/actions";
import {
  Team,
  Coach,
  Schedule,
  TeamUpdate,
  Player,
} from "../../../types/supabase";
import * as Sentry from "@sentry/nextjs";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { devLog, devError } from "../../../lib/security";
import TeamUpdates from "../../../components/TeamUpdates";
import TeamGameCard from "../../../components/team/TeamGameCard";
import TeamPracticeCard from "../../../components/team/TeamPracticeCard";

type TeamPageProps = { params: Promise<{ id: string }> };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function TeamPage({ params }: TeamPageProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [updates, setUpdates] = useState<TeamUpdate[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // DISABLED: Prevent scroll restoration and unwanted scrolling
  useEffect(() => {
    // DISABLED: Prevent browser from restoring scroll position
    if (typeof window !== "undefined") {
      // window.history.scrollRestoration = "manual";

      // DISABLED: Store current scroll position
      // const scrollY = window.scrollY;

      // DISABLED: Restore scroll position after a brief delay to ensure layout is stable
      // const timer = setTimeout(() => {
      //   window.scrollTo(0, scrollY);
      // }, 100);

      return () => {
        // clearTimeout(timer);
        // DISABLED: Restore default scroll restoration
        // window.history.scrollRestoration = "auto";
      };
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const teamData = await fetchTeamById(resolvedParams.id);
        if (!teamData) {
          notFound();
          return;
        }

        // Debug: Log team data (development only)
        devLog("Team Data:", {
          id: teamData.id,
          name: teamData.name,
          logo_url: teamData.logo_url,
          team_image: teamData.team_image,
          coach_names: teamData.coach_names,
        });

        // Additional debugging for team image
        console.log("🔍 Team Detail Page - Team Image Debug:", {
          teamId: teamData.id,
          teamName: teamData.name,
          teamImageUrl: teamData.team_image,
          logoUrl: teamData.logo_url,
          timestamp: new Date().toISOString(),
        });

        const [coachesData, schedulesData, updatesData] = await Promise.all([
          fetchCoachesByTeamId(resolvedParams.id),
          fetchSchedulesByTeamId(resolvedParams.id),
          fetchTeamUpdates(resolvedParams.id),
        ]);

        // Fetch players for this team
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("*")
          .eq("team_id", resolvedParams.id)
          .eq("is_deleted", false)
          .order("name", { ascending: true });

        if (!playersError && playersData) {
          setPlayers(playersData);
        }

        // Debug: Log coaches (development only)
        devLog(
          "Coaches:",
          coachesData.map((c) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            image_url: c.image_url,
          }))
        );

        setTeam(teamData);
        setCoaches(coachesData);
        setSchedules(schedulesData);
        setUpdates(updatesData);

        // Subscriptions for real-time updates
        const scheduleChannel = supabase
          .channel("schedules")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "schedules",
              filter: `team_id=eq.${resolvedParams.id}`,
            },
            (payload) => {
              setSchedules((prev) =>
                [...prev, payload.new as Schedule].sort(
                  (a, b) =>
                    new Date(a.date_time).getTime() -
                    new Date(b.date_time).getTime()
                )
              );
            }
          )
          .subscribe();

        const updateChannel = supabase
          .channel("team_updates")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "team_updates",
              filter: `team_id=eq.${resolvedParams.id}`,
            },
            (payload) => {
              setUpdates((prev) =>
                [...prev, payload.new as TeamUpdate]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .slice(0, 5)
              );
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(scheduleChannel);
          supabase.removeChannel(updateChannel);
        };
      } catch (err) {
        devError("Fetch error:", err);
        Sentry.captureException(err);
        setError("Failed to fetch team data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red mx-auto mb-4"></div>
          <p className="text-lg font-inter">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center bg-gray-900/50 border border-red-500/50 rounded-lg p-4">
          <p className="text-lg font-inter text-red mb-4">
            {error || "Team not found"}
          </p>
          <Link
            href="/teams"
            className="text-red hover:underline text-lg font-bebas"
          >
            ← Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  const games = schedules.filter(
    (s) => s.event_type === "Game" || s.event_type === "Tournament"
  );
  const practices = schedules.filter((s) => s.event_type === "Practice");

  return (
    <motion.div
      className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate={
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? { opacity: 1 }
          : animationComplete
          ? { opacity: 1 }
          : "visible"
      }
      onAnimationComplete={() => setAnimationComplete(true)}
    >
      <div className="max-w-7xl mx-auto">
        {/* Team Identity (Logo and Name) - Side by Side, Centered */}
        <section
          className="pt-20 pb-8 sm:pt-24 mb-8 flex flex-col sm:flex-row items-center justify-center gap-6"
          aria-label="Team Identity"
        >
          <div className="flex-shrink-0">
            <Image
              src={team.logo_url || "/logos/logo2.png"}
              alt={`${team.name} logo`}
              width={120}
              height={120}
              className="rounded-full object-cover"
              priority
              sizes="120px"
              onError={(e) => {
                devError(
                  `Image load error for ${team.name} logo: ${team.logo_url}`
                );
                Sentry.captureMessage(
                  `Failed to load team logo for ${team.name}: ${team.logo_url}`
                );
                e.currentTarget.src = "/logos/logo2.png";
              }}
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
              {team.name}
            </h1>
            <p className="text-lg font-inter text-gray-300">
              {team.age_group} {team.gender} – Grade {team.grade_level}
            </p>
          </div>
        </section>

        {/* Mobile Team Photo - Shows under logo and team name on mobile */}
        <div className="lg:hidden mb-8">
          <section aria-label="Team Photo">
            <Image
              src={
                team.team_image
                  ? `${team.team_image}?t=${Date.now()}`
                  : "/logos/logo2.png"
              }
              alt={`${team.name} team photo`}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-64 object-cover rounded-lg"
              priority
              onError={(e) => {
                devError(
                  `Image load error for ${team.name} photo: ${team.team_image}`
                );
                Sentry.captureMessage(
                  `Failed to load team image for ${team.name}: ${team.team_image}`
                );
                e.currentTarget.src = "/logos/logo2.png";
              }}
            />
          </section>
        </div>

        {/* Two Column Layout for Desktop - Coaches and Team Photo */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 mb-12 lg:items-center">
          {/* Left Column - Coaches Only */}
          <div className="flex flex-col justify-center">
            {/* Coaches */}
            <section aria-label="Coaches">
              <h2 className="text-2xl font-bebas uppercase mb-6 text-center">
                Coaches
              </h2>
              <div className="flex flex-col gap-4">
                {coaches.length > 0 ? (
                  coaches.map((coach) => (
                    <div
                      key={coach.id}
                      className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 flex items-start gap-4"
                    >
                      <Image
                        src={coach.image_url || "/logos/logo2.png"}
                        alt={`${coach.first_name} ${coach.last_name}`}
                        width={70}
                        height={70}
                        className="rounded-full flex-shrink-0"
                        sizes="70px"
                        onError={(e) => {
                          // Silently fallback to default logo without logging error
                          e.currentTarget.src = "/logos/logo2.png";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bebas text-white mb-2">
                          {coach.first_name} {coach.last_name}
                        </h3>
                        <p className="text-gray-300 font-inter text-sm leading-relaxed mb-2">
                          {coach.bio}
                        </p>
                        <p className="text-red font-inter italic text-sm">
                          &ldquo;{coach.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300 font-inter text-center">
                    No coaches assigned.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Team Photo (Desktop Only) */}
          <div className="lg:flex hidden justify-center">
            <section aria-label="Team Photo" className="w-full">
              <Image
                src={
                  team.team_image
                    ? `${team.team_image}?t=${Date.now()}`
                    : "/logos/logo2.png"
                }
                alt={`${team.name} team photo`}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-96 object-cover rounded-lg"
                priority
                onError={(e) => {
                  devError(
                    `Image load error for ${team.name} photo: ${team.team_image}`
                  );
                  Sentry.captureMessage(
                    `Failed to load team image for ${team.name}: ${team.team_image}`
                  );
                  e.currentTarget.src = "/logos/logo2.png";
                }}
              />
            </section>
          </div>
        </div>

        {/* Team Updates - Full Width */}
        <div className="mb-12">
          <TeamUpdates team={team} updates={updates} />
        </div>

        {/* Games & Practices - Side by Side */}
        <section className="mb-12" aria-label="Schedules">
          <h2 className="text-2xl font-bebas uppercase mb-6 text-center">
            Team Schedule
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Games & Tournaments */}
            <div>
              <h3 className="text-xl font-bebas uppercase mb-4 text-center">
                Games & Tournaments
              </h3>
              <div className="space-y-4">
                {games.length > 0 ? (
                  games.map((game) => (
                    <TeamGameCard key={game.id} schedule={game} />
                  ))
                ) : (
                  <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 text-center">
                    <p className="text-gray-300 font-inter">
                      No games or tournaments scheduled.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Practices */}
            <div>
              <h3 className="text-xl font-bebas uppercase mb-4 text-center">
                Practices
              </h3>
              <div className="space-y-4">
                {practices.length > 0 ? (
                  practices.map((practice) => (
                    <TeamPracticeCard key={practice.id} schedule={practice} />
                  ))
                ) : (
                  <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 text-center">
                    <p className="text-gray-300 font-inter">
                      No practices scheduled.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Link
            href="/schedules"
            className="text-red hover:underline mt-4 inline-block text-center w-full"
            aria-label="View all schedules"
          >
            View All Schedules
          </Link>
        </section>

        {/* Team Players - Full Width */}
        <section className="mb-12" aria-label="Team Players">
          <h2 className="text-2xl font-bebas uppercase mb-6 text-center">
            Team Players
          </h2>
          {players.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-gray-900/50 border border-red-500/50 rounded-lg">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 font-bebas uppercase">Name</th>
                    <th className="text-left p-4 font-bebas uppercase">
                      Jersey #
                    </th>
                    <th className="text-left p-4 font-bebas uppercase">
                      Position
                    </th>
                    <th className="text-left p-4 font-bebas uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr
                      key={player.id}
                      className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                        index === players.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="p-4 font-inter text-white">
                        {player.name}
                      </td>
                      <td className="p-4 font-inter text-gray-300">
                        {(player as any).jersey_number || "N/A"}
                      </td>
                      <td className="p-4 font-inter text-gray-300">
                        {(player as any).position || "N/A"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            (player as any).is_active !== false
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {(player as any).is_active !== false
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 text-center">
              <p className="text-gray-300 font-inter">
                No players added to this team yet.
              </p>
            </div>
          )}
        </section>

        {/* Back Link - Bottom of Page */}
        <div className="text-center mt-12">
          <Link
            href="/teams"
            className="text-red hover:underline text-lg font-bebas inline-block"
            aria-label="Back to all teams"
          >
            ← Back to Teams
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
