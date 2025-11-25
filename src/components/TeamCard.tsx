// src/components/TeamCard.tsx
"use client";
import { Team } from "@/types/supabase";
import Image from "next/image";
import Link from "next/link";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col items-center h-80 hover:bg-white/10 transition-colors duration-300">
      <Image
        src={
          team.logo_url ||
          "https://htgkddahhgugesktujds.supabase.co/storage/v1/object/public/images/logos/placeholder-logo%20(2).png"
        }
        alt={`${team.name} logo`}
        width={100}
        height={100}
        className="rounded-full object-cover mb-4 flex-shrink-0"
        sizes="100px"
        onError={(e) => {
          // Silently fallback to default logo without logging error
          e.currentTarget.src =
            "https://htgkddahhgugesktujds.supabase.co/storage/v1/object/public/images/logos/placeholder-logo%20(2).png";
        }}
      />
      <div className="flex flex-col items-center flex-1 justify-between w-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold uppercase text-center mb-2 text-white font-inter tracking-tight">
            {team.name}
          </h2>
          <p className="text-slate-400 font-inter text-center text-sm">
            {team.age_group} {team.gender} – Grade {team.grade_level}
          </p>
          <p className="text-slate-400 font-inter text-center mt-2 text-sm">
            Coach{team.coach_names.length > 1 ? "es" : ""}:{" "}
            {team.coach_names.length > 0
              ? team.coach_names.join(", ")
              : "Not assigned"}
          </p>
        </div>
        <Link
          href={`/teams/${team.id}`}
          className="text-blue-400 hover:text-blue-300 hover:underline mt-4 font-inter flex-shrink-0 transition-colors duration-200"
          aria-label={`View details for ${team.name}`}
        >
          View Team →
        </Link>
      </div>
    </div>
  );
}
