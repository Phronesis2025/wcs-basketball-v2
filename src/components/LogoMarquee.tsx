"use client";

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
      <div
        className="flex items-center marquee"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ animationPlayState: isPaused ? "paused" : "running" }}
      >
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={index}
            className="flex-shrink-0 mx-12 w-[100px] h-[100px] relative flex items-center justify-center"
          >
            {/* Black circle background */}
            <div className="absolute inset-0 bg-black rounded-full"></div>
            {/* Logo container - keeping the same size as before */}
            <div className="relative w-[140px] h-[70px] z-10">
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
          </div>
        ))}
      </div>
    </section>
  );
}
