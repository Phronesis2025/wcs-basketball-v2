"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-start overflow-hidden bg-navy"
      aria-label="Hero"
      style={{
        backgroundImage: 'url("/hero-basketball.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{ objectPosition: "top" }}
        src="/video/hero.mp4"
        poster="/hero-basketball.jpg"
        onError={(e) => {
          const target = e.target as HTMLVideoElement;
          target.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 sm:from-black/80 sm:via-black/65 sm:to-black/90" />

      {/* Basketball Flames - Desktop Only (use <img> for animated asset, low priority) */}
      <div className="hidden sm:block absolute right-4 sm:right-60 lg:right-80 xl:right-96 top-1/2 transform -translate-y-1/2 translate-x-1/2 z-10">
        <Image
          src="/video/basketball-flames-optimized.webp"
          alt="Basketball flames animation"
          width={500}
          height={500}
          className="w-[500px] h-[500px] object-contain"
          loading="lazy"
          priority={false}
        />
      </div>

      <div className="relative z-20 text-white flex flex-col items-start justify-between w-full min-h-screen px-4 pt-20 pb-8 sm:px-6 md:px-8 sm:pt-24 sm:pb-16 hero-content">
        {/* Headline */}
        <div className="flex-grow flex flex-col justify-center">
          <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-bebas font-bold uppercase leading-tight drop-shadow-lg">
            <span className="block font-inter text-xl sm:text-xl font-medium mb-1 normal-case">
              More Than Basketball
            </span>
            <span className="block text-[clamp(4rem,12vw,5rem)] leading-none sm:leading-none sm:mb-10">
              We are <br />
              World Class
            </span>
          </h1>
        </div>

        {/* Basketball Flames - Mobile Only (use <img>, load lazily to avoid LCP hit) */}
        <div className="sm:hidden flex justify-center mb-6 pl-4">
          <Image
            src="/video/basketball-flames-optimized.webp"
            alt="Basketball flames animation"
            width={400}
            height={400}
            className="w-[400px] h-[400px] object-contain"
            loading="lazy"
            priority={false}
          />
        </div>

        {/* Bottom: Button then Tagline */}
        <div className="text-left mb-4 sm:mb-0">
          <Button
            asChild
            className="bg-red text-white font-bebas font-bold rounded-lg hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 uppercase shadow-2xl hover:shadow-red-500/25 mb-4 sm:mb-3"
          >
            <Link href="/club-registration" className="no-underline">
              Join Now
            </Link>
          </Button>

          <p className="text-2xl sm:text-xl font-inter drop-shadow-lg font-medium">
            Basketball excellence that extends beyond the game
          </p>
        </div>
      </div>
    </section>
  );
}
