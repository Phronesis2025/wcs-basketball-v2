"use client";

import Image from "next/image";
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
        minHeight: "100dvh", // Dynamic viewport height for mobile
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

      {/* Basketball Flames Video - Desktop Only */}
      <div className="hidden sm:block absolute right-40 top-1/2 transform -translate-y-1/2 z-10">
        <Image
          src="/video/basketball-flames.gif"
          alt="Basketball flames animation"
          width={384}
          height={384}
          className="w-96 h-96 object-contain"
          style={{ width: "auto", height: "auto" }}
          priority
          unoptimized
        />
      </div>

      <motion.div
        className="relative z-20 text-white flex flex-col items-start justify-start w-full h-screen px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 sm:justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ zIndex: 20, minHeight: "100vh" }}
      >
        {/* Top: Headline */}
        <div className="text-left pt-8 sm:pt-0">
          <h1 className="text-[clamp(6rem,18vw,7rem)] sm:text-[clamp(2.2rem,6vw,4.5rem)] font-bebas font-bold uppercase leading-tight drop-shadow-lg">
            <span className="block font-inter text-xl sm:text-xl font-medium mb-1 sm:hidden normal-case">
              More Than Basketball
            </span>
            <span className="hidden sm:block font-inter text-xl font-medium mb-1 normal-case">
              More Than Basketball
            </span>
            <span className="block text-[clamp(4rem,12vw,5rem)] sm:text-[clamp(6rem,18vw,7rem)] leading-none sm:leading-none sm:mb-10">
              We are <br></br>World Class
            </span>
          </h1>
        </div>

        {/* Basketball Flames Video - Mobile Only */}
        <div className="sm:hidden flex justify-center mb-4 pl-4">
          <Image
            src="/video/basketball-flames.gif"
            alt="Basketball flames animation"
            width={280}
            height={280}
            className="w-70 h-70 object-contain"
            style={{ width: "auto", height: "auto" }}
            priority
            unoptimized
          />
        </div>

        {/* Bottom: Button then Tagline */}
        <div className="text-left w-full pb-4 sm:pb-0 mt-auto sm:mt-0">
          <Button
            asChild
            className="bg-red text-white font-bebas font-bold rounded-lg hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-lg sm:text-lg px-8 sm:px-8 py-4 sm:py-4 uppercase shadow-2xl hover:shadow-red-500/25 mb-4 sm:mb-3 block w-full sm:w-auto"
          >
            <Link href="/register" className="no-underline">
              Join Now
            </Link>
          </Button>

          <p className="text-lg sm:text-xl font-inter drop-shadow-lg font-medium">
            Basketball excellence that extends beyond the game
          </p>
        </div>
      </motion.div>
    </section>
  );
}
