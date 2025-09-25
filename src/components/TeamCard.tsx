"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/**
 * Team data interface representing a basketball team
 */
interface Team {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  grade_level: string;
  logo_url: string | null;
  season: string;
  coach_names: string[];
  video_url: string | null;
}

/**
 * Props interface for the TeamCard component
 */
interface TeamCardProps {
  team: Team;
  index: number;
  isMobile: boolean;
}

/**
 * TeamCard component displays individual team information in a card format
 * Features hover animations, team-specific logos, and responsive design
 *
 * @param team - Team data object containing all team information
 * @param index - Index of the team in the list (used for animations)
 * @param isMobile - Boolean indicating if the device is mobile
 */
export default function TeamCard({
  team,
  isMobile,
}: Omit<TeamCardProps, "index">) {
  /**
   * Maps team names to their corresponding logo files
   * Uses case-insensitive matching to find team-specific logos
   * Falls back to gender-based default logos if no match found
   *
   * @param teamName - The name of the team to get logo for
   * @returns Path to the appropriate logo file
   */
  const getTeamLogo = (teamName: string): string => {
    const name = teamName.toLowerCase();

    // Team-specific logo mapping
    if (name.includes("dupy")) return "/logos/logo-dupy.png";
    if (name.includes("legends")) return "/logos/logo-legends.png";
    if (name.includes("potter")) return "/logos/logo-potter.png";
    if (name.includes("sharks")) return "/logos/logo-sharks.png";
    if (name.includes("swish")) return "/logos/logo-swish.png";
    if (name.includes("vipers")) return "/logos/logo-vipers.png";
    if (name.includes("warriors")) return "/logos/logo-warriors.png";
    if (name.includes("williams")) return "/logos/logo-williams.png";

    // Default logos based on gender
    return team.gender === "Boys"
      ? "/logos/logo-blue.png"
      : "/logos/logo-red.png";
  };

  return (
    <motion.div
      className="relative rounded-lg shadow-md overflow-hidden group"
      whileHover={
        isMobile
          ? {}
          : { y: -8, transition: { duration: 0.3, ease: "easeOut" } }
      }
    >
      {/* Team Image Section */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={
            team.gender === "Boys"
              ? "/teams/boys-team.png"
              : "/teams/girls-team.png"
          }
          alt={`${team.name} team`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder-team-default.jpg";
          }}
        />
        {/* Dark gradient overlay for better visual hierarchy */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 group-hover:from-black/30 group-hover:via-black/50 group-hover:to-black/70 transition-all duration-300" />
      </div>

      {/* Circular Team Logo - positioned to overlap image and content */}
      <div className="absolute top-[152px] left-1/2 transform -translate-x-1/2 w-[120px] h-[120px] rounded-full border-8 border-black bg-white z-[9999] opacity-100">
        <Image
          src={getTeamLogo(team.name)}
          alt={`${team.name} logo`}
          fill
          sizes="120px"
          className="object-contain rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/logos/logo2.png";
          }}
        />
      </div>

      {/* Team Information Section */}
      <div className="relative bg-white pt-[80px] p-6 z-10 text-center">
        <h4 className="text-xl font-bebas text-navy mb-2 group-hover:text-red transition-colors duration-300">
          {team.name}
        </h4>
        <p className="text-gray-600 font-inter text-sm mb-2">
          {team.age_group} {team.gender} - Grade {team.grade_level}
        </p>
        <p className="text-gray-600 font-inter text-sm mb-4">
          Coach: {team.coach_names.join(", ") || "TBD"}
        </p>
        <Link
          href={`/teams/${team.id}`}
          className="block bg-red text-white font-medium font-inter rounded-md text-sm px-5 py-2.5 uppercase w-full text-center hover:bg-red/90 transition-colors duration-200"
        >
          View Team Details
        </Link>
      </div>
    </motion.div>
  );
}
