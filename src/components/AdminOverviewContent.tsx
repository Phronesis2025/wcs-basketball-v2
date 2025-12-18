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
import BasketballLoader from "./BasketballLoader";
import { devError } from "@/lib/security";

// Type for coach login statistics
interface CoachLoginStats {
  total_logins: number;
  last_login_at: string | null;
  last_active_at?: string | null;
  first_login_at: string | null;
  is_active: boolean;
}

// Type for coach form data
interface CoachFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  imageUrl: string;
  quote: string;
  is_active: boolean;
}

// Type for team form data
interface TeamFormData {
  name: string;
  age_group: string;
  gender: string;
  grade_level: string;
  season: string;
  logo_url: string | null;
  team_image: string | null;
  is_active: boolean;
}

// Type for player form data
interface PlayerFormData {
  name: string;
  team_id: string | null;
  jersey_number: number | null;
  grade: string | null;
  date_of_birth: string | null;
  gender: string | null;
  status: "pending" | "approved" | "active" | "on_hold" | "rejected";
}

// Type for team with coaches relation
interface TeamWithCoaches extends Team {
  team_coaches?: Array<{
    coaches?: {
      email: string;
    } | null;
  }>;
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
  setCoachForm: (form: CoachFormData) => void;
  setTeamForm: (form: TeamFormData) => void;
  setPlayerForm: (form: PlayerFormData) => void;
  getCoachLoginStats: (coachId: string) => Promise<CoachLoginStats>;
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
  const [coachLoginStats, setCoachLoginStats] = useState<Record<string, CoachLoginStats>>(
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
        const stats: Record<string, CoachLoginStats> = { ...coachLoginStats }; // Start with existing stats

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
                devError(
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
        <BasketballLoader size={60} />
      </div>
    );
  }

  // Filter players based on status, selected team filter and search term
  const filteredPlayers = players.filter((player) => {
    // Only show approved or active players
    const s = (player.status || "").toLowerCase();
    const statusMatch = s === "approved" || s === "active";

    // Team filter
    let teamMatch = true;
    if (selectedTeamFilter === "all") teamMatch = true;
    else if (selectedTeamFilter === "unassigned") teamMatch = !player.team_id;
    else teamMatch = player.team_id === selectedTeamFilter;

    // Name search filter
    const nameMatch =
      playerSearchTerm === "" ||
      player.name.toLowerCase().includes(playerSearchTerm.toLowerCase());

    return statusMatch && teamMatch && nameMatch;
  });

  return (
    <div className="space-y-6">
      {/* Coaches Accordion */}
      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div
          className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => toggleSection("coaches")}
        >
          <div className="flex items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                Coaches ({coaches.length})
              </h2>
              <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                COACH MANAGEMENT
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ml-3 ${
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
            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter py-2 px-4 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            Add Coach
          </button>
        </div>
        {expandedSections.coaches && (
          <div className="max-h-96 overflow-y-auto">
            {coaches.map((coach, index) => {
              // ONLY use coach.is_active from database (manual admin setting)
              // Do NOT base this on login activity
              const isActive = coach.is_active ?? true;
              const isInactive = isActive === false;

              const loginStats = coachLoginStats[coach.id];
              const lastActive = (loginStats?.last_active_at || loginStats?.last_login_at)
                ? new Date(loginStats.last_active_at || loginStats.last_login_at)
                : null;
              
              // Check if coach is online (last_active_at within last 10 minutes)
              const isOnline = loginStats?.last_active_at
                ? (() => {
                    const lastActiveTime = new Date(loginStats.last_active_at);
                    const now = new Date();
                    const diffMs = now.getTime() - lastActiveTime.getTime();
                    const diffMinutes = diffMs / (1000 * 60);
                    return diffMinutes <= 10; // Online if active within last 10 minutes
                  })()
                : false;

              // Get teams assigned to this coach
              const assignedTeams = teams.filter((team: TeamWithCoaches) =>
                team.team_coaches?.some(
                  (teamCoach) => teamCoach.coaches?.email === coach.email
                )
              );

              return (
                <div
                  key={coach.id}
                  className={`p-4 border-b border-white/10 hover:bg-white/10 ${
                    index === coaches.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Desktop Layout */}
                  <div
                    className="hidden md:grid items-center w-full cursor-pointer hover:bg-white/10 transition-colors"
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
                        <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm font-inter">
                            {coach.first_name[0]}
                            {coach.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name and Role Badge */}
                    <div className="flex flex-col items-start">
                      <div className="text-white font-medium font-inter">
                        {coach.first_name} {coach.last_name}
                      </div>
                      {coach.role && (
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-semibold mt-1 font-inter ${
                            coach.role === "admin"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {coach.role.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Team Count */}
                    <div className="text-slate-400 text-sm text-center font-inter">
                      {assignedTeams.length} team
                      {assignedTeams.length !== 1 ? "s" : ""}
                    </div>

                    {/* Team Names */}
                    <div className="text-slate-400 text-sm text-center font-inter">
                      <div className="font-medium text-slate-300 mb-1 font-inter">
                        Teams
                      </div>
                      <div>
                        {assignedTeams.length > 0
                          ? assignedTeams.map((team) => team.name).join(", ")
                          : "No team"}
                      </div>
                    </div>

                    {/* Loading Status */}
                    <div className="text-slate-400 text-sm text-center">
                      {isLoadingStats && (
                        <div className="font-medium text-slate-300 mb-1 font-inter">
                          Status
                        </div>
                      )}
                      <div>
                        {isLoadingStats
                          ? `Loading... (${loadingProgress.current}/${loadingProgress.total})`
                          : ""}
                      </div>
                    </div>

                    {/* Last Active */}
                    <div className="text-slate-400 text-sm text-center">
                      <div className="font-medium text-slate-300 mb-1 font-inter">
                        Last Active
                      </div>
                      <div>
                        {isOnline ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 font-inter">
                            LIVE
                          </span>
                        ) : lastActive ? (
                          lastActive.toLocaleDateString() +
                          " " +
                          lastActive.toLocaleTimeString()
                        ) : (
                          "Never"
                        )}
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
                    className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-white/10 transition-colors"
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
                        <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm font-inter">
                            {coach.first_name[0]}
                            {coach.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coach Info */}
                    <div className="flex-1">
                      <div className="text-white font-medium font-inter">
                        {coach.first_name} {coach.last_name}
                      </div>
                      <div className="text-slate-400 text-sm space-y-1">
                        {isLoadingStats && (
                          <div>
                            <span className="font-medium text-slate-300 font-inter">
                              Status:
                            </span>{" "}
                            Loading... ({loadingProgress.current}/
                            {loadingProgress.total})
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-300 font-inter">
                            Last Active:
                          </div>
                          <div className="text-slate-400">
                            {isOnline ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 font-inter">
                                LIVE
                              </span>
                            ) : lastActive ? (
                              lastActive.toLocaleDateString() +
                              " " +
                              lastActive.toLocaleTimeString()
                            ) : (
                              "Never"
                            )}
                          </div>
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
      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div
          className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => toggleSection("teams")}
        >
          <div className="flex items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                Teams ({teams.length})
              </h2>
              <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                TEAM MANAGEMENT
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ml-3 ${
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
            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter py-2 px-4 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            Add Team
          </button>
        </div>
        {expandedSections.teams && (
          <div className="max-h-96 overflow-y-auto">
            {teams.map((team, index) => {
              const isActive = team.is_active;
              const isInactive = isActive === false;
              // Count players for this specific team
              const playerCount = players.filter(
                (player: Player) =>
                  player.team_id === team.id && !player.is_deleted
              ).length;

              return (
                <div
                  key={team.id}
                  className={`p-4 border-b border-white/10 hover:bg-white/10 ${
                    index === teams.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  {/* Desktop Layout */}
                  <div
                    className="hidden md:grid items-center w-full cursor-pointer hover:bg-white/10 transition-colors"
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
                    <div className="text-white font-medium font-inter">{team.name}</div>

                    {/* Age Group */}
                    <div className="text-slate-400 text-sm text-center">
                      {team.age_group}
                    </div>

                    {/* Gender */}
                    <div className="text-slate-400 text-sm text-center">
                      {team.gender}
                    </div>

                    {/* Player Count */}
                    <div className="text-slate-400 text-sm text-center">
                      {playerCount} player{playerCount !== 1 ? "s" : ""}
                    </div>

                    {/* Coaches */}
                    <div className="text-slate-400 text-sm text-center">
                      {(team as TeamWithCoaches).team_coaches?.length ||
                        team.coaches?.length ||
                        0}{" "}
                      coach
                      {((team as TeamWithCoaches).team_coaches?.length ||
                        team.coaches?.length ||
                        0) !== 1
                        ? "es"
                        : ""}
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
                    className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-white/10 transition-colors"
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
                      <div className="text-white font-medium font-inter">{team.name}</div>
                      <div className="text-slate-400 text-sm space-y-1">
                        <div>{team.age_group}</div>
                        <div>{team.gender}</div>
                        <div>
                          {playerCount} player{playerCount !== 1 ? "s" : ""}
                        </div>
                        <div>
                          {(team as TeamWithCoaches).team_coaches?.length ||
                            team.coaches?.length ||
                            0}{" "}
                          coach
                          {((team as TeamWithCoaches).team_coaches?.length ||
                            team.coaches?.length ||
                            0) !== 1
                            ? "es"
                            : ""}
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

      {/* Players Accordion */}
      <div className="bg-white/5 border border-white/10 rounded-xl">
        <div
          className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => toggleSection("players")}
        >
          <div className="flex items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                Players ({filteredPlayers.length})
              </h2>
              <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                PLAYER MANAGEMENT
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ml-3 ${
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
          <div className="flex gap-3">
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
              className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter py-2 px-4 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Add Player
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = "/admin/import";
              }}
              className="hidden md:block bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter py-2 px-4 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Import Players
            </button>
          </div>
        </div>
        {expandedSections.players && (
          <div>
            {/* Filters */}
            <div className="p-4 border-b border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Team Filter */}
                <div>
                  <label
                    htmlFor="team-filter"
                    className="block text-sm font-inter text-slate-300 mb-2"
                  >
                    Filter by Team
                  </label>
                  <select
                    id="team-filter"
                    value={selectedTeamFilter}
                    onChange={(e) => setSelectedTeamFilter(e.target.value)}
                    className="w-full p-2 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
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
                    className="block text-sm font-inter text-slate-300 mb-2"
                  >
                    Search Players
                  </label>
                  <input
                    id="player-search"
                    type="text"
                    placeholder="Type player name..."
                    value={playerSearchTerm}
                    onChange={(e) => setPlayerSearchTerm(e.target.value)}
                    className="w-full p-2 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredPlayers.map((player, index) => {
                const playerTeam = teams.find(
                  (team) => team.id === player.team_id
                );
                const isActive = player.is_active ?? true;
                const isInactive = isActive === false;

                return (
                  <div
                    key={player.id}
                    className={`p-4 border-b border-white/10 hover:bg-white/10 ${
                      index === filteredPlayers.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    {/* Desktop Layout */}
                    <div
                      className="hidden md:grid items-center w-full cursor-pointer hover:bg-white/10 transition-colors"
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
                      <div className="text-white font-medium font-inter">
                        {formatPlayerName(player.name)}
                      </div>

                      {/* Team */}
                      <div className="text-slate-400 text-sm">
                        {playerTeam?.name || "Unassigned"}
                      </div>

                      {/* Jersey Number */}
                      <div className="text-slate-400 text-sm text-center">
                        #{player.jersey_number || "N/A"}
                      </div>

                      {/* Grade */}
                      <div className="text-slate-400 text-sm text-center">
                        {player.grade || "N/A"}
                      </div>

                      {/* Age */}
                      <div className="text-slate-400 text-sm text-center">
                        {player.age ? `${player.age} years` : "N/A"}
                      </div>

                      {/* Gender */}
                      <div className="text-slate-400 text-sm text-center">
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
                      className="md:hidden flex items-center justify-between w-full cursor-pointer hover:bg-white/10 transition-colors"
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
                        <div className="text-white font-medium font-inter">
                          {formatPlayerName(player.name)}
                        </div>
                        <div className="text-slate-400 text-sm space-y-1">
                          <div>{playerTeam?.name || "Unassigned"}</div>
                          <div>#{player.jersey_number || "N/A"}</div>
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
