"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const logos = [
  "/logos/logo-blue.png",
  "/logos/logo-dupy.png",
  "/logos/logo-legends.png",
  "/logos/logo-potter.png",
  "/logos/logo-red.png",
  "/logos/logo-sharks.png",
  "/logos/logo-swish.png",
  "/logos/logo-white.png",
  "/logos/logo-williams.png",
  "/logos/logo-vipers.png",
  "/logos/logo-warriors.png",
];

export default function LogoMarquee() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      className="bg-navy/80 py-8 overflow-hidden"
      aria-label="Team Logos"
    >
      <motion.div
        className="flex items-center"
        animate={{ x: ["0%", "-100%"] }}
        transition={{ duration: 45, ease: "linear", repeat: Infinity }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-12 w-[140px] h-[70px] relative"
          >
            <Image
              src={logo}
              alt={`Team logo ${index + 1}`}
              fill
              sizes="140px"
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/placeholder-logo.png";
              }}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
