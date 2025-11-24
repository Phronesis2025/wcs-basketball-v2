"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { ref: titleRef, inView: titleInView } = useInView({ triggerOnce: true, threshold: 0.1 });

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

  // Check scroll position and update arrow visibility
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll handler
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Check if arrows should be shown based on number of events and screen size
  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [todayEvents]);

  // Show minimal loading state instead of returning null
  if (isLoading) {
    return (
      <section
        className="bg-black py-1 w-full"
        aria-label="Today's Events"
      >
        <div className="w-full">
          <div className="bg-[#0A0A0A] w-full">
            <div className="flex overflow-x-auto scrollbar-hide h-[80px] items-center justify-center">
              <div className="text-neutral-500 text-xs font-inter">Loading events...</div>
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
      className="pt-8 md:pt-12 pb-2 px-6 bg-black"
      aria-label="Today's Events"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h2
          ref={titleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-8 md:mb-12 font-inter"
        >
          Today's Events
        </motion.h2>
      </div>
      <div className="w-full bg-black py-2 relative z-40">
        {/* Horizontal Scroll Container */}
        <div className="bg-[#0A0A0A] w-full relative">
          <div className="flex h-[80px]">
            {/* Date Column - Fixed on Left (Not Scrollable) */}
            <div className="flex-shrink-0 w-16 sm:w-20 px-2 py-1 flex flex-col items-center justify-center border-r border-white/10 bg-[#0A0A0A] z-10">
              <div className="text-center">
                <div className="text-white font-bold text-xs uppercase leading-tight font-inter">
                  {dateInfo.dayAbbrev}
                </div>
                <div className="text-neutral-400 font-normal text-[10px] uppercase leading-tight font-inter">
                  {dateInfo.monthDay}
                </div>
              </div>
            </div>

            {/* Events Cards - Horizontal Scroll Only */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-x-auto scrollbar-hide"
            >
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
                    className="flex-shrink-0 w-48 md:w-52 lg:w-64 bg-[#030303] rounded-lg border border-white/10 p-1.5 md:p-2.5 lg:p-3 flex gap-1.5 md:gap-2.5 lg:gap-3 hover:border-white/20 transition-colors"
                  >
                    {/* Large Logo on Left - Centered horizontally */}
                    <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-white/5 rounded-lg self-center relative overflow-hidden">
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40 pointer-events-none z-10"></div>
                      {logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={`${teamName} logo`}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain relative z-0"
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
                          className="w-full h-full object-contain relative z-0"
                          sizes="(max-width: 768px) 48px, (max-width: 1024px) 56px, 64px"
                        />
                      )}
                    </div>

                    {/* Event Details on Right */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      {/* Top Row: Time (left) and Event Type Badge (right) */}
                      <div className="flex items-center justify-between mb-0.5 md:mb-1">
                        <div className="text-white font-normal text-xs md:text-sm font-inter">
                          {time}
                        </div>
                        <span className={`inline-block ${bg} ${text} font-medium text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded uppercase flex-shrink-0 font-inter`}>
                          {eventType}
                        </span>
                      </div>

                      {/* Second Row: Team Name with Opponent (truncate if too long) */}
                      <div className="mb-0.5 md:mb-1">
                        <div className="text-white font-bold text-xs md:text-sm font-inter truncate">
                          {event.opponent && event.event_type === "Game" ? (
                            <>
                              {teamName} vs {event.opponent}
                            </>
                          ) : (
                            teamName
                          )}
                        </div>
                      </div>

                      {/* Third Row: Location */}
                      {event.location && event.location !== "N/A" && (
                        <div className="text-neutral-400 text-[10px] md:text-xs font-inter truncate">
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Navigation Arrows */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="hidden md:flex absolute left-20 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition-all z-20"
                aria-label="Scroll left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-white/10 hover:bg-white/20 rounded-full border border-white/20 text-white transition-all z-20"
                aria-label="Scroll right"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

