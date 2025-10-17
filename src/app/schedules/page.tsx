// src/app/schedules/page.tsx
"use client";
import React from "react";
import { Team, Schedule, TeamUpdate } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTeams } from "@/hooks/useTeams";
import { shouldUseRealtime } from "@/lib/networkUtils";

import MobileMonth from "@/components/calendar/MobileMonth";
import EventDetailsModal from "@/components/calendar/EventDetailsModal";
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
        const response = await fetch("/api/schedules");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch schedules");
        }

        const data = await response.json();
        setEvents(data.events as Schedule[]);

        // Clear any previous errors on successful fetch
        setError(null);
      } catch (err) {
        console.error("Failed to load schedules:", err);
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
              setEvents((prev) =>
                prev.map((event) =>
                  event.id === payload.new.id ? (payload.new as Schedule) : event
                )
              );
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
                const scheduleEvent = {
                  id: update.id,
                  event_type: "Update",
                  date_time: update.date_time,
                  title: update.title,
                  location: "N/A",
                  opponent: null,
                  description: update.content,
                  is_global: update.is_global || false,
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
              const scheduleEvent = {
                id: update.id,
                event_type: "Update",
                date_time: update.date_time,
                title: update.title,
                location: "N/A",
                opponent: null,
                description: update.content,
                is_global: update.is_global || false,
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
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Schedules">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
              Schedules
            </h1>
            {(error || teamsError) && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-400 font-inter text-center mb-2">
                  {error || String(teamsError)}
                </p>
                <p className="text-sm text-gray-300 text-center">
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
                    className="block text-sm font-inter"
                  >
                    Filter by Team
                  </label>
                  <select
                    id="team-filter"
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
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
                    className="block text-sm font-inter"
                  >
                    Filter by Type
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
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
              <h2 className="text-2xl font-bebas mb-4">Today&apos;s Events</h2>
              <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 mb-8">
                {todayEvents.length > 0 ? (
                  <ul className="space-y-2">
                    {todayEvents.map((event) => (
                      <li
                        key={`${event.id}-${event.date_time}`}
                        className="text-gray-300 font-inter"
                      >
                        <div className="space-y-1">
                          {/* First line: Event type and team name */}
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const { bg } = eventTypeToColor(event.event_type);
                              return (
                                <span
                                  className={`${bg} text-white font-bebas uppercase font-bold text-lg px-3 py-1 rounded-md`}
                                >
                                  {event.event_type}
                                </span>
                              );
                            })()}
                            <span> | </span>
                            <span className="text-white">
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
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
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
                            <span> | </span>
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-300 font-inter">No events today.</p>
                )}
              </div>
            </section>
            <section aria-label="Schedules Calendar">
              <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4">
                <h2 className="text-2xl font-bebas mb-4">Team Schedules</h2>
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
        </div>
      </section>
      <EventDetailsModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        teams={teamsData}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
