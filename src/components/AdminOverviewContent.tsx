"use client";

/**
 * ⚠️ IMPORTANT: Active/Inactive Status Rules ⚠️
 *
 * Coach active/inactive status is ONLY based on the manual toggle in coach.is_active field.
 * Do NOT derive this status from login activity (total_logins, last_login_at, etc.).
 * This is a manual admin setting, not an automatic calculation.
 *
 * See lines 245-248 for the correct implementation.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
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
  getCoachLoginStats: (coachId: string) => Promise<any>;
  handleEditCoach: (coach: Coach) => void;
  handleViewCoach: (coach: Coach) => void;
  handleEditTeam: (team: Team) => void;
  handleEditPlayer: (player: Player) => void;
  handleViewTeam: (team: Team) => void;
  handleViewPlayer: (player: Player) => void;
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
  handleViewCoach,
  handleEditTeam,
  handleEditPlayer,
  handleViewTeam,
  handleViewPlayer,
  handleDeleteCoach,
  handleDeleteTeam,
  handleDeletePlayer,
}: AdminOverviewContentProps) {
  // State to store login stats for each coach
  const [coachLoginStats, setCoachLoginStats] = useState<Record<string, any>>(
    {}
  );
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
  });

  // Fetch login stats for all coaches when coaches section is expanded
  useEffect(() => {
    if (coaches.length > 0 && expandedSections.coaches && !isLoadingStats) {
      const fetchLoginStats = async () => {
        setIsLoadingStats(true);
        const stats: Record<string, any> = { ...coachLoginStats }; // Start with existing stats

        // Filter coaches that need stats fetched
        const coachesToFetch = coaches.filter((coach) => !stats[coach.id]);

        if (coachesToFetch.length > 0) {
          setLoadingProgress({ current: 0, total: coachesToFetch.length });
          // Process coaches in smaller batches to avoid rate limiting
          const batchSize = 3; // Reduced batch size
          for (let i = 0; i < coachesToFetch.length; i += batchSize) {
            const batch = coachesToFetch.slice(i, i + batchSize);

            // Fetch stats for this batch in parallel
            const batchPromises = batch.map(async (coach) => {
              try {
                const loginStats = await getCoachLoginStats(coach.id);
                return { coachId: coach.id, stats: loginStats };
              } catch (error) {
                console.error(
                  `Error fetching login stats for coach ${coach.id}:`,
                  error
                );
                return {
                  coachId: coach.id,
                  stats: {
                    total_logins: 0,
                    last_login_at: null,
                    first_login_at: null,
                    is_active: true,
                  },
                };
              }
            });

            // Wait for this batch to complete
            const batchResults = await Promise.all(batchPromises);

            // Update stats with batch results
            batchResults.forEach(({ coachId, stats: loginStats }) => {
              stats[coachId] = loginStats;
            });

            // Update progress
            setLoadingProgress({
              current: Math.min(i + batchSize, coachesToFetch.length),
              total: coachesToFetch.length,
            });

            // Longer delay between batches to respect rate limits
            if (i + batchSize < coachesToFetch.length) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        }

        setCoachLoginStats(stats);
        setIsLoadingStats(false);
      };

      fetchLoginStats();
    }
  }, [coaches, expandedSections.coaches, getCoachLoginStats, isLoadingStats]);

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
              // ONLY use coach.is_active from database (manual admin setting)
              // Do NOT base this on login activity
              const isActive = (coach as any).is_active ?? true;
              const isInactive = isActive === false;

              const loginStats = coachLoginStats[coach.id];
              const lastLogin = loginStats?.last_login_at
                ? new Date(loginStats.last_login_at)
                : null;

              // Get teams assigned to this coach
              const assignedTeams = teams.filter((team: any) =>
                team.team_coaches?.some(
                  (teamCoach: any) => teamCoach.coaches?.email === coach.email
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
                    className="hidden md:grid items-center w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                    style={{
                      gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr 1fr",
                    }}
                    onClick={() => handleViewCoach(coach)}
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
                      <div className="font-medium text-gray-300 mb-1">
                        Teams
                      </div>
                      <div>
                        {assignedTeams.length > 0
                          ? assignedTeams.map((team) => team.name).join(", ")
                          : "No team"}
                      </div>
                    </div>

                    {/* Loading Status */}
                    <div className="text-gray-500 text-sm text-center">
                      {isLoadingStats && (
                        <div className="font-medium text-gray-300 mb-1">
                          Status
                        </div>
                      )}
                      <div>
                        {isLoadingStats
                          ? `Loading... (${loadingProgress.current}/${loadingProgress.total})`
                          : ""}
                      </div>
                    </div>

                    {/* Last Login */}
                    <div className="text-gray-500 text-sm text-center">
                      <div className="font-medium text-gray-300 mb-1">
                        Last Login
                      </div>
                      <div>
                        {lastLogin
                          ? lastLogin.toLocaleDateString() +
                            " " +
                            lastLogin.toLocaleTimeString()
                          : "Never"}
                      </div>
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
                  </div>

                  {/* Mobile Layout */}
                  <div
                    className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => handleViewCoach(coach)}
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
                      <div className="text-gray-400 text-sm space-y-1">
                        <div>
                          <span className="font-medium text-gray-300">
                            Teams:
                          </span>{" "}
                          {assignedTeams.length > 0
                            ? assignedTeams.map((team) => team.name).join(", ")
                            : "No team"}
                        </div>
                        {coach.bio && (
                          <div>
                            <span className="font-medium text-gray-300">
                              Bio:
                            </span>{" "}
                            <span className="text-gray-400">{coach.bio}</span>
                          </div>
                        )}
                        {coach.quote && (
                          <div>
                            <span className="font-medium text-gray-300">
                              Quote:
                            </span>{" "}
                            <span className="text-gray-400 italic">
                              "{coach.quote}"
                            </span>
                          </div>
                        )}
                        {isLoadingStats && (
                          <div>
                            <span className="font-medium text-gray-300">
                              Status:
                            </span>{" "}
                            Loading... ({loadingProgress.current}/
                            {loadingProgress.total})
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-300">
                            Last Login:
                          </span>{" "}
                          {lastLogin
                            ? lastLogin.toLocaleDateString() +
                              " " +
                              lastLogin.toLocaleTimeString()
                            : "Never"}
                        </div>
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
              const playerCount =
                team.players?.filter(
                  (player: any) => player.is_active && !player.is_deleted
                ).length || 0;

              return (
                <div
                  key={team.id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 ${
                    index === teams.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Desktop Layout */}
                  <div
                    className="hidden md:grid items-center w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                    style={{
                      gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr 1fr",
                    }}
                    onClick={() => handleViewTeam(team)}
                  >
                    {/* Team Logo */}
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                      {team.logo_url ? (
                        <Image
                          src={team.logo_url}
                          alt={`${team.name} logo`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {team.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </span>
                      )}
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
                      {team.team_coaches?.length || 0} coach
                      {(team.team_coaches?.length || 0) !== 1 ? "es" : ""}
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
                  </div>

                  {/* Mobile Layout */}
                  <div
                    className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => handleViewTeam(team)}
                  >
                    {/* Team Logo */}
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                      {team.logo_url ? (
                        <Image
                          src={team.logo_url}
                          alt={`${team.name} logo`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {team.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </span>
                      )}
                    </div>

                    {/* Team Info */}
                    <div className="flex-1">
                      <div className="text-white font-medium">{team.name}</div>
                      <div className="text-gray-400 text-sm">
                        {team.age_group} • {team.gender} • {playerCount} player
                        {playerCount !== 1 ? "s" : ""} •{" "}
                        {team.team_coaches?.length || 0} coach
                        {(team.team_coaches?.length || 0) !== 1 ? "es" : ""}
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
                      className="hidden md:grid items-center w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                      style={{
                        gridTemplateColumns: "auto 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                      }}
                      onClick={() => handleViewPlayer(player)}
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
                    </div>

                    {/* Mobile Layout */}
                    <div
                      className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-gray-800/30 transition-colors"
                      onClick={() => handleViewPlayer(player)}
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
