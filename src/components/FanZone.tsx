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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (teamsError || coachesError) {
    Sentry.captureMessage(`Fan Zone error: ${teamsError || coachesError}`);
    return (
      <section className="bg-black py-12" aria-label="Fan Zone">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white text-base font-inter text-center">
            {teamsError || coachesError}
          </p>
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
                      console.error("Video load error:", card.video, e);
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
