"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Using FanZone card data with links
const programs = [
  {
    title: "Our Values",
    description: "Teamwork, discipline, and passion drive our community.",
    image: "/values.png",
    href: "/about",
    icon: "heart",
    colSpan: "md:col-span-2",
    rowSpan: "row-span-1",
    hasImage: true,
  },
  {
    title: "Our Teams",
    description: "Discover our talented youth basketball teams. Join a legacy of winning programs.",
    image: "/teamss.png",
    href: "/teams",
    badge: "Tryouts Open",
    colSpan: "md:col-span-2",
    rowSpan: "row-span-2",
    hasImage: true,
  },
  {
    title: "Tournaments",
    description: "Elite competition and showcase events.",
    image: "/images/basketball-action.jpg",
    href: "/tournament-signup",
    icon: "trophy",
    colSpan: "md:col-span-1",
    rowSpan: "row-span-1",
    hasImage: true,
  },
  {
    title: "Practice Drills",
    description: "Comprehensive training library.",
    image: "/drills.png",
    href: "/drills",
    icon: "dumbbell",
    colSpan: "md:col-span-1",
    rowSpan: "row-span-1",
    hasImage: true,
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
      className="pt-12 pb-12 px-6 bg-black"
      aria-label="Programs"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className={`fade-enter ${isVisible ? "fade-enter-active" : ""}`}>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
              WCS Fanzone
            </h2>
            <p className="text-neutral-400 text-sm max-w-md font-inter uppercase tracking-wider">
              EXPLORE PROGRAMS, TEAMS, AND RESOURCES
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/10 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 p-8 w-full z-10">
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

            // Image cards with dark gradient
            return (
              <Link
                key={program.title}
                href={program.href}
                className={`${program.colSpan} ${program.rowSpan} relative group rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] fade-enter ${delay} ${isVisible ? "fade-enter-active" : ""} p-6 flex flex-col justify-between`}
              >
                {/* Background Image */}
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                />
                {/* Increased dark gradient overlay - lightens slightly on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/85 to-black group-hover:from-black/70 group-hover:via-black/60 group-hover:to-black/70 transition-all duration-500" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-center text-neutral-500 group-hover:text-white transition-colors">
                    {program.icon === "heart" && (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                    {program.icon === "trophy" && (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    )}
                    {program.icon === "dumbbell" && (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2zm0 0V3m0 2v2M9 5h6m0 0V3m0 2v2m0-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1 tracking-tight font-inter">
                      {program.title}
                    </h3>
                    <p className="text-neutral-500 text-xs font-inter">
                      {program.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

