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
import { Team, Coach, Schedule, TeamUpdate } from "../../../types/supabase";
import * as Sentry from "@sentry/nextjs";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { devLog, devError } from "../../../lib/security";
import TeamUpdates from "../../../components/TeamUpdates";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Prevent scroll restoration and unwanted scrolling
  useEffect(() => {
    // Prevent browser from restoring scroll position
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";

      // Store current scroll position
      const scrollY = window.scrollY;

      // Restore scroll position after a brief delay to ensure layout is stable
      const timer = setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 100);

      return () => {
        clearTimeout(timer);
        // Restore default scroll restoration
        window.history.scrollRestoration = "auto";
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

        const [coachesData, schedulesData, updatesData] = await Promise.all([
          fetchCoachesByTeamId(resolvedParams.id),
          fetchSchedulesByTeamId(resolvedParams.id),
          fetchTeamUpdates(resolvedParams.id),
        ]);

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

  const games = schedules.filter((s) => s.event_type === "Game").slice(0, 5);
  const practices = schedules
    .filter((s) => s.event_type === "Practice")
    .slice(0, 5);

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
          className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-6"
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
              src={team.team_image || "/logos/logo2.png"}
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
                          devError(
                            `Image load error for coach ${coach.first_name} ${coach.last_name}: ${coach.image_url}`
                          );
                          Sentry.captureMessage(
                            `Failed to load coach image for ${coach.first_name} ${coach.last_name}: ${coach.image_url}`
                          );
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
                src={team.team_image || "/logos/logo2.png"}
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

        {/* Game Schedule - Full Width */}
        <section className="mb-12" aria-label="Game Schedule">
          <h2 className="text-2xl font-bebas uppercase mb-4 text-center">
            Game Schedule
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="p-2 text-red">Date/Time</th>
                  <th className="p-2 text-red">Location</th>
                  <th className="p-2 text-red">Details</th>
                </tr>
              </thead>
              <tbody>
                {games.length > 0 ? (
                  games.map((game) => (
                    <tr key={game.id} className="border-b border-gray-700">
                      <td className="p-2 text-gray-300">
                        {new Date(game.date_time).toLocaleString("en-US", {
                          timeZone: "America/Chicago",
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="p-2 text-gray-300">{game.location}</td>
                      <td className="p-2">
                        <Link
                          href="/schedules"
                          className="text-red hover:underline"
                          aria-label={`View details for game on ${game.date_time}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-2 text-gray-300">
                      No games scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Link
            href="/schedules"
            className="text-red hover:underline mt-4 inline-block text-center w-full"
            aria-label="View all schedules"
          >
            View All Schedules
          </Link>
        </section>

        {/* Practice Schedule - Full Width */}
        <section aria-label="Practice Schedule">
          <h2 className="text-2xl font-bebas uppercase mb-4 text-center">
            Practice Schedule
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-inter">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="p-2 text-red">Date/Time</th>
                  <th className="p-2 text-red">Location</th>
                  <th className="p-2 text-red">Details</th>
                </tr>
              </thead>
              <tbody>
                {practices.length > 0 ? (
                  practices.map((practice) => (
                    <tr key={practice.id} className="border-b border-gray-700">
                      <td className="p-2 text-gray-300">
                        {new Date(practice.date_time).toLocaleString("en-US", {
                          timeZone: "America/Chicago",
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="p-2 text-gray-300">{practice.location}</td>
                      <td className="p-2">
                        <Link
                          href="/schedules"
                          className="text-red hover:underline"
                          aria-label={`View details for practice on ${practice.date_time}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-2 text-gray-300">
                      No practices scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Link
            href="/schedules"
            className="text-red hover:underline mt-4 inline-block text-center w-full"
            aria-label="View all schedules"
          >
            View All Schedules
          </Link>
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

        {/* Coaches Dashboard Button - Bottom of Page */}
        <div className="text-center mt-8">
          <Link
            href="/coaches/login"
            className="inline-block bg-red text-white font-bebas uppercase py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            aria-label="Access coaches dashboard"
          >
            Coaches Dashboard
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
