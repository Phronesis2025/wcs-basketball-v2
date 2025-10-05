// src/components/TeamUpdates.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, Variants, PanInfo } from "framer-motion";
import Image from "next/image";
import { Team, TeamUpdate } from "../types/supabase";
import { sanitizeInput } from "../lib/security";

interface TeamUpdatesProps {
  team: Team;
  updates: TeamUpdate[];
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function TeamUpdates({ team, updates }: TeamUpdatesProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<TeamUpdate | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate how many cards to show based on screen size
  const getCardsToShow = () => {
    if (typeof window === "undefined") return 3; // SSR fallback
    if (window.innerWidth >= 1024) return 3; // Desktop: lg breakpoint
    if (window.innerWidth >= 768) return 2; // Tablet: md breakpoint
    return 1; // Mobile: default
  };

  const [cardsToShow, setCardsToShow] = useState(getCardsToShow);

  // Calculate maxIndex early
  const maxIndex = Math.max(0, updates.length - cardsToShow);

  // Update cards to show on resize and track container width
  useEffect(() => {
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
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (updates.length <= cardsToShow) return;

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (event.key === "ArrowRight" && currentIndex < maxIndex) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, maxIndex, updates.length, cardsToShow]);

  // Prevent body scroll when modal is open
  useEffect(() => {
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
  }, [selectedUpdate]);

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

  return (
    <section aria-label="Team Updates" className="mt-8 space-y-4">
      <h2 className="text-2xl font-bebas uppercase text-center">
        Team Updates
      </h2>
      {updates.length > 0 ? (
        <div className="relative overflow-hidden group">
          {/* Left Arrow */}
          {updates.length > cardsToShow && currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
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
          {updates.length > cardsToShow && currentIndex < maxIndex && (
            <button
              onClick={() =>
                setCurrentIndex(Math.min(maxIndex, currentIndex + 1))
              }
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
            className="flex cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={{ x: getTranslateX() }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.8,
            }}
          >
            {updates.map((update) => (
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
                  className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 shadow-sm h-[28rem] flex flex-col w-full"
                  role="group"
                  aria-label={`${team.name} update card`}
                >
                  <div className="flex-shrink-0">
                    <h4 className="text-red-600 font-bebas uppercase text-base border-b border-red-500/50 pb-1">
                      {team.name} News
                    </h4>
                    <h3 className="text-3xl font-bebas mt-2 text-white line-clamp-2">
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

                  <div className="flex-1 flex flex-col mt-4">
                    <div className="flex-shrink-0 mb-4">
                      {update.image_url ? (
                        <Image
                          src={update.image_url}
                          alt={update.title}
                          width={400}
                          height={192}
                          className="w-full h-32 md:h-40 lg:h-48 object-cover rounded-md"
                        />
                      ) : team.logo_url ? (
                        <Image
                          src={team.logo_url}
                          alt={`${team.name} logo`}
                          width={400}
                          height={192}
                          className="w-full h-32 md:h-40 lg:h-48 object-contain rounded-md bg-gray-800/50 p-4"
                        />
                      ) : (
                        <div className="w-full h-32 md:h-40 lg:h-48 bg-gray-800/50 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="py-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isDragging) {
                            setSelectedUpdate(update);
                          }
                        }}
                        className="w-full bg-red text-white font-bebas uppercase py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        aria-label={`Read more about ${update.title}`}
                        type="button"
                      >
                        Read more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Carousel indicators */}
          {updates.length > cardsToShow && (
            <div className="flex justify-center mt-6 space-x-3">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    i === currentIndex
                      ? "bg-red-500 scale-110"
                      : "bg-gray-400 hover:bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
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
                {team.name} News
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
