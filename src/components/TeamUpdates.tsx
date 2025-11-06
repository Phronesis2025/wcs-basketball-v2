// src/components/TeamUpdates.tsx
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, Variants, PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Team, TeamUpdate } from "../types/supabase";
import { sanitizeInput, devError } from "../lib/security";
import { useInView } from "react-intersection-observer";
import { useScrollLock } from "@/hooks/useScrollLock";

interface TeamUpdatesProps {
  team?: Team;
  updates?: TeamUpdate[];
  maxUpdates?: number; // Limit number of updates to show
  disableSwiping?: boolean; // Disable swiping functionality (deprecated, use variant instead)
  showViewMoreText?: boolean; // Show "view your teams page for more updates" text
  variant?: "compact-list" | "carousel"; // New prop for layout variant
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  }
  const months = Math.floor(diffInSeconds / 2592000);
  return `${months}mo ago`;
}

// Helper function to truncate content for dek/summary
function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
}

export default function TeamUpdates({
  team,
  updates,
  maxUpdates,
  disableSwiping = false,
  showViewMoreText = false,
  variant = "carousel", // Default to carousel for backward compatibility
}: TeamUpdatesProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<TeamUpdate | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lock scroll when modal is open
  useScrollLock(!!selectedUpdate);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fetchedUpdates, setFetchedUpdates] = useState<TeamUpdate[]>([]);
  const [fetchedTeams, setFetchedTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px",
  });

  // Determine actual variant (backward compatibility: if disableSwiping is true and variant is carousel, use compact-list)
  const actualVariant = variant === "compact-list" || (variant === "carousel" && disableSwiping) ? "compact-list" : "carousel";

  // Use provided updates or fetch them, and limit the number if specified
  const allUpdates = updates || fetchedUpdates;
  const displayUpdates = maxUpdates
    ? allUpdates.slice(0, maxUpdates)
    : allUpdates;
  const displayTeams = team ? [team] : fetchedTeams;

  // Create a map of team IDs to team objects for quick lookup
  const teamsMap = new Map(displayTeams.map((t) => [t.id, t]));

  // Fetch updates and teams if not provided
  useEffect(() => {
    if (!updates && !isLoading && fetchedUpdates.length === 0) {
      setIsLoading(true);
      Promise.all([
        fetch("/api/team-updates").then((res) => res.json()),
        fetch("/api/teams").then((res) => res.json()),
      ])
        .then(([updatesData, teamsData]) => {
          setFetchedUpdates(updatesData);
          setFetchedTeams(teamsData);
        })
        .catch((error) => {
          devError("Error fetching data:", error);
          setFetchedUpdates([]);
          setFetchedTeams([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [updates, isLoading, fetchedUpdates.length]);

  // Calculate how many cards to show based on screen size and swiping setting (for carousel only)
  const getCardsToShow = useCallback(() => {
    if (actualVariant === "compact-list") return 0; // Not used in compact-list
    if (typeof window === "undefined") return disableSwiping ? 1 : 3; // SSR fallback
    if (disableSwiping) {
      return window.innerWidth >= 1024 ? 3 : 1; // Desktop: 3, Mobile: 1
    }
    if (window.innerWidth >= 1024) return 3; // Desktop: lg breakpoint
    if (window.innerWidth >= 768) return 2; // Tablet: md breakpoint
    return 1; // Mobile: default
  }, [disableSwiping, actualVariant]);

  const [cardsToShow, setCardsToShow] = useState(disableSwiping ? 1 : 3); // Default based on swiping setting

  // Calculate maxIndex early (for carousel only)
  const maxIndex = Math.max(0, (displayUpdates?.length || 0) - cardsToShow);

  // Update cards to show on resize and track container width (for carousel only)
  useEffect(() => {
    if (actualVariant === "compact-list") return; // Not needed for compact-list
    if (!inView) return; // Defer work until visible
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setCardsToShow(getCardsToShow());
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      };

      // Initialize on mount
      handleResize();

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [inView, disableSwiping, getCardsToShow, actualVariant]);

  // Keyboard navigation (for carousel only)
  useEffect(() => {
    if (actualVariant === "compact-list") return; // Not needed for compact-list
    if (!inView || disableSwiping) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!displayUpdates || displayUpdates.length <= cardsToShow) return;

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (event.key === "ArrowRight" && currentIndex < maxIndex) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentIndex,
    maxIndex,
    displayUpdates,
    cardsToShow,
    inView,
    disableSwiping,
    actualVariant,
  ]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!inView) return;
    if (selectedUpdate) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedUpdate, inView]);

  const handleDragEnd = (event: unknown, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 75; // Increased threshold for more intentional swipes

    if (info.offset.x > threshold && currentIndex > 0) {
      // Swipe right - go to previous
      setCurrentIndex(currentIndex - 1);
    } else if (info.offset.x < -threshold && currentIndex < maxIndex) {
      // Swipe left - go to next
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Calculate the translateX value in pixels for smooth one-card-at-a-time movement (for carousel only)
  const getTranslateX = () => {
    if (containerWidth === 0) return 0;
    const cardWidthPx = containerWidth / cardsToShow; // exact pixel width per visible card
    return -currentIndex * cardWidthPx;
  };

  // Calculate drag constraints based on available content (for carousel only)
  const getDragConstraints = () => {
    if (containerWidth === 0) return { left: 0, right: 0 };
    const maxTranslate = Math.max(
      0,
      (displayUpdates.length - cardsToShow) * (containerWidth / cardsToShow)
    );
    return { left: -maxTranslate, right: 0 };
  };

  // Render compact list variant (NBA.com style)
  if (actualVariant === "compact-list") {
    return (
      <section
        ref={sectionRef}
        aria-labelledby="team-updates-title"
        className="bg-[#F6F6F6] mt-8 mb-12 pt-6 sm:pt-8 pb-12 sm:pb-16 mx-4 sm:mx-6 lg:mx-8"
      >
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="team-updates-title"
            className="text-3xl sm:text-4xl font-bebas text-center text-navy mb-6 sm:mb-8"
          >
            Around the WCS
          </h2>
          <div className="bg-white border border-slate-400 rounded-lg p-6 sm:p-8" style={{ borderWidth: '1px' }}>
          {isLoading ? (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-700 font-inter">Loading updates…</p>
            </div>
          ) : displayUpdates && displayUpdates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayUpdates.map((update, index) => {
                const updateTeam = update.team_id
                  ? teamsMap.get(update.team_id)
                  : null;
                const teamName =
                  updateTeam?.name || (update.is_global ? "All Teams" : "Program");
                const relativeTime = formatRelativeTime(update.created_at);
                const truncatedContent = truncateContent(update.content);

                return (
                  <Link
                    key={update.id}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedUpdate(update);
                    }}
                    className={`flex gap-3 pb-6 border-b border-gray-600/30 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-navy rounded ${
                      index < displayUpdates.length - 1 ? "" : "border-b-0"
                    } ${
                      // On desktop, add bottom border if not in last row of each column
                      index < displayUpdates.length - 2 ? "md:border-b md:border-gray-600/30" : "md:border-b-0"
                    }`}
                    aria-label={`Read update: ${update.title}`}
                  >
                    {/* Thumbnail */}
                    {update.image_url ? (
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded overflow-hidden bg-gray-800">
                        <Image
                          src={update.image_url}
                          alt={update.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          sizes="(max-width: 640px) 64px, 80px"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Headline */}
                      <h3 className="font-inter font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
                        {sanitizeInput(update.title)}
                      </h3>

                      {/* Dek/Summary */}
                      <p className="text-gray-700 font-inter text-sm mb-2 line-clamp-2 leading-snug">
                        {sanitizeInput(truncatedContent)}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-inter">
                        <span>{teamName}</span>
                        <span>•</span>
                        <span>{relativeTime}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-700 font-inter">No updates available</p>
            </div>
          )}
          </div>
        </div>

        {/* Modal for viewing full update (same as carousel) */}
        {selectedUpdate && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center p-4 z-[9999]"
            role="dialog"
            aria-labelledby="modal-title"
            onClick={() => setSelectedUpdate(null)}
          >
            <motion.div
              className="bg-black border border-red-500/50 rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0">
                <h3 className="text-red-600 font-bebas uppercase text-base">
                  {selectedUpdate?.team_id
                    ? teamsMap.get(selectedUpdate.team_id)?.name ||
                      (selectedUpdate.is_global ? "All Teams" : "Program")
                    : "Program"}{" "}
                  News
                </h3>
                <h2
                  id="modal-title"
                  className="text-2xl font-bebas mt-2 text-white"
                >
                  {sanitizeInput(selectedUpdate.title)}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto mt-4">
                <p className="text-gray-300 font-inter leading-relaxed">
                  {sanitizeInput(selectedUpdate.content)}
                </p>
                {selectedUpdate.image_url && (
                  <Image
                    src={selectedUpdate.image_url}
                    alt={selectedUpdate.title}
                    width={400}
                    height={320}
                    className="w-full h-auto max-h-64 sm:max-h-80 object-contain rounded-md mt-4"
                    sizes="100vw"
                  />
                )}
              </div>

              <div className="flex-shrink-0 mt-4">
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="w-full bg-red text-white font-bebas uppercase py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  aria-label="Close modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </section>
    );
  }

  // Render carousel variant (original implementation)
  return (
    <section
      ref={sectionRef}
      aria-label="All Team Updates"
      className="bg-[#F6F6F6] mt-8 mb-12 py-12 sm:py-16 mx-4 sm:mx-6 lg:mx-8 space-y-4"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bebas uppercase text-center text-navy">
          All Team Updates
        </h2>
        {isLoading ? (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
            <p className="text-gray-700 font-inter">Loading updates…</p>
          </div>
        ) : displayUpdates && displayUpdates.length > 0 ? (
          <div className="relative overflow-hidden group">
            {/* Left Arrow */}
            {!disableSwiping &&
              displayUpdates &&
              displayUpdates.length > cardsToShow &&
              currentIndex > 0 && (
                <button
                  onClick={() => {
                    const newIndex = Math.max(0, currentIndex - 1);
                    setCurrentIndex(newIndex);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Previous updates"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

            {/* Right Arrow */}
            {!disableSwiping &&
              displayUpdates &&
              displayUpdates.length > cardsToShow &&
              currentIndex < maxIndex && (
                <button
                  onClick={() => {
                    const newIndex = Math.min(maxIndex, currentIndex + 1);
                    setCurrentIndex(newIndex);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Next updates"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

            <motion.div
              ref={containerRef}
              className={`flex ${
                disableSwiping
                  ? "cursor-default"
                  : "cursor-grab active:cursor-grabbing"
              }`}
              drag={disableSwiping ? false : "x"}
              dragConstraints={
                disableSwiping ? { left: 0, right: 0 } : getDragConstraints()
              }
              dragElastic={0.1}
              onDragStart={disableSwiping ? undefined : handleDragStart}
              onDragEnd={disableSwiping ? undefined : handleDragEnd}
              animate={{ x: disableSwiping ? 0 : getTranslateX() }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35,
                mass: 0.8,
              }}
            >
              {displayUpdates.map((update) => {
                const updateTeam = update.team_id
                  ? teamsMap.get(update.team_id)
                  : null;
                const teamName =
                  updateTeam?.name || (update.is_global ? "All Teams" : "Team");

                return (
                  <div
                    key={update.id}
                    className={`flex-shrink-0 ${
                      cardsToShow === 3
                        ? "w-1/3"
                        : cardsToShow === 2
                        ? "w-1/2"
                        : "w-full"
                    } p-3 box-border`}
                  >
                    <div
                      className="bg-gray-900/50 border border-red-500/50 rounded-lg shadow-sm h-[28rem] flex flex-col w-full mb-8 overflow-hidden"
                      role="group"
                      aria-label={`${teamName} update card`}
                    >
                      {/* Header Section */}
                      <div className="flex-shrink-0 p-4 pb-2">
                        <h4 className="text-red-600 font-bebas uppercase text-sm border-b border-red-500/50 pb-1">
                          {teamName} News
                        </h4>
                      </div>

                      {/* Image Section - Takes remaining space */}
                      <div className="flex-1 relative">
                        {update.image_url ? (
                          <div className="relative w-full h-full overflow-hidden">
                            <Image
                              src={update.image_url}
                              alt={update.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        ) : updateTeam?.logo_url ? (
                          <div className="relative w-full h-full overflow-hidden bg-gray-800/50">
                            <Image
                              src={updateTeam?.logo_url || "/logos/logo2.png"}
                              alt={`${teamName} logo`}
                              fill
                              className="object-contain p-4"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-800/50 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Section - Bottom of card */}
                      <div className="flex-shrink-0 p-4 pt-2">
                        <h3 className="text-lg font-bebas text-white line-clamp-1 leading-tight overflow-hidden mb-2">
                          {sanitizeInput(update.title)}
                        </h3>
                        <p
                          className="text-gray-300 font-inter leading-tight text-sm overflow-hidden mb-3"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: "1.2em",
                            maxHeight: "2.4em",
                          }}
                        >
                          {sanitizeInput(update.content)}
                        </p>

                        {/* Button Section */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isDragging) {
                              setSelectedUpdate(update);
                            }
                          }}
                          className="w-full bg-red text-white font-bebas uppercase py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
                          aria-label={`Read more about ${update.title}`}
                          type="button"
                        >
                          Read more
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
            <p className="text-gray-700 font-inter">No updates available</p>
          </div>
        )}
        {selectedUpdate && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center p-4 z-[9999]"
            role="dialog"
            aria-labelledby="modal-title"
            onClick={() => setSelectedUpdate(null)}
          >
            <motion.div
              className="bg-black border border-red-500/50 rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0">
                <h3 className="text-red-600 font-bebas uppercase text-base">
                  {selectedUpdate?.team_id
                    ? teamsMap.get(selectedUpdate.team_id)?.name ||
                      (selectedUpdate.is_global ? "All Teams" : "Team")
                    : "Team"}{" "}
                  News
                </h3>
                <h2
                  id="modal-title"
                  className="text-2xl font-bebas mt-2 text-white"
                >
                  {sanitizeInput(selectedUpdate.title)}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto mt-4">
                <p className="text-gray-300 font-inter leading-relaxed">
                  {sanitizeInput(selectedUpdate.content)}
                </p>
                {selectedUpdate.image_url && (
                  <Image
                    src={selectedUpdate.image_url}
                    alt={selectedUpdate.title}
                    width={400}
                    height={320}
                    className="w-full h-auto max-h-64 sm:max-h-80 object-contain rounded-md mt-4"
                    sizes="100vw"
                  />
                )}
              </div>

              <div className="flex-shrink-0 mt-4">
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="w-full bg-red text-white font-bebas uppercase py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  aria-label="Close modal"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
