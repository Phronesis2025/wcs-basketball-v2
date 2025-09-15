"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden bg-navy"
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
      <motion.div
        className="relative z-20 text-center text-white px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ zIndex: 20 }}
      >
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bebas font-bold uppercase leading-tight drop-shadow-lg">
          WELCOME TO WCS YOUTH BASKETBALL
        </h1>
        <p className="text-lg font-inter mt-4 max-w-2xl mx-auto drop-shadow-lg">
          Empowering Kids 8-18 with Skills and Character
        </p>
        <Button
          asChild
          className="mt-6 bg-red text-white font-inter font-medium rounded-md hover:bg-red-700 hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-base px-6 py-3 uppercase"
        >
          <Link href="/register" className="no-underline">
            Join Now
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
