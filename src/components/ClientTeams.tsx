// src/components/ClientTeams.tsx
"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useMediaQuery } from "react-responsive";
import TeamCard from "@/components/TeamCard";
import * as Sentry from "@sentry/nextjs";
import { Team } from "@/types/supabase";

interface ClientTeamsProps {
  initialTeams: Team[];
  error?: string | null;
}

export default function ClientTeams({ initialTeams, error }: ClientTeamsProps) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const uniqueTeams = initialTeams.filter(
    (team, index, self) => index === self.findIndex((t) => t.name === team.name)
  );

  if (error) {
    Sentry.captureMessage("Teams page error: " + error);
    return (
      <div className="bg-navy min-h-screen text-white">
        <section className="pt-20 pb-12 sm:pt-24" aria-label="Our Teams">
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
        <section className="pt-20 pb-12 sm:pt-24" aria-label="Our Teams">
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
                    : { y: -8, transition: { duration: 0.3, ease: "easeOut" } }
                }
              >
                <TeamCard team={team} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
