"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FlipCard from "./FlipCard";
import { devLog } from "@/lib/security";

// Static list of hero images from /public/hero directory
const ALL_HERO_IMAGES = [
  'action-basketball-action.jpg',
  'action-boy_playground.jpg',
  'action-boydribble.jpg',
  'action-fans-cheering.jpg',
  'action-girllayup.jpg',
  'action-girlshooting.jpg',
  'action-teamjump.jpg',
  'equip-basketball.jpg',
  'equip-basketball2.png',
  'equip-hoop.png',
  'equip-shoe.png',
  'equip-trophy.png',
  'hero-court.jpg',
  'integrity.png',
  'logo-WCS_Logo-white.png',
  'logo-wcscourt.png',
  'mental-toughness.png',
  'placeholder-news-2.png',
  'playground-court-sunset.jpg',
  'playground-game-action.jpg',
  'respect.png',
  'teamwork.png',
  'values-card__1_.jpg',
] as const;

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [imagePools, setImagePools] = useState<{
    leftTop: string[];
    leftBottom: string[];
    rightTop: string[];
    rightBottom: string[];
  }>({
    leftTop: [],
    leftBottom: [],
    rightTop: [],
    rightBottom: [],
  });
  const [isMounted, setIsMounted] = useState(false);

  // Distribute images into pools based on filename prefix (client-side only to avoid hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    const logoEquipImages: string[] = [];
    const otherImages: string[] = [];

    // Categorize images by prefix
    ALL_HERO_IMAGES.forEach((filename) => {
      const lowerFilename = filename.toLowerCase();
      if (lowerFilename.startsWith('logo-') || lowerFilename.startsWith('equip-')) {
        logoEquipImages.push(`/hero/${filename}`);
      } else {
        otherImages.push(`/hero/${filename}`);
      }
    });

    // Shuffle each group separately (only on client)
    const shuffledLogoEquip = [...logoEquipImages].sort(() => Math.random() - 0.5);
    const shuffledOther = [...otherImages].sort(() => Math.random() - 0.5);

    // Distribute logo/equip to top left and bottom right
    const logoEquipPoolSize = Math.ceil(shuffledLogoEquip.length / 2);
    const leftTop = shuffledLogoEquip.slice(0, logoEquipPoolSize);
    const rightBottom = shuffledLogoEquip.slice(logoEquipPoolSize);

    // Distribute other images to top right and bottom left
    const otherPoolSize = Math.ceil(shuffledOther.length / 2);
    const rightTop = shuffledOther.slice(0, otherPoolSize);
    const leftBottom = shuffledOther.slice(otherPoolSize);

    // Ensure each pool has at least 2 images for rotation
    const ensureMinimumImages = (pool: string[]) => {
      if (pool.length === 0) return [];
      if (pool.length === 1) return [...pool, ...pool];
      return pool;
    };

    const pools = {
      leftTop: ensureMinimumImages(leftTop),
      leftBottom: ensureMinimumImages(leftBottom),
      rightTop: ensureMinimumImages(rightTop),
      rightBottom: ensureMinimumImages(rightBottom),
    };

    devLog(`Loaded ${ALL_HERO_IMAGES.length} hero images from /public/hero, distributed into 4 pools`);
    devLog(`Pool sizes: leftTop=${pools.leftTop.length}, leftBottom=${pools.leftBottom.length}, rightTop=${pools.rightTop.length}, rightBottom=${pools.rightBottom.length}`);

    setImagePools(pools);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative pt-20 pb-20 md:pt-32 md:pb-32 mx-4 sm:mx-6 lg:mx-8 overflow-hidden min-h-screen flex flex-col justify-center bg-black"
      aria-label="Hero"
    >
      {/* Background Glow - Removed for pure black background */}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center z-20 relative">
        {/* Hero Logo Text with Aurora Effect */}
        <div className="mb-8 flex justify-center">
          <p className="hero-aurora-text text-3xl md:text-4xl lg:text-5xl font-normal">
            WORLD CLASS SPORTS
          </p>
        </div>

        {/* Badge with pulsing dot */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-300 font-inter">
            COACH NATE CLASSIC REGISTRATION OPEN
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-white leading-[0.9] text-balance mb-8 font-inter">
          BUILT FOR
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            THE GAME.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 text-lg leading-relaxed max-w-xl mb-10 text-balance font-light font-inter">
          Building confident players through elite training, competitive teams, and high-energy tournaments.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-auto sm:w-auto h-12 px-8 rounded-full bg-gradient-to-b from-[#003d70] to-[#002C51] text-white font-medium text-sm flex items-center justify-center gap-2 font-inter relative overflow-hidden group shadow-lg shadow-[#002C51]/50 hover:shadow-xl hover:shadow-[#002C51]/60 hover:scale-[1.02] transition-all duration-300"
            style={{
              boxShadow: '0 4px 14px 0 rgba(0, 44, 81, 0.39), inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(0, 0, 0, 0.2)'
            }}
          >
            <span className="relative z-10">Find a Program</span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          </Link>
        </div>
      </div>

      {/* Parallax Image Grid with Fade Cards */}
      {isMounted && (imagePools.leftTop.length > 0 || imagePools.leftBottom.length > 0 || imagePools.rightTop.length > 0 || imagePools.rightBottom.length > 0) && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          {/* Image 1 - Top Left (logo/equip - no blur) */}
          {imagePools.leftTop.length > 0 && (
            <div
              className="absolute left-[5%] md:left-[12%] top-[8%] w-36 md:w-56 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 0.8}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.leftTop} 
                interval={8500} 
                alt="Team"
                hasEdgeBlur={false}
              />
            </div>
          )}
          
          {/* Image 2 - Bottom Left (other images - with blur) */}
          {imagePools.leftBottom.length > 0 && (
            <div
              className="absolute left-[2%] md:left-[8%] top-[55%] md:top-[60%] w-52 md:w-72 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 0.3}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.leftBottom} 
                interval={11000} 
                alt="Play"
                hasEdgeBlur={true}
              />
            </div>
          )}

          {/* Image 3 - Top Right (other images - with blur) */}
          {imagePools.rightTop.length > 0 && (
            <div
              className="absolute right-[5%] md:right-[12%] top-[10%] w-56 md:w-80 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 1.0}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.rightTop} 
                interval={9500} 
                alt="Hoop"
                hasEdgeBlur={true}
              />
            </div>
          )}
          
          {/* Image 4 - Bottom Right (logo/equip - no blur) */}
          {imagePools.rightBottom.length > 0 && (
            <div
              className="absolute right-[2%] md:right-[8%] top-[60%] md:top-[65%] w-40 md:w-60 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 0.5}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.rightBottom} 
                interval={13000} 
                alt="Coach"
                hasEdgeBlur={false}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
