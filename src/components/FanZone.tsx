"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { devLog, devError } from "@/lib/security";

// Removed unused interfaces

interface FanZoneProps {
  teamsError?: string | null;
  coachesError?: string | null;
}

const cards = [
  {
    title: "Our Values",
    description: "Teamwork, discipline, and passion drive our community.",
    video: "/video/values.mp4",
    poster: "/images/teamwork.png",
    href: "/about",
  },
  {
    title: "Our Teams",
    description: "Discover our talented youth basketball teams.",
    video: "/video/teams.mp4",
    poster: "/images/boys team.jpg",
    href: "/teams",
  },
  {
    title: "Latest News",
    description: "Stay updated with WCS Warriors' championship wins and more.",
    video: "/video/news.mp4",
    poster: "/images/placeholder-news-1.png",
    href: "/news",
  },
  {
    title: "Coaches Corner",
    description: "Meet our expert coaches shaping young athletes.",
    video: "/video/coaches.mp4",
    poster: "/images/placeholder-news-2.png",
    href: "/coaches",
  },
];

export default function FanZone({ teamsError, coachesError }: FanZoneProps) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const [isMobile, setIsMobile] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set up intersection observer for mobile video playing
  useEffect(() => {
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardIndex = parseInt(
            entry.target.getAttribute("data-card-index") || "0"
          );
          const video = videoRefs.current[cardIndex];

          if (entry.isIntersecting) {
            // Card is in view - play video
            if (video) {
              devLog("Card in view, playing video", cardIndex);
              video.play().catch((error) => {
                devError("Mobile video play failed", error);
                video.style.display = "none";
              });
            }
          } else {
            // Card is out of view - pause video
            if (video) {
              devLog("Card out of view, pausing video", cardIndex);
              video.pause();
              video.currentTime = 0;
            }
          }
        });
      },
      {
        threshold: 0.5, // Play when 50% of the card is visible
        rootMargin: "0px 0px -10% 0px", // Start playing slightly before fully in view
      }
    );

    // Observe all card elements
    cardRefs.current.forEach((cardRef) => {
      if (cardRef) {
        observer.observe(cardRef);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  if (teamsError || coachesError) {
    Sentry.captureMessage(`Fan Zone error: ${teamsError || coachesError}`);
    return (
      <section className="bg-black py-12" aria-label="Fan Zone">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-white text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            Fan Zone
          </h2>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-200 text-lg font-inter mb-4">
              {teamsError || coachesError}
            </p>
            <p className="text-gray-300 text-sm font-inter">
              Please check your environment configuration or contact support.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="bg-black py-12" aria-label="Fan Zone">
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
          Fan Zone
        </h2>
        <p className="text-white text-lg font-inter mb-8 text-center">
          Explore our community, teams, news, and coaching expertise.
        </p>
        <div
          className={
            isMobile
              ? "space-y-4 mx-6"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          }
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-card-index={index}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer group"
              whileHover={
                isMobile
                  ? {}
                  : {
                      y: -8,
                      transition: { duration: 0.3, ease: "easeOut" },
                    }
              }
            >
              <Link href={card.href} className="block">
                <div
                  className="relative h-48 bg-gray-200 overflow-hidden"
                  onMouseEnter={(e) => {
                    // Only handle hover on desktop
                    if (isMobile) return;

                    const video = e.currentTarget.querySelector(
                      "video"
                    ) as HTMLVideoElement;
                    if (video) {
                      // Security: Use secure logging utility
                      devLog("Hovering over video container", card.video);
                      devLog("Video element", video);
                      devLog("Video readyState", video.readyState);

                      video.play().catch((error) => {
                        devError("Video play failed", error);
                        // Fallback to poster image if video fails to play
                        video.style.display = "none";
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Only handle hover on desktop
                    if (isMobile) return;

                    const video = e.currentTarget.querySelector(
                      "video"
                    ) as HTMLVideoElement;
                    if (video) {
                      video.pause();
                      video.currentTime = 0;
                    }
                  }}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    poster={card.poster}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={(e) => {
                      const video = e.target as HTMLVideoElement;
                      devError("Video load error:", e);
                      video.style.display = "none";
                      // Show poster image as fallback
                      const posterImg = document.createElement("img");
                      posterImg.src = card.poster;
                      posterImg.alt = card.title;
                      posterImg.className = "w-full h-full object-cover";
                      video.parentNode?.appendChild(posterImg);
                    }}
                    onLoadStart={() => {
                      devLog("Video load started", card.video);
                    }}
                    onCanPlay={() => {
                      devLog("Video can play", card.video);
                    }}
                    onLoadedData={() => {
                      devLog("Video data loaded", card.video);
                    }}
                  >
                    <source src={card.video} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bebas text-navy mb-2 group-hover:text-red transition-colors duration-300">
                    {card.title}
                  </h4>
                  <p className="text-gray-600 font-inter text-sm">
                    {card.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
