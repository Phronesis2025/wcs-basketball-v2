"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FlipCard from "./FlipCard";
import { devError, devLog } from "@/lib/security";

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
  const [isLoadingImages, setIsLoadingImages] = useState(true);


  // Fetch hero images from Supabase storage via API route
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        // Check localStorage cache first
        const cacheKey = 'hero-images-cache';
        const cacheTimestampKey = 'hero-images-cache-timestamp';
        const cacheVersionKey = 'hero-images-cache-version';
        const cacheExpiry = 3600000; // 1 hour in milliseconds
        const currentCacheVersion = '2.2'; // Increment this when file structure changes (force refresh for new images)
        
        const cachedData = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
        const cachedTimestamp = typeof window !== 'undefined' ? localStorage.getItem(cacheTimestampKey) : null;
        const cachedVersion = typeof window !== 'undefined' ? localStorage.getItem(cacheVersionKey) : null;
        
        // Only use cache if version matches and it's less than 1 hour old
        if (cachedData && cachedTimestamp && cachedVersion === currentCacheVersion) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          
          if (now - timestamp < cacheExpiry) {
            const { images: imageUrls } = JSON.parse(cachedData);
            devLog("Using cached hero images");
            
            // Validate cached URLs - filter out any that might reference deleted files
            // Only filter known invalid patterns (files that definitely don't exist)
            const validImageUrls = imageUrls?.filter((url: string) => {
              if (!url || typeof url !== 'string') return false;
              const urlLower = url.toLowerCase();
              
              // Only filter out files we know for certain don't exist
              // ChatGPT files and old teams-card (but allow values-card)
              if (urlLower.includes('chatgpt')) {
                devLog(`Filtering out invalid cached URL: ${url} (ChatGPT file)`);
                return false;
              }
              if (urlLower.includes('teams-card') && !urlLower.includes('values-card')) {
                devLog(`Filtering out invalid cached URL: ${url} (old teams-card file)`);
                return false;
              }
              
              return true;
            }) || [];
            
            // If we filtered out URLs, clear cache and fetch fresh
            if (validImageUrls.length < imageUrls.length) {
              devLog(`Clearing cache due to invalid URLs. Had ${imageUrls.length}, now ${validImageUrls.length}`);
              if (typeof window !== 'undefined') {
                localStorage.removeItem(cacheKey);
                localStorage.removeItem(cacheTimestampKey);
                localStorage.removeItem(cacheVersionKey);
              }
              // Continue to fetch fresh data below - don't return
            } else if (validImageUrls.length > 0) {
              // Process cached images - use validImageUrls, not imageUrls
              // Separate images by prefix: logo/equip vs all others
              const logoEquipImages: string[] = [];
              const otherImages: string[] = [];
              
              for (const url of validImageUrls) {
                const urlLower = url.toLowerCase();
                const filenameMatch = urlLower.match(/\/hero\/([^/?]+)/);
                if (filenameMatch) {
                  const filename = filenameMatch[1];
                  if (filename.startsWith('logo-') || filename.startsWith('equip-')) {
                    logoEquipImages.push(url);
                  } else {
                    otherImages.push(url);
                  }
                }
              }
              
              // Shuffle each group separately
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
              
              const pools = {
                leftTop,
                leftBottom,
                rightTop,
                rightBottom,
              };
              
              const ensureMinimumImages = (pool: string[]) => {
                if (pool.length === 0) return [];
                if (pool.length === 1) return [...pool, ...pool];
                return pool;
              };
              
              setImagePools({
                leftTop: ensureMinimumImages(pools.leftTop),
                leftBottom: ensureMinimumImages(pools.leftBottom),
                rightTop: ensureMinimumImages(pools.rightTop),
                rightBottom: ensureMinimumImages(pools.rightBottom),
              });
              setIsLoadingImages(false);
              return; // Exit early if using valid cached data
            }
          }
        }
        
        // Fetch images from API route (uses admin client with proper permissions)
        const response = await fetch('/api/hero-images', {
          cache: 'force-cache', // Use browser cache
        });
        
        if (!response.ok) {
          devError("Error fetching hero images from API:", response.statusText);
          setImagePools({
            leftTop: [],
            leftBottom: [],
            rightTop: [],
            rightBottom: [],
          });
          setIsLoadingImages(false);
          return;
        }

        const { images: imageUrls } = await response.json();
        
        // Validate API response URLs - filter out any invalid ones
        // Only filter known invalid patterns (files that definitely don't exist)
        const validApiUrls = imageUrls?.filter((url: string) => {
          if (!url || typeof url !== 'string') return false;
          const urlLower = url.toLowerCase();
          
          // Only filter out files we know for certain don't exist
          // ChatGPT files and old teams-card (but allow values-card)
          if (urlLower.includes('chatgpt')) {
            devLog(`Filtering out invalid API URL: ${url} (ChatGPT file)`);
            return false;
          }
          if (urlLower.includes('teams-card') && !urlLower.includes('values-card')) {
            devLog(`Filtering out invalid API URL: ${url} (old teams-card file)`);
            return false;
          }
          
          return true;
        }) || [];
        
        // Cache the validated response with version
        if (typeof window !== 'undefined' && validApiUrls && validApiUrls.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify({ images: validApiUrls }));
          localStorage.setItem(cacheTimestampKey, Date.now().toString());
          localStorage.setItem(cacheVersionKey, currentCacheVersion);
        }

        if (validApiUrls && validApiUrls.length > 0) {
          devLog(`Total image URLs received: ${imageUrls.length}, valid after filtering: ${validApiUrls.length}`);

          // Separate images by prefix:
          // - logo- and equip- files go to top left and bottom right
          // - All other files go to top right and bottom left
          const logoEquipImages: string[] = [];
          const otherImages: string[] = [];
          
          for (const url of validApiUrls) {
            const urlLower = url.toLowerCase();
            // Extract filename from URL (after /hero/)
            const filenameMatch = urlLower.match(/\/hero\/([^/?]+)/);
            if (filenameMatch) {
              const filename = filenameMatch[1];
              if (filename.startsWith('logo-') || filename.startsWith('equip-')) {
                logoEquipImages.push(url);
              } else {
                otherImages.push(url);
              }
            }
          }
          
          // Shuffle each group separately
          const shuffledLogoEquip = [...logoEquipImages].sort(() => Math.random() - 0.5);
          const shuffledOther = [...otherImages].sort(() => Math.random() - 0.5);
          
          // Distribute logo/equip images to top left and bottom right
          const logoEquipPoolSize = Math.ceil(shuffledLogoEquip.length / 2);
          const leftTop = shuffledLogoEquip.slice(0, logoEquipPoolSize);
          const rightBottom = shuffledLogoEquip.slice(logoEquipPoolSize);
          
          // Distribute other images to top right and bottom left
          const otherPoolSize = Math.ceil(shuffledOther.length / 2);
          const rightTop = shuffledOther.slice(0, otherPoolSize);
          const leftBottom = shuffledOther.slice(otherPoolSize);
          
          const pools = {
            leftTop,
            leftBottom,
            rightTop,
            rightBottom,
          };

          // Ensure each pool has at least 2 images for rotation (duplicate within pool if needed)
          // This ensures smooth rotation while keeping pools unique from each other
          const ensureMinimumImages = (pool: string[]) => {
            if (pool.length === 0) return [];
            if (pool.length === 1) return [...pool, ...pool]; // Duplicate single image for rotation
            // If pool has 2+ images, return as is (already good for rotation)
            return pool;
          };

          // Verify no duplicates across pools
          const allPoolImages = [
            ...pools.leftTop,
            ...pools.leftBottom,
            ...pools.rightTop,
            ...pools.rightBottom,
          ];
          const uniqueImages = new Set(allPoolImages);
          
          if (allPoolImages.length !== uniqueImages.size) {
            devLog("Warning: Some images may appear in multiple pools");
          }

          setImagePools({
            leftTop: ensureMinimumImages(pools.leftTop),
            leftBottom: ensureMinimumImages(pools.leftBottom),
            rightTop: ensureMinimumImages(pools.rightTop),
            rightBottom: ensureMinimumImages(pools.rightBottom),
          });

          devLog(`Loaded ${validApiUrls.length} hero images from storage, distributed into 4 pools`);
          devLog(`Logo/Equip images: ${logoEquipImages.length} (leftTop=${pools.leftTop.length}, rightBottom=${pools.rightBottom.length})`);
          devLog(`Other images: ${otherImages.length} (rightTop=${pools.rightTop.length}, leftBottom=${pools.leftBottom.length})`);
          devLog(`Pool sizes: leftTop=${pools.leftTop.length}, leftBottom=${pools.leftBottom.length}, rightTop=${pools.rightTop.length}, rightBottom=${pools.rightBottom.length}`);
        } else {
          devLog("No hero images found in storage bucket images/hero");
          // Fallback to empty pools
          setImagePools({
            leftTop: [],
            leftBottom: [],
            rightTop: [],
            rightBottom: [],
          });
        }
      } catch (error) {
        devError("Error fetching hero images:", error);
        setImagePools({
          leftTop: [],
          leftBottom: [],
          rightTop: [],
          rightBottom: [],
        });
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchHeroImages();
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
      className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center bg-[#030303]"
      aria-label="Hero"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/[0.05] blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center z-20 relative">
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

      {/* Parallax Image Grid with Flip Cards */}
      {!isLoadingImages && (imagePools.leftTop.length > 0 || imagePools.leftBottom.length > 0 || imagePools.rightTop.length > 0 || imagePools.rightBottom.length > 0) && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          {/* Image 1 - Top Left */}
          {imagePools.leftTop.length > 0 && (
            <div
              className="absolute left-[5%] md:left-[12%] top-[8%] w-36 md:w-56 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 0.8}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.leftTop} 
                interval={10000} 
                alt="Team"
              />
            </div>
          )}
          
          {/* Image 2 - Bottom Left */}
          {imagePools.leftBottom.length > 0 && (
            <div
              className="absolute left-[2%] md:left-[8%] top-[55%] md:top-[60%] w-52 md:w-72 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 0.3}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.leftBottom} 
                interval={14000} 
                alt="Play"
          />
        </div>
          )}

          {/* Image 3 - Top Right */}
          {imagePools.rightTop.length > 0 && (
            <div
              className="absolute right-[5%] md:right-[12%] top-[10%] w-56 md:w-80 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 1.0}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.rightTop} 
                interval={12000} 
                alt="Hoop"
              />
            </div>
          )}
          
          {/* Image 4 - Bottom Right */}
          {imagePools.rightBottom.length > 0 && (
            <div
              className="absolute right-[2%] md:right-[8%] top-[60%] md:top-[65%] w-40 md:w-60 aspect-[3/4] opacity-35"
              style={{
                transform: `translateY(${scrollY * 0.5}px)`,
              }}
            >
              <FlipCard 
                images={imagePools.rightBottom} 
                interval={16000} 
                alt="Coach"
              />
        </div>
          )}
      </div>
      )}
    </section>
  );
}
