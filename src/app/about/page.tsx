"use client";

import Image from "next/image";

/**
 * Core values data for the About page
 * Each value represents a key principle of WCS Basketball
 */
const values = [
  {
    title: "Fundamentals First",
    description:
      "Mastering ball-handling, shooting, passing, defense, and footwork.",
    image: "/images/fundamentalsfirst.png",
    hasImage: true,
  },
  {
    title: "Basketball IQ",
    description:
      "Understanding the game, reading situations, and making smart decisions.",
    image: "/images/basketballiq.png",
    hasImage: true,
  },
  {
    title: "Work Ethic",
    description:
      "Committing to consistent practice and striving for excellence.",
    image: "/images/workethic.png",
    hasImage: true,
  },
  {
    title: "Teamwork",
    description:
      "Playing unselfishly and supporting others on and off the court.",
    image: "/images/placeholder-news-1.webp",
    hasImage: true,
  },
  {
    title: "Leadership",
    description:
      "Leading by example with humility, communication, and accountability.",
    icon: "flag",
    hasImage: false,
  },
  {
    title: "Discipline",
    description:
      "Training the mind and body to stay focused, resilient, and coachable.",
    icon: "target",
    hasImage: false,
  },
  {
    title: "Adaptability",
    description: "Learning to adjust, improve, and overcome challenges.",
    icon: "refresh-cw",
    hasImage: false,
  },
  {
    title: "Mental Toughness",
    description: "Competing with confidence and composure under pressure.",
    icon: "brain-circuit",
    hasImage: false,
  },
];

/**
 * About page component displaying WCS Basketball information and core values
 * Features responsive design matching the home page style
 */
export default function About() {
  return (
    <main className="relative pt-32 pb-24 bg-[#030711] text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition duration-300 hover:border-white/20 hover:bg-white/[0.04]"
            >
              {value.hasImage && value.image ? (
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src={value.image}
                    alt={value.title}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105 opacity-80"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-value.png";
                    }}
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-white/5">
                  {/* Icon placeholder - using simple SVG icons */}
                  {value.icon === "flag" && (
                    <svg
                      className="h-10 w-10 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 0112.313 12.313L3 15zM18 4.5V21m0 0l-1.772-.886a9 9 0 00-1.228 1.228L18 21z"
                      />
                    </svg>
                  )}
                  {value.icon === "target" && (
                    <svg
                      className="h-10 w-10 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.311-.06m-2.699 2.7a14.988 14.988 0 005.84-7.38m0 0a14.98 14.98 0 00-5.84-7.38m5.84 7.38H9.75"
                      />
                    </svg>
                  )}
                  {value.icon === "refresh-cw" && (
                    <svg
                      className="h-10 w-10 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  )}
                  {value.icon === "brain-circuit" && (
                    <svg
                      className="h-10 w-10 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      />
                    </svg>
                  )}
                </div>
              )}
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-white font-inter">
                  {value.title}
                </h3>
                <p className="text-base text-slate-400 font-inter">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
