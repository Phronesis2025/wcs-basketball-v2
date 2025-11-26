// src/app/admin/club-management/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { devError, devLog } from "@/lib/security";
import { AuthPersistence } from "@/lib/authPersistence";
import CoachProfile from "@/components/dashboard/CoachProfile";
import {
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
import ScheduleModal from "@/components/dashboard/ScheduleModal";
import ViewModal from "@/components/dashboard/ViewModal";
import StatCard from "@/components/dashboard/StatCard";
import AddCoachModal from "@/components/dashboard/AddCoachModal";
import AddTeamModal from "@/components/dashboard/AddTeamModal";
import AddPlayerModal from "@/components/dashboard/AddPlayerModal";
import CoachDetailModal from "@/components/CoachDetailModal";
import TeamDetailModal from "@/components/TeamDetailModal";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import ChangelogTable from "@/components/ChangelogTable";
import ChangelogModal from "@/components/ChangelogModal";
import CommitChart from "@/components/CommitChart";
import OnHoldModal from "@/components/dashboard/OnHoldModal";
import PlayerPaymentModal from "@/components/dashboard/PlayerPaymentModal";
import VolunteerDetailModal from "@/components/dashboard/VolunteerDetailModal";
import WebVitalsDiagnostic from "@/components/WebVitalsDiagnostics";
import ParentPaymentTable from "@/components/admin/ParentPaymentTable";
import ParentPaymentDetailModal from "@/components/admin/ParentPaymentDetailModal";
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
  fetchAllTeamUpdates,
  uploadFileToStorage,
} from "@/lib/actions";
import {
  createPracticeDrill,
  deletePracticeDrill,
  getPracticeDrills,
} from "@/lib/drillActions";
import { getMessages } from "@/lib/messageActions";
import { getUnreadMentionCount } from "@/lib/messageActions";
import BasketballLoader from "@/components/BasketballLoader";
import Navbar from "@/components/Navbar";

// Main component
function ClubManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Always default to profile tab when no tab is specified
  const tabFromUrl = searchParams.get("tab");
  const activeTab = tabFromUrl || "profile";

  // Ensure profile tab is set on initial load if no tab is specified
  useEffect(() => {
    if (!tabFromUrl) {
      router.replace("/admin/club-management?tab=profile");
    }
  }, [tabFromUrl, router]);

  // State management
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userFirstName, setUserFirstName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadMentions, setUnreadMentions] = useState(0);
  const [initialProfileSection, setInitialProfileSection] = useState<
    string | null
  >(null);
  const [messageBoardRefreshTrigger, setMessageBoardRefreshTrigger] =
    useState(0);
  const [scrollToMessageId, setScrollToMessageId] = useState<string | null>(
    null
  );
  // Stripe/Payments metrics
  const [membershipFees, setMembershipFees] = useState<number>(0);
  const [pendingDues, setPendingDues] = useState<number>(0);
  const [tournamentFees, setTournamentFees] = useState<number>(0);
  const [merchFees, setMerchFees] = useState<number>(0);
  const [paidPlayersCount, setPaidPlayersCount] = useState<number>(0);
  const [pendingPlayersCount, setPendingPlayersCount] = useState<number>(0);
  const totalRevenue = useMemo(
    () => (membershipFees || 0) + (tournamentFees || 0) + (merchFees || 0),
    [membershipFees, tournamentFees, merchFees]
  );
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null);
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
  const [changelogModalOpen, setChangelogModalOpen] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState<any>(null);

  // Derived player states
  const pendingPlayers = useMemo(
    () => players.filter((p) => p.status === "pending"),
    [players]
  );
  const awaitingPaymentPlayers = useMemo(
    () => players.filter((p) => p.status === "approved"),
    [players]
  );
  const onHoldPlayers = useMemo(
    () => players.filter((p) => p.status === "on_hold"),
    [players]
  );
  const rejectedPlayers = useMemo(
    () => players.filter((p) => p.status === "rejected"),
    [players]
  );

  // UI states
  const [expandedSections, setExpandedSections] = useState({
    coaches: false,
    teams: false,
    players: false,
    analytics: false,
    systemMonitoring: false,
    changelog: false,
    parentPaymentOverview: false,
    paymentManagement: false,
    registrations: false,
    volunteerSubmissions: false,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "drill" | "game" | "practice" | "update";
    name?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showProfanityModal, setShowProfanityModal] = useState(false);
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [selectedPlayerForHold, setSelectedPlayerForHold] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [placingOnHold, setPlacingOnHold] = useState(false);
  const [showPlayerPaymentModal, setShowPlayerPaymentModal] = useState(false);
  const [selectedPlayerForPaymentModal, setSelectedPlayerForPaymentModal] =
    useState<Player | null>(null);
  const [selectedPlayerPaymentStatus, setSelectedPlayerPaymentStatus] =
    useState<"approved" | "pending" | "on_hold" | "rejected">("pending");

  // Volunteer states
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);

  // Parent payment states
  const [parentPaymentData, setParentPaymentData] = useState<any[]>([]);
  const [selectedParentForModal, setSelectedParentForModal] = useState<
    any | null
  >(null);
  const [showParentPaymentModal, setShowParentPaymentModal] = useState(false);
  const [parentSearchTerm, setParentSearchTerm] = useState<string>("");
  const [parentStatusFilter, setParentStatusFilter] = useState<
    "All" | "Paid" | "Pending" | "Overdue"
  >("All");
  const [parentPaymentPage, setParentPaymentPage] = useState<number>(1);
  const [loadingParentPayments, setLoadingParentPayments] = useState(false);

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

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsStats | null>(
    null
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        setIsAuthorized(false);
        setUserName(null);
        setUserFirstName(null);
        setUserLastName(null);
        setUserEmail(null);
        setUserId(null);
        setIsAdmin(false);
        setUserRole(null);

        // Clear auth data comprehensively
        AuthPersistence.clearAuthData();

        // Clear any remaining Supabase storage
        try {
          Object.keys(localStorage).forEach((key) => {
            if (
              key.startsWith("sb-") ||
              key.includes("supabase") ||
              key.includes("auth")
            ) {
              localStorage.removeItem(key);
            }
          });
          Object.keys(sessionStorage).forEach((key) => {
            if (
              key.startsWith("sb-") ||
              key.includes("supabase") ||
              key.includes("auth")
            ) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (cleanupErr) {
          devError("Club Management: Storage cleanup error", cleanupErr);
        }

        // Use replace to prevent back navigation to protected page
        window.location.replace("/coaches/login");
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Store refreshed session
        AuthPersistence.storeSession(session);
        devLog("Token refreshed and stored");
      }
    });

    // Also listen for custom auth state change events (from Navbar sign out)
    const handleAuthStateChange = (event: CustomEvent) => {
      if (!event.detail.authenticated) {
        devLog(
          "Club Management: Auth state change event detected - signed out"
        );
        // Don't redirect here, let the SIGNED_OUT event handler do it
        // Just clear state
        setIsAuthorized(false);
        setUserName(null);
        setUserFirstName(null);
        setUserLastName(null);
        setUserEmail(null);
        setUserId(null);
        setIsAdmin(false);
        setUserRole(null);
      }
    };

    window.addEventListener(
      "authStateChanged",
      handleAuthStateChange as EventListener
    );

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(
        "authStateChanged",
        handleAuthStateChange as EventListener
      );
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
        const { data: coachRows, error: coachError } = await supabase
          .from("coaches")
          .select("first_name, last_name")
          .eq("user_id", user.id)
          .limit(1);

        if (coachError) {
          devError("Error fetching coach name:", coachError);
          setUserName("Coach");
          setUserFirstName(null);
          setUserLastName(null);
        } else if (coachRows && Array.isArray(coachRows) && coachRows[0]) {
          setUserName(`${coachRows[0].first_name} ${coachRows[0].last_name}`);
          setUserFirstName(coachRows[0].first_name);
          setUserLastName(coachRows[0].last_name);
        } else {
          setUserName("Coach");
          setUserFirstName(null);
          setUserLastName(null);
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
          const roleResponseData = await roleResponse.json();
          devLog("Role API response:", roleResponseData);

          // Handle response format - could be { data: { role: ... } } or { role: ... }
          const roleData = roleResponseData.data || roleResponseData;
          const roleFromApi = roleData?.role;

          devLog("Role from API:", roleFromApi);

          // Handle null role - check user_metadata as fallback
          let finalRole = roleFromApi;
          if (!finalRole && user.user_metadata?.role) {
            finalRole = user.user_metadata.role;
            devLog("Using role from user_metadata:", finalRole);
          }

          // If still no role, default to "coach" for authenticated users
          if (!finalRole) {
            devLog("No role found, defaulting to 'coach'");
            finalRole = "coach";
          }

          devLog("Final role set to:", finalRole);
          setUserRole(finalRole);
          // Update isAdmin based on the actual database role
          const isAdminValue = finalRole === "admin";
          setIsAdmin(isAdminValue);
          devLog("isAdmin set to:", isAdminValue);
          // Set authorized flag AFTER we have all required data
          setIsAuthorized(true);
          devLog("User data loaded successfully - page authorized", {
            userId: user.id,
            userRole: finalRole,
            isAdmin: isAdminValue,
            isAuthorized: true,
          });
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
      let fetchedTeams: any[] = [];
      try {
        const teamsResponse = await fetch(
          userRole === "admin" && userId
            ? "/api/admin/teams"
            : userId
            ? `/api/teams/by-coach?userId=${userId}`
            : "/api/teams"
        );

        if (teamsResponse.ok) {
          try {
            const teamsData = await teamsResponse.json();
            devLog("Teams API response:", teamsData);
            // Handle {success: true, data: [...]} format from formatSuccessResponse
            if (teamsData?.success && Array.isArray(teamsData.data)) {
              fetchedTeams = teamsData.data;
            } else if (Array.isArray(teamsData)) {
              fetchedTeams = teamsData;
            } else if (teamsData?.data && Array.isArray(teamsData.data)) {
              fetchedTeams = teamsData.data;
            } else if (teamsData?.teams && Array.isArray(teamsData.teams)) {
              fetchedTeams = teamsData.teams;
            } else {
              devError("Unexpected teams data format", teamsData);
              fetchedTeams = [];
            }
            devLog("Parsed teams:", fetchedTeams.length);
            setTeams(fetchedTeams);
          } catch (jsonError) {
            devError("Error parsing teams JSON:", jsonError);
            setTeams([]);
          }
        } else {
          devError(
            `Failed to fetch teams: ${teamsResponse.status} ${teamsResponse.statusText}`
          );
          setTeams([]);
        }
      } catch (fetchError) {
        devError("Network error fetching teams:", fetchError);
        setTeams([]);
      }

      // Fetch players (admins via API, coaches load all then filter by coach teams)
      if (userRole === "admin" && userId) {
        const playersResponse = await fetch("/api/admin/players", {
          headers: { "x-user-id": userId },
        });
        if (playersResponse.ok) {
          try {
            const playersData = await playersResponse.json();
            devLog("Players API response:", playersData);
            // Handle {success: true, data: [...]} format from createSecureResponse/formatSuccessResponse
            let playersArray: any[] = [];
            if (playersData?.success && Array.isArray(playersData.data)) {
              playersArray = playersData.data;
            } else if (Array.isArray(playersData)) {
              playersArray = playersData;
            } else if (playersData?.data && Array.isArray(playersData.data)) {
              playersArray = playersData.data;
            } else if (
              playersData?.players &&
              Array.isArray(playersData.players)
            ) {
              playersArray = playersData.players;
            }
            devLog("Parsed players:", playersArray.length);
            setPlayers(playersArray);
          } catch (jsonError) {
            devError("Error parsing players JSON:", jsonError);
            setPlayers([]);
          }
        }
      } else {
        // For coaches: fetch players for their assigned teams
        const playersResp = await fetch("/api/coaches/players", {
          headers: { "x-user-id": userId || "" },
        });
        if (playersResp.ok) {
          try {
            const playersData = await playersResp.json();
            const coachPlayers = Array.isArray(playersData)
              ? playersData
              : playersData?.players || [];
            setPlayers(coachPlayers);
          } catch (jsonError) {
            devError("Error parsing coach players JSON:", jsonError);
            setPlayers([]);
          }
        } else {
          devError(
            `Failed to fetch coach players: ${playersResp.status} ${playersResp.statusText}`
          );
        }
      }

      // Fetch coaches
      if (userRole === "admin") {
        devLog("Fetching coaches for admin...");
        const coachesResponse = await fetch("/api/admin/coaches");
        devLog("Coaches response status:", coachesResponse.status);
        if (coachesResponse.ok) {
          try {
            const coachesData = await coachesResponse.json();
            devLog("Coaches data received:", coachesData);
            // Handle {success: true, data: [...]} format from formatSuccessResponse
            let coachesArray: any[] = [];
            if (coachesData?.success && Array.isArray(coachesData.data)) {
              coachesArray = coachesData.data;
            } else if (Array.isArray(coachesData)) {
              coachesArray = coachesData;
            } else if (coachesData?.data && Array.isArray(coachesData.data)) {
              coachesArray = coachesData.data;
            } else if (
              coachesData?.coaches &&
              Array.isArray(coachesData.coaches)
            ) {
              coachesArray = coachesData.coaches;
            }
            devLog("Setting coaches array:", coachesArray.length);
            devLog(
              "Coach image URLs:",
              coachesArray.map((c: any) => ({
                id: c.id,
                name: `${c.first_name} ${c.last_name}`,
                image_url: c.image_url,
              }))
            );
            setCoaches(coachesArray);
          } catch (jsonError) {
            devError("Error parsing coaches JSON:", jsonError);
            setCoaches([]);
          }
        } else {
          devError(
            `Failed to fetch coaches: ${coachesResponse.status} ${coachesResponse.statusText}`
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

    try {
      // Fetch schedules
      devLog("fetchCoachData: Fetching schedules");
      const schedulesData = await fetchSchedulesByTeamId(selectedTeamId);
      devLog("fetchCoachData: Schedules fetched", {
        count: schedulesData?.length || 0,
        schedules: schedulesData,
      });
      setSchedules(schedulesData || []);

      // Fetch team updates - admins see all updates, coaches see only their team's updates
      devLog("fetchCoachData: Fetching team updates", {
        isAdmin,
        selectedTeamId,
      });
      const updatesData = isAdmin
        ? await fetchAllTeamUpdates()
        : await fetchTeamUpdates(selectedTeamId);
      devLog("fetchCoachData: Team updates fetched", {
        count: updatesData?.length || 0,
        isAdmin,
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
      devError("Error fetching coach data", error);
    }
  };

  // Fetch volunteers
  const fetchVolunteers = async () => {
    if (!userId || userRole !== "admin") {
      return;
    }

    try {
      const response = await fetch("/api/admin/volunteers", {
        headers: { "x-user-id": userId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch volunteers");
      }

      try {
        const data = await response.json();
        setVolunteers(Array.isArray(data) ? data : []);
      } catch (jsonError) {
        devError("Error parsing volunteers JSON:", jsonError);
        setVolunteers([]);
      }
    } catch (error) {
      devError("Error fetching volunteers:", error);
      toast.error("Failed to load volunteers");
    }
  };

  // Fetch parent payment overview
  const fetchParentPayments = async () => {
    if (!userId || userRole !== "admin") {
      return;
    }

    setLoadingParentPayments(true);
    try {
      const response = await fetch("/api/admin/parents/payment-overview", {
        headers: { "x-user-id": userId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch parent payment data");
      }

      try {
        const data = await response.json();
        setParentPaymentData(Array.isArray(data) ? data : []);
      } catch (jsonError) {
        devError("Error parsing parent payment data JSON:", jsonError);
        setParentPaymentData([]);
      }
    } catch (error) {
      devError("Error fetching parent payments:", error);
      toast.error("Failed to load parent payment data");
    } finally {
      setLoadingParentPayments(false);
    }
  };

  // Load analytics data
  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      if (!userId) {
        toast.error("Please log in first");
        return;
      }

      // Fetch real analytics data from API
      const response = await fetch("/api/admin/analytics/stats", {
        headers: { "x-user-id": userId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error("Invalid response from analytics API");
      }
    } catch (error) {
      devError("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
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
      // Always ensure teams are loaded for coach dashboard
      if (teams.length === 0) {
        fetchManagementData();
      }
    } else if (activeTab === "profile") {
      // Load messages for profile tab (message board)
      // Note: CoachProfile component uses its own useMentions hook to fetch messages
      // This is just for consistency
      (async () => {
        try {
          const messagesData = await getMessages();
          setMessages(messagesData || []);
        } catch (error) {
          devError("Error loading messages for profile tab:", error);
        }
      })();
    } else if (activeTab === "payments") {
      // Always ensure teams and players are loaded for Payment tab
      if (teams.length === 0 || players.length === 0) {
        fetchManagementData();
      }
      // Fetch volunteers
      fetchVolunteers();
      // Fetch parent payment overview
      fetchParentPayments();
      // Fetch Stripe-backed metrics
      (async () => {
        try {
          const resp = await fetch("/api/admin/payments/metrics");
          if (resp.ok) {
            const j = await resp.json();
            setMembershipFees(j.membershipFees || 0);
            setPendingDues(j.pendingDues || 0);
            setTournamentFees(j.tournamentFees || 0);
            setMerchFees(j.merch || 0);
            setPaidPlayersCount(j.paidPlayersCount || 0);
            setPendingPlayersCount(j.pendingPlayersCount || 0);
          }
        } catch (e) {
          // Non-fatal; keep defaults
        }
      })();
    } else if (activeTab === "analytics") {
      fetchAnalyticsData();
    }
    // Removed teams.length and players.length from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthorized, userId, userRole]);

  // Activity heartbeat for admins/coaches using this page
  useEffect(() => {
    if (!userId) return;
    const ping = async () => {
      try {
        await fetch("/api/activity/heartbeat", {
          method: "POST",
          headers: { "x-user-id": userId },
        });
      } catch {}
    };
    ping();
    const onVisibility = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [userId]);

  // Auto-select a team when teams load on Coach tab
  useEffect(() => {
    if (!isAuthorized || activeTab !== "coaches-dashboard") return;
    // Wait for teams to be loaded before auto-selecting
    if (teams.length === 0) {
      // Teams not loaded yet, fetch them if we have userId and userRole
      if (userId && userRole) {
        fetchManagementData();
      }
      return;
    }
    // If a team is already selected, don't auto-select
    if (selectedTeamId) return;

    // If admin, default to "All Teams"
    if (userRole === "admin") {
      setSelectedTeamId("__GLOBAL__");
      return;
    }

    // For coaches, select their first assigned team
    const coachTeams = teams.filter((team) =>
      team.coaches?.some((c: any) => c.email === userEmail)
    );
    const defaultTeam = coachTeams[0];
    if (defaultTeam) {
      setSelectedTeamId(defaultTeam.id);
    }
  }, [
    teams,
    activeTab,
    isAuthorized,
    userRole,
    userEmail,
    selectedTeamId,
    userId,
  ]);

  // Load coach data when team changes
  useEffect(() => {
    if (!isAuthorized || !userId || !userRole) return;
    if (selectedTeamId && activeTab === "coaches-dashboard") {
      fetchCoachData();
    }
  }, [selectedTeamId, activeTab, isAuthorized, userId, userRole]);

  // Fetch unread mention count
  useEffect(() => {
    const fetchUnreadMentions = async () => {
      if (!userId) return;
      try {
        const count = await getUnreadMentionCount(userId);
        setUnreadMentions(count);
      } catch (error) {
        devError("Error fetching unread mentions", error);
        setUnreadMentions(0);
      }
    };

    fetchUnreadMentions();
  }, [userId, messages]); // Refresh when messages change

  // Reset initialProfileSection after profile tab is opened
  useEffect(() => {
    if (activeTab === "profile" && initialProfileSection) {
      // Small delay to ensure CoachProfile has processed the prop
      const timer = setTimeout(() => {
        setInitialProfileSection(null);
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [activeTab, initialProfileSection]);

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
    devLog("Edit coach clicked, coach data:", coach);
    setEditingCoach(coach);
    setShowEditCoachModal(true);
  };

  const handleViewCoach = async (coach: any) => {
    devLog("View coach clicked, coach data:", coach);
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
    devLog("Edit team clicked, team data:", team);
    setEditingTeam(team);
    setShowEditTeamModal(true);
  };

  const handleViewTeam = (team: Team) => {
    devLog("View team clicked, team data:", team);
    // Find the latest team data from the teams array to ensure fresh data
    const latestTeamData = teams.find((t) => t.id === team.id) || team;
    devLog("Using latest team data for modal:", latestTeamData);
    setSelectedTeamForModal(latestTeamData);
    setShowTeamDetailModal(true);
  };

  const handleEditPlayer = (player: Player) => {
    devLog("Edit player clicked, player data:", player);
    setEditingPlayer(player);
    setShowEditPlayerModal(true);
  };

  const handleViewPlayer = (player: Player) => {
    devLog("View player clicked, player data:", player);
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

    const sortedUpdates = [...teamUpdates].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastUpdate = sortedUpdates[0];

    if (!lastUpdate) return "No updates";

    return getRelativeTime(new Date(lastUpdate.created_at));
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
          const updateData: any = {
            event_type: eventType,
            date_time: data.gameDateTime,
            location: data.gameLocation,
            opponent: data.gameOpponent,
            description: data.gameComments,
          };

          // Add end date for tournaments
          if (data.gameType === "tournament" && data.gameEndDateTime) {
            updateData.end_date_time = data.gameEndDateTime;
          }

          await updateSchedule(editingSchedule.id, updateData);
        }
        toast.success("Schedule updated successfully");
      } else {
        // Create new schedule
        devLog("handleCreateSchedule: Creating new schedule", {
          modalType,
          teamId: selectedTeamId,
          userId,
        });

        // Handle __GLOBAL__ conversion
        const isGlobal = selectedTeamId === "__GLOBAL__";
        const teamId = isGlobal ? null : selectedTeamId;

        if (modalType === "Practice" && data.isRecurring) {
          const recurringData = {
            team_id: teamId,
            event_type: "Practice" as const,
            date_time: data.practiceDateTime,
            title: data.practiceTitle || null,
            location: data.practiceLocation,
            description: data.practiceComments,
            is_global: isGlobal,
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
            team_id: teamId,
            event_type: "Practice" as const,
            date_time: data.practiceDateTime,
            title: data.practiceTitle || null,
            location: data.practiceLocation,
            description: data.practiceComments,
            is_global: isGlobal,
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
          const gameData: any = {
            team_id: teamId,
            event_type: eventType as "Game" | "Tournament",
            date_time: data.gameDateTime,
            title: null,
            location: data.gameLocation,
            opponent: data.gameOpponent,
            description: data.gameComments,
            is_global: isGlobal,
            created_by: userId || undefined,
          };

          // Add end date for tournaments
          if (data.gameType === "tournament" && data.gameEndDateTime) {
            gameData.end_date_time = data.gameEndDateTime;
          }

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

      let imageUrl = data.image_url;

      // Handle file upload if image is provided
      if (data.image && data.image instanceof File) {
        devLog("Uploading file for team update:", {
          fileName: data.image.name,
          fileType: data.image.type,
          fileSize: data.image.size,
          fileSizeMB: (data.image.size / (1024 * 1024)).toFixed(2),
        });
        try {
          const formData = new FormData();
          formData.append("file", data.image);
          formData.append("folder", "team_updates");

          const response = await fetch("/api/upload/team-update", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to upload image");
          }

          const result = await response.json();
          imageUrl = result.url;
          devLog("File uploaded successfully:", imageUrl);
        } catch (uploadError) {
          devError("File upload failed:", uploadError);
          toast.error(
            `Failed to upload image: ${
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown error"
            }`
          );
          return;
        }
      }

      // Handle __GLOBAL__ conversion
      const isGlobal = selectedTeamId === "__GLOBAL__";
      const teamId = isGlobal ? null : selectedTeamId;

      await addUpdate({
        team_id: teamId,
        title: data.title,
        content: data.content,
        date_time: data.date_time || null,
        image_url: imageUrl,
        is_global: isGlobal || data.is_global,
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

  const handleUpdateUpdate = async (data: any) => {
    try {
      if (!editingUpdate) {
        toast.error("No update selected for editing");
        return;
      }

      let imageUrl = data.image_url || editingUpdate.image_url;

      // Handle file upload if new image is provided
      if (data.image && data.image instanceof File) {
        devLog("Uploading new file for team update:", data.image.name);
        imageUrl = await uploadFileToStorage(
          data.image,
          "team-updates",
          "team_updates"
        );
        devLog("File uploaded successfully:", imageUrl);
      }

      await updateUpdate(editingUpdate.id, {
        title: data.title,
        content: data.content,
        date_time: data.date_time || null,
        image_url: imageUrl,
      });
      toast.success("Update saved successfully");
      setShowScheduleModal(false);
      setEditingUpdate(null);
      await fetchCoachData();
    } catch (e) {
      devError("Failed to update team update", e);
      toast.error("Failed to save update");
    }
  };

  const handleCreateDrill = async (data: any) => {
    try {
      if (!selectedTeamId) {
        toast.error("Please select a team first");
        return;
      }

      // Handle global drills (for all teams)
      const isGlobal = selectedTeamId === "__GLOBAL__";
      const teamIdForDrill = isGlobal ? null : selectedTeamId;

      let imageUrl = data.image_url;

      // Handle file upload if image is provided
      if (data.image && data.image instanceof File) {
        devLog("Uploading file for practice drill:", data.image.name);
        imageUrl = await uploadFileToStorage(
          data.image,
          "practice-drills",
          "practice_drills"
        );
        devLog("File uploaded successfully:", imageUrl);
      }

      await createPracticeDrill(
        {
          team_id: teamIdForDrill,
          title: data.title,
          skills: data.skills || [],
          equipment: data.equipment || [],
          time: data.time || "",
          instructions: data.instructions || "",
          additional_info: data.additional_info,
          benefits: data.benefits || "",
          difficulty: data.difficulty || "",
          category: data.category || "",
          image_url: imageUrl,
          youtube_url: data.youtube_url,
          is_global: isGlobal,
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

  const handleDeleteScheduleItem = (
    scheduleId: string,
    eventType: "Game" | "Practice"
  ) => {
    setDeleteTarget({
      id: scheduleId,
      type: eventType.toLowerCase() as "game" | "practice",
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteUpdateItem = (updateId: string) => {
    setDeleteTarget({ id: updateId, type: "update" });
    setShowDeleteConfirm(true);
  };

  const handleDeleteDrillItem = (drillId: string) => {
    setDeleteTarget({ id: drillId, type: "drill" });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      devLog("Attempting to delete:", { deleteTarget, userId });

      if (deleteTarget.type === "drill") {
        await deletePracticeDrill(
          deleteTarget.id,
          userId || "",
          userRole === "admin"
        );
        toast.success("Drill deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
      } else if (
        deleteTarget.type === "game" ||
        deleteTarget.type === "practice"
      ) {
        await deleteSchedule(
          deleteTarget.id,
          userId || "",
          userRole === "admin"
        );
        toast.success(
          `${
            deleteTarget.type === "game" ? "Game" : "Practice"
          } deleted successfully`,
          {
            duration: 3000,
            position: "top-right",
          }
        );
      } else if (deleteTarget.type === "update") {
        await deleteUpdate(deleteTarget.id, userId || "", userRole === "admin");
        toast.success("Update deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
      }

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      await fetchCoachData();
    } catch (error) {
      devError("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Coach, Team, Player handlers
  const handleCoachSubmit = async (coachData: any) => {
    try {
      devLog("Saving coach data:", coachData);
      devLog("Editing coach ID:", editingCoach?.id);

      let coachId: string;

      if (editingCoach) {
        // Update existing coach using API route
        devLog("Updating coach with ID:", editingCoach.id);
        const requestBody = {
          firstName: coachData.first_name,
          lastName: coachData.last_name,
          email: coachData.email,
          bio: coachData.bio,
          imageUrl: coachData.image_url,
          quote: coachData.quote,
          is_active: coachData.is_active,
        };
        devLog("Sending coach update data:", requestBody);
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
          devError("Error updating coach:", result.error);
          throw new Error(result.error || "Failed to update coach");
        }

        devLog("Coach updated successfully:", result);
        coachId = editingCoach.id;
        toast.success("Coach updated successfully");
      } else {
        // Create new coach using API route
        devLog("Creating new coach via API");
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
          devError("Error creating coach:", result.error);
          throw new Error(result.error || "Failed to create coach");
        }

        devLog("Coach created successfully:", result);
        coachId = result.id;
        toast.success("Coach added successfully");
      }

      // Handle team assignment
      if (coachData.selectedTeamId) {
        devLog("Assigning coach to team:", coachData.selectedTeamId);

        // Remove any existing team assignment for this coach
        await supabase.from("team_coaches").delete().eq("coach_id", coachId);

        // Add new team assignment
        const { error: assignError } = await supabase
          .from("team_coaches")
          .insert({
            coach_id: coachId,
            team_id: coachData.selectedTeamId,
          });

        if (assignError) {
          devError("Error assigning coach to team:", assignError);
          toast.error("Coach saved but team assignment failed");
        } else {
          toast.success("Coach assigned to team successfully");
        }
      } else if (editingCoach && !coachData.selectedTeamId) {
        // If editing and no team selected, remove team assignment
        await supabase.from("team_coaches").delete().eq("coach_id", coachId);
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
      devLog("Saving team data:", teamData);
      devLog("Editing team ID:", editingTeam?.id);

      if (editingTeam) {
        // Update existing team using API route
        devLog("Updating team with ID:", editingTeam.id);
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
          devError("Error updating team:", result.error);
          throw new Error(result.error || "Failed to update team");
        }

        devLog("Team updated successfully:", result);
        toast.success("Team updated successfully");
        setShowEditTeamModal(false); // Close the modal
        setEditingTeam(null); // Clear the editing team
        await fetchManagementData(); // Refresh the data
      } else {
        // Create new team using API route
        devLog("Creating new team via API");
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
          devError("Error creating team:", result.error);
          const errorMessage =
            result.error || result.details || "Failed to create team";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        devLog("Team created successfully:", result);
        toast.success("Team added successfully");
        setShowEditTeamModal(false); // Close the modal
        setEditingTeam(null); // Clear editing state
        await fetchManagementData(); // Refresh the data
      }
    } catch (e) {
      devError("Failed to save team", e);
      const errorMessage =
        e instanceof Error ? e.message : "Failed to save team";
      if (!errorMessage.includes("Failed to create team")) {
        toast.error(errorMessage);
      }
      // Don't show generic error if specific error was already shown
    }
  };

  const handlePlayerSubmit = async (playerData: any) => {
    try {
      devLog("Saving player data:", playerData);
      devLog("Editing player ID:", editingPlayer?.id);

      if (editingPlayer) {
        // Update existing player using API route
        devLog("Updating player with ID:", editingPlayer.id);
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
          devError("Error updating player:", result.error);
          throw new Error(result.error || "Failed to update player");
        }

        devLog("Player updated successfully:", result);
        toast.success("Player updated successfully");
        setShowEditPlayerModal(false); // Close the modal
        setEditingPlayer(null); // Clear the editing player
        await fetchManagementData(); // Refresh the data
      } else {
        // Create new player using API route
        devLog("Creating new player via API");
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
          devError("Error creating player:", result.error);
          throw new Error(result.error || "Failed to create player");
        }

        devLog("Player created successfully:", result);
        toast.success("Player added successfully");
        setShowEditPlayerModal(false); // Close the modal
        setEditingPlayer(null); // Clear editing state
        await fetchManagementData(); // Refresh the data
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
    devLog("Mock handler called with:", item);
  };

  const mockSetState = (value: any) => {
    devLog("Mock setState called with:", value);
  };

  if (!isAuthorized || !userId || !userRole) {
    return (
      <div className="bg-black min-h-screen text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <BasketballLoader size={60} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8 z-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col items-center justify-center mb-2">
              <h1 className="text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter text-center">
                Club Management
              </h1>
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    // Load user data first to ensure userId is available
                    await loadUserData();
                    // Get userId after loadUserData completes
                    const currentUserId =
                      userId || (await supabase.auth.getUser()).data.user?.id;

                    // Then refresh management data, messages, and unread mentions in parallel
                    await Promise.all([
                      fetchManagementData(),
                      (async () => {
                        try {
                          const messagesData = await getMessages();
                          setMessages(messagesData || []);
                        } catch (error) {
                          devError("Error refreshing messages:", error);
                        }
                      })(),
                      (async () => {
                        if (currentUserId) {
                          try {
                            const { getUnreadMentionCount } = await import(
                              "@/lib/messageActions"
                            );
                            const count = await getUnreadMentionCount(
                              currentUserId
                            );
                            setUnreadMentions(count);
                          } catch (error) {
                            devError(
                              "Error refreshing unread mentions count:",
                              error
                            );
                          }
                        }
                      })(),
                    ]);
                    // Trigger MessageBoard refresh
                    setMessageBoardRefreshTrigger((prev) => prev + 1);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
                className="ml-4 p-2 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition-colors duration-200"
                title="Refresh data"
              >
                <svg
                  className={`w-5 h-5 text-white ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
            {userFirstName && userLastName && (
              <p className="text-white text-xl font-semibold mb-2 text-center font-inter">
                <span className="relative inline-block">
                  {/* Pending Players Notification (Left side, Admin only) */}
                  {isAdmin && pendingPlayers.length > 0 && (
                    <span
                      className="absolute top-[40%] -translate-y-1/2 right-full mr-3 h-[1.5em] w-[1.5em] bg-blue-500 rounded-full cursor-pointer z-10 flex items-center justify-center text-white text-xs font-bold hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        handleTabChange("payments");
                        // Scroll to registration section after payments tab is rendered
                        let attempts = 0;
                        const scrollToRegistrations = () => {
                          // Look for the "Registrations" heading in the payments tab
                          const headings = Array.from(
                            document.querySelectorAll("h2, h3")
                          );
                          const registrationsHeading = headings.find((h) =>
                            h.textContent?.includes("Registrations")
                          );
                          const target =
                            registrationsHeading?.closest("div") ||
                            registrationsHeading;

                          if (target) {
                            // Scroll to the registration section
                            target.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            // Also scroll window to top with offset
                            const rect = target.getBoundingClientRect();
                            window.scrollTo({
                              top: window.scrollY + rect.top - 20,
                              behavior: "smooth",
                            });
                          } else {
                            // Retry if section not found yet (max 10 attempts = 1 second)
                            attempts++;
                            if (attempts < 10) {
                              setTimeout(scrollToRegistrations, 100);
                            }
                          }
                        };
                        // Start scrolling after a delay to allow tab to render
                        setTimeout(scrollToRegistrations, 300);
                      }}
                      title={`${pendingPlayers.length} pending player${
                        pendingPlayers.length !== 1 ? "s" : ""
                      } awaiting approval`}
                    >
                      {pendingPlayers.length}
                    </span>
                  )}
                  {userFirstName} {userLastName}
                  {unreadMentions > 0 && (
                    <span
                      className="absolute top-[40%] -translate-y-1/2 left-full ml-3 h-[1.5em] w-[1.5em] bg-[red] rounded-full cursor-pointer z-10 flex items-center justify-center text-white text-xs font-bold"
                      onClick={async () => {
                        setInitialProfileSection("messages");
                        handleTabChange("profile");

                        // Get the first unread mention to scroll to
                        if (userId) {
                          try {
                            const { getUnreadMentionsForUser } = await import(
                              "@/lib/messageActions"
                            );
                            const mentions = await getUnreadMentionsForUser(
                              userId
                            );

                            if (mentions && mentions.length > 0) {
                              // Get the first unread mention
                              const firstMention = mentions[0];
                              if (firstMention) {
                                // Determine the message_id (if it's a reply, get the parent message_id)
                                // coach_message_replies is an array from Supabase relationship query
                                const replyData = Array.isArray(
                                  firstMention.coach_message_replies
                                )
                                  ? firstMention.coach_message_replies[0]
                                  : firstMention.coach_message_replies;
                                const messageId = firstMention.reply_id
                                  ? replyData?.message_id ||
                                    firstMention.message_id
                                  : firstMention.message_id;

                                if (messageId) {
                                  // Set the message ID to scroll to
                                  setScrollToMessageId(messageId);
                                }
                              }
                            }
                          } catch (error) {
                            devError("Error fetching unread mentions", error);
                          }
                        }

                        // Scroll to message board after messages section is rendered
                        // Use multiple attempts to ensure the section is open
                        let messageAttempts = 0;
                        const scrollToMessages = () => {
                          const messagesSection =
                            document.getElementById("messages-section");
                          const messageBoard = document.getElementById(
                            "message-board-container"
                          );
                          const target = messageBoard || messagesSection;

                          if (target) {
                            // Scroll to the top of the message board
                            target.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            // Also scroll window to top with offset
                            const rect = target.getBoundingClientRect();
                            window.scrollTo({
                              top: window.scrollY + rect.top - 20,
                              behavior: "smooth",
                            });
                          } else {
                            // Retry if section not found yet (max 10 attempts = 1 second)
                            messageAttempts++;
                            if (messageAttempts < 10) {
                              setTimeout(scrollToMessages, 100);
                            }
                          }
                        };
                        // Start scrolling after a delay to allow tab and section to render
                        setTimeout(scrollToMessages, 300);
                      }}
                      title={`${unreadMentions} unread mention${
                        unreadMentions !== 1 ? "s" : ""
                      }`}
                    >
                      {unreadMentions}
                    </span>
                  )}
                </span>
              </p>
            )}
            <p className="text-blue-400 text-xl font-inter mb-8 text-center italic">
              "Success is built on the foundation of unity, discipline, and
              relentless effort"
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="bg-gray-800 p-1 rounded-lg">
              {(() => {
                // Define tabs based on user role
                // Admin view: Profile, Payments, Manage, Coach, Monitor
                // Coach view: Profile, Coach, Manage
                const adminTabs = [
                  { id: "profile", label: "Profile", icon: "👤" },
                  { id: "payments", label: "Payments", icon: "💳" },
                  { id: "overview", label: "Manage", icon: "📋" },
                  { id: "coaches-dashboard", label: "Coach", icon: "🏀" },
                  { id: "analytics", label: "Monitor", icon: "📊" },
                ];

                const coachTabs = [
                  { id: "profile", label: "Profile", icon: "👤" },
                  { id: "coaches-dashboard", label: "Coach", icon: "🏀" },
                  { id: "overview", label: "Manage", icon: "📋" },
                ];

                // For admin on mobile, split into two rows
                if (userRole === "admin") {
                  const firstRowTabs = adminTabs.slice(0, 3); // Profile, Payments, Manage
                  const secondRowTabs = adminTabs.slice(3); // Coach, Monitor

                  return (
                    <>
                      {/* Desktop: All tabs in one row */}
                      <div className="hidden md:flex flex-row space-x-1 w-full">
                        {adminTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 rounded-md font-inter transition-all text-xs sm:text-base ${
                              activeTab === tab.id
                                ? "bg-[red] text-white shadow-lg"
                                : "text-gray-300 hover:text-white hover:bg-gray-700"
                            }`}
                          >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">
                              {tab.label}
                            </span>
                            <span className="sm:hidden">
                              {tab.label.split(" ")[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                      {/* Mobile: Two rows */}
                      <div className="flex md:hidden flex-col space-y-1 w-full">
                        {/* First Row: Profile, Payments, Manage */}
                        <div className="flex flex-row space-x-1">
                          {firstRowTabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id)}
                              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 rounded-md font-inter transition-all text-xs sm:text-base ${
                                activeTab === tab.id
                                  ? "bg-[red] text-white shadow-lg"
                                  : "text-gray-300 hover:text-white hover:bg-gray-700"
                              }`}
                            >
                              <span>{tab.icon}</span>
                              <span className="hidden sm:inline">
                                {tab.label}
                              </span>
                              <span className="sm:hidden">
                                {tab.label.split(" ")[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                        {/* Second Row: Coach, Monitor */}
                        <div className="flex flex-row space-x-1">
                          {secondRowTabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id)}
                              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 rounded-md font-inter transition-all text-xs sm:text-base ${
                                activeTab === tab.id
                                  ? "bg-[red] text-white shadow-lg"
                                  : "text-gray-300 hover:text-white hover:bg-gray-700"
                              }`}
                            >
                              <span>{tab.icon}</span>
                              <span className="hidden sm:inline">
                                {tab.label}
                              </span>
                              <span className="sm:hidden">
                                {tab.label.split(" ")[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                }

                // Coach view: single row (unchanged)
                return coachTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-3 px-2 sm:px-4 rounded-md font-inter transition-all text-xs sm:text-base ${
                      activeTab === tab.id
                        ? "bg-[red] text-white shadow-lg"
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

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                    Manage
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md font-inter uppercase tracking-wider">
                    COACHES, TEAMS, AND PLAYERS
                  </p>
                </div>
              </div>
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
            <div className="space-y-12">
              {/* Team Selection Section */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                      Coach Dashboard
                    </h2>
                    <p className="text-slate-400 text-sm max-w-md font-inter uppercase tracking-wider">
                      MANAGE YOUR TEAM SCHEDULE, UPDATES, AND DRILLS
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor="team-select"
                        className="block text-sm font-semibold font-inter mb-2 text-white"
                      >
                        Select Team
                      </label>
                      <select
                        id="team-select"
                        value={selectedTeamId}
                        onChange={(e) => {
                          devLog("Team selection changed:", e.target.value);
                          setSelectedTeamId(e.target.value);
                          const team = teams.find(
                            (t) => t.id === e.target.value
                          );
                          devLog("Found team:", team);
                          devLog("Team logo URL:", team?.logo_url);
                        }}
                        className="w-full p-3 bg-white text-black rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-inter hover:bg-gray-50 transition-colors"
                      >
                        <option value="">Select a team</option>
                        {userRole === "admin" && (
                          <option value="__GLOBAL__">
                            All teams (program-wide)
                          </option>
                        )}
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {selectedTeamId ? (
                <>
                  {/* Statistics Cards */}
                  <section className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                          Quick Stats
                        </h2>
                        <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                          AT A GLANCE
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(() => {
                        // Get start of today for comparison (midnight today)
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const nextGame = schedules
                          .filter(
                            (s) =>
                              (s.event_type === "Game" ||
                                s.event_type === "Tournament") &&
                              new Date(s.date_time) >= today
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
                                ? `${daysUntil} day${
                                    daysUntil === 1 ? "" : "s"
                                  }`
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
                  </section>

                  {/* Main Content Grid */}
                  <section className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Upcoming Games */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                          <div>
                            <h3 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                              Upcoming Games
                            </h3>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              NEXT SCHEDULED GAMES
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingSchedule(null); // Clear any previous editing state
                              setModalType("Game");
                              setShowScheduleModal(true);
                            }}
                            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-inter hover:bg-blue-500/30 transition-colors flex items-center gap-2"
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Add Game
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(() => {
                            // Get start of today for comparison (midnight today)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            return schedules
                              .filter(
                                (s) =>
                                  (s.event_type === "Game" ||
                                    s.event_type === "Tournament") &&
                                  new Date(s.date_time) >= today
                              )
                              .slice(0, 3)
                              .map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="text-white font-semibold text-lg mb-1 font-inter">
                                        {schedule.opponent
                                          ? `vs. ${schedule.opponent}`
                                          : "TBD"}
                                      </h4>
                                      <div className="text-slate-400 text-sm font-inter">
                                        <div className="sm:hidden">
                                          <div>
                                            {new Date(
                                              schedule.date_time
                                            ).toLocaleDateString("en-US", {
                                              weekday: "short",
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </div>
                                          <div>
                                            {new Date(
                                              schedule.date_time
                                            ).toLocaleTimeString("en-US", {
                                              hour: "numeric",
                                              minute: "2-digit",
                                              hour12: true,
                                            })}
                                          </div>
                                        </div>
                                        <div className="hidden sm:block">
                                          {new Date(
                                            schedule.date_time
                                          ).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                          })}
                                        </div>
                                      </div>
                                      {schedule.location && (
                                        <p className="text-slate-400 text-sm mt-1 font-inter flex items-center gap-1">
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
                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                          </svg>
                                          {schedule.location}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <div className="flex space-x-2 justify-center sm:justify-start">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openViewModal(schedule, "game");
                                          }}
                                          className="text-slate-400 hover:text-white text-sm font-inter"
                                          title="View details"
                                        >
                                          👁️
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            devLog(
                                              "[DEBUG] Setting editing schedule:",
                                              schedule
                                            );
                                            setEditingSchedule(schedule);
                                            setModalType("Game");
                                            setShowScheduleModal(true);
                                          }}
                                          className="text-blue-400 hover:text-blue-300 text-sm font-inter"
                                          title="Edit"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteScheduleItem(
                                              schedule.id,
                                              "Game"
                                            );
                                          }}
                                          className="text-red-400 hover:text-red-300 text-sm font-inter"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium text-center font-inter ${
                                          schedule.event_type === "Tournament"
                                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                                        }`}
                                      >
                                        {schedule.event_type === "Tournament"
                                          ? "Tournament"
                                          : "Game"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ));
                          })()}
                          {(() => {
                            // Get start of today for comparison (midnight today)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            return (
                              schedules.filter(
                                (s) =>
                                  (s.event_type === "Game" ||
                                    s.event_type === "Tournament") &&
                                  new Date(s.date_time) >= today
                              ).length === 0 && (
                                <div className="text-center py-8">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                    <svg
                                      className="w-8 h-8 text-slate-400"
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
                                  </div>
                                  <p className="text-slate-400 font-inter">
                                    No upcoming games
                                  </p>
                                  <p className="text-slate-500 text-sm mt-1 font-inter">
                                    Add a game to get started
                                  </p>
                                </div>
                              )
                            );
                          })()}
                        </div>
                      </div>

                      {/* Practice Schedule */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                          <div>
                            <h3 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                              Practice Schedule
                            </h3>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              THIS WEEK&apos;S PRACTICE
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => {
                                setEditingSchedule(null); // Clear any previous editing state
                                setModalType("Practice");
                                setShowScheduleModal(true);
                              }}
                              className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-inter hover:bg-blue-500/30 transition-colors flex items-center gap-2"
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
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Practice
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {(() => {
                            // Get start of today for comparison (midnight today)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            return schedules
                              .filter(
                                (s) =>
                                  s.event_type === "Practice" &&
                                  new Date(s.date_time) >= today
                              )
                              .slice(0, 3)
                              .map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="text-white font-semibold text-lg mb-1 font-inter">
                                        {schedule.title || "Practice"}
                                      </h4>
                                      <div className="text-slate-400 text-sm font-inter">
                                        <div className="sm:hidden">
                                          <div>
                                            {new Date(
                                              schedule.date_time
                                            ).toLocaleDateString("en-US", {
                                              weekday: "short",
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })}
                                          </div>
                                          <div>
                                            {new Date(
                                              schedule.date_time
                                            ).toLocaleTimeString("en-US", {
                                              hour: "numeric",
                                              minute: "2-digit",
                                              hour12: true,
                                            })}
                                          </div>
                                        </div>
                                        <div className="hidden sm:block">
                                          {new Date(
                                            schedule.date_time
                                          ).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                          })}
                                        </div>
                                      </div>
                                      {schedule.location && (
                                        <p className="text-slate-400 text-sm mt-1 font-inter flex items-center gap-1">
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
                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                          </svg>
                                          {schedule.location}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      <div className="flex space-x-2 justify-center sm:justify-start">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openViewModal(schedule, "practice");
                                          }}
                                          className="text-slate-400 hover:text-white text-sm font-inter"
                                          title="View details"
                                        >
                                          👁️
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            devLog(
                                              "[DEBUG] Setting editing practice:",
                                              schedule
                                            );
                                            setEditingSchedule(schedule);
                                            setModalType("Practice");
                                            setShowScheduleModal(true);
                                          }}
                                          className="text-blue-400 hover:text-blue-300 text-sm font-inter"
                                          title="Edit"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteScheduleItem(
                                              schedule.id,
                                              "Practice"
                                            );
                                          }}
                                          className="text-red-400 hover:text-red-300 text-sm font-inter"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full text-xs font-medium text-center font-inter">
                                        Practice
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ));
                          })()}
                          {(() => {
                            // Get start of today for comparison (midnight today)
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);

                            return (
                              schedules.filter(
                                (s) =>
                                  s.event_type === "Practice" &&
                                  new Date(s.date_time) >= today
                              ).length === 0 && (
                                <div className="text-center py-8">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                    <svg
                                      className="w-8 h-8 text-slate-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                  <p className="text-slate-400 font-inter">
                                    No practices scheduled
                                  </p>
                                  <p className="text-slate-500 text-sm mt-1 font-inter">
                                    Add a practice to get started
                                  </p>
                                </div>
                              )
                            );
                          })()}
                        </div>
                      </div>

                      {/* Recent Announcements */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                          <div>
                            <h3 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                              Recent Announcements
                            </h3>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              {isAdmin
                                ? "ALL TEAM UPDATES"
                                : "LATEST TEAM UPDATES"}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingUpdate(null); // Clear any previous editing state
                              setModalType("Update");
                              setShowScheduleModal(true);
                            }}
                            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-inter hover:bg-blue-500/30 transition-colors flex items-center gap-2"
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Add Update
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(isAdmin
                            ? teamUpdates
                            : teamUpdates.slice(0, 3)
                          ).map((update) => (
                            <div
                              key={update.id}
                              className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="text-white font-semibold text-lg mb-1 font-inter">
                                    {update.title}
                                  </h4>
                                  <p className="text-slate-400 text-sm font-inter">
                                    {new Date(
                                      update.created_at
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
                                  {/* Display image if available */}
                                  {update.image_url && (
                                    <div className="mt-3">
                                      <Image
                                        src={update.image_url}
                                        alt={`${update.title} image`}
                                        width={200}
                                        height={150}
                                        className="w-full max-w-xs h-32 object-cover rounded-lg border border-white/10"
                                        onError={(e) => {
                                          devError(
                                            "Failed to load team update image:",
                                            update.image_url
                                          );
                                          // Hide the image element on error
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div className="flex space-x-2 justify-center sm:justify-start">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openViewModal(update, "update");
                                      }}
                                      className="text-slate-400 hover:text-white text-sm font-inter"
                                      title="View details"
                                    >
                                      👁️
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingUpdate(update);
                                        setModalType("Update");
                                        setShowScheduleModal(true);
                                      }}
                                      className="text-blue-400 hover:text-blue-300 text-sm font-inter"
                                      title="Edit update"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUpdateItem(update.id);
                                      }}
                                      className="text-red-400 hover:text-red-300 text-sm font-inter"
                                      title="Delete update"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                  <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full text-xs font-medium text-center font-inter">
                                    Update
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {teamUpdates.length === 0 && (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                                  />
                                </svg>
                              </div>
                              <p className="text-slate-400 font-inter">
                                No announcements
                              </p>
                              <p className="text-slate-500 text-sm mt-1 font-inter">
                                Add an update to keep your team informed
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Your Practice Drills */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                          <div>
                            <h3 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                              Your Practice Drills
                            </h3>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              DRILL LIBRARY
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingDrill(null); // Clear any previous editing state
                              setModalType("Drill");
                              setShowScheduleModal(true);
                            }}
                            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-inter hover:bg-blue-500/30 transition-colors flex items-center gap-2"
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
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Add Drill
                          </button>
                        </div>
                        <div className="space-y-3">
                          {drills.length > 0 ? (
                            drills.map((drill) => (
                              <div
                                key={drill.id}
                                className="bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                onClick={() => openViewModal(drill, "drill")}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="text-white font-semibold text-lg mb-2 font-inter">
                                      {drill.title}
                                    </h4>
                                    <div className="flex gap-2 mb-2">
                                      <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-1 rounded-full text-xs font-medium font-inter">
                                        Drill
                                      </span>
                                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-full text-xs font-medium font-inter">
                                        {drill.difficulty}
                                      </span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-inter">
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
                                      className="text-green-400 hover:text-green-300 text-sm font-inter"
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
                                      className="text-blue-400 hover:text-blue-300 text-sm font-inter"
                                      title="Edit drill"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDrillItem(drill.id);
                                      }}
                                      className="text-red-400 hover:text-red-300 text-sm font-inter"
                                      title="Delete drill"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                  />
                                </svg>
                              </div>
                              <p className="text-slate-400 font-inter">
                                No practice drills yet
                              </p>
                              <p className="text-slate-500 text-sm mt-1 font-inter">
                                Click &quot;Add Drill&quot; to create your first
                                drill
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <section className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                        Select Your Team
                      </h2>
                      <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                        CHOOSE A TEAM TO GET STARTED
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/10">
                      <svg
                        className="w-12 h-12 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-300 text-lg font-inter mb-2">
                      Please select a team to view the dashboard
                    </p>
                    <p className="text-slate-500 text-sm font-inter">
                      Use the team selector above to get started
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                    Profile
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md font-inter uppercase tracking-wider">
                    VIEW AND MANAGE YOUR PROFILE INFORMATION
                  </p>
                </div>
              </div>
              <CoachProfile
                userId={userId}
                userEmail={userEmail}
                userName={userName}
                isAdmin={isAdmin}
                initialSection={initialProfileSection}
                messageBoardRefreshTrigger={messageBoardRefreshTrigger}
                scrollToMessageId={scrollToMessageId}
                onMentionRead={() => {
                  // Refresh unread mentions count when a mention is marked as read
                  if (userId) {
                    getUnreadMentionCount(userId).then((count) => {
                      setUnreadMentions(count);
                    });
                  }
                  // Clear scrollToMessageId after it's been used
                  setScrollToMessageId(null);
                }}
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && userRole === "admin" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                    Monitor
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md font-inter uppercase tracking-wider">
                    ANALYTICS, PERFORMANCE, AND SYSTEM HEALTH
                  </p>
                </div>
              </div>
              {/* Website Analytics & Monitoring Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl">
                <div
                  className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleSection("analytics")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                        Website Analytics & Monitoring
                      </h2>
                      <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                        PERFORMANCE METRICS
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ml-auto ${
                        expandedSections.analytics ? "rotate-180" : ""
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
                {expandedSections.analytics && (
                  <div className="p-6">
                    {analyticsLoading ? (
                      <div className="text-center py-8">
                        <BasketballLoader size={60} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-blue-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-xl font-semibold tracking-tighter text-white font-inter uppercase">
                                User Statistics
                              </h3>
                            </div>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              TRAFFIC OVERVIEW
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="pb-3 border-b border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Unique Visitors
                                </span>
                                <span className="text-2xl font-bold text-white font-inter">
                                  {analyticsData?.trafficMetrics
                                    ?.uniqueVisitors || 0}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                From web_vitals table (last 30 days) - Distinct
                                sessions
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Counts unique visitors based on session IDs from
                                Core Web Vitals tracking
                              </p>
                            </div>
                            <div className="pb-3 border-b border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Page Views
                                </span>
                                <span className="text-2xl font-bold text-green-400 font-inter">
                                  {analyticsData?.trafficMetrics
                                    ?.totalPageViews || 0}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                From web_vitals table (last 30 days) - LCP
                                entries
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Total number of page loads tracked via Largest
                                Contentful Paint metrics
                              </p>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Mobile Users
                                </span>
                                <span className="text-2xl font-bold text-blue-400 font-inter">
                                  {analyticsData?.trafficMetrics
                                    ?.deviceBreakdown?.mobile || 0}
                                  %
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                From login_logs table - User agent analysis
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Percentage of users accessing from mobile
                                devices (phones, tablets)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-green-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-xl font-semibold tracking-tighter text-white font-inter uppercase">
                                Performance
                              </h3>
                            </div>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              API ROUTE METRICS
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="pb-3 border-b border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Avg Response Time
                                </span>
                                <span className="text-2xl font-bold text-white font-inter">
                                  {analyticsData?.performanceMetrics
                                    ?.averagePageLoadTime || 0}
                                  <span className="text-sm font-normal text-slate-400 ml-1">
                                    ms
                                  </span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                From performance_metrics table (last 24h)
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Average time for API routes to respond to
                                requests
                              </p>
                            </div>
                            <div className="pb-3 border-b border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Error Rate
                                </span>
                                <span className="text-2xl font-bold text-white font-inter">
                                  {(
                                    (analyticsData?.performanceMetrics
                                      ?.errorRate || 0) * 100
                                  ).toFixed(1)}
                                  <span className="text-sm font-normal text-slate-400 ml-1">
                                    %
                                  </span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                From error_logs table
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Percentage of unresolved errors compared to
                                total errors logged
                              </p>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Success Rate
                                </span>
                                <span className="text-2xl font-bold text-green-400 font-inter">
                                  {(
                                    100 -
                                    (analyticsData?.performanceMetrics
                                      ?.errorRate || 0) *
                                      100
                                  ).toFixed(1)}
                                  <span className="text-sm font-normal text-slate-400 ml-1">
                                    %
                                  </span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                Calculated from error rate
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Percentage of successful operations (100% -
                                error rate)
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-purple-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-xl font-semibold tracking-tighter text-white font-inter uppercase">
                                System Health
                              </h3>
                            </div>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              STATUS MONITORING
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="pb-3 border-b border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Uptime
                                </span>
                                <span className="text-2xl font-bold text-green-400 font-inter">
                                  {analyticsData?.systemHealth?.uptime || 99.9}
                                  <span className="text-sm font-normal text-slate-400 ml-1">
                                    %
                                  </span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                From UptimeRobot API
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Percentage of time the website has been online
                                and accessible
                              </p>
                            </div>
                            <div className="pb-3 border-b border-white/10">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  API Response Time
                                </span>
                                <span className="text-2xl font-bold text-blue-400 font-inter">
                                  {analyticsData?.systemHealth?.responseTime ||
                                    120}
                                  <span className="text-sm font-normal text-slate-400 ml-1">
                                    ms
                                  </span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                From performance_metrics table (last 24h)
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Average server response time for API requests
                              </p>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-sm font-inter">
                                  Database
                                </span>
                                <span
                                  className={`text-lg font-semibold font-inter px-3 py-1 rounded-lg ${
                                    analyticsData?.systemHealth?.database ===
                                    "Healthy"
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                                  }`}
                                >
                                  {analyticsData?.systemHealth?.database ||
                                    "Healthy"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 font-inter">
                                Health check via Supabase query
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-inter">
                                Database connection status and query response
                                capability
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors lg:col-span-3">
                          <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-yellow-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-xl font-semibold tracking-tighter text-white font-inter uppercase">
                                Core Web Vitals
                              </h3>
                            </div>
                            <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                              USER EXPERIENCE METRICS
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* LCP */}
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-inter font-medium">
                                  LCP
                                </span>
                                <span
                                  className={`text-lg font-bold font-inter ${
                                    (analyticsData?.webVitals?.lcp || 2500) <
                                    2500
                                      ? "text-green-400"
                                      : (analyticsData?.webVitals?.lcp ||
                                          2500) < 4000
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {analyticsData?.webVitals?.lcp || 2500}
                                  <span className="text-xs font-normal text-slate-400 ml-1">
                                    ms
                                  </span>
                                </span>
                              </div>
                              {(analyticsData?.webVitals?.lcp || 2500) >=
                                2500 && (
                                <WebVitalsDiagnostic
                                  metricName="LCP"
                                  value={analyticsData?.webVitals?.lcp || 2500}
                                  status={
                                    (analyticsData?.webVitals?.lcp || 2500) <
                                    2500
                                      ? "good"
                                      : (analyticsData?.webVitals?.lcp ||
                                          2500) < 4000
                                      ? "needsImprovement"
                                      : "poor"
                                  }
                                />
                              )}
                            </div>

                            {/* INP */}
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-inter font-medium">
                                  INP
                                </span>
                                <span
                                  className={`text-lg font-bold font-inter ${
                                    (analyticsData?.webVitals?.inp || 200) < 200
                                      ? "text-green-400"
                                      : (analyticsData?.webVitals?.inp || 200) <
                                        500
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {analyticsData?.webVitals?.inp || 200}
                                  <span className="text-xs font-normal text-slate-400 ml-1">
                                    ms
                                  </span>
                                </span>
                              </div>
                              {(analyticsData?.webVitals?.inp || 200) >=
                                200 && (
                                <WebVitalsDiagnostic
                                  metricName="INP"
                                  value={analyticsData?.webVitals?.inp || 200}
                                  status={
                                    (analyticsData?.webVitals?.inp || 200) < 200
                                      ? "good"
                                      : (analyticsData?.webVitals?.inp || 200) <
                                        500
                                      ? "needsImprovement"
                                      : "poor"
                                  }
                                />
                              )}
                            </div>

                            {/* CLS */}
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-inter font-medium">
                                  CLS
                                </span>
                                <span
                                  className={`text-lg font-bold font-inter ${
                                    (analyticsData?.webVitals?.cls || 0.1) < 0.1
                                      ? "text-green-400"
                                      : (analyticsData?.webVitals?.cls || 0.1) <
                                        0.25
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {analyticsData?.webVitals?.cls?.toFixed(2) ||
                                    0.1}
                                </span>
                              </div>
                              {(analyticsData?.webVitals?.cls || 0.1) >=
                                0.1 && (
                                <WebVitalsDiagnostic
                                  metricName="CLS"
                                  value={analyticsData?.webVitals?.cls || 0.1}
                                  status={
                                    (analyticsData?.webVitals?.cls || 0.1) < 0.1
                                      ? "good"
                                      : (analyticsData?.webVitals?.cls || 0.1) <
                                        0.25
                                      ? "needsImprovement"
                                      : "poor"
                                  }
                                />
                              )}
                            </div>

                            {/* FCP */}
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-inter font-medium">
                                  FCP
                                </span>
                                <span
                                  className={`text-lg font-bold font-inter ${
                                    (analyticsData?.webVitals?.fcp || 1800) <
                                    1800
                                      ? "text-green-400"
                                      : (analyticsData?.webVitals?.fcp ||
                                          1800) < 3000
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {analyticsData?.webVitals?.fcp || 1800}
                                  <span className="text-xs font-normal text-slate-400 ml-1">
                                    ms
                                  </span>
                                </span>
                              </div>
                              {(analyticsData?.webVitals?.fcp || 1800) >=
                                1800 && (
                                <WebVitalsDiagnostic
                                  metricName="FCP"
                                  value={analyticsData?.webVitals?.fcp || 1800}
                                  status={
                                    (analyticsData?.webVitals?.fcp || 1800) <
                                    1800
                                      ? "good"
                                      : (analyticsData?.webVitals?.fcp ||
                                          1800) < 3000
                                      ? "needsImprovement"
                                      : "poor"
                                  }
                                />
                              )}
                            </div>

                            {/* TTFB */}
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm font-inter font-medium">
                                  TTFB
                                </span>
                                <span
                                  className={`text-lg font-bold font-inter ${
                                    (analyticsData?.webVitals?.ttfb || 600) <
                                    600
                                      ? "text-green-400"
                                      : (analyticsData?.webVitals?.ttfb ||
                                          600) < 800
                                      ? "text-yellow-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {analyticsData?.webVitals?.ttfb || 600}
                                  <span className="text-xs font-normal text-slate-400 ml-1">
                                    ms
                                  </span>
                                </span>
                              </div>
                              {(analyticsData?.webVitals?.ttfb || 600) >=
                                600 && (
                                <WebVitalsDiagnostic
                                  metricName="TTFB"
                                  value={analyticsData?.webVitals?.ttfb || 600}
                                  status={
                                    (analyticsData?.webVitals?.ttfb || 600) <
                                    600
                                      ? "good"
                                      : (analyticsData?.webVitals?.ttfb ||
                                          600) < 800
                                      ? "needsImprovement"
                                      : "poor"
                                  }
                                />
                              )}
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-white/10">
                            <p className="text-xs text-slate-400 font-inter">
                              <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
                              Green (Good)
                              <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 mr-2 ml-4"></span>
                              Yellow (Needs Improvement)
                              <span className="inline-block w-3 h-3 rounded-full bg-red-400 mr-2 ml-4"></span>
                              Red (Poor)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* System Monitoring Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl">
                <div
                  className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleSection("systemMonitoring")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                        Site Updates & Improvements
                      </h2>
                      <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                        DEVELOPMENT ACTIVITY
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ml-auto ${
                        expandedSections.systemMonitoring ? "rotate-180" : ""
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
                {expandedSections.systemMonitoring && (
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-slate-400 text-sm font-inter">
                        Track development activity and site improvements over
                        time.
                      </p>
                    </div>
                    <CommitChart userId={userId} />
                  </div>
                )}
              </div>

              {/* Changelog Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl">
                <div
                  className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleSection("changelog")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                        Changelog
                      </h2>
                      <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                        VERSION HISTORY
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ml-auto ${
                        expandedSections.changelog ? "rotate-180" : ""
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
                      setEditingChangelog(null);
                      setChangelogModalOpen(true);
                    }}
                    className="px-6 py-2 text-sm font-semibold text-blue-400 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 rounded-lg font-inter transition-colors"
                  >
                    Add Entry
                  </button>
                </div>
                {expandedSections.changelog && (
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-slate-400 text-sm font-inter">
                        View and manage all site updates, features, and
                        improvements.
                      </p>
                    </div>
                    <ChangelogTable
                      userId={userId || undefined}
                      isAdmin={isAdmin}
                    />
                  </div>
                )}
              </div>
              {changelogModalOpen && (
                <ChangelogModal
                  isOpen={changelogModalOpen}
                  onClose={() => setChangelogModalOpen(false)}
                  userId={userId || ""}
                  editing={editingChangelog}
                  onSaved={() => {
                    // rely on ChangelogTable to refetch when user re-enters tab, or reload page
                  }}
                />
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && userRole === "admin" && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                    Payments
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md font-inter uppercase tracking-wider">
                    REGISTRATION FEES AND FINANCIAL TRANSACTIONS
                  </p>
                </div>
              </div>
              {/* Payment Management Summary Cards */}
              <div className="bg-white/5 border border-white/10 rounded-xl">
                <div
                  className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleSection("paymentManagement")}
                >
                  <div className="flex items-center">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                        Payment Management
                      </h2>
                      <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                        FINANCIAL OVERVIEW
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ml-3 ${
                        expandedSections.paymentManagement ? "rotate-180" : ""
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
                {expandedSections.paymentManagement && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                            Registration Fees
                          </h3>
                          <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                            PLAYER PAYMENTS
                          </p>
                        </div>
                        <p className="text-slate-400 text-sm mb-4 font-inter">
                          Manage player registration fees and payment status.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Total Players:
                            </span>
                            <span className="text-white font-inter">
                              {players.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Paid:
                            </span>
                            <span className="text-green-400 font-inter">
                              {paidPlayersCount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Pending:
                            </span>
                            <span className="text-yellow-400 font-inter">
                              {pendingPlayersCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                            Revenue by Category
                          </h3>
                          <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                            STRIPE TRANSACTIONS
                          </p>
                        </div>
                        <p className="text-slate-400 text-sm mb-4 font-inter">
                          Realized totals from Stripe (webhook-synced).
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Membership Fees:
                            </span>
                            <span className="text-green-400 font-inter">
                              {membershipFees.toLocaleString(undefined, {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Tournament Fees:
                            </span>
                            <span className="text-white font-inter">$0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Merch:
                            </span>
                            <span className="text-white font-inter">$0.00</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                            Financial Summary
                          </h3>
                          <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                            TOTAL REVENUE
                          </p>
                        </div>
                        <p className="text-slate-400 text-sm mb-4 font-inter">
                          Live totals from Stripe + pending dues.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Total Revenue:
                            </span>
                            <span className="text-green-400 font-inter">
                              {totalRevenue.toLocaleString(undefined, {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300 font-inter">
                              Pending Dues:
                            </span>
                            <span className="text-yellow-400 font-inter">
                              {pendingDues.toLocaleString(undefined, {
                                style: "currency",
                                currency: "USD",
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Registrations Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl">
                <div
                  className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleSection("registrations")}
                >
                  <div className="flex items-center">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase">
                        Registrations
                      </h2>
                      <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                        PLAYER STATUS TRACKING
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ml-3 ${
                        expandedSections.registrations ? "rotate-180" : ""
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
                      if (
                        !confirm(
                          "Are you sure you want to delete ALL pending registrations, parents, and players? This will also delete related payments. Note: auth.users must be deleted manually. This cannot be undone."
                        )
                      ) {
                        return;
                      }
                      (async () => {
                        try {
                          const resp = await fetch(
                            "/api/admin/clear-all-test-data",
                            {
                              method: "POST",
                            }
                          );
                          if (resp.ok) {
                            toast.success(
                              "All test data cleared successfully!"
                            );
                            await fetchManagementData();
                          } else {
                            const j = await resp.json().catch(() => ({}));
                            toast.error(j.error || "Failed to clear data");
                          }
                        } catch (error) {
                          toast.error("Error clearing data");
                        }
                      })();
                    }}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors text-sm font-semibold font-inter"
                  >
                    Clear All Data
                  </button>
                </div>
                {expandedSections.registrations && (
                  <div className="p-6">
                    {/* Side-by-side tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Awaiting Payment */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 border-l-[16px] border-l-green-500">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase flex items-center gap-2">
                            <span className="text-green-400">💳</span>
                            <span>Awaiting Payment</span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 font-inter">
                              {awaitingPaymentPlayers.length}
                            </span>
                          </h3>
                          <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                            PENDING PAYMENT
                          </p>
                        </div>
                        {awaitingPaymentPlayers.length > 0 ? (
                          <div className="overflow-x-auto block">
                            <div className="inline-block min-w-full align-middle">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left border-b border-white/10">
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Player
                                    </th>
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Team
                                    </th>
                                    <th className="py-2 text-slate-300 hidden md:table-cell font-inter">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {awaitingPaymentPlayers.map((p: any) => {
                                    const playerAge = p.date_of_birth
                                      ? Math.floor(
                                          (new Date().getTime() -
                                            new Date(
                                              p.date_of_birth
                                            ).getTime()) /
                                            365.25 /
                                            24 /
                                            60 /
                                            60 /
                                            1000
                                        )
                                      : null;
                                    const assignedTeam = teams.find(
                                      (t: any) => t.id === p.team_id
                                    );

                                    return (
                                      <tr
                                        key={p.id}
                                        className="border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                        onClick={() => {
                                          setSelectedPlayerForPaymentModal(p);
                                          setSelectedPlayerPaymentStatus(
                                            "approved"
                                          );
                                          setShowPlayerPaymentModal(true);
                                        }}
                                      >
                                        <td className="py-2 pr-4">
                                          <div className="text-white font-medium font-inter">
                                            {p.name}
                                          </div>
                                          {playerAge && (
                                            <div className="text-slate-400 text-xs mt-1 font-inter">
                                              Age: {playerAge} • {p.gender}
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-2 pr-4">
                                          {assignedTeam ? (
                                            <div className="text-white font-inter">
                                              {assignedTeam.name}
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 font-inter">
                                              Not assigned
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 hidden md:table-cell">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 font-inter">
                                            Pending Payment
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm font-inter">
                            No players awaiting payment
                          </p>
                        )}
                      </div>

                      {/* Pending Approvals */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 border-l-[16px] border-l-blue-500">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase flex items-center gap-2">
                            <span className="text-blue-400">📝</span>
                            <span>Pending Approval</span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter">
                              {pendingPlayers.length}
                            </span>
                          </h3>
                          <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                            AWAITING REVIEW
                          </p>
                        </div>
                        {pendingPlayers.length > 0 ? (
                          <div className="overflow-x-auto block">
                            <div className="inline-block min-w-full align-middle">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left border-b border-white/10">
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Player
                                    </th>
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Team
                                    </th>
                                    <th className="py-2 text-slate-300 hidden md:table-cell font-inter">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pendingPlayers.map((p: any) => {
                                    const playerAge = p.date_of_birth
                                      ? Math.floor(
                                          (new Date().getTime() -
                                            new Date(
                                              p.date_of_birth
                                            ).getTime()) /
                                            365.25 /
                                            24 /
                                            60 /
                                            60 /
                                            1000
                                        )
                                      : null;
                                    const assignedTeam = teams.find(
                                      (t: any) => t.id === p.team_id
                                    );

                                    return (
                                      <tr
                                        key={p.id}
                                        className="border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                        onClick={() => {
                                          setSelectedPlayerForPaymentModal(p);
                                          setSelectedPlayerPaymentStatus(
                                            "pending"
                                          );
                                          setShowPlayerPaymentModal(true);
                                        }}
                                      >
                                        <td className="py-2 pr-4">
                                          <div className="text-white">
                                            {p.name}
                                          </div>
                                          {playerAge && (
                                            <div className="text-slate-400 text-xs mt-1 font-inter">
                                              Age: {playerAge} • {p.gender}
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-2 pr-4">
                                          {assignedTeam ? (
                                            <div className="text-white font-inter">
                                              {assignedTeam.name}
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 font-inter">
                                              Not assigned
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 hidden md:table-cell">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter">
                                            Pending
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm font-inter">
                            No players pending approval
                          </p>
                        )}
                      </div>
                    </div>

                    {/* On Hold and Rejected Players Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      {/* On Hold Players */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 border-l-[16px] border-l-orange-500">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase flex items-center gap-2">
                            <span className="text-orange-400">⏸️</span>
                            <span>On Hold</span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 font-inter">
                              {onHoldPlayers.length}
                            </span>
                          </h3>
                          <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                            TEMPORARILY PAUSED
                          </p>
                        </div>
                        {onHoldPlayers.length > 0 ? (
                          <div className="overflow-x-auto block">
                            <div className="inline-block min-w-full align-middle">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left border-b border-white/10">
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Player
                                    </th>
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Team
                                    </th>
                                    <th className="py-2 text-slate-300 hidden md:table-cell font-inter">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {onHoldPlayers.map((p: any) => {
                                    const playerAge = p.date_of_birth
                                      ? Math.floor(
                                          (new Date().getTime() -
                                            new Date(
                                              p.date_of_birth
                                            ).getTime()) /
                                            (365.25 * 24 * 60 * 60 * 1000)
                                        )
                                      : null;
                                    const assignedTeam = teams.find(
                                      (t: any) => t.id === p.team_id
                                    );

                                    return (
                                      <tr
                                        key={p.id}
                                        className="border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                        onClick={() => {
                                          setSelectedPlayerForPaymentModal(p);
                                          setSelectedPlayerPaymentStatus(
                                            "on_hold"
                                          );
                                          setShowPlayerPaymentModal(true);
                                        }}
                                      >
                                        <td className="py-2 pr-4">
                                          <div className="text-white font-medium font-inter">
                                            {p.name}
                                          </div>
                                          {playerAge && (
                                            <div className="text-slate-400 text-xs mt-1 font-inter">
                                              Age: {playerAge} • {p.gender}
                                            </div>
                                          )}
                                          {p.on_hold_reason && (
                                            <div className="mt-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded text-xs text-orange-300">
                                              <strong>Reason:</strong>{" "}
                                              {p.on_hold_reason}
                                            </div>
                                          )}
                                        </td>
                                        <td className="py-2 pr-4">
                                          {assignedTeam ? (
                                            <div className="text-white font-inter">
                                              {assignedTeam.name}
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 font-inter">
                                              Not assigned
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 hidden md:table-cell">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30 font-inter">
                                            On Hold
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm font-inter">
                            No players on hold
                          </p>
                        )}
                      </div>

                      {/* Rejected Players */}
                      <div className="bg-white/5 rounded-xl border border-white/10 p-4 border-l-[16px] border-l-red-500">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold tracking-tighter text-white mb-2 font-inter uppercase flex items-center gap-2">
                            <span className="text-red-400">❌</span>
                            <span>Rejected</span>
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30 font-inter">
                              {rejectedPlayers.length}
                            </span>
                          </h3>
                          <p className="text-slate-400 text-sm font-inter uppercase tracking-wider">
                            NOT APPROVED
                          </p>
                        </div>
                        {rejectedPlayers.length > 0 ? (
                          <div className="overflow-x-auto block">
                            <div className="inline-block min-w-full align-middle">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left border-b border-white/10">
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Player
                                    </th>
                                    <th className="py-2 pr-4 text-slate-300 font-inter">
                                      Team
                                    </th>
                                    <th className="py-2 text-slate-300 hidden md:table-cell font-inter">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rejectedPlayers.map((p: any) => {
                                    const playerAge = p.date_of_birth
                                      ? Math.floor(
                                          (new Date().getTime() -
                                            new Date(
                                              p.date_of_birth
                                            ).getTime()) /
                                            (365.25 * 24 * 60 * 60 * 1000)
                                        )
                                      : null;
                                    const assignedTeam = teams.find(
                                      (t: any) => t.id === p.team_id
                                    );

                                    return (
                                      <tr
                                        key={p.id}
                                        className="border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                        onClick={() => {
                                          setSelectedPlayerForPaymentModal(p);
                                          setSelectedPlayerPaymentStatus(
                                            "rejected"
                                          );
                                          setShowPlayerPaymentModal(true);
                                        }}
                                      >
                                        <td className="py-2 pr-4">
                                          <div className="text-white font-medium font-inter">
                                            {p.name}
                                          </div>
                                          {playerAge && (
                                            <div className="text-slate-400 text-xs mt-1 font-inter">
                                              Age: {playerAge} • {p.gender}
                                            </div>
                                          )}
                                          {/* Rejection reason removed from row view */}
                                        </td>
                                        <td className="py-2 pr-4">
                                          {assignedTeam ? (
                                            <div className="text-white font-inter">
                                              {assignedTeam.name}
                                            </div>
                                          ) : (
                                            <span className="text-slate-400 font-inter">
                                              Not assigned
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 hidden md:table-cell">
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 font-inter">
                                            Rejected
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm font-inter">
                            No rejected players
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Volunteer Submissions Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl mt-8">
                <div
                  className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleSection("volunteerSubmissions")}
                >
                  <div className="flex items-center">
                    <h2 className="text-2xl font-semibold text-white font-inter">
                      Volunteer Submissions
                    </h2>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ml-3 ${
                        expandedSections.volunteerSubmissions
                          ? "rotate-180"
                          : ""
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
                {expandedSections.volunteerSubmissions && (
                  <div className="p-6">
                    {volunteers.length > 0 ? (
                      <div className="overflow-x-auto block">
                        <div className="inline-block min-w-full align-middle">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left border-b border-white/10">
                                <th className="py-2 pr-4 text-slate-300 font-inter">
                                  Full Name
                                </th>
                                <th className="py-2 pr-4 text-slate-300 font-inter">
                                  Role
                                </th>
                                <th className="py-2 text-slate-300 hidden md:table-cell font-inter">
                                  Has Child
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {volunteers.map((volunteer: any) => {
                                const fullName = `${volunteer.first_name} ${volunteer.last_name}`;
                                const roleDisplay =
                                  volunteer.role === "coach"
                                    ? "Coach"
                                    : "Volunteer";
                                const hasChild = volunteer.has_child_on_team
                                  ? "Yes"
                                  : "No";

                                return (
                                  <tr
                                    key={volunteer.id}
                                    className="border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                                    onClick={() => {
                                      setSelectedVolunteer(volunteer);
                                      setShowVolunteerModal(true);
                                    }}
                                  >
                                    <td className="py-2 pr-4">
                                      <div className="text-white font-medium font-inter">
                                        {fullName}
                                      </div>
                                      <div className="text-slate-400 text-xs mt-1 font-inter">
                                        {volunteer.email}
                                      </div>
                                    </td>
                                    <td className="py-2 pr-4">
                                      <span className="text-white font-inter">
                                        {roleDisplay}
                                      </span>
                                    </td>
                                    <td className="py-2 hidden md:table-cell">
                                      <span className="text-white font-inter">
                                        {hasChild}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm font-inter">
                        No pending volunteer submissions
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Parent Payment Overview Section */}
              <div className="bg-white/5 border border-white/10 rounded-xl mt-8">
                <div
                  className="flex items-center justify-between p-6 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleSection("parentPaymentOverview")}
                >
                  <div className="flex items-center">
                    <h2 className="text-2xl font-semibold text-white font-inter">
                      Parent Payment Overview
                    </h2>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ml-3 ${
                        expandedSections.parentPaymentOverview
                          ? "rotate-180"
                          : ""
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
                {expandedSections.parentPaymentOverview && (
                  <div className="p-6">
                    {loadingParentPayments ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                        <p className="text-slate-400 text-sm font-inter">
                          Loading parent payment data...
                        </p>
                      </div>
                    ) : (
                      <ParentPaymentTable
                        data={parentPaymentData}
                        onRowClick={(parent) => {
                          setSelectedParentForModal(parent);
                          setShowParentPaymentModal(true);
                        }}
                        searchTerm={parentSearchTerm}
                        onSearchChange={setParentSearchTerm}
                        statusFilter={parentStatusFilter}
                        onStatusFilterChange={setParentStatusFilter}
                        currentPage={parentPaymentPage}
                        onPageChange={setParentPaymentPage}
                        itemsPerPage={15}
                      />
                    )}
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
                ? editingUpdate
                  ? handleUpdateUpdate
                  : handleCreateUpdate
                : handleCreateDrill
            }
            onProfanityError={(errors) => {
              setProfanityErrors(errors);
              setShowProfanityModal(true);
            }}
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
            teams={teams.map((t) => ({ id: t.id, name: t.name }))}
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-inter">
                    Delete{" "}
                    {deleteTarget?.type === "drill"
                      ? "Drill"
                      : deleteTarget?.type === "game"
                      ? "Game"
                      : deleteTarget?.type === "practice"
                      ? "Practice"
                      : deleteTarget?.type === "update"
                      ? "Update"
                      : "Item"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    This action cannot be undone. The {deleteTarget?.type} will
                    be permanently removed.
                  </p>
                  <div className="flex space-x-4 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteTarget(null);
                      }}
                      className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!submitting) {
                          confirmDelete();
                        }
                      }}
                      disabled={submitting}
                      className="px-6 py-2 text-sm font-semibold text-white bg-[red] hover:bg-[#b80000] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Player Payment Modal */}
          {selectedPlayerForPaymentModal && (
            <PlayerPaymentModal
              isOpen={showPlayerPaymentModal}
              onClose={() => {
                setShowPlayerPaymentModal(false);
                setSelectedPlayerForPaymentModal(null);
              }}
              player={selectedPlayerForPaymentModal}
              teams={teams}
              playerStatus={selectedPlayerPaymentStatus}
              onApprove={async (playerId: string, teamId: string) => {
                const loadingToast = toast.loading("Approving player...");
                try {
                  const resp = await fetch("/api/approve-player", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      player_id: playerId,
                      team_id: teamId,
                      status: "approved",
                    }),
                  });
                  if (resp.ok) {
                    toast.dismiss(loadingToast);
                    toast.success(
                      "Player approved! Payment email sent to parent."
                    );
                  } else {
                    const j = await resp.json().catch(() => ({}));
                    toast.dismiss(loadingToast);
                    toast.error(j.error || "Failed to approve player");
                    throw new Error(j.error || "Failed to approve player");
                  }
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error("An error occurred while approving the player");
                  throw error;
                }
              }}
              onOnHold={async (playerId: string, reason: string) => {
                const loadingToast = toast.loading("Placing player on hold...");
                try {
                  const resp = await fetch("/api/approve-player", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      player_id: playerId,
                      status: "on_hold",
                      on_hold_reason: reason,
                    }),
                  });
                  if (resp.ok) {
                    toast.dismiss(loadingToast);
                    toast.success(
                      "Player placed on hold. Email sent to parent."
                    );
                  } else {
                    const j = await resp.json().catch(() => ({}));
                    toast.dismiss(loadingToast);
                    toast.error(j.error || "Failed to update player status");
                    throw new Error(
                      j.error || "Failed to update player status"
                    );
                  }
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error("An error occurred while updating player status");
                  throw error;
                }
              }}
              onReject={async (playerId: string, reason: string) => {
                const loadingToast = toast.loading("Rejecting player...");
                try {
                  const resp = await fetch("/api/approve-player", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      player_id: playerId,
                      status: "rejected",
                      rejection_reason: reason,
                    }),
                  });
                  if (resp.ok) {
                    toast.dismiss(loadingToast);
                    toast.success("Player rejected. Email sent to parent.");
                  } else {
                    const j = await resp.json().catch(() => ({}));
                    toast.dismiss(loadingToast);
                    toast.error(j.error || "Failed to reject player");
                    throw new Error(j.error || "Failed to reject player");
                  }
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error("An error occurred while rejecting the player");
                  throw error;
                }
              }}
              onMoveToPending={async (playerId: string) => {
                const loadingToast = toast.loading(
                  "Moving player back to pending..."
                );
                try {
                  const resp = await fetch("/api/approve-player", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      player_id: playerId,
                      status: "pending",
                    }),
                  });
                  if (resp.ok) {
                    toast.dismiss(loadingToast);
                    toast.success("Player moved back to pending approval.");
                  } else {
                    const j = await resp.json().catch(() => ({}));
                    toast.dismiss(loadingToast);
                    toast.error(j.error || "Failed to update player status");
                    throw new Error(
                      j.error || "Failed to update player status"
                    );
                  }
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error("An error occurred while updating player status");
                  throw error;
                }
              }}
              fetchManagementData={fetchManagementData}
            />
          )}

          {/* Volunteer Detail Modal */}
          {selectedVolunteer && (
            <VolunteerDetailModal
              isOpen={showVolunteerModal}
              onClose={() => {
                setShowVolunteerModal(false);
                setSelectedVolunteer(null);
              }}
              volunteer={selectedVolunteer}
              userId={userId}
              onDelete={async (volunteerId: string) => {
                const loadingToast = toast.loading("Rejecting volunteer...");
                try {
                  const response = await fetch(
                    `/api/admin/volunteers/${volunteerId}`,
                    {
                      method: "DELETE",
                      headers: {
                        "x-user-id": userId || "",
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(
                      error.error || "Failed to reject volunteer"
                    );
                  }

                  toast.dismiss(loadingToast);
                  toast.success("Volunteer rejected successfully");
                  await fetchVolunteers();
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Failed to reject volunteer"
                  );
                  throw error;
                }
              }}
              onNotesUpdate={fetchVolunteers}
            />
          )}

          {/* Parent Payment Detail Modal */}
          {selectedParentForModal && (
            <ParentPaymentDetailModal
              isOpen={showParentPaymentModal}
              onClose={() => {
                setShowParentPaymentModal(false);
                setSelectedParentForModal(null);
              }}
              parent={selectedParentForModal}
              userId={userId}
              onRefresh={fetchParentPayments}
            />
          )}

          {/* On Hold Modal */}
          {selectedPlayerForHold && (
            <OnHoldModal
              isOpen={showOnHoldModal}
              onClose={() => {
                setShowOnHoldModal(false);
                setSelectedPlayerForHold(null);
              }}
              onConfirm={async (reason: string) => {
                if (!selectedPlayerForHold) return;

                setPlacingOnHold(true);
                const loadingToast = toast.loading("Placing player on hold...");

                try {
                  const resp = await fetch("/api/approve-player", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      player_id: selectedPlayerForHold.id,
                      status: "on_hold",
                      on_hold_reason: reason,
                    }),
                  });

                  if (resp.ok) {
                    toast.dismiss(loadingToast);
                    toast.success(
                      "Player placed on hold. Email sent to parent."
                    );
                    await fetchManagementData();
                    setShowOnHoldModal(false);
                    setSelectedPlayerForHold(null);
                    setPlacingOnHold(false);
                  } else {
                    const j = await resp.json().catch(() => ({}));
                    toast.dismiss(loadingToast);
                    toast.error(j.error || "Failed to update player status");
                    setPlacingOnHold(false);
                  }
                } catch (error) {
                  toast.dismiss(loadingToast);
                  toast.error("An error occurred while updating player status");
                  setPlacingOnHold(false);
                }
              }}
              playerName={selectedPlayerForHold.name}
              loading={placingOnHold}
            />
          )}

          {/* Profanity Validation Modal */}
          {showProfanityModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 font-inter">
                    Inappropriate Language Detected
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Please review and correct the following issues:
                  </p>
                  <div className="text-left mb-6">
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {profanityErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex space-x-3 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfanityModal(false);
                        setProfanityErrors([]);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      I&apos;ll Fix This
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// Wrapper component with Suspense
export default function ClubManagement() {
  return (
    <Suspense
      fallback={
        <div className="bg-black min-h-screen text-white pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <BasketballLoader size={60} />
            </div>
          </div>
        </div>
      }
    >
      <ClubManagementContent />
    </Suspense>
  );
}
