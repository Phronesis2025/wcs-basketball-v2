"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";

interface Team {
  id: string;
  name: string;
  logo_url?: string;
}

export default function LogoMarquee() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback logos for teams without logos
  const fallbackLogos = [
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

  useEffect(() => {
    const fetchAllLogos = async () => {
      try {
        const allLogos: Team[] = [];
        const logoUrls = new Set<string>(); // Track URLs to avoid duplicates

        // 1. Fetch logos from Supabase storage bucket via API route (PRIMARY SOURCE)
        try {
          const response = await fetch('/api/logos');
          
          if (response.ok) {
            const { logos: storageLogos } = await response.json();
            
            if (storageLogos && storageLogos.length > 0) {
              for (const logo of storageLogos) {
                if (logo.logo_url && !logoUrls.has(logo.logo_url)) {
                  logoUrls.add(logo.logo_url);
                  allLogos.push({
                    id: logo.id,
                    name: logo.name,
                    logo_url: logo.logo_url,
                  });
                }
              }
              devLog(`Loaded ${allLogos.length} logos from storage bucket images/logos via API`);
            } else {
              devLog("No logos found in storage bucket images/logos");
            }
          } else {
            devError("Error fetching logos from API:", response.statusText);
          }
        } catch (storageError) {
          devError("Error accessing storage API:", storageError);
        }

        // 2. Fetch team logos from database
      try {
          const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("id, name, logo_url")
          .eq("is_active", true)
          .order("name");

          if (!teamError && teamData) {
            for (const team of teamData) {
              if (team.logo_url && !logoUrls.has(team.logo_url)) {
                logoUrls.add(team.logo_url);
                allLogos.push({
                  id: team.id,
                  name: team.name,
                  logo_url: team.logo_url,
                });
              }
            }
          } else if (teamError) {
            devError("Error fetching teams:", teamError);
          }
        } catch (dbError) {
          devError("Error accessing database:", dbError);
        }

        // 3. If we have logos, use them; otherwise use fallback
        if (allLogos.length > 0) {
          setTeams(allLogos);
        } else {
          // Use fallback logos if no logos found
          setTeams(
            fallbackLogos.map((logo, index) => ({
              id: `fallback-${index}`,
              name: `Team ${index + 1}`,
              logo_url: logo,
            }))
          );
        }
      } catch (error) {
        devError("Error fetching logos:", error);
        // Use fallback logos if there's an error
        setTeams(
          fallbackLogos.map((logo, index) => ({
            id: `fallback-${index}`,
            name: `Team ${index + 1}`,
            logo_url: logo,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllLogos();
  }, []);

  if (loading) {
    return (
      <section
        className="bg-navy/80 py-3 overflow-hidden"
        aria-label="Team Logos"
      >
        <div className="flex items-center justify-center">
          <div className="text-white text-lg">Loading team logos...</div>
        </div>
      </section>
    );
  }

  // Get all team logos
  const uniqueLogos = teams
    .filter((team) => team.logo_url)
    .map((team) => ({
      id: team.id,
      name: team.name,
      logo_url: team.logo_url!,
    }));

  const logosToUse = uniqueLogos.length > 0 ? uniqueLogos : fallbackLogos.map((logo, index) => ({
    id: `fallback-${index}`,
    name: `Team ${index + 1}`,
    logo_url: logo,
  }));

  // Split logos in half - first half on top row, second half on bottom row
  const halfLength = Math.ceil(logosToUse.length / 2);
  const firstRow = logosToUse.slice(0, halfLength);
  const secondRow = logosToUse.slice(halfLength);

  return (
    <section
      className="bg-[#030303] py-4 overflow-hidden border-t border-white/5 relative"
      aria-label="Team Logos"
    >
      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#030303] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none"></div>
      
      {/* First Row - Scrolling Left */}
      <div className="overflow-hidden mb-6">
        <div className="flex items-center gap-4 animate-scroll">
          {/* First set */}
          {firstRow.map((logo, index) => (
          <div
              key={`first-row-1-${logo.id}-${index}`}
              className="flex-shrink-0 w-[140px] h-[100px] bg-white/5 rounded-xl py-6 px-4 flex items-center justify-center hover:bg-white/10 transition-all relative overflow-hidden"
          >
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
              <Image
                src={logo.logo_url}
                alt={`${logo.name} logo`}
                width={120}
                height={70}
                className="object-contain grayscale relative z-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/basketball icon.png";
                }}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {firstRow.map((logo, index) => (
            <div
              key={`first-row-2-${logo.id}-${index}`}
              className="flex-shrink-0 w-[140px] h-[100px] bg-white/5 rounded-xl py-6 px-4 flex items-center justify-center hover:bg-white/10 transition-all relative overflow-hidden"
            >
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
              <Image
                src={logo.logo_url}
                alt={`${logo.name} logo`}
                width={120}
                height={70}
                className="object-contain grayscale relative z-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/basketball icon.png";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Second Row - Scrolling Right (reverse direction) */}
      <div className="overflow-hidden">
        <div className="flex items-center gap-4 animate-scroll-reverse">
          {/* First set */}
          {secondRow.map((logo, index) => (
            <div
              key={`second-row-1-${logo.id}-${index}`}
              className="flex-shrink-0 w-[140px] h-[100px] bg-white/5 rounded-xl py-6 px-4 flex items-center justify-center hover:bg-white/10 transition-all relative overflow-hidden"
            >
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
              <Image
                src={logo.logo_url}
                alt={`${logo.name} logo`}
                width={120}
                height={70}
                className="object-contain grayscale relative z-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/basketball icon.png";
                }}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {secondRow.map((logo, index) => (
            <div
              key={`second-row-2-${logo.id}-${index}`}
              className="flex-shrink-0 w-[140px] h-[100px] bg-white/5 rounded-xl py-6 px-4 flex items-center justify-center hover:bg-white/10 transition-all relative overflow-hidden"
            >
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
              <Image
                src={logo.logo_url}
                alt={`${logo.name} logo`}
                width={120}
                height={70}
                className="object-contain grayscale relative z-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/basketball icon.png";
                }}
              />
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
