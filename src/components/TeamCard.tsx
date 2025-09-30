// src/components/TeamCard.tsx
"use client";
import { Team } from "@/types/supabase";
import Image from "next/image";
import Link from "next/link";
import { devError } from "@/lib/security";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 flex flex-col items-center h-80">
      <Image
        src={team.logo_url || "/logos/logo2.png"}
        alt={`${team.name} logo`}
        width={100}
        height={100}
        className="rounded-full object-cover mb-4 flex-shrink-0"
        onError={(e) => {
          devError(`Image load error for ${team.name} logo: ${team.logo_url}`);
          e.currentTarget.src = "/logos/logo2.png";
        }}
      />
      <div className="flex flex-col items-center flex-1 justify-between w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bebas uppercase text-center mb-2">
            {team.name}
          </h2>
          <p className="text-gray-300 font-inter text-center text-sm">
            {team.age_group} {team.gender} – Grade {team.grade_level}
          </p>
          <p className="text-gray-300 font-inter text-center mt-2 text-sm">
            Coach{team.coach_names.length > 1 ? "es" : ""}:{" "}
            {team.coach_names.length > 0
              ? team.coach_names.join(", ")
              : "Not assigned"}
          </p>
        </div>
        <Link
          href={`/teams/${team.id}`}
          className="text-red hover:underline mt-4 font-bebas flex-shrink-0"
          aria-label={`View details for ${team.name}`}
        >
          View Team
        </Link>
      </div>
    </div>
  );
}
