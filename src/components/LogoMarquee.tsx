"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Team {
  id: string;
  name: string;
  logo_url?: string;
}

export default function LogoMarquee() {
  const [isPaused, setIsPaused] = useState(false);
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
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("id, name, logo_url")
          .eq("is_active", true)
          .order("name");

        if (error) {
          console.error("Error fetching teams:", error);
          // Use fallback logos if database fetch fails
          setTeams(
            fallbackLogos.map((logo, index) => ({
              id: `fallback-${index}`,
              name: `Team ${index + 1}`,
              logo_url: logo,
            }))
          );
        } else {
          setTeams(data || []);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
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

    fetchTeams();
  }, []);

  // Combine team logos with fallback logos to ensure we have enough logos for the marquee
  const getDisplayLogos = () => {
    const teamLogos = teams
      .filter((team) => team.logo_url)
      .map((team) => ({
        id: team.id,
        name: team.name,
        logo_url: team.logo_url!,
      }));

    // If we have team logos, use them; otherwise use fallback logos
    const logosToUse =
      teamLogos.length > 0
        ? teamLogos
        : fallbackLogos.map((logo, index) => ({
            id: `fallback-${index}`,
            name: `Team ${index + 1}`,
            logo_url: logo,
          }));

    // Duplicate the logos array to create seamless scrolling
    return [...logosToUse, ...logosToUse];
  };

  const displayLogos = getDisplayLogos();

  if (loading) {
    return (
      <section
        className="bg-navy/80 py-8 overflow-hidden"
        aria-label="Team Logos"
      >
        <div className="flex items-center justify-center">
          <div className="text-white text-lg">Loading team logos...</div>
        </div>
      </section>
    );
  }

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
        {displayLogos.map((logo, index) => (
          <div
            key={`${logo.id}-${index}`}
            className="flex-shrink-0 mx-12 w-[100px] h-[100px] relative flex items-center justify-center"
          >
            {/* Black circle background */}
            <div className="absolute inset-0 bg-black rounded-full"></div>
            {/* Logo container - keeping the same size as before */}
            <div className="relative w-[140px] h-[70px] z-10">
              <Image
                src={logo.logo_url}
                alt={`${logo.name} logo`}
                fill
                sizes="140px"
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/basketball icon.png";
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
