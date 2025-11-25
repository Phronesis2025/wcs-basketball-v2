// src/app/schedules/page.tsx
"use client";
import React from "react";
import { Team, Schedule, TeamUpdate } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTeams } from "@/hooks/useTeams";
import { shouldUseRealtime } from "@/lib/networkUtils";
import { devError } from "@/lib/security";

import MobileMonth from "@/components/calendar/MobileMonth";
import EventDetailsModal from "@/components/calendar/EventDetailsModal";
import AdSection from "@/components/AdSection";
import { eventTypeToColor } from "@/lib/calendarColors";

export default function SchedulesPage() {
  const [events, setEvents] = useState<Schedule[]>([]);
  const { data: teamsData = [], error: teamsError } = useTeams();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use server-side API to bypass VPN CORS issues
        const response = await fetch("/api/schedules", { cache: "no-store" });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch schedules");
        }

        const data = await response.json();
        setEvents(data.events as Schedule[]);

        // Clear any previous errors on successful fetch
        setError(null);
      } catch (err) {
        devError("Failed to load schedules:", err);
        Sentry.captureException(err);

        // Provide more specific error messages based on the error type
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        if (
          errorMessage.includes("placeholder") ||
          errorMessage.includes("Missing required environment variables")
        ) {
          setError(
            "Database connection not configured. Please check your network connection and try again."
          );
        } else if (
          errorMessage.includes("fetch") ||
          errorMessage.includes("network")
        ) {
          setError(
            "Network connection issue. Please check your internet connection and try again."
          );
        } else {
          setError("Failed to load schedules. Please try refreshing the page.");
        }
      }
    };
    fetchData();

    // Check if real-time should be enabled (skip for VPN users)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    shouldUseRealtime().then((useRealtime) => {
      if (useRealtime) {
        // Realtime: listen for all CRUD operations
        channel = supabase
          .channel("schedules_realtime")
          // Schedules table events
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "schedules" },
            (payload) => {
              setEvents((prev) => [...prev, payload.new as Schedule]);
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "schedules" },
            (payload) => {
              const updatedSchedule = payload.new as Schedule;

              // If the schedule was soft deleted (deleted_at is set), remove it from the list
              if (updatedSchedule.deleted_at) {
                setEvents((prev) =>
                  prev.filter((event) => event.id !== updatedSchedule.id)
                );
              } else {
                // Otherwise, update the event normally
                setEvents((prev) =>
                  prev.map((event) =>
                    event.id === updatedSchedule.id ? updatedSchedule : event
                  )
                );
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "schedules" },
            (payload) => {
              setEvents((prev) =>
                prev.filter((event) => event.id !== payload.old.id)
              );
            }
          )
          // Team updates table events
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "team_updates" },
            (payload) => {
              const update = payload.new as TeamUpdate;
              if (update.date_time) {
                // Get team name for the title
                let teamName = "All Teams";
                // Show specific team name if team_id exists and it's not a global update
                if (update.team_id && !(update.is_global === true)) {
                  const foundTeam = teamsData.find(
                    (t) => t.id === update.team_id
                  );
                  teamName = foundTeam?.name || "Team";

                  // Remove "WCS" prefix if present
                  teamName = teamName.replace(/^\s*WCS\s*/i, "").trim();
                }

                const scheduleEvent = {
                  id: update.id,
                  team_id: update.team_id, // Preserve team_id for the modal
                  event_type: "Update",
                  date_time: update.date_time,
                  end_date_time: null,
                  title: `${teamName}: ${update.title}`,
                  location: "N/A",
                  opponent: null,
                  description: update.content,
                  is_global: update.is_global || false,
                  recurring_group_id: null,
                  created_by: update.created_by,
                  created_at: update.created_at,
                  deleted_at: update.deleted_at,
                } as Schedule;
                setEvents((prev) => [...prev, scheduleEvent]);
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "team_updates" },
            (payload) => {
              const update = payload.new as TeamUpdate;

              // If the update was soft deleted (deleted_at is set), remove it from the list
              if (update.deleted_at) {
                setEvents((prev) =>
                  prev.filter((event) => event.id !== update.id)
                );
              } else {
                // Get team name for the title
                let teamName = "All Teams";
                // Show specific team name if team_id exists and it's not a global update
                if (update.team_id && !(update.is_global === true)) {
                  const foundTeam = teamsData.find(
                    (t) => t.id === update.team_id
                  );
                  teamName = foundTeam?.name || "Team";

                  // Remove "WCS" prefix if present
                  teamName = teamName.replace(/^\s*WCS\s*/i, "").trim();
                }

                const scheduleEvent = {
                  id: update.id,
                  team_id: update.team_id, // Preserve team_id for the modal
                  event_type: "Update",
                  date_time: update.date_time,
                  end_date_time: null,
                  title: `${teamName}: ${update.title}`,
                  location: "N/A",
                  opponent: null,
                  description: update.content,
                  is_global: update.is_global || false,
                  recurring_group_id: null,
                  created_by: update.created_by,
                  created_at: update.created_at,
                  deleted_at: update.deleted_at,
                } as Schedule;

                setEvents((prev) => {
                  // If date_time was removed, remove from events
                  if (!update.date_time) {
                    return prev.filter((event) => event.id !== update.id);
                  }
                  // Otherwise, update the event
                  return prev.map((event) =>
                    event.id === update.id ? scheduleEvent : event
                  );
                });
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "team_updates" },
            (payload) => {
              setEvents((prev) =>
                prev.filter((event) => event.id !== payload.old.id)
              );
            }
          )
          .subscribe();
      }
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // First, filter out any events that have been soft deleted
      if (event.deleted_at) {
        return false;
      }

      // Then apply the existing filters
      const typeMatch = typeFilter === "all" || event.event_type === typeFilter;
      const teamMatch = teamFilter === "all" || event.team_id === teamFilter;
      return typeMatch && teamMatch;
    });
  }, [events, typeFilter, teamFilter]);

  const todayEvents = useMemo(() => {
    const today = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Chicago",
    });
    return filteredEvents.filter((event) => {
      // Additional safety check - filter out any deleted events
      if (event.deleted_at) {
        return false;
      }

      // Compare date-only strings in the same locale/timezone
      const eventDateOnly = new Date(event.date_time).toLocaleDateString(
        "en-US",
        { timeZone: "America/Chicago" }
      );
      return eventDateOnly === today;
    });
  }, [filteredEvents]);

  // Desktop now mirrors the mobile custom calendar, so no need to format for FullCalendar

  return (
    <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6" aria-label="Schedules">
        <div className="text-center mb-16">
          <h1 className="mb-8 text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter relative z-20">
            Schedules
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl font-inter">
            View all upcoming games, practices, tournaments, and team updates in one comprehensive calendar. 
            Filter by team or event type to find exactly what you&apos;re looking for.
          </p>
        </div>

        <div className="space-y-8">
            {(error || teamsError) && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-400 font-inter text-center mb-2">
                  {error || String(teamsError)}
                </p>
                <p className="text-sm text-slate-400 text-center">
                  If you&apos;re using a VPN, try switching servers or disabling
                  it temporarily. You can also try refreshing the page or
                  checking your internet connection.
                </p>
              </div>
            )}
            <section aria-label="Filters">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label
                    htmlFor="team-filter"
                    className="block text-sm font-inter text-slate-300 mb-2"
                  >
                    Filter by Team
                  </label>
                  <select
                    id="team-filter"
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="w-full mt-1 p-2 bg-white/5 text-slate-300 rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                  >
                    <option value="all">All Teams</option>
                    {teamsData.map((team: Team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="type-filter"
                    className="block text-sm font-inter text-slate-300 mb-2"
                  >
                    Filter by Type
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full mt-1 p-2 bg-white/5 text-slate-300 rounded-lg border border-white/10 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                  >
                    <option value="all">All Types</option>
                    <option value="Game">Games</option>
                    <option value="Practice">Practices</option>
                    <option value="Tournament">Tournaments</option>
                    <option value="Update">Updates</option>
                    <option value="Meeting">Meetings</option>
                  </select>
                </div>
              </div>
            </section>
            <section aria-label="Today's Events">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter mb-6">
                Today&apos;s Events
              </h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                {todayEvents.length > 0 ? (
                  <ul className="space-y-3">
                    {todayEvents.map((event) => (
                      <li
                        key={`${event.id}-${event.date_time}`}
                        className="text-slate-300 font-inter"
                      >
                        <div className="space-y-1">
                          {/* First line: Event type and team name */}
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const { bg, text } = eventTypeToColor(
                                event.event_type
                              );
                              return (
                                <span
                                  className={`${bg} ${text} font-inter uppercase font-semibold text-sm px-3 py-1 rounded-lg flex items-center justify-center`}
                                >
                                  {event.event_type}
                                </span>
                              );
                            })()}
                            <span className="text-slate-500"> | </span>
                            <span className="text-white font-medium">
                              {event.is_global || !event.team_id
                                ? "All Teams"
                                : (
                                    teamsData.find(
                                      (t) => t.id === event.team_id
                                    )?.name || "Team"
                                  )
                                    .replace(/^\s*WCS\s*/i, "")
                                    .trim()}
                            </span>
                          </div>
                          {/* Second line: Date/time and location */}
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <span>
                              {new Date(event.date_time).toLocaleString(
                                "en-US",
                                {
                                  timeZone: "America/Chicago",
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </span>
                            <span className="text-slate-600"> | </span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 font-inter">No events today.</p>
                )}
              </div>
            </section>
            <section aria-label="Schedules Calendar">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter mb-6">
                  Team Schedules
                </h2>
                {/* Mobile calendar */}
                <div className="block md:hidden">
                  <MobileMonth
                    events={filteredEvents}
                    teams={teamsData}
                    onSelectEvent={setSelectedEvent}
                    maxVisiblePerDay={3}
                  />
                </div>
                {/* Desktop calendar mirrors mobile style */}
                <div className="hidden md:block">
                  <MobileMonth
                    events={filteredEvents}
                    teams={teamsData}
                    onSelectEvent={setSelectedEvent}
                    maxVisiblePerDay={3}
                  />
                </div>
              </div>
            </section>
          </div>
      </section>

      {/* Ad Section - Above Footer */}
      <div className="mt-16 md:mt-24">
        <AdSection />
      </div>

      <EventDetailsModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        teams={teamsData}
        onClose={() => setSelectedEvent(null)}
      />
    </main>
  );
}
