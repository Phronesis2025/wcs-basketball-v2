"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Team {
  id: string;
  name: string;
  age_group: string;
  gender: string;
  coach_email: string;
  grade_level: string;
  logo_url: string;
}

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-black rounded-[15px] shadow-md overflow-hidden mx-auto flex flex-col",
        "drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
      )}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-full h-48 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
        <Image
          src={team.logo_url}
          alt={`${team.name} team photo`}
          fill
          priority
          className="object-cover object-center"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder-team-default.jpg";
          }}
        />
        <div className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 w-[100px] h-[100px] rounded-full border-8 border-[#002C51]">
          <Image
            src={team.logo_url}
            alt={`${team.name} logo`}
            fill
            className="object-contain rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/placeholder-team-default.jpg";
            }}
          />
        </div>
      </div>
      <div className="pt-[60px] p-6 flex flex-col flex-grow text-center shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
        <h3 className="text-white font-bebas text-sm sm:text-lg lg:text-2xl mb-1 sm:mb-2 uppercase">
          {team.name}
        </h3>
        <p className="text-white text-sm font-inter">
          {team.age_group} {team.gender}
        </p>
      </div>
    </motion.div>
  );
}
