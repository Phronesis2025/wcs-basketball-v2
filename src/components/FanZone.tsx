// src/components/FanZone.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, PanInfo } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import Image from "next/image";

interface FanZoneProps {
  teamsError?: string | null;
  coachesError?: string | null;
}

const cards = [
  {
    title: "Our Values",
    description: "Teamwork, discipline, and passion drive our community.",
    image: "/images/placeholder-news-1.webp",
    href: "/about",
  },
  {
    title: "Our Teams",
    description: "Discover our talented youth basketball teams.",
    image: "/images/boys team.jpg",
    href: "/teams",
  },
  {
    title: "Schedules",
    description:
      "View upcoming games, practices, and team events on our interactive calendar.",
    image: "/images/placeholder-news-1.webp",
    href: "/schedules",
  },
  {
    title: "Practice Drills",
    description:
      "Explore our comprehensive library of basketball drills and training exercises.",
    image: "/images/placeholder-news-2.webp",
    href: "/drills",
  },
  {
    title: "Coach Login",
    description: "Access your coach dashboard to manage teams and schedules.",
    image: "/images/coach_login.png",
    href: "/coaches/login",
  },
  {
    title: "Parent Login",
    description: "Sign in to view your child's team information and updates.",
    image: "/images/parent_login.png",
    href: "/parent/login",
  },
  {
    title: "Tournament Information",
    description: "View upcoming tournaments and sign up for competitions.",
    image: "/images/tournament.png",
    href: "/tournament-signup",
  },
];

export default function FanZone({ teamsError, coachesError }: FanZoneProps) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const parentContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate how many cards to show based on screen size
  const getCardsToShow = useCallback(() => {
    if (typeof window === "undefined") return 4; // SSR fallback
    if (window.innerWidth >= 640) return 4; // Tablet and Desktop: sm breakpoint and above - show 4 cards
    return 2; // Mobile: default - show 2 cards
  }, []);

  const [cardsToShow, setCardsToShow] = useState(4);

  // Calculate maxIndex
  const maxIndex = Math.max(0, cards.length - cardsToShow);

  // Update cards to show on resize and track container width
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const updateDimensions = () => {
      const newCardsToShow = getCardsToShow();
      setCardsToShow(newCardsToShow);
      
      // Measure width - use the parent container ref (the overflow-hidden div)
      if (parentContainerRef.current) {
        const width = parentContainerRef.current.offsetWidth || parentContainerRef.current.clientWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      } else if (containerRef.current) {
        // Fallback: try to get width from motion div's parent
        const parent = containerRef.current.parentElement;
        if (parent) {
          const parentWidth = parent.offsetWidth || parent.clientWidth;
          if (parentWidth > 0) {
            setContainerWidth(parentWidth);
          }
        }
      }
      
      // Reset to first card if current index exceeds max
      setCurrentIndex((prev) => {
        const newMax = Math.max(0, cards.length - newCardsToShow);
        return Math.min(prev, newMax);
      });
    };

    // Initialize on mount
    updateDimensions();
    
    // Try measuring width with delays to ensure DOM is ready
    const timeout1 = setTimeout(updateDimensions, 10);
    const timeout2 = setTimeout(updateDimensions, 100);

    // Use ResizeObserver for better width tracking - observe parent container
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && parentContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(parentContainerRef.current);
    }

    window.addEventListener("resize", updateDimensions);
    
    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [getCardsToShow]);

  // Keyboard navigation
  useEffect(() => {
    if (!inView) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (cards.length <= cardsToShow) return;

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (event.key === "ArrowRight" && currentIndex < maxIndex) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, maxIndex, cardsToShow, inView]);

  const handleDragEnd = (event: unknown, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 75; // Threshold for swipe detection

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

  // Calculate the translateX value in pixels for smooth sliding
  const getTranslateX = () => {
    if (containerWidth === 0) return 0;
    const cardWidthPx = containerWidth / cardsToShow;
    return -currentIndex * cardWidthPx;
  };

  // Calculate drag constraints based on available content
  const getDragConstraints = () => {
    if (containerWidth === 0) return { left: 0, right: 0 };
    const maxTranslate = Math.max(
      0,
      (cards.length - cardsToShow) * (containerWidth / cardsToShow)
    );
    return { left: -maxTranslate, right: 0 };
  };

  return (
    <section
      ref={ref}
      className="bg-[#F6F6F6] pt-6 sm:pt-8 pb-12 sm:pb-16 mx-4 sm:mx-6 lg:mx-8"
      aria-label="Fan Zone"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(teamsError || coachesError) && (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            {teamsError && (
              <p className="text-red-600 font-inter">{teamsError}</p>
            )}
            {coachesError && (
              <p className="text-red-600 font-inter">{coachesError}</p>
            )}
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl font-bebas text-center text-navy mb-6 sm:mb-8">
          Fan Zone
        </h2>
        <div className="bg-white border border-slate-400 rounded-lg p-6 sm:p-8" style={{ borderWidth: '1px' }}>
          {/* Mobile: Grid layout with all cards in 2 columns */}
          <div className="grid grid-cols-2 gap-4 sm:hidden">
            {cards.map((card, index) => {
              const isLastCard = index === cards.length - 1;
              const isOddTotal = cards.length % 2 === 1;
              
              return (
                <div
                  key={card.title}
                  className={isLastCard && isOddTotal ? "col-span-2 flex justify-center" : ""}
                >
                  <div className={isLastCard && isOddTotal ? "w-full max-w-[calc(50%-0.5rem)]" : "w-full"}>
                    <Link
                      href={card.href}
                      className="block h-full"
                      data-testid={
                        card.title === "Our Teams" ? "fan-zone-teams-link" : undefined
                      }
                    >
                      <div 
                        className={`relative bg-white rounded-lg shadow-lg overflow-hidden fan-zone-card ${
                          inView ? "fan-zone-card-visible" : ""
                        } h-full flex flex-col`}
                        onMouseEnter={(e) => {
                          const card = e.currentTarget;
                          const img = card.querySelector('img');
                          const overlay = card.querySelector('.absolute.inset-0');
                          const title = card.querySelector('.card-title');
                          if (img) img.style.transform = 'scale(1.05)';
                          if (overlay) overlay.classList.add('bg-black/20');
                          if (title) title.classList.add('text-red');
                        }}
                        onMouseLeave={(e) => {
                          const card = e.currentTarget;
                          const img = card.querySelector('img');
                          const overlay = card.querySelector('.absolute.inset-0');
                          const title = card.querySelector('.card-title');
                          if (img) img.style.transform = 'scale(1)';
                          if (overlay) overlay.classList.remove('bg-black/20');
                          if (title) title.classList.remove('text-red');
                        }}
                      >
                        {/* Image Section */}
                        <div className="relative w-full aspect-[5/3] overflow-hidden">
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="object-cover transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, 25vw"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = "/images/placeholder-team-default.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 transition-all duration-300" />
                        </div>
                        {/* Content Section */}
                        <div className="p-3 sm:p-4 flex-1 flex flex-col">
                          <h4 className="text-base sm:text-lg font-bebas text-navy mb-1 sm:mb-2 transition-colors duration-300 card-title">
                            {card.title}
                          </h4>
                          <p className="text-gray-600 font-inter text-xs sm:text-sm flex-1 line-clamp-2">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop/Tablet: Carousel layout */}
          <div ref={parentContainerRef} className="hidden sm:block relative overflow-hidden group min-h-[250px] sm:min-h-[280px]">
          {/* Left Arrow - Always visible when available, hover effect on desktop/tablet */}
          {cards.length > cardsToShow && currentIndex > 0 && (
            <button
              onClick={() => {
                const newIndex = Math.max(0, currentIndex - 1);
                setCurrentIndex(newIndex);
              }}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-navy p-2 sm:p-3 rounded-full transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg"
              aria-label="Previous cards"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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

          {/* Right Arrow - Always visible when available, hover effect on desktop/tablet */}
          {cards.length > cardsToShow && currentIndex < maxIndex && (
            <button
              onClick={() => {
                const newIndex = Math.min(maxIndex, currentIndex + 1);
                setCurrentIndex(newIndex);
              }}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-navy p-2 sm:p-3 rounded-full transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 shadow-lg"
              aria-label="Next cards"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
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
            className={`flex w-full ${
              isDragging ? "cursor-grabbing" : cardsToShow === 2 ? "cursor-grab" : "cursor-default"
            }`}
            drag={cardsToShow === 2 ? "x" : false} // Only enable drag on mobile (2 cards)
            dragConstraints={getDragConstraints()}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={{ x: containerWidth > 0 ? getTranslateX() : 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.8,
            }}
            style={{ willChange: "transform" }}
          >
            {cards.map((card, index) => {
              // Calculate card width based on container width and cards to show
              const cardWidth = containerWidth > 0 
                ? containerWidth / cardsToShow 
                : cardsToShow === 4 
                  ? "25%" 
                  : cardsToShow === 2 
                    ? "50%" 
                    : "100%";
              
              return (
              <div
                key={card.title}
                className="flex-shrink-0 px-2 sm:px-3 box-border"
                style={{
                  width: typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
                  minWidth: typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
                }}
              >
                <Link
                  href={card.href}
                  className="block h-full"
                  data-testid={
                    card.title === "Our Teams" ? "fan-zone-teams-link" : undefined
                  }
                  onClick={(e) => {
                    // Prevent navigation if user was dragging
                    if (isDragging) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div 
                    className={`relative bg-white rounded-lg shadow-lg overflow-hidden fan-zone-card ${
                      inView ? "fan-zone-card-visible" : ""
                    } h-full flex flex-col`}
                    onMouseEnter={(e) => {
                      const card = e.currentTarget;
                      const img = card.querySelector('img');
                      const overlay = card.querySelector('.absolute.inset-0');
                      const title = card.querySelector('.card-title');
                      if (img) img.style.transform = 'scale(1.05)';
                      if (overlay) overlay.classList.add('bg-black/20');
                      if (title) title.classList.add('text-red');
                    }}
                    onMouseLeave={(e) => {
                      const card = e.currentTarget;
                      const img = card.querySelector('img');
                      const overlay = card.querySelector('.absolute.inset-0');
                      const title = card.querySelector('.card-title');
                      if (img) img.style.transform = 'scale(1)';
                      if (overlay) overlay.classList.remove('bg-black/20');
                      if (title) title.classList.remove('text-red');
                    }}
                  >
                    {/* Image Section */}
                    <div className="relative w-full aspect-[5/3] overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = "/images/placeholder-team-default.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 transition-all duration-300" />
                    </div>
                    {/* Content Section */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <h4 className="text-base sm:text-lg font-bebas text-navy mb-1 sm:mb-2 transition-colors duration-300 card-title">
                        {card.title}
                      </h4>
                      <p className="text-gray-600 font-inter text-xs sm:text-sm flex-1 line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
            })}
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
