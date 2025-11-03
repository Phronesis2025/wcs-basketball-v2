"use client";

import { useState } from "react";
import { Player, Team } from "@/types/supabase";
import BasketballLoader from "./BasketballLoader";

interface CoachPlayersViewProps {
  teams: Team[];
  players: Player[];
  userName: string;
  managementDataLoading: boolean;
  expandedSections: {
    players: boolean;
  };
  toggleSection: (section: string) => void;
  setEditingPlayer: (player: Player | null) => void;
}

// Helper function to format player name as "FirstName L."
const formatPlayerName = (fullName: string): string => {
  const nameParts = fullName.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0]; // Only first name
  }
  const firstName = nameParts[0];
  const lastNameInitial = nameParts[nameParts.length - 1][0];
  return `${firstName} ${lastNameInitial}.`;
};

export default function CoachPlayersView({
  teams,
  players,
  userName,
  managementDataLoading,
  expandedSections,
  toggleSection,
  setEditingPlayer,
}: CoachPlayersViewProps) {
  // Get teams assigned to current coach
  // Fallback: if teams don't include coaches array (e.g., fetched via /api/teams/by-coach),
  // treat all provided teams as assigned to this coach
  const coachTeams = teams.some((t: Team) => (t as any).coaches)
    ? teams.filter((team: Team) =>
        (team as any).coaches?.some(
          (teamCoach: any) => teamCoach.email === userName
        )
      )
    : teams;

  // Filter players to only show those in coach's teams
  const coachPlayers = players.filter((player: Player) =>
    coachTeams.some((team) => team.id === player.team_id)
  );

  if (managementDataLoading) {
    return (
      <div className="text-center py-8">
        <BasketballLoader size={60} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Players Accordion - Filtered for coach's teams */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg">
        <div
          className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
          onClick={() => toggleSection("players")}
        >
          <div className="flex items-center">
            <h2 className="text-2xl font-bebas font-bold text-red">
              My Players ({coachPlayers.length})
            </h2>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ml-3 ${
                expandedSections.players ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {expandedSections.players && (
          <div className="max-h-96 overflow-y-auto">
            {coachPlayers.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <p>No players assigned to your teams yet.</p>
                <p className="text-sm mt-2">
                  Contact an administrator to assign players to your teams.
                </p>
              </div>
            ) : (
              coachPlayers.map((player, index) => {
                const playerTeam = teams.find(
                  (team) => team.id === player.team_id
                );
                const isActive = (player as any).is_active;
                const isInactive = isActive === false;

                return (
                  <div
                    key={player.id}
                    className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 ${
                      index === coachPlayers.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    {/* Desktop Layout */}
                    <div
                      className="hidden md:grid items-center w-full"
                      style={{
                        gridTemplateColumns:
                          "auto 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto",
                      }}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                        <span className="text-white font-bold text-sm">
                          {player.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>

                      {/* Name */}
                      <div className="text-white font-medium">
                        {formatPlayerName(player.name)}
                      </div>

                      {/* Team */}
                      <div className="text-gray-400 text-sm">
                        {playerTeam?.name || "Unassigned"}
                      </div>

                      {/* Jersey Number */}
                      <div className="text-gray-400 text-sm text-center">
                        #{player.jersey_number || "N/A"}
                      </div>

                      {/* Grade */}
                      <div className="text-gray-400 text-sm text-center">
                        {player.grade || "N/A"}
                      </div>

                      {/* Age */}
                      <div className="text-gray-400 text-sm text-center">
                        {player.age ? `${player.age} years` : "N/A"}
                      </div>

                      {/* Gender */}
                      <div className="text-gray-400 text-sm text-center">
                        {player.gender || "N/A"}
                      </div>

                      {/* Active/Inactive Badge */}
                      <div className="text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isInactive
                              ? "!bg-red-600 !text-white"
                              : "!bg-green-900 !text-green-300"
                          }`}
                          style={
                            isInactive
                              ? {
                                  backgroundColor: "#dc2626",
                                  color: "white",
                                }
                              : {
                                  backgroundColor: "#14532d",
                                  color: "#86efac",
                                }
                          }
                        >
                          {isInactive ? "Inactive" : "Active"}
                        </span>
                      </div>

                      {/* Edit Button */}
                      <div className="text-center">
                        <button
                          onClick={() => setEditingPlayer(player)}
                          className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded hover:bg-blue-900/20"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div
                      className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                      onClick={() => setEditingPlayer(player)}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">
                          {player.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {formatPlayerName(player.name)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {playerTeam?.name || "Unassigned"} • #
                          {player.jersey_number || "N/A"}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isInactive
                              ? "!bg-red-600 !text-white"
                              : "!bg-green-900 !text-green-300"
                          }`}
                          style={
                            isInactive
                              ? {
                                  backgroundColor: "#dc2626",
                                  color: "white",
                                }
                              : {
                                  backgroundColor: "#14532d",
                                  color: "#86efac",
                                }
                          }
                        >
                          {isInactive ? "Inactive" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
