"use client";

import { Team, Coach, Player } from "@/types/supabase";
import Image from "next/image";

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  team: Team | null;
  coaches: Coach[];
  players: Player[];
}

export default function TeamDetailModal({
  isOpen,
  onClose,
  onEdit,
  team,
  coaches,
  players,
}: TeamDetailModalProps) {
  if (!isOpen || !team) return null;

  // Get coaches assigned to this team
  const assignedCoaches = coaches.filter((coach: Coach) =>
    team.team_coaches?.some(
      (teamCoach: any) => teamCoach.coaches?.email === coach.email
    )
  );

  // Get players assigned to this team
  const assignedPlayers = players.filter(
    (player: Player) =>
      player.team_id === team.id && player.is_active && !player.is_deleted
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">
            Team Details
          </h2>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                title="Edit Team"
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

        {/* Team Information */}
        <div className="p-6 space-y-6">
          {/* Team Header */}
          <div className="flex items-center space-x-4">
            {/* Team Logo */}
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {team.logo_url ? (
                <Image
                  className="rounded-full object-cover"
                  src={team.logo_url}
                  alt={`${team.name} logo`}
                  width={64}
                  height={64}
                />
              ) : (
                <span className="text-gray-600 font-bold text-xl">
                  {team.name.charAt(0)}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {team.name}
              </h3>
              <div className="text-gray-600 text-sm space-y-1">
                <div>
                  <span className="font-medium">Age Group:</span>{" "}
                  {team.age_group}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {team.gender}
                </div>
                {team.grade_level && (
                  <div>
                    <span className="font-medium">Grade:</span>{" "}
                    {team.grade_level}
                  </div>
                )}
                {team.season && (
                  <div>
                    <span className="font-medium">Season:</span> {team.season}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Photo Section */}
          {team.team_image && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Team Photo
              </h4>
              <div className="relative w-full max-w-md mx-auto">
                <Image
                  src={`${team.team_image}?t=${Date.now()}`}
                  alt={`${team.name} team photo`}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            </div>
          )}

          {/* View Team Page Link */}
          <div className="text-center">
            <a
              href={`/teams/${team.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Team Page
            </a>
          </div>

          {/* Coaches Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Coaches ({assignedCoaches.length})
            </h4>
            {assignedCoaches.length > 0 ? (
              <div className="space-y-2">
                {assignedCoaches.map((coach) => (
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
              <p className="text-gray-600">No coaches assigned</p>
            )}
          </div>

          {/* Players Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Players ({assignedPlayers.length})
            </h4>
            {assignedPlayers.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {assignedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {player.image_url ? (
                        <Image
                          className="rounded-full object-cover"
                          src={player.image_url}
                          alt={player.name}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <span className="text-gray-600 font-bold text-sm">
                          {player.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-gray-900 font-medium">
                        {player.name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {player.position && `${player.position} • `}
                        {player.jersey_number && `#${player.jersey_number}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No players assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
