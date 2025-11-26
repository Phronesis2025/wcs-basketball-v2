"use client";

import { Player, Team, Coach } from "@/types/supabase";
import Image from "next/image";

interface PlayerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  player: Player | null;
  teams: Team[];
  coaches: Coach[];
}

export default function PlayerDetailModal({
  isOpen,
  onClose,
  onEdit,
  player,
  teams,
  coaches,
}: PlayerDetailModalProps) {
  if (!isOpen || !player) return null;

  // Get team information for this player
  const playerTeam = teams.find((team: Team) => team.id === player.team_id);

  // Get coaches for this player's team
  const teamCoaches = coaches.filter((coach: Coach) =>
    playerTeam?.team_coaches?.some(
      (teamCoach: any) => teamCoach.coaches?.email === coach.email
    )
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 sm:p-4 overflow-y-auto pt-20 sm:pt-20">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto mx-1 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">
            Player Details
          </h2>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                title="Edit Player"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Player Information */}
        <div className="p-6 space-y-6">
          {/* Player Header */}
          <div className="flex items-center space-x-4">
            {/* Player Avatar */}
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {player.image_url ? (
                <Image
                  className="rounded-full object-cover"
                  src={player.image_url}
                  alt={player.name}
                  width={64}
                  height={64}
                />
              ) : (
                <span className="text-gray-600 font-bold text-xl">
                  {player.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {player.name}
              </h3>
              <div className="text-gray-600 text-sm space-y-1">
                {player.position && (
                  <div>
                    <span className="font-medium">Position:</span>{" "}
                    {player.position}
                  </div>
                )}
                {player.jersey_number && (
                  <div>
                    <span className="font-medium">Jersey #:</span>{" "}
                    {player.jersey_number}
                  </div>
                )}
                {player.birth_date && (
                  <div>
                    <span className="font-medium">Birth Date:</span>{" "}
                    {new Date(player.birth_date).toLocaleDateString()}
                  </div>
                )}
                {player.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {player.phone}
                  </div>
                )}
                {player.email && (
                  <div>
                    <span className="font-medium">Email:</span> {player.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Team Information
            </h4>
            {playerTeam ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {playerTeam.image_url ? (
                      <Image
                        className="rounded-full object-cover"
                        src={playerTeam.image_url}
                        alt={playerTeam.name}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <span className="text-gray-600 font-bold">
                        {playerTeam.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-900 font-medium">
                      {playerTeam.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {playerTeam.age_group} • {playerTeam.gender}
                      {playerTeam.grade_level &&
                        ` • Grade ${playerTeam.grade_level}`}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No team assigned</p>
            )}
          </div>

          {/* Coaches Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Team Coaches ({teamCoaches.length})
            </h4>
            {teamCoaches.length > 0 ? (
              <div className="space-y-2">
                {teamCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {coach.image_url ? (
                        <Image
                          className="rounded-full object-cover"
                          src={coach.image_url}
                          alt={`${coach.first_name} ${coach.last_name}`}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <span className="text-gray-600 font-bold text-sm">
                          {coach.first_name[0]}
                          {coach.last_name[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-gray-900 font-medium">
                        {coach.first_name} {coach.last_name}
                      </div>
                      <div className="text-gray-600 text-sm">{coach.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No coaches assigned to team</p>
            )}
          </div>

          {/* Additional Information */}
          {(player.emergency_contact_name ||
            player.emergency_contact_phone ||
            player.medical_conditions ||
            player.allergies) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Additional Information
              </h4>
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                {player.emergency_contact_name && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Emergency Contact:
                    </span>{" "}
                    {player.emergency_contact_name}
                  </div>
                )}
                {player.emergency_contact_phone && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Emergency Phone:
                    </span>{" "}
                    {player.emergency_contact_phone}
                  </div>
                )}
                {player.medical_conditions && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Medical Conditions:
                    </span>{" "}
                    {player.medical_conditions}
                  </div>
                )}
                {player.allergies && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Allergies:
                    </span>{" "}
                    {player.allergies}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
