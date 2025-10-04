// src/components/TeamUpdates.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  motion,
  Variants,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Team, TeamUpdate } from "@/types/supabase";
import { sanitizeInput } from "@/lib/security";

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

  // Swipe functionality
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0, 50, 100], [0, 1, 1, 1, 0]);
  const scale = useTransform(
    x,
    [-100, -50, 0, 50, 100],
    [0.95, 0.98, 1, 0.98, 0.95]
  );

  // Calculate how many cards to show based on screen size
  const getCardsToShow = () => {
    if (typeof window === "undefined") return 3; // SSR fallback
    return window.innerWidth >= 1024 ? 3 : 2; // lg breakpoint
  };

  const [cardsToShow, setCardsToShow] = useState(getCardsToShow);

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

  const maxIndex = Math.max(0, updates.length - cardsToShow);

  const handleDragEnd = (event: unknown, info: PanInfo) => {
    const threshold = 50;

    if (info.offset.x > threshold && currentIndex > 0) {
      // Swipe right - go to previous
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else if (info.offset.x < -threshold && currentIndex < maxIndex) {
      // Swipe left - go to next
      setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
    }

    // Reset position
    x.set(0);
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
        <div className="relative overflow-hidden">
          <motion.div
            ref={containerRef}
            className="flex"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            animate={{ x: getTranslateX() }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {updates.map((update) => (
              <motion.div
                key={update.id}
                className={`flex-shrink-0 ${
                  cardsToShow === 3 ? "w-1/3" : "w-1/2"
                } px-2 box-border`}
                style={{ opacity, scale }}
              >
                <div
                  className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 shadow-sm h-[28rem] flex flex-col w-full"
                  role="group"
                  aria-label={`${team.name} update card`}
                >
                  <h4 className="text-red-600 font-bebas uppercase text-base border-b border-red-500/50 pb-1">
                    {team.name} News
                  </h4>
                  <h3 className="text-3xl font-bebas mt-2 text-white line-clamp-2">
                    {sanitizeInput(update.title)}
                  </h3>
                  <p
                    className="text-gray-300 font-inter leading-tight mt-4 flex-grow text-sm lg:text-base overflow-hidden"
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
                  <div className="mt-2 flex-shrink-0">
                    {update.image_url ? (
                      <Image
                        src={update.image_url}
                        alt={update.title}
                        width={400}
                        height={200}
                        className="w-full h-32 lg:h-48 object-cover rounded-md"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-32 lg:h-48 bg-gray-800/50 rounded-md flex items-center justify-center">
                        <span className="text-gray-500 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedUpdate(update)}
                    className="mt-4 w-full bg-red text-white font-bebas uppercase py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    aria-label={`View details for ${update.title}`}
                  >
                    View Update
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation indicators */}
          {updates.length > cardsToShow && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-red-500" : "bg-gray-500"
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
      {updates.length > cardsToShow && (
        <div className="text-center mt-4">
          <Link
            href="/updates"
            className="text-red-600 hover:underline text-base font-bebas"
            aria-label="View all team updates"
          >
            View All Updates
          </Link>
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
            className="bg-black border border-red-500/50 rounded-lg p-4 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
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
                  width={600}
                  height={256}
                  className="w-full h-auto max-h-64 sm:max-h-80 object-contain rounded-md mt-4"
                  sizes="(max-width: 390px) 100vw, 600px"
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
