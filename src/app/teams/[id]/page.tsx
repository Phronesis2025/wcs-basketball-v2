// src/app/teams/[id]/page.tsx
"use client";
import { notFound } from "next/navigation";
import {
  fetchTeamById,
  fetchCoachesByTeamId,
  fetchSchedulesByTeamId,
  fetchTeamUpdates,
} from "@/lib/actions";
import { Team, Coach, Schedule, TeamUpdate } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { supabase } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";

type TeamPageProps = { params: Promise<{ id: string }> };

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function TeamPage({ params }: TeamPageProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [updates, setUpdates] = useState<TeamUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Embla Carousel setup
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
  ]);

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

        const [coachesData, schedulesData, updatesData] = await Promise.all([
          fetchCoachesByTeamId(resolvedParams.id),
          fetchSchedulesByTeamId(resolvedParams.id),
          fetchTeamUpdates(resolvedParams.id),
        ]);

        setTeam(teamData);
        setCoaches(coachesData);
        setSchedules(schedulesData);
        setUpdates(updatesData);
      } catch (err) {
        Sentry.captureException(err);
        setError("Failed to fetch team data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscriptions for real-time updates
    const scheduleChannel = supabase
      .channel("schedules")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "schedules",
          filter: `team_id=eq.${params.then((p) => p.id)}`,
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
          filter: `team_id=eq.${params.then((p) => p.id)}`,
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
          ? { opacity: 1, y: 0 }
          : "visible"
      }
    >
      <div className="max-w-7xl mx-auto">
        <Link
          href="/teams"
          className="text-red hover:underline text-lg font-bebas mb-6 inline-block"
          aria-label="Back to all teams"
        >
          ← Back to Teams
        </Link>

        {/* Top Section (Team Identity) */}
        <section
          className="mb-8 flex flex-col lg:flex-row gap-6"
          aria-label="Team Identity"
        >
          <div className="flex-1">
            <Image
              src={team.logo_url || "/logos/logo2.png"}
              alt={`${team.name} logo`}
              width={120}
              height={120}
              className="rounded-full object-cover"
              priority
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
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-bebas uppercase">
              {team.name}
            </h1>
            <p className="text-lg font-inter text-gray-300">
              {team.age_group} {team.gender} – Grade {team.grade_level}
            </p>
          </div>
        </section>

        {/* Team Photo (Right on Desktop, Full-Width on Mobile) */}
        <section className="mb-8 lg:ml-auto lg:w-1/2" aria-label="Team Photo">
          <Image
            src={team.team_image || "/logos/logo2.png"}
            alt={`${team.name} team photo`}
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-64 object-cover rounded-lg lg:h-80"
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

        {/* Coaches */}
        <section className="mb-12" aria-label="Coaches">
          <h2 className="text-2xl font-bebas uppercase mb-4">Coaches</h2>
          <div className="flex flex-col gap-4">
            {coaches.length > 0 ? (
              coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 flex flex-col items-center"
                >
                  <Image
                    src={coach.image_url || "/logos/logo2.png"}
                    alt={`${coach.first_name} ${coach.last_name}`}
                    width={80}
                    height={80}
                    className="rounded-full mb-2"
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
                  <h3 className="text-xl font-bebas text-center">
                    {coach.first_name} {coach.last_name}
                  </h3>
                  <p className="text-gray-300 font-inter text-center">
                    {coach.bio}
                  </p>
                  <p className="text-red font-inter italic mt-2 text-center">
                    “{coach.quote}”
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-inter text-center">
                No coaches assigned.
              </p>
            )}
          </div>
        </section>

        {/* Team Updates */}
        <section className="mb-12" aria-label="Team Updates">
          <h2 className="text-2xl font-bebas uppercase mb-4">Team Updates</h2>
          {updates.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {updates.map((update) => (
                    <div
                      key={update.id}
                      className="flex-[0_0_100%] min-w-0 px-2"
                    >
                      <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4">
                        <h3 className="text-xl font-bebas">{update.title}</h3>
                        <p className="text-gray-300 font-inter">
                          {update.content}
                        </p>
                        {update.image_url && (
                          <Image
                            src={update.image_url}
                            alt={update.title}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="w-full h-auto mt-4 rounded-lg"
                            onError={(e) => {
                              devError(
                                `Image load error for update ${update.title}: ${update.image_url}`
                              );
                              Sentry.captureMessage(
                                `Failed to load update image for ${update.title}: ${update.image_url}`
                              );
                              e.currentTarget.src = "/logos/logo2.png";
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 font-inter">No updates available.</p>
          )}
        </section>

        {/* Game Schedule */}
        <section className="mb-12" aria-label="Game Schedule">
          <h2 className="text-2xl font-bebas uppercase mb-4">Game Schedule</h2>
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
            className="text-red hover:underline mt-4 inline-block"
            aria-label="View all schedules"
          >
            View All Schedules
          </Link>
        </section>

        {/* Practice Schedule */}
        <section aria-label="Practice Schedule">
          <h2 className="text-2xl font-bebas uppercase mb-4">
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
            className="text-red hover:underline mt-4 inline-block"
            aria-label="View all schedules"
          >
            View All Schedules
          </Link>
        </section>
      </div>
    </motion.div>
  );
}
