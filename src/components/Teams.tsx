"use client";

import { useInView } from "react-intersection-observer";
import { motion, Variants } from "framer-motion";
import { useState } from "react";
import TeamCard from "./TeamCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import * as Sentry from "@sentry/nextjs";

interface Team {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  coach_email: string;
  grade_level: string;
  logo_url: string;
}

interface TeamsProps {
  initialTeams: Team[];
  error?: string | null;
}

export default function Teams({ initialTeams, error }: TeamsProps) {
  const { ref } = useInView({ triggerOnce: true });
  const [startIndex, setStartIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );

  const handlePrev = () => {
    setSlideDirection("left");
    setStartIndex(
      (prev) => (prev - 3 + initialTeams.length) % initialTeams.length
    );
  };

  const handleNext = () => {
    setSlideDirection("right");
    setStartIndex((prev) => (prev + 3) % initialTeams.length);
  };

  const getItemVariants = (): Variants => {
    if (slideDirection === "left") {
      return {
        hidden: { opacity: 0, x: -200 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      };
    } else if (slideDirection === "right") {
      return {
        hidden: { opacity: 0, x: 200 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      };
    } else {
      return {
        hidden: { opacity: 0, y: 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: "easeOut" },
        },
      };
    }
  };

  // Compute the 3 visible teams for the current page (wraps around)
  const visibleTeams: Team[] = [0, 1, 2].map((offset) => {
    const teamIndex = (startIndex + offset) % initialTeams.length;
    return initialTeams[teamIndex];
  });

  if (error) {
    Sentry.captureMessage("Teams component error: " + error);
    return (
      <section className="bg-[#002C51] py-12" aria-label="Our Teams">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white text-base font-inter text-center">{error}</p>
        </div>
      </section>
    );
  }

  if (!initialTeams.length) {
    return (
      <section className="bg-[#002C51] py-12" aria-label="Our Teams">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white text-base font-inter text-center">
            No teams available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="bg-[#002C51] py-12" aria-label="Our Teams">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bebas text-white mb-4 text-center uppercase">
          Our Teams
        </h2>
        <div className="relative">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 pb-4">
            {visibleTeams.map((team) => (
              <motion.div
                key={`${team.id}-${startIndex}-${slideDirection}`}
                variants={getItemVariants()}
                initial="hidden"
                animate="visible"
              >
                <TeamCard team={team} />
              </motion.div>
            ))}
          </div>
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
            onClick={handlePrev}
            aria-label="Previous teams"
          >
            <FaArrowLeft />
          </button>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
            onClick={handleNext}
            aria-label="Next teams"
          >
            <FaArrowRight />
          </button>
        </div>
        <div className="mt-8 text-center">
          <Button
            asChild
            variant="default"
            className="bg-blue-600 text-white font-medium font-inter rounded-md hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-base px-6 py-3 uppercase"
          >
            <Link href="/teams" className="no-underline">
              View All Teams
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
