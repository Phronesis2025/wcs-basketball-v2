// src/components/TeamUpdates.tsx
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, Variants, PanInfo } from "framer-motion";
import Image from "next/image";
import { Team, TeamUpdate } from "../types/supabase";
import { sanitizeInput, devError } from "../lib/security";
import { useInView } from "react-intersection-observer";
// Remove server action import - we'll use API route instead

interface TeamUpdatesProps {
  team?: Team;
  updates?: TeamUpdate[];
  maxUpdates?: number; // Limit number of updates to show
  disableSwiping?: boolean; // Disable swiping functionality
  showViewMoreText?: boolean; // Show "view your teams page for more updates" text
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function TeamUpdates({
  team,
  updates,
  maxUpdates,
  disableSwiping = false,
  showViewMoreText = false,
}: TeamUpdatesProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<TeamUpdate | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    if (!updates && inView && !isLoading && fetchedUpdates.length === 0) {
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
  }, [updates, inView, isLoading, fetchedUpdates.length]);

  // Calculate how many cards to show based on screen size and swiping setting
  const getCardsToShow = useCallback(() => {
    if (typeof window === "undefined") return disableSwiping ? 1 : 3; // SSR fallback
    if (disableSwiping) {
      return window.innerWidth >= 1024 ? 3 : 1; // Desktop: 3, Mobile: 1
    }
    if (window.innerWidth >= 1024) return 3; // Desktop: lg breakpoint
    if (window.innerWidth >= 768) return 2; // Tablet: md breakpoint
    return 1; // Mobile: default
  }, [disableSwiping]);

  const [cardsToShow, setCardsToShow] = useState(disableSwiping ? 1 : 3); // Default based on swiping setting

  // Calculate maxIndex early
  const maxIndex = Math.max(0, (displayUpdates?.length || 0) - cardsToShow);

  // Update cards to show on resize and track container width
  useEffect(() => {
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
  }, [inView, disableSwiping, getCardsToShow]);

  // Keyboard navigation
  useEffect(() => {
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

  // Calculate the translateX value in pixels for smooth one-card-at-a-time movement
  const getTranslateX = () => {
    if (containerWidth === 0) return 0;
    const cardWidthPx = containerWidth / cardsToShow; // exact pixel width per visible card
    return -currentIndex * cardWidthPx;
  };

  // Calculate drag constraints based on available content
  const getDragConstraints = () => {
    if (containerWidth === 0) return { left: 0, right: 0 };
    const maxTranslate = Math.max(
      0,
      (displayUpdates.length - cardsToShow) * (containerWidth / cardsToShow)
    );
    return { left: -maxTranslate, right: 0 };
  };

  return (
    <section
      ref={sectionRef}
      aria-label="All Team Updates"
      className="mt-8 mb-12 space-y-4"
    >
      <h2 className="text-2xl font-bebas uppercase text-center">
        All Team Updates
      </h2>
      {showViewMoreText && (
        <p className="text-center text-gray-400 text-sm font-inter mt-2">
          View your teams page for more updates
        </p>
      )}
      {isLoading ? (
        <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 text-center">
          <p className="text-gray-300 font-inter">Loading updates…</p>
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
                    className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 shadow-sm h-[32rem] flex flex-col w-full mb-8"
                    role="group"
                    aria-label={`${teamName} update card`}
                  >
                    <div className="flex-shrink-0">
                      <h4 className="text-red-600 font-bebas uppercase text-base border-b border-red-500/50 pb-1">
                        {teamName} News
                      </h4>
                      <h3 className="text-2xl font-bebas mt-2 text-white line-clamp-1 leading-tight overflow-hidden">
                        {sanitizeInput(update.title)}
                      </h3>
                      <p
                        className="text-gray-300 font-inter leading-tight mt-4 text-sm lg:text-base overflow-hidden"
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
                    </div>

                    <div className="flex-1 flex flex-col justify-between mt-4">
                      <div className="flex-shrink-0 mb-4">
                        {update.image_url ? (
                          <div className="relative w-full aspect-[16/9] md:aspect-[16/10] lg:aspect-[4/3] rounded-md overflow-hidden">
                            <Image
                              src={update.image_url}
                              alt={update.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        ) : updateTeam?.logo_url ? (
                          <div className="relative w-full aspect-[16/9] md:aspect-[16/10] lg:aspect-[4/3] rounded-md overflow-hidden bg-gray-800/50">
                            <Image
                              src={updateTeam?.logo_url || "/logos/logo2.png"}
                              alt={`${teamName} logo`}
                              fill
                              className="object-contain p-4"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-[16/9] md:aspect-[16/10] lg:aspect-[4/3] bg-gray-800/50 rounded-md flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 py-4 pb-6">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isDragging) {
                              setSelectedUpdate(update);
                            }
                          }}
                          className="w-full bg-red text-white font-bebas uppercase py-3 px-4 rounded-lg hover:bg-red-600 transition-colors"
                          aria-label={`Read more about ${update.title}`}
                          type="button"
                        >
                          Read more
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 text-center">
          <p className="text-gray-300 font-inter">No updates available</p>
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
    </section>
  );
}
