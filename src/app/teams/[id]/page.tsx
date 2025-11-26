// src/app/teams/[id]/page.tsx
"use client";
import React from "react";
import { notFound } from "next/navigation";
import {
  fetchTeamById,
  fetchCoachesByTeamId,
  fetchSchedulesByTeamId,
} from "../../../lib/actions";
import { Team, Coach, Schedule, Player } from "../../../types/supabase";
import * as Sentry from "@sentry/nextjs";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import BasketballLoader from "@/components/BasketballLoader";
import AdSection from "@/components/AdSection";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { devLog, devError } from "../../../lib/security";

type TeamPageProps = { params: Promise<{ id: string }> };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function TeamPage({ params }: TeamPageProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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
        devLog("🔍 Team Detail Page - Team Image Debug:", {
          teamId: teamData.id,
          teamName: teamData.name,
          teamImageUrl: teamData.team_image,
          logoUrl: teamData.logo_url,
          timestamp: new Date().toISOString(),
        });

        const [coachesData, schedulesData] = await Promise.all([
          fetchCoachesByTeamId(resolvedParams.id),
          fetchSchedulesByTeamId(resolvedParams.id),
        ]);

        // DISABLED: Fetch players for this team
        // const { data: playersData, error: playersError } = await supabase
        //   .from("players")
        //   .select("*")
        //   .eq("team_id", resolvedParams.id)
        //   .eq("is_deleted", false)
        //   .order("name", { ascending: true });

        // if (!playersError && playersData) {
        //   setPlayers(playersData);
        // }

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

        // Subscriptions for real-time updates
        let scheduleChannel: ReturnType<typeof supabase.channel> | null = null;
        try {
          scheduleChannel = supabase
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
            .subscribe((status) => {
              // Suppress WebSocket errors in production
              if (
                process.env.NODE_ENV === "development" &&
                status === "CHANNEL_ERROR"
              ) {
                devError("Schedule subscription error");
              }
            });
        } catch (error) {
          // Silently fail - realtime is optional
          if (process.env.NODE_ENV === "development") {
            devError("Failed to set up schedule subscription:", error);
          }
        }

        return () => {
          if (scheduleChannel) {
            try {
              supabase.removeChannel(scheduleChannel);
            } catch (error) {
              // Silently fail on cleanup
            }
          }
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
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen flex items-center justify-center">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>
        <div className="text-center relative z-10">
          <BasketballLoader size={80} />
        </div>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen flex items-center justify-center">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>
        <div className="text-center bg-white/5 border border-white/10 rounded-xl p-6 relative z-10">
          <p className="text-lg font-inter text-red-400 mb-4">
            {error || "Team not found"}
          </p>
        </div>
      </main>
    );
  }

  // Filter and sort games/practices, then take only the next 3 upcoming ones
  const allGames = schedules
    .filter((s) => s.event_type === "Game" || s.event_type === "Tournament")
    .sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    )
    .filter((s) => new Date(s.date_time) >= new Date()); // Only future events

  const allPractices = schedules
    .filter((s) => s.event_type === "Practice")
    .sort(
      (a, b) =>
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    )
    .filter((s) => new Date(s.date_time) >= new Date()); // Only future events

  const games = allGames.slice(0, 3);
  const practices = allPractices.slice(0, 3);

  // Helper function to format player name: "First Name L."
  const formatPlayerName = (fullName: string): string => {
    const parts = fullName.trim().split(" ");
    if (parts.length === 0) return fullName;
    if (parts.length === 1) return parts[0] || "";
    const firstName = parts[0] || "";
    const lastPart = parts[parts.length - 1];
    const lastInitial = lastPart?.[0]?.toUpperCase() || "";
    return `${firstName} ${lastInitial}.`;
  };

  // Helper function to format grade level with ordinal suffix
  const formatGradeLevel = (grade: number | string): string => {
    const num = typeof grade === "string" ? parseInt(grade, 10) : grade;
    if (isNaN(num)) return "";
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${num}th`;
    }
    switch (lastDigit) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  };

  // Helper function to format date/time for Chicago timezone
  const formatDateTimeChicago = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <motion.main
      className="relative bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen overflow-x-hidden"
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
      {/* Background Banner Image - Full screen width, constrained to viewport */}
      <div
        className="absolute top-0 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] overflow-hidden"
        style={{
          left: 0,
          right: 0,
        }}
      >
        <Image
          src="/teambanner.webp"
          alt="Team background banner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark gradient overlay - darker at top, fading to transparent at bottom */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.6) 100%)",
          }}
          aria-hidden="true"
        />
        {/* Blur overlay at bottom to blend into black section */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{
            height: "25%",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.8) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
      </div>

      {/* Team Identity (Name, Logo, and Info) - Overlaps banner image */}
      <section
        className="relative z-20 flex flex-col items-center justify-center mx-auto max-w-7xl px-6 mb-16 team-identity-overlap"
        aria-label="Team Identity"
      >
        {/* Team Name - Centered */}
        <div className="text-center w-full mb-6 px-2">
          {/* Grade/Gender - Just Above Title, Centered, Smaller */}
          <div className="text-center w-full mb-0">
            <p className="text-sm sm:text-base font-inter text-slate-400 uppercase">
              {formatGradeLevel(team.grade_level)} grade • {team.gender}
            </p>
          </div>
          <h1
            className="mb-0 text-8xl sm:text-6xl md:text-8xl relative z-20 team-name-animated uppercase tracking-tight mx-auto text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
            data-text={team.name}
            style={{
              fontSize: "clamp(2.5rem, 12vw, 6rem)",
              lineHeight: "1.1",
            }}
          >
            {team.name}
          </h1>
        </div>

        {/* Logo - Below Title, Smaller, Centered */}
        <div className="flex-shrink-0">
          <Image
            src={team.logo_url || "/logos/logo2.png"}
            alt={`${team.name} logo`}
            width={80}
            height={80}
            className="rounded-full object-cover"
            priority
            sizes="80px"
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
      </section>

      {/* Content container */}
      <div className="relative mx-auto max-w-7xl px-6 pb-24">
        {/* Mobile Team Photo - Shows under logo and team name on mobile */}
        <div className="lg:hidden mb-12">
          <section aria-label="Team Photo">
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
              <Image
                src={
                  team.team_image
                    ? `${team.team_image}?t=${Date.now()}`
                    : "/logos/logo2.png"
                }
                alt={`${team.name} team photo`}
                fill
                className="object-cover"
                sizes="100vw"
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
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
            </div>
          </section>
        </div>

        {/* Two Column Layout for Desktop - Coaches and Team Photo */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 mb-16 mt-32 lg:items-start">
          {/* Left Column - Coaches Only */}
          <div className="flex flex-col justify-center">
            {/* Coaches */}
            <section aria-label="Coaches">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-medium uppercase tracking-wider text-blue-200 font-inter">
                  Coaches
                </span>
              </div>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter">
                Meet Our Coaches
              </h2>
              <div className="h-1 w-20 rounded-full bg-blue-600 mb-6"></div>
              <div className="flex flex-col gap-4">
                {coaches.length > 0 ? (
                  coaches.map((coach) => (
                    <div
                      key={coach.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4 hover:bg-white/10 transition-colors duration-300"
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
                        <h3 className="text-lg font-semibold text-white mb-2 font-inter">
                          {coach.first_name} {coach.last_name}
                        </h3>
                        <p className="text-slate-400 font-inter text-sm leading-relaxed mb-2">
                          {coach.bio}
                        </p>
                        <p className="text-blue-400 font-inter italic text-sm">
                          &ldquo;{coach.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 font-inter text-center">
                    No coaches assigned.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Team Photo (Desktop Only) */}
          <div className="lg:flex hidden justify-center">
            <section aria-label="Team Photo" className="w-full">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                <Image
                  src={
                    team.team_image
                      ? `${team.team_image}?t=${Date.now()}`
                      : "/logos/logo2.png"
                  }
                  alt={`${team.name} team photo`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 0vw, 50vw"
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
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
              </div>
            </section>
          </div>
        </div>

        {/* Games & Practices - Side by Side */}
        <section className="mb-16 mt-32" aria-label="Schedules">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter">
              Team Schedule
            </h2>
            <p className="mt-4 text-lg text-slate-400 font-inter">
              Upcoming games, tournaments, and practice sessions.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Games & Tournaments */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 text-center font-inter">
                Games & Tournaments
              </h3>
              {games.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-white/10">
                  <table className="w-full bg-white/5 rounded-xl overflow-hidden">
                    <thead className="sticky top-0 bg-white/10 z-10">
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                          Opponent
                        </th>
                        <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                          Date & Time
                        </th>
                        <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map((game, index) => (
                        <tr
                          key={game.id}
                          className={`border-b border-white/10 hover:bg-white/10 transition-colors ${
                            index === games.length - 1 ? "border-b-0" : ""
                          }`}
                        >
                          <td className="p-4 font-inter text-white">
                            vs {game.opponent || "TBD"}
                          </td>
                          <td className="p-4 font-inter text-slate-300">
                            {formatDateTimeChicago(game.date_time)}
                          </td>
                          <td className="p-4 font-inter text-slate-300">
                            {game.location || "TBD"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <p className="text-slate-400 font-inter">
                    No games or tournaments scheduled.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Practices */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 text-center font-inter">
                Practices
              </h3>
              {practices.length > 0 ? (
                <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-white/10">
                  <table className="w-full bg-white/5 rounded-xl overflow-hidden">
                    <thead className="sticky top-0 bg-white/10 z-10">
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                          Description
                        </th>
                        <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                          Date & Time
                        </th>
                        <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                          Location
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {practices.map((practice, index) => (
                        <tr
                          key={practice.id}
                          className={`border-b border-white/10 hover:bg-white/10 transition-colors ${
                            index === practices.length - 1 ? "border-b-0" : ""
                          }`}
                        >
                          <td className="p-4 font-inter text-white">
                            {practice.description || "Practice Session"}
                          </td>
                          <td className="p-4 font-inter text-slate-300">
                            {formatDateTimeChicago(practice.date_time)}
                          </td>
                          <td className="p-4 font-inter text-slate-300">
                            {practice.location || "TBD"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                  <p className="text-slate-400 font-inter">
                    No practices scheduled.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-6">
            <Link
              href="/schedules"
              className="text-blue-400 hover:text-blue-300 hover:underline font-inter transition-colors"
              aria-label="View all schedules"
            >
              View All Schedules →
            </Link>
          </div>
        </section>

        {/* Team Players - Full Width - HIDDEN */}
        <section className="mb-16 mt-32 hidden" aria-label="Team Players">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter">
              Team Players
            </h2>
            <p className="mt-4 text-lg text-slate-400 font-inter">
              Meet the players on this team.
            </p>
          </div>
          {players.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full bg-white/5 rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                      Name
                    </th>
                    <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                      Jersey #
                    </th>
                    <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                      Position
                    </th>
                    <th className="text-left p-4 font-semibold text-white font-inter uppercase text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr
                      key={player.id}
                      className={`border-b border-white/10 hover:bg-white/10 transition-colors ${
                        index === players.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="p-4 font-inter text-white">
                        {formatPlayerName(player.name)}
                      </td>
                      <td className="p-4 font-inter text-slate-300">
                        {(player as any).jersey_number || "N/A"}
                      </td>
                      <td className="p-4 font-inter text-slate-300">
                        {(player as any).position || "N/A"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            (player as any).is_active !== false
                              ? "bg-green-900/50 text-green-300 border border-green-500/50"
                              : "bg-red-900/50 text-red-300 border border-red-500/50"
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
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-slate-400 font-inter">
                No players added to this team yet.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Ad Section - Above Footer */}
      <div className="mt-16 md:mt-24">
        <AdSection />
      </div>
    </motion.main>
  );
}
