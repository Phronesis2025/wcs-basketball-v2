// src/app/schedules/page.tsx
"use client";
import React from "react";
import { Team, Schedule, TeamUpdate } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { fetchTeams } from "@/lib/actions";
import { supabase } from "@/lib/supabaseClient";

export default function SchedulesPage() {
  const [events, setEvents] = useState<Schedule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch schedules
        const { data: schedules } = await supabase
          .from("schedules")
          .select("*")
          .is("deleted_at", null); // Filter soft-deleted

        // Fetch updates with date_time
        const { data: updates } = await supabase
          .from("team_updates")
          .select("*")
          .not("date_time", "is", null)
          .is("deleted_at", null);

        const teamsData = await fetchTeams();

        // Combine schedules and updates, converting updates to schedule format
        const allEvents = [
          ...(schedules || []),
          ...(updates || []).map((update) => ({
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
          })),
        ];

        setEvents(allEvents);
        setTeams(teamsData);
      } catch (err) {
        Sentry.captureException(err);
        setError("Failed to load schedules or teams");
      }
    };
    fetchData();

    const channel = supabase
      .channel("schedules")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "schedules" },
        (payload) => {
          setEvents((prev) => [...prev, payload.new as Schedule]);
        }
      )
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
            };
            setEvents((prev) => [...prev, scheduleEvent as Schedule]);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
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
      const eventDate = new Date(event.date_time).toLocaleDateString("en-US", {
        timeZone: "America/Chicago",
      });
      return eventDate === today;
    });
  }, [filteredEvents]);

  const formattedEvents = filteredEvents.map((event) => {
    const startDate = new Date(event.date_time); // treat as local timestamp
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour duration
    return {
      id: event.id,
      title: event.event_type === "Update" ? event.title : event.event_type,
      start: startDate, // pass Date object (local)
      end: endDate,
      allDay: false,
      backgroundColor:
        event.event_type === "Game"
          ? "#15803D"
          : event.event_type === "Practice"
          ? "#D91E18"
          : event.event_type === "Tournament"
          ? "#6B21A8"
          : event.event_type === "Update"
          ? "#3B82F6"
          : "#F59E0B",
      extendedProps: {
        location: event.location,
        opponent: event.opponent,
        description: event.description,
        eventType: event.event_type,
      },
    };
  });

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-20 sm:pt-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bebas uppercase">Schedules</h1>
        {error && <p className="text-red font-inter text-center">{error}</p>}
        <section aria-label="Filters">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label htmlFor="team-filter" className="block text-sm font-inter">
                Filter by Team
              </label>
              <select
                id="team-filter"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
              >
                <option value="all">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type-filter" className="block text-sm font-inter">
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
                  <li key={event.id} className="text-gray-300 font-inter">
                    <div className="flex items-center space-x-2">
                      <span className="text-red font-bebas uppercase">
                        {event.event_type}
                      </span>
                      <span> | </span>
                      <span>
                        {new Date(event.date_time).toLocaleString("en-US", {
                          timeZone: "America/Chicago",
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                      <span> | </span>
                      <span>{event.location}</span>
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
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,listWeek",
              }}
              events={formattedEvents}
              eventContent={(info) => (
                <div className="p-1">
                  <p className="text-white font-inter text-sm">
                    {info.event.title}
                  </p>
                  <p className="text-gray-300 font-inter text-xs">
                    {info.event.extendedProps.location}
                  </p>
                </div>
              )}
              eventClick={(info) =>
                setSelectedEvent(
                  events.find((e) => e.id === info.event.id) || null
                )
              }
              height="auto"
              views={{
                listWeek: {
                  eventTimeFormat: {
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                  },
                },
                dayGridMonth: {
                  eventTimeFormat: {
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                  },
                },
              }}
              eventClassNames="border-none cursor-pointer"
            />
          </div>
        </section>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-red-500/50 rounded-lg p-4 max-w-lg w-full">
              <h2 className="text-2xl font-bebas text-white mb-4">
                {selectedEvent.event_type}
              </h2>
              <div className="space-y-2">
                <p className="text-gray-300 font-inter">
                  Time:
                  {new Date(selectedEvent.date_time).toLocaleString("en-US", {
                    timeZone: "America/Chicago",
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-gray-300 font-inter">
                  Location: {selectedEvent.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-700 text-white font-inter rounded p-2 mt-4 w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
