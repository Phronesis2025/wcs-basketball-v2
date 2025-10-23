"use client";

import { useState } from "react";
import { Player, Team, Coach } from "@/types/supabase";

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

interface AdminOverviewContentProps {
  teams: Team[];
  players: Player[];
  coaches: Coach[];
  managementDataLoading: boolean;
  expandedSections: {
    coaches: boolean;
    teams: boolean;
    players: boolean;
  };
  toggleSection: (section: string) => void;
  selectedTeamFilter: string;
  setSelectedTeamFilter: (filter: string) => void;
  playerSearchTerm: string;
  setPlayerSearchTerm: (term: string) => void;
  setEditingCoach: (coach: Coach | null) => void;
  setEditingTeam: (team: Team | null) => void;
  setEditingPlayer: (player: Player | null) => void;
  setSelectedCoachForModal: (coach: Coach | null) => void;
  setSelectedTeamForModal: (team: Team | null) => void;
  setSelectedPlayerForModal: (player: Player | null) => void;
  setShowEditCoachModal: (show: boolean) => void;
  setShowEditTeamModal: (show: boolean) => void;
  setShowEditPlayerModal: (show: boolean) => void;
  setCoachForm: (form: any) => void;
  setTeamForm: (form: any) => void;
  setPlayerForm: (form: any) => void;
  getCoachLoginStats: (email: string) => any;
  handleEditCoach: (coach: Coach) => void;
  handleEditTeam: (team: Team) => void;
  handleEditPlayer: (player: Player) => void;
  handleDeleteCoach: (coach: Coach) => void;
  handleDeleteTeam: (team: Team) => void;
  handleDeletePlayer: (player: Player) => void;
}

export default function AdminOverviewContent({
  teams,
  players,
  coaches,
  managementDataLoading,
  expandedSections,
  toggleSection,
  selectedTeamFilter,
  setSelectedTeamFilter,
  playerSearchTerm,
  setPlayerSearchTerm,
  setEditingCoach,
  setEditingTeam,
  setEditingPlayer,
  setSelectedCoachForModal,
  setSelectedTeamForModal,
  setSelectedPlayerForModal,
  setShowEditCoachModal,
  setShowEditTeamModal,
  setShowEditPlayerModal,
  setCoachForm,
  setTeamForm,
  setPlayerForm,
  getCoachLoginStats,
  handleEditCoach,
  handleEditTeam,
  handleEditPlayer,
  handleDeleteCoach,
  handleDeleteTeam,
  handleDeletePlayer,
}: AdminOverviewContentProps) {
  if (managementDataLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red"></div>
        <p className="mt-2 text-gray-300">Loading data...</p>
      </div>
    );
  }

  // Filter players based on selected team filter and search term
  const filteredPlayers = players.filter((player) => {
    // Team filter
    let teamMatch = true;
    if (selectedTeamFilter === "all") teamMatch = true;
    else if (selectedTeamFilter === "unassigned") teamMatch = !player.team_id;
    else teamMatch = player.team_id === selectedTeamFilter;

    // Name search filter
    const nameMatch =
      playerSearchTerm === "" ||
      player.name.toLowerCase().includes(playerSearchTerm.toLowerCase());

    return teamMatch && nameMatch;
  });

  return (
    <div className="space-y-6">
      {/* Coaches Accordion */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg">
        <div
          className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
          onClick={() => toggleSection("coaches")}
        >
          <div className="flex items-center">
            <h2 className="text-2xl font-bebas font-bold text-red">
              Coaches ({coaches.length})
            </h2>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ml-3 ${
                expandedSections.coaches ? "rotate-180" : ""
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCoach(null);
              setCoachForm({
                firstName: "",
                lastName: "",
                email: "",
                bio: "",
                imageUrl:
                  "https://htgkddahhgugesktujds.supabase.co/storage/v1/object/public/images/coaches/goofy_coach.png",
                quote: "",
                is_active: true,
              });
              setShowEditCoachModal(true);
            }}
            className="bg-red text-white font-bebas uppercase py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            Add Coach
          </button>
        </div>
        {expandedSections.coaches && (
          <div className="max-h-96 overflow-y-auto">
            {coaches.map((coach, index) => {
              const isActive = (coach as any).is_active;
              const isInactive = isActive === false;
              const loginStats = getCoachLoginStats(coach.email);
              const lastLogin = loginStats?.last_login_at
                ? new Date(loginStats.last_login_at)
                : null;
              const daysSinceLogin = lastLogin
                ? Math.floor(
                    (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
                  )
                : null;
              const isInactiveByLogin = daysSinceLogin && daysSinceLogin > 30;
              const isInactiveByStatus = loginStats?.is_active === false;
              const isInactiveOverall =
                isInactive || isInactiveByLogin || isInactiveByStatus;

              // Get teams assigned to this coach
              const assignedTeams = teams.filter((team: Team) =>
                team.coaches?.some(
                  (teamCoach) => teamCoach.email === coach.email
                )
              );

              return (
                <div
                  key={coach.id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 ${
                    index === coaches.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Desktop Layout */}
                  <div
                    className="hidden md:grid items-center w-full"
                    style={{
                      gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr 1fr auto",
                    }}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                      {coach.image_url ? (
                        <img
                          src={coach.image_url}
                          alt={`${coach.first_name} ${coach.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {coach.first_name[0]}
                            {coach.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name and Role Badge */}
                    <div className="flex flex-col items-start">
                      <div className="text-white font-medium">
                        {coach.first_name} {coach.last_name}
                      </div>
                      {(coach as any).role && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold mt-1 ${
                            (coach as any).role === "admin"
                              ? "bg-black text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {(coach as any).role.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Team Count */}
                    <div className="text-gray-500 text-sm text-center">
                      {assignedTeams.length} team
                      {assignedTeams.length !== 1 ? "s" : ""}
                    </div>

                    {/* Team Names */}
                    <div className="text-gray-400 text-sm text-center">
                      {assignedTeams.length > 0
                        ? assignedTeams.map((team) => team.name).join(", ")
                        : "No team"}
                    </div>

                    {/* Login Count */}
                    <div className="text-gray-500 text-sm text-center">
                      {loginStats
                        ? `${loginStats.total_logins} login${
                            loginStats.total_logins !== 1 ? "s" : ""
                          }`
                        : "0 logins"}
                    </div>

                    {/* Last Login */}
                    <div className="text-gray-500 text-sm text-center">
                      Last:{" "}
                      {lastLogin
                        ? lastLogin.toLocaleDateString() +
                          " " +
                          lastLogin.toLocaleTimeString()
                        : "Never"}
                    </div>

                    {/* Active/Inactive Badge */}
                    <div className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isInactiveOverall
                            ? "!bg-red-600 !text-white"
                            : "!bg-green-900 !text-green-300"
                        }`}
                        style={
                          isInactiveOverall
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
                        {isInactiveOverall ? "Inactive" : "Active"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="text-center">
                      <div className="flex space-x-1 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCoach(coach);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="View coach"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCoach(coach);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                          aria-label="Edit coach"
                        >
                          <svg
                            className="w-4 h-4"
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCoach(coach);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                          aria-label="Delete coach"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div
                    className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => handleEditCoach(coach)}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                      {coach.image_url ? (
                        <img
                          src={coach.image_url}
                          alt={`${coach.first_name} ${coach.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {coach.first_name[0]}
                            {coach.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coach Info */}
                    <div className="flex-1">
                      <div className="text-white font-medium">
                        {coach.first_name} {coach.last_name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {assignedTeams.length} team
                        {assignedTeams.length !== 1 ? "s" : ""} •{" "}
                        {loginStats
                          ? `${loginStats.total_logins} login${
                              loginStats.total_logins !== 1 ? "s" : ""
                            }`
                          : "0 logins"}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          isInactiveOverall
                            ? "!bg-red-600 !text-white"
                            : "!bg-green-900 !text-green-300"
                        }`}
                        style={
                          isInactiveOverall
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
                        {isInactiveOverall ? "Inactive" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Teams Accordion */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg">
        <div
          className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
          onClick={() => toggleSection("teams")}
        >
          <div className="flex items-center">
            <h2 className="text-2xl font-bebas font-bold text-red">
              Teams ({teams.length})
            </h2>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ml-3 ${
                expandedSections.teams ? "rotate-180" : ""
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingTeam(null);
              setTeamForm({
                teamName: "",
                ageGroup: "",
                gender: "",
                description: "",
                is_active: true,
              });
              setShowEditTeamModal(true);
            }}
            className="bg-red text-white font-bebas uppercase py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            Add Team
          </button>
        </div>
        {expandedSections.teams && (
          <div className="max-h-96 overflow-y-auto">
            {teams.map((team, index) => {
              const isActive = (team as any).is_active;
              const isInactive = isActive === false;
              const playerCount = players.filter(
                (player: Player) => player.team_id === team.id
              ).length;

              return (
                <div
                  key={team.id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 ${
                    index === teams.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Desktop Layout */}
                  <div
                    className="hidden md:grid items-center w-full"
                    style={{
                      gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr 1fr auto",
                    }}
                  >
                    {/* Team Logo */}
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-sm">
                        {team.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Team Name */}
                    <div className="text-white font-medium">{team.name}</div>

                    {/* Age Group */}
                    <div className="text-gray-400 text-sm text-center">
                      {team.age_group}
                    </div>

                    {/* Gender */}
                    <div className="text-gray-400 text-sm text-center">
                      {team.gender}
                    </div>

                    {/* Player Count */}
                    <div className="text-gray-400 text-sm text-center">
                      {playerCount} player{playerCount !== 1 ? "s" : ""}
                    </div>

                    {/* Coaches */}
                    <div className="text-gray-400 text-sm text-center">
                      {team.coaches?.length || 0} coach
                      {(team.coaches?.length || 0) !== 1 ? "es" : ""}
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
                        onClick={() => handleEditTeam(team)}
                        className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded hover:bg-blue-900/20"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div
                    className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => handleEditTeam(team)}
                  >
                    {/* Team Logo */}
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {team.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <div className="text-white font-medium">{team.name}</div>
                      <div className="text-gray-400 text-sm">
                        {team.age_group} • {team.gender} • {playerCount} player
                        {playerCount !== 1 ? "s" : ""}
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
            })}
          </div>
        )}
      </div>

      {/* Players Accordion */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg">
        <div
          className="flex items-center justify-between p-6 border-b border-gray-700 cursor-pointer hover:bg-gray-800/50 transition-colors"
          onClick={() => toggleSection("players")}
        >
          <div className="flex items-center">
            <h2 className="text-2xl font-bebas font-bold text-red">
              Players ({filteredPlayers.length})
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingPlayer(null);
              setPlayerForm({
                teamId: "",
                name: "",
                jerseyNumber: "",
                grade: "",
                parentName: "",
                parentPhone: "",
                parentEmail: "",
                dateOfBirth: "",
                is_active: true,
              });
              setShowEditPlayerModal(true);
            }}
            className="bg-red text-white font-bebas uppercase py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            Add Player
          </button>
        </div>
        {expandedSections.players && (
          <div>
            {/* Filters */}
            <div className="p-4 border-b border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team Filter */}
                <div>
                  <label
                    htmlFor="team-filter"
                    className="block text-sm font-inter text-gray-300 mb-2"
                  >
                    Filter by Team
                  </label>
                  <select
                    id="team-filter"
                    value={selectedTeamFilter}
                    onChange={(e) => setSelectedTeamFilter(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                  >
                    <option value="all">All Players</option>
                    <option value="unassigned">Unassigned Players</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Player Search */}
                <div>
                  <label
                    htmlFor="player-search"
                    className="block text-sm font-inter text-gray-300 mb-2"
                  >
                    Search Players
                  </label>
                  <input
                    id="player-search"
                    type="text"
                    placeholder="Type player name..."
                    value={playerSearchTerm}
                    onChange={(e) => setPlayerSearchTerm(e.target.value)}
                    className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredPlayers.map((player, index) => {
                const playerTeam = teams.find(
                  (team) => team.id === player.team_id
                );
                const isActive = (player as any).is_active;
                const isInactive = isActive === false;

                return (
                  <div
                    key={player.id}
                    className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 ${
                      index === filteredPlayers.length - 1 ? "border-b-0" : ""
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
                          onClick={() => handleEditPlayer(player)}
                          className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1 rounded hover:bg-blue-900/20"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div
                      className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                      onClick={() => handleEditPlayer(player)}
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
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
