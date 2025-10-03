// src/components/FanZone.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { devLog, devError } from "@/lib/security";

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
            if (video) {
              devLog("Card in view, playing video", cardIndex);
              video.play().catch((error) => {
                devError("Mobile video play failed", error);
                video.style.display = "none";
              });
            }
          } else {
            if (video) {
              video.pause();
              video.currentTime = 0;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentCardRefs = cardRefs.current;
    currentCardRefs.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      currentCardRefs.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [isMobile]);

  return (
    <section
      ref={ref}
      className="bg-white py-12 sm:py-16"
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
        <h2 className="text-3xl sm:text-4xl font-bebas text-center text-navy mb-8 sm:mb-12">
          Fan Zone
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              className="relative bg-white rounded-lg shadow-lg overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-card-index={index}
            >
              <Link
                href={card.href}
                className="block"
                data-testid={
                  card.title === "Our Teams" ? "fan-zone-teams-link" : undefined
                }
                onMouseEnter={(e) => {
                  if (isMobile) return;
                  const video = e.currentTarget.querySelector(
                    "video"
                  ) as HTMLVideoElement;
                  if (video) {
                    video.play().catch((error) => {
                      devError("Video play failed", error);
                      Sentry.captureException(error);
                    });
                  }
                }}
                onMouseLeave={(e) => {
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
              </Link>
              <div className="p-6">
                <h4 className="text-xl font-bebas text-navy mb-2 group-hover:text-red transition-colors duration-300">
                  {card.title}
                </h4>
                <p className="text-gray-600 font-inter text-sm">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
