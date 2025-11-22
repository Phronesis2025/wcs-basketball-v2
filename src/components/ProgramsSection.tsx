"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Using FanZone card data with links
const programs = [
  {
    title: "Our Values",
    description: "Teamwork, discipline, and passion drive our community.",
    image: "/images/teamwork.png",
    href: "/about",
    icon: "heart",
    colSpan: "md:col-span-2",
    rowSpan: "row-span-1",
  },
  {
    title: "Our Teams",
    description: "Discover our talented youth basketball teams. Join a legacy of winning programs.",
    image: "/images/boys team.jpg",
    href: "/teams",
    badge: "Tryouts Open",
    colSpan: "md:col-span-2",
    rowSpan: "row-span-2",
    hasImage: true,
  },
  {
    title: "Schedules",
    description: "View upcoming games and events.",
    image: "/images/calendar.png",
    href: "/schedules",
    icon: "calendar",
    colSpan: "md:col-span-1",
    rowSpan: "row-span-1",
  },
  {
    title: "Practice Drills",
    description: "Comprehensive training library.",
    image: "/images/skill.png",
    href: "/drills",
    icon: "dumbbell",
    colSpan: "md:col-span-1",
    rowSpan: "row-span-1",
  },
];

export default function ProgramsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <section
      ref={ref}
      id="around-wcs"
      className="py-24 px-6 border-t border-white/5 bg-[#030303]"
      aria-label="Programs"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className={`fade-enter ${isVisible ? "fade-enter-active" : ""}`}>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-white mb-2 font-inter">
              Around the WCS
            </h2>
            <p className="text-neutral-400 text-sm max-w-md font-inter">
              From beginners to college prospects. Choose your path.
            </p>
          </div>
          <Link
            href="/teams"
            className="text-sm text-white border-b border-white/30 pb-1 hover:border-white transition-colors inline-block font-inter"
          >
            View All Divisions
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px]">
          {programs.map((program, index) => {
            const delays = ["", "delay-100", "delay-200", "delay-300"];
            const delay = delays[index] || "";

            if (program.hasImage) {
              // Large image card (Travel Teams style)
              return (
                <Link
                  key={program.title}
                  href={program.href}
                  className={`${program.colSpan} ${program.rowSpan} relative group rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] fade-enter ${delay} ${isVisible ? "fade-enter-active" : ""}`}
                >
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    {program.badge && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide mb-4 font-inter">
                        {program.badge}
                      </div>
                    )}
                    <h3 className="text-3xl font-semibold text-white mb-2 tracking-tight font-inter">
                      {program.title}
                    </h3>
                    <p className="text-neutral-300 text-sm max-w-md mb-4 font-inter">
                      {program.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:gap-3 transition-all font-inter">
                      Learn More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            }

            // Icon/Text cards (Skills Academy, 3v3, Camps style)
            return (
              <Link
                key={program.title}
                href={program.href}
                className={`${program.colSpan} ${program.rowSpan} relative group rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] fade-enter ${delay} ${isVisible ? "fade-enter-active" : ""} p-8 flex flex-col justify-between`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white">
                    {program.icon === "heart" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                    {program.icon === "calendar" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {program.icon === "dumbbell" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zm0 0V3m0 2v2M9 5h6m0 0V3m0 2v2m0-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-tight font-inter">
                    {program.title}
                  </h3>
                  <p className="text-neutral-400 text-sm max-w-xs font-inter">
                    {program.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

