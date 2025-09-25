// src/app/schedules/page.tsx
"use client";
// Removed unused imports: fetchSchedulesByTeamId, fetchTeamById
import { Team, Schedule } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
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
        const { data: schedules } = await supabase
          .from("schedules")
          .select("*");
        const { data: teamsData } = await supabase
          .from("teams")
          .select(
            "id, name, age_group, gender, grade_level, logo_url, season, coach_names, video_url, team_image"
          );
        setEvents(schedules || []);
        setTeams(
          (teamsData || []).map((team) => ({
            ...team,
            coach_names: team.coach_names || [],
            video_url: team.video_url || null,
            team_image: team.team_image || null,
          }))
        );
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

  const formattedEvents = filteredEvents.map((event) => ({
    id: event.id,
    title: event.event_type,
    start: event.date_time,
    backgroundColor:
      event.event_type === "Game"
        ? "#15803D"
        : event.event_type === "Practice"
        ? "#D91E18"
        : event.event_type === "Tournament"
        ? "#6B21A8"
        : "#F59E0B",
    extendedProps: { location: event.location },
  }));

  return (
    <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-bebas mb-8 text-center"
          aria-label="Schedules Page"
        >
          Schedules
        </h1>
        {error && (
          <div className="mb-8 p-4 bg-gray-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red font-inter">{error}</p>
          </div>
        )}
        <section className="mb-8" aria-label="Schedule Filter">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event-type"
                className="text-white font-inter text-sm mb-2 block"
              >
                Event Type
              </label>
              <select
                id="event-type"
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setTypeFilter(e.target.value)
                }
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="all">All Types</option>
                <option value="Game">Game</option>
                <option value="Practice">Practice</option>
                <option value="Tournament">Tournament</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="team"
                className="text-white font-inter text-sm mb-2 block"
              >
                Team
              </label>
              <select
                id="team"
                value={teamFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setTeamFilter(e.target.value)
                }
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="all">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <section className="mb-8" aria-label="Today’s Events">
          <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4">
            <h2 className="text-2xl font-bebas mb-4">Today’s Events</h2>
            {todayEvents.length > 0 ? (
              <ul className="space-y-4">
                {todayEvents.map((event) => (
                  <li key={event.id} className="text-gray-300 font-inter">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            event.event_type === "Game"
                              ? "#15803D"
                              : event.event_type === "Practice"
                              ? "#D91E18"
                              : event.event_type === "Tournament"
                              ? "#6B21A8"
                              : "#F59E0B",
                        }}
                      />
                      <div>
                        <p className="font-semibold">{event.event_type}</p>
                        <p>
                          {new Date(event.date_time).toLocaleString("en-US", {
                            timeZone: "America/Chicago",
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                        <p>{event.location}</p>
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
        <section className="mb-12" aria-label="Schedules Calendar">
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
                  Time:{" "}
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
