"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Schedule, Team } from "@/types/supabase";
import { devError, devLog } from "@/lib/security";
import { eventTypeToColor } from "@/lib/calendarColors";

interface TodaysEventsProps {
  maxEvents?: number; // Default: 5
  showViewAllLink?: boolean; // Default: true
}

export default function TodaysEvents({
  maxEvents = 10, // Increased for horizontal scroll
  showViewAllLink = true,
}: TodaysEventsProps) {
  const [events, setEvents] = useState<Schedule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events and teams
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    const fetchData = async (attempt = 1) => {
      try {
        setIsLoading(true);
        setError(null);

        // Use a timestamp to bust any potential cache
        const timestamp = Date.now();
        const [eventsResponse, teamsResponse] = await Promise.all([
          fetch(`/api/schedules?t=${timestamp}`, { 
            cache: "no-store",
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            }
          }),
          fetch(`/api/teams?t=${timestamp}`, { 
            cache: "no-store",
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            }
          }),
        ]);

        if (!eventsResponse.ok) {
          throw new Error(`Failed to fetch schedules: ${eventsResponse.status}`);
        }

        const { extractApiResponseData } = await import("@/lib/errorHandler");
        const eventsData = await extractApiResponseData(eventsResponse);
        const teamsData = await extractApiResponseData(teamsResponse);

        if (!isMounted) return;

        // Ensure we have valid data - handle both {events: [...]} and [...] formats
        let eventsList = [];
        if (eventsData?.events) {
          eventsList = eventsData.events;
        } else if (Array.isArray(eventsData)) {
          eventsList = eventsData;
        } else if (eventsData && typeof eventsData === 'object') {
          // Try to find events array in response
          eventsList = Object.values(eventsData).find(val => Array.isArray(val)) || [];
        }
        
        const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData?.teams || teamsData || []);

        devLog(`TodaysEvents: Fetched ${eventsList.length} events and ${teamsList.length} teams`);
        setEvents(eventsList);
        setTeams(teamsList);
      } catch (err) {
        devError("Error fetching today's events:", err);
        
        // Retry logic - only retry on network errors or 5xx errors
        if (isMounted && retryCount < MAX_RETRIES && attempt < MAX_RETRIES) {
          retryCount++;
          const delay = attempt * 1000; // Exponential backoff: 1s, 2s
          devLog(`TodaysEvents: Retrying fetch (attempt ${attempt + 1}/${MAX_RETRIES}) in ${delay}ms...`);
          setTimeout(() => {
            if (isMounted) {
              fetchData(attempt + 1);
            }
          }, delay);
          return;
        }

        if (isMounted) {
          setError("Failed to load today's events");
          setEvents([]);
          setTeams([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch immediately on mount - no delay needed
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and format today's events
  const todayEvents = useMemo(() => {
    // Get today's date in America/Chicago timezone
    const today = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Chicago",
    });

    // Filter events for today
    const filtered = events.filter((event) => {
      // Filter out deleted events
      if (event.deleted_at) {
        return false;
      }

      // Only include Game, Practice, and Tournament events (exclude Update and Meeting)
      if (
        event.event_type !== "Game" &&
        event.event_type !== "Practice" &&
        event.event_type !== "Tournament"
      ) {
        return false;
      }

      // Compare date-only strings in the same locale/timezone
      const eventDateOnly = new Date(event.date_time).toLocaleDateString(
        "en-US",
        { timeZone: "America/Chicago" }
      );

      return eventDateOnly === today;
    });

    // Sort by time (ascending)
    const sorted = filtered.sort((a, b) => {
      return (
        new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      );
    });

    // Limit to maxEvents
    return sorted.slice(0, maxEvents);
  }, [events, maxEvents]);

  // Helper function to get team
  const getTeam = (event: Schedule): Team | null => {
    if (event.is_global || !event.team_id) {
      return null;
    }
    return teams.find((t) => t.id === event.team_id) || null;
  };

  // Helper function to get team name
  const getTeamName = (event: Schedule): string => {
    if (event.is_global || !event.team_id) {
      return "All Teams";
    }

    const team = teams.find((t) => t.id === event.team_id);
    if (!team) {
      return "Team";
    }

    // Remove "WCS" prefix if present (match existing pattern)
    return team.name.replace(/^\s*WCS\s*/i, "").trim();
  };

  // Helper function to format time
  const formatTime = (dateTime: string): string => {
    try {
      return new Date(dateTime).toLocaleTimeString("en-US", {
        timeZone: "America/Chicago",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  // Helper function to format date
  const formatDate = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      const dayAbbrev = date.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "America/Chicago",
      });
      const monthDay = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "America/Chicago",
      });
      return { dayAbbrev, monthDay };
    } catch {
      return { dayAbbrev: "", monthDay: "" };
    }
  };

  // Show minimal loading state instead of returning null
  if (isLoading) {
    return (
      <section
        className="bg-gray-100 py-1 w-full"
        aria-label="Today's Events"
      >
        <div className="w-full">
          <div className="bg-gray-100 border-t border-gray-300 w-full">
            <div className="flex overflow-x-auto scrollbar-hide h-[80px] items-center justify-center">
              <div className="text-gray-500 text-xs">Loading events...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    // Log error for debugging but don't break homepage
    devLog("TodaysEvents error:", error);
    return null; // Silent fail - don't break homepage
  }

  // Don't render section if no events (clean UI)
  if (todayEvents.length === 0) {
    return null;
  }

  // Get date info from first event (all events are today)
  const dateInfo = todayEvents.length > 0 
    ? formatDate(todayEvents[0].date_time)
    : { dayAbbrev: "", monthDay: "" };

  return (
    <section
      className="bg-gray-100 py-1 w-full relative z-40"
      aria-label="Today's Events"
    >
      <div className="w-full">
        {/* Horizontal Scroll Container */}
        <div className="bg-gray-100 border-t border-gray-300 w-full relative">
          <div className="flex h-[80px]">
            {/* Date Column - Fixed on Left (Not Scrollable) */}
            <div className="flex-shrink-0 w-16 sm:w-20 px-2 py-1 flex flex-col items-center justify-center border-r border-gray-300 bg-gray-100 z-10">
              <div className="text-center">
                <div className="text-gray-700 font-bold text-xs uppercase leading-tight">
                  {dateInfo.dayAbbrev}
                </div>
                <div className="text-gray-700 font-normal text-[10px] uppercase leading-tight">
                  {dateInfo.monthDay}
                </div>
              </div>
            </div>

            {/* Events Cards - Horizontal Scroll Only */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 md:gap-2 px-1.5 md:px-2 h-full items-center">
              {todayEvents.map((event) => {
                const team = getTeam(event);
                const teamName = getTeamName(event);
                const time = formatTime(event.date_time);
                const eventType = event.event_type;

                const { bg, text } = eventTypeToColor(eventType);
                // Use team's actual logo from database, only fallback if missing
                const logoUrl = team?.logo_url || null;

                return (
                  <div
                    key={`${event.id}-${event.date_time}`}
                    className="flex-shrink-0 w-48 md:w-52 lg:w-64 bg-white rounded border border-gray-200 p-1.5 md:p-2.5 lg:p-3 flex gap-1.5 md:gap-2.5 lg:gap-3"
                  >
                    {/* Large Logo on Left */}
                    <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center">
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={`${teamName} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                          sizes="(max-width: 768px) 48px, (max-width: 1024px) 56px, 64px"
                          onError={(e) => {
                            // Only fallback if image fails to load
                            e.currentTarget.src = "/logos/logo2.png";
                          }}
                        />
                      ) : (
                        <Image
                          src="/logos/logo2.png"
                          alt={`${teamName} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                          sizes="(max-width: 768px) 48px, (max-width: 1024px) 56px, 64px"
                        />
                      )}
                    </div>

                    {/* Event Details on Right */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      {/* Time and Location - Stacked vertically */}
                      <div className="mb-0.5 md:mb-1">
                        <div className="text-gray-800 font-bold text-xs md:text-sm">
                          {time} CT
                        </div>
                        {event.location && event.location !== "N/A" && (
                          <div className="text-gray-600 text-[10px] md:text-xs mt-0.5">
                            {event.location}
                          </div>
                        )}
                      </div>

                      {/* Event Type Badge and Team Name - Horizontal layout */}
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className={`inline-block ${bg} ${text} font-bold text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 rounded uppercase flex-shrink-0`}>
                          {eventType}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-800 font-bold text-xs md:text-sm truncate">
                            {event.opponent && event.event_type === "Game" ? (
                              <>
                                {teamName} vs {event.opponent}
                              </>
                            ) : (
                              teamName
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

