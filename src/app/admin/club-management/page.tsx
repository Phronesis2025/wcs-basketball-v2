// src/app/admin/club-management/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";
import { AuthPersistence } from "@/lib/authPersistence";
import CoachProfile from "@/components/dashboard/CoachProfile";
import {
  ErrorLog,
  LoginStatistic,
  ErrorStatistics,
  AnalyticsStats,
  Player,
  Team,
  Coach,
  Schedule,
  TeamUpdate,
  PracticeDrill,
  CoachMessage,
} from "@/types/supabase";
import CoachPlayersView from "@/components/CoachPlayersView";
import AdminOverviewContent from "@/components/AdminOverviewContent";
import MessageBoard from "@/components/dashboard/MessageBoard";
import ScheduleModal from "@/components/dashboard/ScheduleModal";
import ViewModal from "@/components/dashboard/ViewModal";
import StatCard from "@/components/dashboard/StatCard";
import AddCoachModal from "@/components/dashboard/AddCoachModal";
import AddTeamModal from "@/components/dashboard/AddTeamModal";
import AddPlayerModal from "@/components/dashboard/AddPlayerModal";
import CoachDetailModal from "@/components/CoachDetailModal";
import TeamDetailModal from "@/components/TeamDetailModal";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import toast from "react-hot-toast";
import {
  addSchedule,
  addRecurringPractice,
  updateSchedule,
  deleteSchedule,
  addUpdate,
  updateUpdate,
  deleteUpdate,
  fetchSchedulesByTeamId,
  fetchTeamUpdates,
  getUserRole,
} from "@/lib/actions";
import {
  createPracticeDrill,
  updatePracticeDrill,
  deletePracticeDrill,
  getPracticeDrills,
} from "@/lib/drillActions";
import { getMessages } from "@/lib/messageActions";

// Main component
function ClubManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // State management
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const hasInitialized = useRef(false);
  const isLoadingUserDataRef = useRef(false);

  // Data states
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [teamUpdates, setTeamUpdates] = useState<TeamUpdate[]>([]);
  const [drills, setDrills] = useState<PracticeDrill[]>([]);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [managementDataLoading, setManagementDataLoading] = useState(false);

  // UI states
  const [expandedSections, setExpandedSections] = useState({
    coaches: false,
    teams: false,
    players: false,
  });
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [playerSearchTerm, setPlayerSearchTerm] = useState<string>("");

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditCoachModal, setShowEditCoachModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showEditPlayerModal, setShowEditPlayerModal] = useState(false);
  const [showCoachDetailModal, setShowCoachDetailModal] = useState(false);
  const [showTeamDetailModal, setShowTeamDetailModal] = useState(false);
  const [showPlayerDetailModal, setShowPlayerDetailModal] = useState(false);

  // View modal states
  const [viewingItem, setViewingItem] = useState<
    Schedule | TeamUpdate | PracticeDrill | null
  >(null);
  const [viewItemType, setViewItemType] = useState<
    "game" | "practice" | "update" | "drill"
  >("game");

  // Form states
  const [editingCoach, setEditingCoach] = useState<any | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Coach detail modal states
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [selectedTeamForModal, setSelectedTeamForModal] = useState<Team | null>(
    null
  );
  const [selectedPlayerForModal, setSelectedPlayerForModal] =
    useState<Player | null>(null);
  const [coachLoginStats, setCoachLoginStats] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<TeamUpdate | null>(null);
  const [editingDrill, setEditingDrill] = useState<PracticeDrill | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [modalType, setModalType] = useState<
    "Game" | "Practice" | "Update" | "Drill"
  >("Game");

  // Coach dashboard states
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [drillLoading, setDrillLoading] = useState(false);

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsStats | null>(
    null
  );
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [errorStats, setErrorStats] = useState<ErrorStatistics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      devLog("Club Management: Auth state changed:", {
        event,
        hasSession: !!session,
      });

      // Check if we're in the process of signing out
      const isSigningOut =
        localStorage.getItem("auth.signingOut") === "true" ||
        sessionStorage.getItem("auth.justSignedOut") === "true";

      if (isSigningOut) {
        devLog("Club Management: Skipping auth state change - signing out");
        return;
      }

      if (event === "INITIAL_SESSION" && session && !hasInitialized.current) {
        // First load - initialize once
        devLog("Club Management: INITIAL_SESSION detected, loading user data");
        hasInitialized.current = true;
        if (!isLoadingUserDataRef.current) {
          loadUserData();
        }
      } else if (
        event === "INITIAL_SESSION" &&
        !session &&
        !hasInitialized.current
      ) {
        // No session on initial load - redirect to login
        devLog(
          "Club Management: No session on INITIAL_SESSION, redirecting to login"
        );
        hasInitialized.current = true;
        router.push("/coaches/login");
      } else if (event === "SIGNED_IN" && session) {
        // User just signed in - load user data
        devLog("Club Management: SIGNED_IN detected, loading user data");
        if (!isLoadingUserDataRef.current) {
          loadUserData();
        }
      } else if (event === "SIGNED_OUT") {
        devLog("Club Management: SIGNED_OUT detected, clearing state");
        hasInitialized.current = false;
        isLoadingUserDataRef.current = false;
        setIsLoadingUserData(false);
        setIsAuthorized(false);
        setUserName(null);
        setUserEmail(null);
        setUserId(null);
        setIsAdmin(false);
        setUserRole(null);
        // Clear auth data
        AuthPersistence.clearAuthData();
        router.push("/coaches/login");
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Store refreshed session
        AuthPersistence.storeSession(session);
        devLog("Token refreshed and stored");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Load user data
  const loadUserData = async () => {
    if (isLoadingUserDataRef.current) {
      devLog("Already loading user data, skipping...");
      return;
    }

    try {
      isLoadingUserDataRef.current = true;
      setIsLoadingUserData(true);
      devLog("Loading user data...");

      // Use Supabase's built-in session management
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        devLog("No valid session found, redirecting to login");
        router.push("/coaches/login");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        devLog("No user found, redirecting to login");
        router.push("/coaches/login");
        return;
      }

      devLog("User authenticated successfully:", user.email);

      // Store session using AuthPersistence (without triggering events)
      await AuthPersistence.storeSession(session);

      // Set user data
      setUserEmail(user.email || "");
      setUserId(user.id);
      setIsAdmin(user.user_metadata?.role === "admin");

      // Fetch coach name from database
      try {
        const { data: coachData, error: coachError } = await supabase
          .from("coaches")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .single();

        if (coachError) {
          devError("Error fetching coach name:", coachError);
          setUserName("Coach");
        } else if (coachData) {
          setUserName(`${coachData.first_name} ${coachData.last_name}`);
        } else {
          setUserName("Coach");
        }
      } catch (error) {
        devError("Error fetching coach data:", error);
        setUserName("Coach");
      }
      setLastLoginTime(
        user.last_sign_in_at ? new Date(user.last_sign_in_at) : null
      );

      // Fetch user role (keep existing logic)
      try {
        const roleResponse = await fetch("/api/auth/check-role", {
          headers: { "x-user-id": user.id },
        });
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          devLog("User role:", roleData.role);
          setUserRole(roleData.role);
          // Set authorized flag AFTER we have all required data
          setIsAuthorized(true);
          devLog("User data loaded successfully - page authorized");
        } else {
          devError("Failed to fetch user role - response not ok");
          router.push("/coaches/login");
        }
      } catch (roleError) {
        devError("Failed to fetch user role:", roleError);
        router.push("/coaches/login");
      }
    } catch (error) {
      devError("Error loading user data:", error);
      router.push("/coaches/login");
    } finally {
      isLoadingUserDataRef.current = false;
      setIsLoadingUserData(false);
    }
  };

  // Load management data
  const fetchManagementData = async () => {
    if (!userId || !userRole) {
      devError("Cannot fetch management data: missing userId or userRole");
      return;
    }

    setManagementDataLoading(true);
    try {
      // Fetch teams first
      const teamsResponse = await fetch(
        userRole === "admin" && userId
          ? "/api/admin/teams"
          : userId
          ? `/api/teams/by-coach?userId=${userId}`
          : "/api/teams"
      );
      let fetchedTeams: any[] = [];
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        fetchedTeams = Array.isArray(teamsData)
          ? teamsData
          : teamsData.teams || [];
        setTeams(fetchedTeams);
      }

      // Fetch players (admins via API, coaches load all then filter by coach teams)
      if (userRole === "admin" && userId) {
        const playersResponse = await fetch("/api/admin/players", {
          headers: { "x-user-id": userId },
        });
        if (playersResponse.ok) {
          const playersData = await playersResponse.json();
          setPlayers(
            Array.isArray(playersData) ? playersData : playersData.players || []
          );
        }
      } else {
        // For coaches: fetch players for their assigned teams
        const playersResp = await fetch("/api/coaches/players", {
          headers: { "x-user-id": userId || "" },
        });
        if (playersResp.ok) {
          const playersData = await playersResp.json();
          const coachPlayers = Array.isArray(playersData)
            ? playersData
            : playersData.players || [];
          setPlayers(coachPlayers);
        } else {
          devError(
            `Failed to fetch coach players: ${playersResp.status} ${playersResp.statusText}`
          );
        }
      }

      // Fetch coaches
      if (userRole === "admin") {
        console.log("Fetching coaches for admin...");
        const coachesResponse = await fetch("/api/admin/coaches");
        console.log("Coaches response status:", coachesResponse.status);
        if (coachesResponse.ok) {
          const coachesData = await coachesResponse.json();
          console.log("Coaches data received:", coachesData);
          const coachesArray = Array.isArray(coachesData)
            ? coachesData
            : coachesData.coaches || [];
          console.log("Setting coaches array:", coachesArray);
          console.log(
            "Coach image URLs:",
            coachesArray.map((c: any) => ({
              id: c.id,
              name: `${c.first_name} ${c.last_name}`,
              image_url: c.image_url,
            }))
          );
          setCoaches(coachesArray);
        } else {
          console.error(
            "Failed to fetch coaches:",
            coachesResponse.status,
            coachesResponse.statusText
          );
        }
      } else {
        // For coaches, only show their own data
        setCoaches([]);
      }
    } catch (error) {
      devError("Error fetching management data:", error);
    } finally {
      setManagementDataLoading(false);
    }
  };

  // Load coach dashboard data
  const fetchCoachData = async () => {
    if (!selectedTeamId || !userId) {
      devLog("fetchCoachData: Missing required data", {
        selectedTeamId,
        userId,
      });
      return;
    }

    devLog("fetchCoachData: Starting data fetch", { selectedTeamId, userId });

    setScheduleLoading(true);
    setUpdateLoading(true);
    setDrillLoading(true);

    try {
      // Fetch schedules
      devLog("fetchCoachData: Fetching schedules");
      const schedulesData = await fetchSchedulesByTeamId(selectedTeamId);
      devLog("fetchCoachData: Schedules fetched", {
        count: schedulesData?.length || 0,
        schedules: schedulesData,
      });
      setSchedules(schedulesData || []);

      // Fetch team updates
      devLog("fetchCoachData: Fetching team updates");
      const updatesData = await fetchTeamUpdates(selectedTeamId);
      devLog("fetchCoachData: Team updates fetched", {
        count: updatesData?.length || 0,
      });
      setTeamUpdates(updatesData || []);

      // Fetch drills
      if (selectedTeamId !== "__GLOBAL__") {
        devLog("fetchCoachData: Fetching drills for team");
        const drillsData = await getPracticeDrills(selectedTeamId);
        devLog("fetchCoachData: Drills fetched", {
          count: drillsData?.length || 0,
        });
        setDrills(drillsData || []);
      } else {
        // For global view, get all drills
        devLog("fetchCoachData: Fetching all drills (global view)");
        const { getAllPracticeDrills } = await import("@/lib/drillActions");
        const drillsData = await getAllPracticeDrills();
        devLog("fetchCoachData: All drills fetched", {
          count: drillsData?.length || 0,
        });
        setDrills(drillsData || []);
      }

      // Fetch messages
      devLog("fetchCoachData: Fetching messages");
      const messagesData = await getMessages();
      devLog("fetchCoachData: Messages fetched", {
        count: messagesData?.length || 0,
      });
      setMessages(messagesData || []);

      devLog("fetchCoachData: All data fetched successfully");
    } catch (error) {
      devError("Error fetching coach data:", error);
    } finally {
      setScheduleLoading(false);
      setUpdateLoading(false);
      setDrillLoading(false);
    }
  };

  // Load analytics data
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      // Mock analytics data - in real app this would come from API
      setAnalyticsData({
        errorStats: {
          total_errors: 0,
          critical_errors: 0,
          error_count: 0,
          warning_count: 0,
          info_count: 0,
          error_rate: 0.02,
          recent_errors: [],
          resolved_errors: 0,
          unresolved_errors: 0,
        },
        loginStats: [],
        performanceMetrics: {
          averagePageLoadTime: 120,
          uptime: 99.9,
          errorRate: 0.02,
        },
        trafficMetrics: {
          totalPageViews: 1200,
          uniqueVisitors: 150,
          topPages: [],
          deviceBreakdown: { mobile: 60, desktop: 40 },
        },
      } as AnalyticsStats);
    } catch (error) {
      devError("Error fetching analytics data:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (!isAuthorized || !userId || !userRole) return;
    if (activeTab === "overview") {
      fetchManagementData();
    } else if (activeTab === "coaches-dashboard") {
      if (teams.length === 0) fetchManagementData();
    } else if (activeTab === "analytics") {
      fetchAnalyticsData();
    }
  }, [activeTab, isAuthorized, userId, userRole]);

  // Auto-select a team when teams load on Coach tab
  useEffect(() => {
    if (!isAuthorized || activeTab !== "coaches-dashboard") return;
    if (selectedTeamId || teams.length === 0) return;

    const coachTeams = teams.filter((team) =>
      team.coaches?.some((c: any) => c.email === userEmail)
    );
    const defaultTeam = userRole === "admin" ? teams[0] : coachTeams[0];
    if (defaultTeam) {
      setSelectedTeamId(defaultTeam.id);
      setSelectedTeam(defaultTeam);
    }
  }, [teams, activeTab, isAuthorized, userRole, userEmail, selectedTeamId]);

  // Load coach data when team changes
  useEffect(() => {
    if (selectedTeamId && activeTab === "coaches-dashboard") {
      fetchCoachData();
    }
  }, [selectedTeamId, activeTab]);

  // Handlers
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const handleTabChange = (tab: string) => {
    router.push(`/admin/club-management?tab=${tab}`);
  };

  const handleEditCoach = (coach: any) => {
    console.log("Edit coach clicked, coach data:", coach);
    setEditingCoach(coach);
    setShowEditCoachModal(true);
  };

  const handleViewCoach = async (coach: any) => {
    console.log("View coach clicked, coach data:", coach);
    setSelectedCoach(coach);

    // Fetch login statistics for this coach
    try {
      const stats = await getCoachLoginStats(coach.id);
      setCoachLoginStats(stats);
    } catch (error) {
      devError("Error fetching coach login stats:", error);
      setCoachLoginStats({
        total_logins: 0,
        last_login_at: null,
        first_login_at: null,
        is_active: true,
      });
    }

    setShowCoachDetailModal(true);
  };

  const handleEditTeam = (team: Team) => {
    console.log("Edit team clicked, team data:", team);
    setEditingTeam(team);
    setShowEditTeamModal(true);
  };

  const handleViewTeam = (team: Team) => {
    console.log("View team clicked, team data:", team);
    // Find the latest team data from the teams array to ensure fresh data
    const latestTeamData = teams.find((t) => t.id === team.id) || team;
    console.log("Using latest team data for modal:", latestTeamData);
    setSelectedTeamForModal(latestTeamData);
    setShowTeamDetailModal(true);
  };

  const handleEditPlayer = (player: Player) => {
    console.log("Edit player clicked, player data:", player);
    setEditingPlayer(player);
    setShowEditPlayerModal(true);
  };

  const handleViewPlayer = (player: Player) => {
    console.log("View player clicked, player data:", player);
    setSelectedPlayerForModal(player);
    setShowPlayerDetailModal(true);
  };

  const handleDeleteCoach = async (coach: Coach) => {
    try {
      const response = await fetch(`/api/admin/coaches/${coach.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId || "",
        },
      });

      if (response.ok) {
        toast.success("Coach deleted successfully");
        setShowEditCoachModal(false); // Close the modal
        setEditingCoach(null); // Clear the editing coach
        await fetchManagementData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete coach");
      }
    } catch (error) {
      devError("Delete coach error:", error);
      toast.error("Failed to delete coach");
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    try {
      const response = await fetch(`/api/admin/teams/${team.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId || "",
        },
      });

      if (response.ok) {
        toast.success("Team deleted successfully");
        setShowEditTeamModal(false); // Close the modal
        setEditingTeam(null); // Clear the editing team
        await fetchManagementData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete team");
      }
    } catch (error) {
      devError("Delete team error:", error);
      toast.error("Failed to delete team");
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    try {
      const response = await fetch(`/api/admin/players/${player.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId || "",
        },
      });

      if (response.ok) {
        toast.success("Player deleted successfully");
        setShowEditPlayerModal(false); // Close the modal
        setEditingPlayer(null); // Clear the editing player
        await fetchManagementData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete player");
      }
    } catch (error) {
      devError("Delete player error:", error);
      toast.error("Failed to delete player");
    }
  };

  const getCoachLoginStats = async (coachId: string) => {
    try {
      const response = await fetch(
        `/api/admin/coaches/${coachId}/login-stats`,
        {
          headers: {
            "x-user-id": userId || "",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.loginStats;
      } else {
        devError("Failed to fetch coach login stats:", response.status);
        return {
          total_logins: 0,
          last_login_at: null,
          first_login_at: null,
          is_active: true,
        };
      }
    } catch (error) {
      devError("Error fetching coach login stats:", error);
      return {
        total_logins: 0,
        last_login_at: null,
        first_login_at: null,
        is_active: true,
      };
    }
  };

  // Dashboard helper functions
  const getUpdatesCount = () => {
    if (!lastLoginTime) {
      return teamUpdates.length; // If no last login time, return all updates
    }

    return teamUpdates.filter(
      (update) => new Date(update.created_at) > lastLoginTime
    ).length;
  };

  const getLastUpdateTime = () => {
    if (teamUpdates.length === 0) return "No updates";

    const lastUpdate = teamUpdates.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return getRelativeTime(new Date(lastUpdate.created_at));
  };

  const getLastMessageTime = () => {
    if (messages.length === 0) return "No messages";

    const lastMessage = messages.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return getRelativeTime(new Date(lastMessage.created_at));
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
    }
  };

  const getDrillsCount = () => {
    return drills.length;
  };

  // Schedule handlers
  const handleCreateSchedule = async (data: any) => {
    try {
      devLog("handleCreateSchedule: Starting schedule creation", {
        modalType,
        selectedTeamId,
        editingSchedule: !!editingSchedule,
        data: {
          gameDateTime: data.gameDateTime,
          gameLocation: data.gameLocation,
          gameOpponent: data.gameOpponent,
          gameComments: data.gameComments,
          gameType: data.gameType,
        },
      });

      if (!selectedTeamId) {
        toast.error("Please select a team first");
        return;
      }

      // Validate required fields for games
      if (modalType === "Game") {
        if (!data.gameDateTime) {
          toast.error("Game date and time is required");
          return;
        }
        if (!data.gameLocation) {
          toast.error("Game location is required");
          return;
        }
        if (!data.gameOpponent) {
          toast.error("Game opponent is required");
          return;
        }
      }

      // Check if we're editing an existing schedule
      if (editingSchedule) {
        devLog("handleCreateSchedule: Editing existing schedule", {
          scheduleId: editingSchedule.id,
          updateData: data,
        });

        // Update existing schedule
        if (modalType === "Practice" && data.isRecurring) {
          // For recurring practices, we need to handle this differently
          // For now, just update the main schedule
          await updateSchedule(editingSchedule.id, {
            event_type: "Practice",
            date_time: data.practiceDateTime,
            location: data.practiceLocation,
            description: data.practiceComments,
          });
        } else if (modalType === "Practice") {
          await updateSchedule(editingSchedule.id, {
            event_type: "Practice",
            date_time: data.practiceDateTime,
            location: data.practiceLocation,
            description: data.practiceComments,
          });
        } else {
          // Game/Tournament
          const eventType =
            data.gameType === "tournament" ? "Tournament" : "Game";
          await updateSchedule(editingSchedule.id, {
            event_type: eventType,
            date_time: data.gameDateTime,
            location: data.gameLocation,
            opponent: data.gameOpponent,
            description: data.gameComments,
          });
        }
        toast.success("Schedule updated successfully");
      } else {
        // Create new schedule
        devLog("handleCreateSchedule: Creating new schedule", {
          modalType,
          teamId: selectedTeamId,
          userId,
        });

        if (modalType === "Practice" && data.isRecurring) {
          const recurringData = {
            team_id: selectedTeamId,
            event_type: "Practice" as const,
            date_time: data.practiceDateTime,
            title: data.practiceTitle || null,
            location: data.practiceLocation,
            description: data.practiceComments,
            is_global: false,
            recurringType: data.recurringType,
            recurringCount: data.recurringCount,
            recurringEndDate: data.recurringEndDate,
            selectedDays: data.selectedDays || [],
          };
          devLog(
            "handleCreateSchedule: Creating recurring practice",
            recurringData
          );
          await addRecurringPractice(recurringData);
        } else if (modalType === "Practice") {
          const practiceData = {
            team_id: selectedTeamId,
            event_type: "Practice" as const,
            date_time: data.practiceDateTime,
            title: data.practiceTitle || null,
            location: data.practiceLocation,
            description: data.practiceComments,
            is_global: false,
          };
          devLog(
            "handleCreateSchedule: Creating single practice",
            practiceData
          );
          await addSchedule(practiceData);
        } else {
          // Game/Tournament
          const eventType =
            data.gameType === "tournament" ? "Tournament" : "Game";
          const gameData = {
            team_id: selectedTeamId,
            event_type: eventType as "Game" | "Tournament",
            date_time: data.gameDateTime,
            title: null,
            location: data.gameLocation,
            opponent: data.gameOpponent,
            description: data.gameComments,
            is_global: false,
            created_by: userId || undefined,
          };
          devLog("handleCreateSchedule: Creating game/tournament", gameData);
          const result = await addSchedule(gameData);
          devLog("handleCreateSchedule: Game creation result", result);
        }
        toast.success("Schedule created successfully");
      }

      setShowScheduleModal(false);
      devLog("handleCreateSchedule: Refreshing coach data");
      await fetchCoachData();
      devLog("handleCreateSchedule: Schedule creation completed successfully");
    } catch (e) {
      devError("Failed to save schedule", e);
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error occurred";
      toast.error(`Failed to save: ${errorMessage}`);
    }
  };

  const handleCreateUpdate = async (data: any) => {
    try {
      if (!selectedTeamId) {
        toast.error("Please select a team first");
        return;
      }
      await addUpdate({
        team_id: selectedTeamId,
        title: data.title,
        content: data.content,
        date_time: data.date_time || null,
        image_url: data.image_url,
        is_global: data.is_global,
        created_by: userId || "",
      });
      toast.success("Saved successfully");
      setShowScheduleModal(false);
      await fetchCoachData();
    } catch (e) {
      devError("Failed to create update", e);
      toast.error("Failed to save");
    }
  };

  const handleCreateDrill = async (data: any) => {
    try {
      if (!selectedTeamId) {
        toast.error("Please select a team first");
        return;
      }
      await createPracticeDrill(
        {
          team_id: selectedTeamId,
          title: data.title,
          skills: data.skills || [],
          equipment: data.equipment || [],
          time: data.time || "",
          instructions: data.instructions || "",
          additional_info: data.additional_info,
          benefits: data.benefits || "",
          difficulty: data.difficulty || "",
          category: data.category || "",
          image_url: data.image,
        },
        userId || ""
      );
      toast.success("Saved successfully");
      setShowScheduleModal(false);
      await fetchCoachData();
    } catch (e) {
      devError("Failed to create drill", e);
      toast.error("Failed to save");
    }
  };

  const handleDeleteScheduleItem = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId, userId || "", userRole === "admin");
      toast.success("Deleted");
      await fetchCoachData();
    } catch (e) {
      devError("Failed to delete schedule", e);
      toast.error("Delete failed");
    }
  };

  const handleDeleteUpdateItem = async (updateId: string) => {
    try {
      await deleteUpdate(updateId, userId || "", userRole === "admin");
      toast.success("Deleted");
      await fetchCoachData();
    } catch (e) {
      devError("Failed to delete update", e);
      toast.error("Delete failed");
    }
  };

  const handleDeleteDrillItem = async (drillId: string) => {
    try {
      await deletePracticeDrill(drillId, userId || "", userRole === "admin");
      toast.success("Deleted");
      await fetchCoachData();
    } catch (e) {
      devError("Failed to delete drill", e);
      toast.error("Delete failed");
    }
  };

  // Coach, Team, Player handlers
  const handleCoachSubmit = async (coachData: any) => {
    try {
      console.log("Saving coach data:", coachData);
      console.log("Editing coach ID:", editingCoach?.id);

      if (editingCoach) {
        // Update existing coach using API route
        console.log("Updating coach with ID:", editingCoach.id);
        const requestBody = {
          firstName: coachData.first_name,
          lastName: coachData.last_name,
          email: coachData.email,
          bio: coachData.bio,
          imageUrl: coachData.image_url,
          quote: coachData.quote,
          is_active: coachData.is_active,
        };
        console.log("Sending coach update data:", requestBody);
        const response = await fetch(`/api/admin/coaches/${editingCoach.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId || "",
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Error updating coach:", result.error);
          throw new Error(result.error || "Failed to update coach");
        }

        console.log("Coach updated successfully:", result);
        toast.success("Coach updated successfully");
        setShowEditCoachModal(false); // Close the modal
        setEditingCoach(null); // Clear the editing coach
        await fetchManagementData(); // Refresh the data
      } else {
        // Create new coach using API route
        console.log("Creating new coach via API");
        const response = await fetch("/api/admin/create-coach", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId || "",
          },
          body: JSON.stringify({
            firstName: coachData.first_name,
            lastName: coachData.last_name,
            email: coachData.email,
            bio: coachData.bio,
            imageUrl: coachData.image_url,
            quote: coachData.quote,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Error creating coach:", result.error);
          throw new Error(result.error || "Failed to create coach");
        }

        console.log("Coach created successfully:", result);
        toast.success("Coach added successfully");
      }

      setShowEditCoachModal(false);
      setEditingCoach(null);
      await fetchManagementData();
    } catch (e) {
      devError("Failed to save coach", e);
      toast.error("Failed to save coach");
    }
  };

  const handleTeamSubmit = async (teamData: any) => {
    try {
      console.log("Saving team data:", teamData);
      console.log("Editing team ID:", editingTeam?.id);

      if (editingTeam) {
        // Update existing team using API route
        console.log("Updating team with ID:", editingTeam.id);
        const response = await fetch(`/api/admin/teams/${editingTeam.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId || "",
          },
          body: JSON.stringify({
            teamName: teamData.name,
            ageGroup: teamData.age_group,
            gender: teamData.gender,
            gradeLevel: teamData.grade_level,
            season: teamData.season,
            logoUrl: teamData.logo_url,
            teamImageUrl: teamData.team_image,
            is_active: teamData.is_active,
            coach_ids: teamData.coach_ids,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Error updating team:", result.error);
          throw new Error(result.error || "Failed to update team");
        }

        console.log("Team updated successfully:", result);
        toast.success("Team updated successfully");
        setShowEditTeamModal(false); // Close the modal
        setEditingTeam(null); // Clear the editing team
        await fetchManagementData(); // Refresh the data
      } else {
        // Create new team using API route
        console.log("Creating new team via API");
        const response = await fetch("/api/admin/create-team", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId || "",
          },
          body: JSON.stringify({
            teamName: teamData.name,
            ageGroup: teamData.age_group,
            gender: teamData.gender,
            gradeLevel: teamData.grade_level,
            season: teamData.season,
            logoUrl: teamData.logo_url,
            teamImageUrl: teamData.team_image,
            is_active: teamData.is_active,
            coach_ids: teamData.coach_ids,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Error creating team:", result.error);
          throw new Error(result.error || "Failed to create team");
        }

        console.log("Team created successfully:", result);
        toast.success("Team added successfully");
      }
    } catch (e) {
      devError("Failed to save team", e);
      toast.error("Failed to save team");
    }
  };

  const handlePlayerSubmit = async (playerData: any) => {
    try {
      console.log("Saving player data:", playerData);
      console.log("Editing player ID:", editingPlayer?.id);

      if (editingPlayer) {
        // Update existing player using API route
        console.log("Updating player with ID:", editingPlayer.id);
        const response = await fetch(`/api/admin/players/${editingPlayer.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId || "",
          },
          body: JSON.stringify({
            name: playerData.name,
            jerseyNumber: playerData.jersey_number,
            grade: playerData.grade,
            dateOfBirth: playerData.date_of_birth,
            gender: playerData.gender,
            teamId: playerData.team_id,
            parentName: playerData.parent_name,
            parentEmail: playerData.parent_email,
            parentPhone: playerData.parent_phone,
            emergencyContact: playerData.emergency_contact,
            emergencyPhone: playerData.emergency_phone,
            is_active: playerData.is_active,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Error updating player:", result.error);
          throw new Error(result.error || "Failed to update player");
        }

        console.log("Player updated successfully:", result);
        toast.success("Player updated successfully");
        setShowEditPlayerModal(false); // Close the modal
        setEditingPlayer(null); // Clear the editing player
        await fetchManagementData(); // Refresh the data
      } else {
        // Create new player using API route
        console.log("Creating new player via API");
        const response = await fetch("/api/admin/create-player", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId || "",
          },
          body: JSON.stringify({
            name: playerData.name,
            jerseyNumber: playerData.jersey_number,
            grade: playerData.grade,
            dateOfBirth: playerData.date_of_birth,
            gender: playerData.gender,
            teamId: playerData.team_id,
            parentName: playerData.parent_name,
            parentEmail: playerData.parent_email,
            parentPhone: playerData.parent_phone,
            emergencyContact: playerData.emergency_contact,
            emergencyPhone: playerData.emergency_phone,
            is_active: playerData.is_active,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Error creating player:", result.error);
          throw new Error(result.error || "Failed to create player");
        }

        console.log("Player created successfully:", result);
        toast.success("Player added successfully");
      }
    } catch (e) {
      devError("Failed to save player", e);
      toast.error("Failed to save player");
    }
  };

  // View modal handlers
  const openViewModal = (
    item: Schedule | TeamUpdate | PracticeDrill,
    type: "game" | "practice" | "update" | "drill"
  ) => {
    setViewingItem(item);
    setViewItemType(type);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingItem(null);
  };

  // Mock handlers for components
  const mockHandler = (item: any) => {
    console.log("Mock handler called with:", item);
  };

  const mockSetState = (value: any) => {
    console.log("Mock setState called with:", value);
  };

  if (!isAuthorized || !userId || !userRole) {
    return (
      <div className="bg-navy min-h-screen text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red"></div>
            <p className="mt-2 text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            Club Management
          </h1>
          <p className="text-white text-lg font-inter mb-8 text-center">
            {userRole === "admin"
              ? "Manage coaches, teams, and players. Create, edit, and organize your basketball club."
              : "View and manage your assigned teams and players."}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-row space-x-1 bg-gray-800 p-1 rounded-lg">
            {(() => {
              // Define tabs based on user role
              const allTabs = [
                { id: "overview", label: "Manage", icon: "📋" },
                { id: "coaches-dashboard", label: "Coach", icon: "🏀" },
                { id: "profile", label: "Profile", icon: "👤" },
                { id: "payments", label: "Payments", icon: "💳" },
                { id: "analytics", label: "Monitor", icon: "📊" },
              ];

              // Show different tabs based on role
              const visibleTabs =
                userRole === "admin"
                  ? allTabs
                  : allTabs.filter(
                      (tab) =>
                        tab.id === "overview" ||
                        tab.id === "coaches-dashboard" ||
                        tab.id === "profile"
                    );

              return visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 rounded-md font-bebas transition-all text-xs sm:text-base ${
                    activeTab === tab.id
                      ? "bg-red text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Tab Description */}
        <div className="mb-6">
          <p className="text-gray-300 text-center text-sm">
            {activeTab === "overview" &&
              (userRole === "admin"
                ? "Manage coaches, teams, and players. Create, edit, and organize your basketball club."
                : "View and manage your assigned teams and players.")}
            {activeTab === "coaches-dashboard" &&
              "Access the coach dashboard to manage schedules, drills, and team communications."}
            {activeTab === "profile" &&
              "View and manage your profile information, teams, and account settings."}
            {activeTab === "payments" &&
              userRole === "admin" &&
              "Handle registration fees, payments, and financial transactions for your club."}
            {activeTab === "analytics" &&
              userRole === "admin" &&
              "Monitor system performance, track errors, and view detailed analytics and statistics."}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {userRole === "admin" ? (
              <AdminOverviewContent
                teams={teams}
                players={players}
                coaches={coaches}
                managementDataLoading={managementDataLoading}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                selectedTeamFilter={selectedTeamFilter}
                setSelectedTeamFilter={setSelectedTeamFilter}
                playerSearchTerm={playerSearchTerm}
                setPlayerSearchTerm={setPlayerSearchTerm}
                setEditingCoach={setEditingCoach}
                setEditingTeam={setEditingTeam}
                setEditingPlayer={setEditingPlayer}
                setSelectedCoachForModal={mockHandler}
                setSelectedTeamForModal={mockHandler}
                setSelectedPlayerForModal={mockHandler}
                setShowEditCoachModal={setShowEditCoachModal}
                setShowEditTeamModal={setShowEditTeamModal}
                setShowEditPlayerModal={setShowEditPlayerModal}
                setCoachForm={mockSetState}
                setTeamForm={mockSetState}
                setPlayerForm={mockSetState}
                getCoachLoginStats={getCoachLoginStats}
                handleEditCoach={handleEditCoach}
                handleViewCoach={handleViewCoach}
                handleEditTeam={handleEditTeam}
                handleEditPlayer={handleEditPlayer}
                handleViewTeam={handleViewTeam}
                handleViewPlayer={handleViewPlayer}
                handleDeleteCoach={handleDeleteCoach}
                handleDeleteTeam={handleDeleteTeam}
                handleDeletePlayer={handleDeletePlayer}
              />
            ) : (
              <CoachPlayersView
                teams={teams}
                players={players}
                userName={userEmail || userName || ""}
                managementDataLoading={managementDataLoading}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                setEditingPlayer={setEditingPlayer}
              />
            )}
          </div>
        )}

        {/* Coach Dashboard Tab */}
        {activeTab === "coaches-dashboard" && (
          <div className="space-y-8">
            {/* Team Selection */}
            <div className="mb-6">
              <label
                htmlFor="team-select"
                className="block text-sm font-inter mb-2 text-white"
              >
                Select Team
              </label>
              <select
                id="team-select"
                value={selectedTeamId}
                onChange={(e) => {
                  console.log("Team selection changed:", e.target.value);
                  setSelectedTeamId(e.target.value);
                  const team = teams.find((t) => t.id === e.target.value);
                  console.log("Found team:", team);
                  console.log("Team logo URL:", team?.logo_url);
                  setSelectedTeam(team || null);
                }}
                className="w-full p-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a team</option>
                {userRole === "admin" && (
                  <option value="__GLOBAL__">All teams (program-wide)</option>
                )}
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Logo */}
            {selectedTeamId && (
              <div className="mb-6 flex justify-center">
                <div className="w-32 h-32 relative bg-white rounded-full flex items-center justify-center p-2">
                  <div className="w-24 h-24 relative">
                    {(() => {
                      // Debug logging (can be removed in production)
                      // console.log("Selected Team ID:", selectedTeamId);
                      // console.log("Selected Team:", selectedTeam);
                      // console.log("Team Logo URL:", selectedTeam?.logo_url);

                      // Map team names to logo files
                      const getTeamLogo = (teamName: string | undefined) => {
                        if (!teamName) return "/logos/logo2.png";

                        const name = teamName.toLowerCase();
                        if (name.includes("dupy"))
                          return "/logos/logo-dupy.png";
                        if (name.includes("legends"))
                          return "/logos/logo-legends.png";
                        if (name.includes("potter"))
                          return "/logos/logo-potter.png";
                        if (name.includes("sharks"))
                          return "/logos/logo-sharks.png";
                        if (name.includes("swish"))
                          return "/logos/logo-swish.png";
                        if (name.includes("vipers"))
                          return "/logos/logo-vipers.png";
                        if (name.includes("warriors"))
                          return "/logos/logo-warriors.png";
                        if (name.includes("williams"))
                          return "/logos/logo-williams.png";
                        if (name.includes("blue"))
                          return "/logos/logo-blue.png";
                        if (name.includes("red")) return "/logos/logo-red.png";
                        if (name.includes("white"))
                          return "/logos/logo-white.png";
                        if (name.includes("errors")) return "/logos/logo2.png"; // Use default for errors team

                        return "/logos/logo2.png"; // Default fallback
                      };

                      const logoSrc =
                        selectedTeamId === "__GLOBAL__"
                          ? "/logos/logo2.png"
                          : selectedTeam?.logo_url ||
                            getTeamLogo(selectedTeam?.name);

                      // console.log("Logo source logic:");
                      // console.log("- selectedTeamId === '__GLOBAL__':", selectedTeamId === "__GLOBAL__");
                      // console.log("- selectedTeam?.team_image:", selectedTeam?.team_image);
                      // console.log("- getTeamLogo result:", getTeamLogo(selectedTeam?.name));
                      // console.log("Final Logo Source:", logoSrc);

                      return (
                        <Image
                          src={logoSrc}
                          alt={
                            selectedTeamId === "__GLOBAL__"
                              ? "All Teams"
                              : selectedTeam?.name || "Team Logo"
                          }
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {selectedTeamId ? (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {(() => {
                    const nextGame = schedules
                      .filter(
                        (s) =>
                          s.event_type === "Game" &&
                          new Date(s.date_time) > new Date()
                      )
                      .sort(
                        (a, b) =>
                          new Date(a.date_time).getTime() -
                          new Date(b.date_time).getTime()
                      )[0];

                    const daysUntil = nextGame
                      ? Math.ceil(
                          (new Date(nextGame.date_time).getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;

                    return (
                      <StatCard
                        title="Next Game"
                        value={
                          nextGame
                            ? `${daysUntil} day${daysUntil === 1 ? "" : "s"}`
                            : "N/A"
                        }
                        subtitle={
                          nextGame
                            ? `vs ${nextGame.opponent || "TBD"}`
                            : "No upcoming games"
                        }
                        icon={
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        }
                      />
                    );
                  })()}
                  <StatCard
                    title="New Updates"
                    value={getUpdatesCount()}
                    subtitle={getLastUpdateTime()}
                    icon={
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
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="New Messages"
                    value={messages.length}
                    subtitle={getLastMessageTime()}
                    icon={
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    }
                  />
                  <StatCard
                    title="Practice Drills"
                    value={getDrillsCount()}
                    subtitle="In Library"
                    icon={
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 2L12 22"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2 12L22 12"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4 C 9 8, 9 16, 4 20"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 4 C 15 8, 15 16, 20 20"
                        />
                      </svg>
                    }
                  />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Upcoming Games */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bebas uppercase text-gray-900">
                          Upcoming Games
                        </h3>
                        <p className="text-sm text-gray-500 font-inter mt-1">
                          Next scheduled games
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingSchedule(null); // Clear any previous editing state
                          setModalType("Game");
                          setShowScheduleModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors"
                      >
                        + Add Game
                      </button>
                    </div>
                    <div className="space-y-3">
                      {schedules
                        .filter(
                          (s) =>
                            s.event_type === "Game" &&
                            new Date(s.date_time) > new Date()
                        )
                        .slice(0, 3)
                        .map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold text-lg mb-1">
                                  {schedule.opponent
                                    ? `vs. ${schedule.opponent}`
                                    : "TBD"}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  {new Date(
                                    schedule.date_time
                                  ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                                {schedule.location && (
                                  <p className="text-gray-500 text-sm mt-1">
                                    📍 {schedule.location}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  Game
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openViewModal(schedule, "game");
                                    }}
                                    className="text-gray-600 hover:text-gray-800 text-sm"
                                    title="View details"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "[DEBUG] Setting editing schedule:",
                                        schedule
                                      );
                                      setEditingSchedule(schedule);
                                      setModalType("Game");
                                      setShowScheduleModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteScheduleItem(schedule.id);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {schedules.filter(
                        (s) =>
                          s.event_type === "Game" &&
                          new Date(s.date_time) > new Date()
                      ).length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No upcoming games
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Practice Schedule */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bebas uppercase text-gray-900">
                          Practice Schedule
                        </h3>
                        <p className="text-sm text-gray-500 font-inter mt-1">
                          This week&apos;s practice
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            setEditingSchedule(null); // Clear any previous editing state
                            setModalType("Practice");
                            setShowScheduleModal(true);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors"
                        >
                          + Add Practice
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {schedules
                        .filter(
                          (s) =>
                            s.event_type === "Practice" &&
                            new Date(s.date_time) > new Date()
                        )
                        .slice(0, 3)
                        .map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold text-lg mb-1">
                                  {schedule.title || "Practice"}
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  {new Date(
                                    schedule.date_time
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}{" "}
                                  • 2h
                                </p>
                                {schedule.location && (
                                  <p className="text-gray-500 text-sm mt-1">
                                    📍 {schedule.location}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                                  Practice
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openViewModal(schedule, "practice");
                                    }}
                                    className="text-gray-600 hover:text-gray-800 text-sm"
                                    title="View details"
                                  >
                                    👁️
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "[DEBUG] Setting editing practice:",
                                        schedule
                                      );
                                      setEditingSchedule(schedule);
                                      setModalType("Practice");
                                      setShowScheduleModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteScheduleItem(schedule.id);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {schedules.filter(
                        (s) =>
                          s.event_type === "Practice" &&
                          new Date(s.date_time) > new Date()
                      ).length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No practices scheduled
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recent Announcements */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bebas uppercase text-gray-900">
                          Recent Announcements
                        </h3>
                        <p className="text-sm text-gray-500 font-inter mt-1">
                          Latest Team Updates
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingUpdate(null); // Clear any previous editing state
                          setModalType("Update");
                          setShowScheduleModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors"
                      >
                        + Add Update
                      </button>
                    </div>
                    <div className="space-y-3">
                      {teamUpdates.slice(0, 3).map((update) => (
                        <div
                          key={update.id}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => openViewModal(update, "update")}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-gray-900 font-semibold text-lg mb-1">
                                {update.title}
                              </h4>
                              <p className="text-gray-500 text-sm">
                                {new Date(update.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingUpdate(update);
                                  setModalType("Update");
                                  setShowScheduleModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteUpdateItem(update.id)
                                }
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {teamUpdates.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                          No announcements
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Your Practice Drills */}
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bebas uppercase text-gray-900">
                          Your Practice Drills
                        </h3>
                        <p className="text-sm text-gray-500 font-inter mt-1">
                          Drill Library
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingDrill(null); // Clear any previous editing state
                          setModalType("Drill");
                          setShowScheduleModal(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700"
                      >
                        + Add Drill
                      </button>
                    </div>
                    <div className="space-y-3">
                      {drills.length > 0 ? (
                        drills.map((drill) => (
                          <div
                            key={drill.id}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => openViewModal(drill, "drill")}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold text-lg mb-2">
                                  {drill.title}
                                </h4>
                                <div className="flex gap-2 mb-2">
                                  <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    Drill
                                  </span>
                                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                    {drill.difficulty}
                                  </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                  {drill.time}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingItem(drill);
                                    setModalType("Drill");
                                    setShowViewModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-800 text-sm"
                                  title="View drill"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingDrill(drill);
                                    setModalType("Drill");
                                    setShowScheduleModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                  title="Edit drill"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDrillItem(drill.id);
                                  }}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                  title="Delete drill"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No practice drills yet</p>
                          <p className="text-xs mt-1">
                            Click &quot;Add Drill&quot; to create your first
                            drill
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Board - Visible on all screen sizes */}
                <div className="mb-8">
                  <MessageBoard
                    userId={userId || ""}
                    userName={userName || ""}
                    isAdmin={userRole === "admin"}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-300 text-lg">
                  Select a team to manage content.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <CoachProfile
            userId={userId}
            userEmail={userEmail}
            userName={userName}
            isAdmin={isAdmin}
          />
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && userRole === "admin" && (
          <div className="space-y-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bebas text-white mb-6">
                Payment Management
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-bebas text-white mb-4">
                    Registration Fees
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Manage player registration fees and payment status.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Players:</span>
                      <span className="text-white">{players.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Paid:</span>
                      <span className="text-green-400">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Pending:</span>
                      <span className="text-yellow-400">0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-bebas text-white mb-4">
                    Team Dues
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Track team dues and equipment fees.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Teams:</span>
                      <span className="text-white">{teams.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Dues Collected:</span>
                      <span className="text-green-400">$0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Outstanding:</span>
                      <span className="text-red-400">$0</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-bebas text-white mb-4">
                    Financial Summary
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Overall financial status and reports.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Revenue:</span>
                      <span className="text-green-400">$0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Expenses:</span>
                      <span className="text-red-400">$0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Net Profit:</span>
                      <span className="text-white">$0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && userRole === "admin" && (
          <div className="space-y-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bebas text-white mb-6">
                Website Analytics & Monitoring
              </h2>

              {analyticsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red"></div>
                  <p className="mt-2 text-gray-300">Loading analytics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-bebas text-white mb-4">
                      User Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Users:</span>
                        <span className="text-white">
                          {analyticsData?.trafficMetrics?.uniqueVisitors || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Page Views:</span>
                        <span className="text-green-400">
                          {analyticsData?.trafficMetrics?.totalPageViews || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Mobile Users:</span>
                        <span className="text-blue-400">
                          {analyticsData?.trafficMetrics?.deviceBreakdown
                            ?.mobile || 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-bebas text-white mb-4">
                      Performance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Load Time:</span>
                        <span className="text-white">
                          {analyticsData?.performanceMetrics
                            ?.averagePageLoadTime || 0}
                          ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Error Rate:</span>
                        <span className="text-red-400">
                          {(analyticsData?.performanceMetrics?.errorRate || 0) *
                            100}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Uptime:</span>
                        <span className="text-green-400">
                          {analyticsData?.performanceMetrics?.uptime || 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-bebas text-white mb-4">
                      System Health
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Uptime:</span>
                        <span className="text-green-400">99.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Response Time:</span>
                        <span className="text-blue-400">120ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Database:</span>
                        <span className="text-green-400">Healthy</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setEditingSchedule(null);
            setEditingUpdate(null);
            setEditingDrill(null);
          }}
          onSubmit={
            modalType === "Game" || modalType === "Practice"
              ? handleCreateSchedule
              : modalType === "Update"
              ? handleCreateUpdate
              : handleCreateDrill
          }
          onProfanityError={(errors) =>
            console.log("Profanity errors:", errors)
          }
          type={modalType}
          editingData={
            modalType === "Game" || modalType === "Practice"
              ? editingSchedule
              : modalType === "Update"
              ? editingUpdate
              : editingDrill
          }
          selectedTeamId={selectedTeamId}
        />

        <ViewModal
          isOpen={showViewModal}
          onClose={closeViewModal}
          item={viewingItem}
          itemType={viewItemType}
        />

        {/* Add/Edit Modals */}
        <AddCoachModal
          isOpen={showEditCoachModal}
          onClose={() => setShowEditCoachModal(false)}
          onSubmit={handleCoachSubmit}
          onDelete={handleDeleteCoach}
          editingCoach={editingCoach}
          loading={false}
          isManageTab={true}
        />

        <AddTeamModal
          isOpen={showEditTeamModal}
          onClose={() => setShowEditTeamModal(false)}
          onSubmit={handleTeamSubmit}
          onDelete={handleDeleteTeam}
          editingTeam={editingTeam}
          loading={false}
          isManageTab={true}
          coaches={coaches}
        />

        <AddPlayerModal
          isOpen={showEditPlayerModal}
          onClose={() => setShowEditPlayerModal(false)}
          onSubmit={handlePlayerSubmit}
          onDelete={handleDeletePlayer}
          editingPlayer={editingPlayer}
          teams={teams}
          loading={false}
          isManageTab={true}
        />

        {/* Coach Detail Modal */}
        <CoachDetailModal
          isOpen={showCoachDetailModal}
          onClose={() => setShowCoachDetailModal(false)}
          onEdit={() => {
            setShowCoachDetailModal(false);
            handleEditCoach(selectedCoach!);
          }}
          coach={selectedCoach}
          teams={teams}
          loginStats={coachLoginStats}
        />

        {/* Team Detail Modal */}
        <TeamDetailModal
          isOpen={showTeamDetailModal}
          onClose={() => setShowTeamDetailModal(false)}
          onEdit={() => {
            setShowTeamDetailModal(false);
            handleEditTeam(selectedTeamForModal!);
          }}
          team={selectedTeamForModal}
          coaches={coaches}
          players={players}
        />

        {/* Player Detail Modal */}
        <PlayerDetailModal
          isOpen={showPlayerDetailModal}
          onClose={() => setShowPlayerDetailModal(false)}
          onEdit={() => {
            setShowPlayerDetailModal(false);
            handleEditPlayer(selectedPlayerForModal!);
          }}
          player={selectedPlayerForModal}
          teams={teams}
          coaches={coaches}
        />
      </div>
    </div>
  );
}

// Wrapper component with Suspense
export default function ClubManagement() {
  return (
    <Suspense
      fallback={
        <div className="bg-navy min-h-screen text-white pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red"></div>
              <p className="mt-2 text-gray-300">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <ClubManagementContent />
    </Suspense>
  );
}
