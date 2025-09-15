"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative w-full h-screen flex items-center justify-start overflow-hidden bg-navy"
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95" />
      <motion.div
        className="relative z-20 text-white flex flex-col items-start justify-between w-full h-screen px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ zIndex: 20 }}
      >
        {/* Top: Headline */}
        <div className="text-left pt-8 sm:pt-4">
          <h1 className="text-[clamp(6rem,18vw,7rem)] sm:text-[clamp(2.2rem,6vw,4.5rem)] font-bebas font-bold uppercase leading-tight drop-shadow-lg">
            <span className="block font-inter text-xl sm:text-xl font-medium mb-1 sm:hidden">
              More Than
            </span>
            <span className="block font-inter text-xl sm:text-xl font-medium mb-2 sm:hidden">
              Basketball
            </span>
            <span className="hidden sm:block font-inter text-xl font-medium mb-1">
              More Than Basketball
            </span>
            <span className="block">We are World Class</span>
          </h1>
        </div>

        {/* Bottom: Button then Tagline */}
        <div className="text-left -mb-4 sm:-mb-6">
          <Button
            asChild
            className="bg-red text-white font-bebas font-bold rounded-lg hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 uppercase shadow-2xl hover:shadow-red-500/25 mb-4 sm:mb-6"
          >
            <Link href="/register" className="no-underline">
              Join Now
            </Link>
          </Button>

          <p className="text-2xl sm:text-xl font-inter drop-shadow-lg font-medium">
            Basketball excellence that extends beyond the game
          </p>
        </div>
      </motion.div>
    </section>
  );
}
