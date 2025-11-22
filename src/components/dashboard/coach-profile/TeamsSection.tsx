// src/components/dashboard/coach-profile/TeamsSection.tsx
import React from "react";
import Image from "next/image";
import { CoachProfileData } from "./hooks/useProfile";

interface TeamsSectionProps {
  profileData: CoachProfileData;
}

export default function TeamsSection({ profileData }: TeamsSectionProps) {
  return (
    <div>
      <h3 className="text-2xl font-bebas text-white mb-6 uppercase">
        Teams & Responsibilities
      </h3>
      {profileData.teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.teams.map((team) => (
            <div
              key={team.id}
              className="bg-gray-800 border border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                {team.logo_url ? (
                  <Image
                    src={team.logo_url}
                    alt={team.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bebas text-gray-300">
                      🏀
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="text-lg font-bebas text-white">
                    {team.name}
                  </h4>
                  <p className="text-sm font-inter text-gray-400">
                    {team.age_group} • {team.gender}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 font-inter">No teams assigned</p>
      )}
    </div>
  );
}

