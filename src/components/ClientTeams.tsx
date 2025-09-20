"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useMediaQuery } from "react-responsive";
import TeamCard from "@/components/TeamCard";
import * as Sentry from "@sentry/nextjs";

/**
 * Team data interface representing a basketball team
 * Matches the Team interface in TeamCard component
 */
interface Team {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  grade_level: string;
  logo_url: string;
  coach_names: string[];
  video_url: string;
}

/**
 * Props interface for the ClientTeams component
 */
interface ClientTeamsProps {
  initialTeams: Team[];
  error?: string | null;
}

/**
 * ClientTeams component displays a grid of team cards
 * Handles responsive layout, duplicate filtering, and error states
 * Uses intersection observer for scroll-based animations
 *
 * @param initialTeams - Array of team data from server-side fetch
 * @param error - Optional error message if teams failed to load
 */
export default function ClientTeams({ initialTeams, error }: ClientTeamsProps) {
  // Intersection observer for scroll-based animations
  const { ref, inView } = useInView({ triggerOnce: true });

  // Responsive design hook for mobile detection
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  /**
   * Remove duplicate teams based on team name
   * Keeps the first occurrence of each team name to maintain order
   */
  const uniqueTeams = initialTeams.filter(
    (team, index, self) => index === self.findIndex((t) => t.name === team.name)
  );

  if (error) {
    Sentry.captureMessage("Teams page error: " + error);
    return (
      <div className="bg-navy min-h-screen text-white">
        <section className="py-12" aria-label="Our Teams">
          <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-white text-base font-inter text-center">
              {error}
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (!uniqueTeams.length) {
    return (
      <div className="bg-navy min-h-screen text-white">
        <section className="py-12" aria-label="Our Teams">
          <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-white text-base font-inter text-center">
              No teams available.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white">
      <section ref={ref} className="py-12" aria-label="Our Teams">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            Our Teams
          </h1>
          <p className="text-white text-lg font-inter mb-8 text-center">
            Meet our competitive youth basketball teams for the 2025-2026
            season.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 space-y-4 md:space-y-0">
            {uniqueTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={
                  isMobile
                    ? {}
                    : {
                        y: -8,
                        transition: { duration: 0.3, ease: "easeOut" },
                      }
                }
              >
                <TeamCard team={team} isMobile={isMobile} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
