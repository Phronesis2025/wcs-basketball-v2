"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AdSection from "@/components/AdSection";

/**
 * Core values data for the About page
 * Each value represents a key principle of WCS Basketball
 */
const values = [
  {
    title: "Fundamentals First",
    description:
      "Mastering ball-handling, shooting, passing, defense, and footwork.",
    image: "/fundamentalfirst.png",
  },
  {
    title: "Basketball IQ",
    description:
      "Understanding the game, reading situations, and making smart decisions.",
    image: "/Basketball IQ.png",
  },
  {
    title: "Work Ethic",
    description:
      "Committing to consistent practice and striving for excellence.",
    image: "/work_ethic.png",
  },
  {
    title: "Teamwork",
    description:
      "Playing unselfishly and supporting others on and off the court.",
    image: "/team_work.png",
  },
  {
    title: "Leadership",
    description:
      "Leading by example with humility, communication, and accountability.",
    image: "/leadership (2).png",
  },
  {
    title: "Discipline",
    description:
      "Training the mind and body to stay focused, resilient, and coachable.",
    image: "/discipline (2).png",
  },
  {
    title: "Adaptability",
    description: "Learning to adjust, improve,\n\nand overcome challenges.",
    image: "/Adaptability (2).png",
  },
  {
    title: "Mental Toughness",
    description: "Competing with confidence and composure under pressure.",
    image: "/mental_toughness.png",
  },
];

/**
 * About page component displaying WCS Basketball information and core values
 * Features responsive design matching the home page style
 */
export default function About() {
  const [isMobile, setIsMobile] = useState(false);
  const [openCards, setOpenCards] = useState<Set<number>>(new Set());

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle card click on mobile
  const handleCardClick = (index: number, e: React.MouseEvent) => {
    // Check if mobile on click (in case state hasn't updated)
    const isMobileView = window.innerWidth < 640;
    if (!isMobileView) return;

    e.stopPropagation();
    setOpenCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-4xl px-6 text-center">
        <h1 className="mb-8 text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter relative z-20">
          About World Class Sports
        </h1>
        {/* Logo3 */}
        <div className="mb-8 flex justify-center relative z-10">
          <div className="relative h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80 xl:h-96 xl:w-96">
            <Image
              src="/logo3.png"
              alt="World Class Sports logo"
              fill
              className="object-contain drop-shadow-2xl relative z-10"
              sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, (max-width: 1280px) 320px, 384px"
            />
          </div>
        </div>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl font-inter">
          At World Class Sports (WCS), we're all about serious, high-level
          competitive basketball. If your child has the drive to compete at the
          top tournament level, you've found the right program. Since 2000,
          World Class Sports has built a reputation across the Midwest for
          putting talented, fundamentally sound, and exceptionally well-coached
          teams on the floor year after year. When you join WCS, you're joining
          a proven travel basketball program that parents and players trust to
          take their game to the next level.
        </p>
        {/* Logo Section */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-12 md:gap-16 lg:gap-20">
          <div className="relative h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src="/WCS-old1.png"
              alt="World Class Sports logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 160px"
            />
          </div>
          <div className="relative h-32 w-32 md:h-48 md:w-48 lg:h-56 lg:w-56 opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src="/WCSold2.png"
              alt="World Class Sports logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 128px, (max-width: 1024px) 192px, 224px"
            />
          </div>
          <div className="relative h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 opacity-80 hover:opacity-100 transition-opacity">
            <Image
              src="/World_Class_Logo 23.png"
              alt="World Class Sports logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 160px"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-auto mt-32 max-w-7xl px-6">
        <div className="grid items-start gap-16 md:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span className="text-xs font-medium uppercase tracking-wider text-blue-200 font-inter">
                Our Mission
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter">
              Developing the next generation of athletes.
            </h2>
            <div className="h-1 w-20 rounded-full bg-blue-600 mb-6"></div>
            {/* Team Images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/boys-about.jpg"
                  alt="World Class Sports boys team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Slight gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
              </div>
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                <Image
                  src="/girls-about.jpg"
                  alt="World Class Sports girls team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Slight gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
              </div>
            </div>
          </div>
          <div className="text-lg leading-relaxed text-slate-400 font-inter">
            <p>
              At World Class Sports, we’re fully committed to growing young
              basketball players in Salina, KS and the surrounding communities
              through top-tier competitive travel basketball. Our mission goes
              beyond winning games—we’re here to teach kids the game the right
              way.
            </p>
            <p className="mt-4">
              We place a strong emphasis on tough defense, outstanding
              sportsmanship, and real teamwork while focusing on each player’s
              individual growth. Our goal is simple: help your child develop the
              skills, confidence, and character they need to excel in middle
              school, high school, and beyond—both on the court and in life.
              When you choose WCS, you’re giving your young athlete a proven
              program that builds complete players and great young people.
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="mx-auto mt-32 max-w-7xl px-6">
        <div className="grid items-start gap-16 md:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span className="text-xs font-medium uppercase tracking-wider text-blue-200 font-inter">
                Our History
              </span>
            </div>
            <h2 className="mb-6 text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter">
              Building a legacy since 2000.
            </h2>
            <div className="h-1 w-20 rounded-full bg-blue-600 mb-6"></div>
            <div className="relative w-full rounded-xl overflow-hidden border border-white/10">
              <Image
                src="/IMG_9487.jpeg"
                alt="World Class Sports team photo from early years"
                width={800}
                height={600}
                className="w-full h-auto grayscale object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Slight gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/30" />
            </div>
          </div>
          <div className="text-lg leading-relaxed text-slate-400 font-inter">
            <p>
              World Class Sports first landed in Salina in the summer of 2000,
              born from a direct partnership with the original World Class
              Sports out of Chicago—a respected name in screen printing, sports
              camps, and competitive basketball. They asked us to carry their
              proven brand deeper into the Midwest, and we started small but
              strong: sponsoring just two youth travel teams.
            </p>
            <p className="mt-4">
              Those first two teams quickly showed Salina what high-level
              basketball could look like, and the demand exploded. From that
              foundation, we built the full World Class Sports Basketball Club
              right here in central Kansas, opening doors for hundreds of local
              kids to experience real competitive basketball.
            </p>
            <p className="mt-4">
              Since 2000, WCS has proudly fielded more than 32 teams and given
              over 300 boys and girls—from 2nd grade all the way through 8th
              grade—the chance to compete, grow, and fall in love with the game.
              Two decades later, we're still the same program: Salina-grown,
              Midwest-tough, and completely dedicated to developing the next
              generation of athletes.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mx-auto mt-32 max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl font-inter">
            Our Core Values
          </h2>
          <p className="mt-4 text-lg text-slate-400 font-inter">
            The principles that guide our players on and off the court.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const isOpen = openCards.has(index);
            return (
              <div
                key={value.title}
                onClick={(e) => handleCardClick(index, e)}
                className="group relative overflow-hidden rounded-xl aspect-[4/5] cursor-pointer border border-white/10"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    className={`object-cover ${
                      value.title === "Discipline"
                        ? "scale-x-[-1]"
                        : `transition-transform duration-700 ${
                            isMobile && isOpen
                              ? "scale-110"
                              : "sm:group-hover:scale-110"
                          }`
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/basketball icon.png";
                    }}
                  />
                  {/* Dark overlay - darker by default, lighter on hover (desktop) or click (mobile) */}
                  <div
                    className={`absolute inset-0 transition-colors duration-300 ${
                      isMobile && isOpen
                        ? "bg-black/50"
                        : "bg-black/80 sm:group-hover:bg-black/50"
                    }`}
                  />
                </div>

                {/* Content Container - Centered at bottom with fixed height */}
                <div className="relative h-full flex flex-col justify-end">
                  {/* Fixed height container for text to ensure consistent positioning - black background on hover (desktop) or click (mobile) */}
                  <div
                    className={`relative h-40 sm:h-48 md:h-52 p-3 sm:p-6 flex flex-col justify-end bg-transparent sm:group-hover:bg-black transition-colors duration-300 ${
                      isMobile && isOpen ? "bg-black" : ""
                    }`}
                  >
                    {/* Main Title - Always Visible */}
                    <div className="relative overflow-hidden text-center h-20 sm:h-24 md:h-28 flex items-end justify-center">
                      <h3
                        className={`text-lg sm:text-2xl md:text-3xl font-bold text-white font-inter tracking-tight transform transition-transform duration-500 sm:group-hover:-translate-y-full ${
                          isMobile && isOpen ? "-translate-y-full" : ""
                        }`}
                      >
                        {value.title}
                      </h3>
                    </div>

                    {/* Description - Slides in on hover (desktop) or click (mobile) */}
                    <div className="relative overflow-hidden text-center h-20 sm:h-24 md:h-28 flex items-start justify-center">
                      <div
                        className={`w-full px-2 sm:px-4 py-2 transition-transform duration-500 ${
                          isMobile && isOpen
                            ? "translate-y-0 bg-black"
                            : "translate-y-full sm:group-hover:translate-y-0"
                        }`}
                      >
                        <p className="text-[10px] sm:text-xs md:text-sm text-white/90 font-inter leading-relaxed whitespace-pre-line">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ad Section - Above Footer */}
      <div className="mt-16 md:mt-24">
        <AdSection />
      </div>
    </main>
  );
}
