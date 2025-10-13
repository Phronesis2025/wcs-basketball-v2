// src/components/FanZone.tsx
"use client";

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
    image: "/images/teamwork.png",
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
];

export default function FanZone({ teamsError, coachesError }: FanZoneProps) {
  const { ref, inView } = useInView({ triggerOnce: true });

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
            <div
              key={card.title}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden group fan-zone-card ${
                inView ? "fan-zone-card-visible" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link
                href={card.href}
                className="block"
                data-testid={
                  card.title === "Our Teams" ? "fan-zone-teams-link" : undefined
                }
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = "/images/placeholder-team-default.jpg";
                    }}
                  />
                </div>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
