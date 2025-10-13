// src/app/coaches/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../../lib/supabaseClient";
import {
  devLog,
  devError,
  generateCSRFToken,
  sanitizeInputWithProfanity,
} from "../../../lib/security";
import {
  addSchedule,
  addRecurringPractice,
  updateSchedule,
  updateRecurringPractice,
  deleteSchedule,
  bulkDeleteSchedules,
  addUpdate,
  updateUpdate,
  deleteUpdate,
  // addNews,
  // updateNews,
  // deleteNews,
  fetchSchedulesByTeamId,
  fetchTeamUpdates,
  // fetchNews,
  fetchTeams,
  fetchTeamsByCoachId,
  getUserRole,
} from "../../../lib/actions";
import {
  createPracticeDrill,
  updatePracticeDrill,
  deletePracticeDrill,
  getPracticeDrills,
} from "../../../lib/drillActions";
import { getMessages } from "../../../lib/messageActions";
import {
  Team,
  Schedule,
  TeamUpdate,
  PracticeDrill,
} from "../../../types/supabase";

// Import new dashboard components
import StatCard from "../../../components/dashboard/StatCard";
import ScheduleModal from "../../../components/dashboard/ScheduleModal";
import GameCard from "../../../components/dashboard/GameCard";
import PracticeCard from "../../../components/dashboard/PracticeCard";
import AnnouncementCard from "../../../components/dashboard/AnnouncementCard";
import DrillCard from "../../../components/dashboard/DrillCard";
import MessageBoard from "../../../components/dashboard/MessageBoard";

export default function CoachesDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // const [csrfToken, setCsrfToken] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null); // New: Mobile preview
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // const scrollPositionRef = useRef<number>(0); // Track scroll position
  const router = useRouter();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Teams", href: "/teams" },
    { name: "Schedules", href: "/schedules" },
    { name: "Coaches", href: "/coaches/login" },
    { name: "Shop", href: "/shop" },
  ];

  // // Schedule form fields
  // const [scheduleEventType, setScheduleEventType] = useState("");
  // const [scheduleDateTime, setScheduleDateTime] = useState("");
  // const [scheduleLocation, setScheduleLocation] = useState("");
  // const [scheduleOpponent, setScheduleOpponent] = useState("");
  // const [scheduleDescription, setScheduleDescription] = useState("");

  // // Recurring practice fields
  // const [isRecurring, setIsRecurring] = useState(false);
  // const [recurringType, setRecurringType] = useState<"count" | "date">("count");
  // const [recurringCount, setRecurringCount] = useState(4);
  // const [recurringEndDate, setRecurringEndDate] = useState("");

  // // Team update form fields
  // const [updateTitle, setUpdateTitle] = useState("");
  // const [updateContent, setUpdateContent] = useState("");
  // const [updateImage, setUpdateImage] = useState<File | null>(null);

  // // News form fields
  // const [newsTitle, setNewsTitle] = useState("");
  // const [newsContent, setNewsContent] = useState("");
  // const [newsImage, setNewsImage] = useState<File | null>(null);

  // Lists for edit/delete
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [updates, setUpdates] = useState<TeamUpdate[]>([]);
  const [drills, setDrills] = useState<PracticeDrill[]>([]); // Practice drills
  const [messages, setMessages] = useState<
    { id: string; created_at: string }[]
  >([]); // For message board stats
  // const [newsList, setNewsList] = useState<News[]>([]);

  // // Editing state
  // const [editing, setEditing] = useState<{
  //   id: string;
  //   type: "schedule" | "update" | "news";
  //   data: Schedule | TeamUpdate | News;
  // } | null>(null);

  // // Carousel state for updates and schedules
  // const [updateCarouselIndex, setUpdateCarouselIndex] = useState(0);
  // const [scheduleCarouselIndex, setScheduleCarouselIndex] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "Game" | "Practice" | "Update" | "Drill"
  >("Game");
  const [editingItem, setEditingItem] = useState<
    Schedule | TeamUpdate | PracticeDrill | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    type: "drill" | "game" | "practice" | "update" | "bulk_practices";
    name?: string;
    count?: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showProfanityModal, setShowProfanityModal] = useState(false);
  const [profanityErrors, setProfanityErrors] = useState<string[]>([]);

  // Carousel navigation functions (unused in new design)
  // const nextUpdate = () => {
  //   const maxIndex = Math.max(0, updates.length - 3);
  //   setUpdateCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  // };

  // const prevUpdate = () => {
  //   setUpdateCarouselIndex((prev) => Math.max(prev - 1, 0));
  // };

  // const nextSchedule = () => {
  //   const maxIndex = Math.max(0, schedules.length - 3);
  //   setScheduleCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  // };

  // const prevSchedule = () => {
  //   setScheduleCarouselIndex((prev) => Math.max(prev - 1, 0));
  // };

  // Get the last 3 updates for carousel (unused in new design)
  // const getCarouselUpdates = () => {
  //   return updates.slice(updateCarouselIndex, updateCarouselIndex + 3);
  // };

  // Get the last 3 schedules for carousel (unused in new design)
  // const getCarouselSchedules = () => {
  //   return schedules.slice(scheduleCarouselIndex, scheduleCarouselIndex + 3);
  // };

  // Calculate dashboard stats
  const getNextGame = () => {
    const upcomingGames = schedules
      .filter(
        (s) => s.event_type === "Game" && new Date(s.date_time) > new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      );

    if (upcomingGames.length === 0) return null;

    const nextGame = upcomingGames[0];
    const daysUntil = Math.ceil(
      (new Date(nextGame.date_time).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      days: daysUntil,
      opponent: nextGame.opponent || "TBD",
    };
  };

  const getUpdatesCount = () => {
    if (!lastLoginTime) {
      return updates.length; // If no last login time, return all updates
    }

    return updates.filter(
      (update) => new Date(update.created_at) > lastLoginTime
    ).length;
  };

  const getLastUpdateTime = () => {
    if (updates.length === 0) return "No updates";

    const lastUpdate = updates.sort(
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

  // Permission helper functions
  const canEditSchedule = (schedule: Schedule) => {
    return isAdmin || schedule.created_by === userId;
  };

  const canDeleteSchedule = (schedule: Schedule) => {
    return isAdmin || schedule.created_by === userId;
  };

  const canEditUpdate = (update: TeamUpdate) => {
    return isAdmin || update.created_by === userId;
  };

  const canDeleteUpdate = (update: TeamUpdate) => {
    return isAdmin || update.created_by === userId;
  };

  const getDrillsCount = () => {
    return drills.length;
  };

  const loadMessages = async () => {
    try {
      const messagesData = await getMessages();
      setMessages(messagesData);
    } catch (error) {
      devError("Error loading messages:", error);
      // If messages table doesn't exist yet, set empty array
      setMessages([]);
    }
  };

  // Modal handlers
  const openModal = (
    type: "Game" | "Practice" | "Update" | "Drill",
    item?: Schedule | TeamUpdate
  ) => {
    setModalType(type);
    
    // If editing a recurring practice, enhance the item with recurring pattern info
    if (type === "Practice" && item && "recurring_group_id" in item && item.recurring_group_id) {
      // Find all events in the same recurring group to determine the pattern
      const recurringEvents = schedules.filter(s => 
        s.recurring_group_id === item.recurring_group_id
      ).sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
      
      // Extract the days of the week from all events
      const selectedDays = [...new Set(recurringEvents.map(event => {
        const eventDate = new Date(event.date_time);
        return eventDate.getDay(); // 0=Sunday, 1=Monday, etc.
      }))].sort();
      
      // Create enhanced editing item with recurring pattern
      const enhancedItem = {
        ...item,
        recurringPattern: {
          selectedDays,
          recurringType: "date" as const, // Default to date type for editing
          recurringCount: recurringEvents.length,
          recurringEndDate: recurringEvents[recurringEvents.length - 1]?.date_time
        }
      };
      
      setEditingItem(enhancedItem);
    } else {
      setEditingItem(item || null);
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Delete all practices for the selected team
  const handleDeleteAllPractices = () => {
    if (!selectedTeam || selectedTeam === "__GLOBAL__") {
      toast.error("Please select a team first");
      return;
    }

    const practiceSchedules = schedules.filter(
      (s) => s.event_type === "Practice" && s.team_id === selectedTeam
    );

    if (practiceSchedules.length === 0) {
      toast.error("No practices found to delete");
      return;
    }

    // Set up the delete confirmation modal
    setDeleteTarget({
      type: "bulk_practices",
      id: selectedTeam,
      name: `all ${practiceSchedules.length} practice(s)`,
      count: practiceSchedules.length,
    });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      devLog("Attempting to delete:", { deleteTarget, userId });

      if (deleteTarget.type === "drill") {
        await deletePracticeDrill(deleteTarget.id, userId!, isAdmin);
        setDrills((prev) => prev.filter((d) => d.id !== deleteTarget.id));
        toast.success("Drill deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
      } else if (
        deleteTarget.type === "game" ||
        deleteTarget.type === "practice"
      ) {
        await deleteSchedule(deleteTarget.id, userId!, isAdmin);
        setSchedules((prev) => prev.filter((s) => s.id !== deleteTarget.id));
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
        await deleteUpdate(deleteTarget.id, userId!, isAdmin);
        setUpdates((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        toast.success("Update deleted successfully", {
          duration: 3000,
          position: "top-right",
        });
      } else if (deleteTarget.type === "bulk_practices") {
        // Get all practice schedules for the team
        const practiceSchedules = schedules.filter(
          (s) => s.event_type === "Practice" && s.team_id === deleteTarget.id
        );
        
        const scheduleIds = practiceSchedules.map((s) => s.id);
        await bulkDeleteSchedules(scheduleIds, deleteTarget.id);
        
        // Update local state
        setSchedules((prev) =>
          prev.filter((s) => !(s.event_type === "Practice" && s.team_id === deleteTarget.id))
        );
        
        toast.success(`Deleted ${deleteTarget.count} practice(s) successfully!`, {
          duration: 3000,
          position: "top-right",
        });
      }

      setShowDeleteConfirm(false);
      setDeleteTarget(null);
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

  const handleModalSubmit = async (data: Record<string, unknown>) => {
    try {
      setLoading(true);

      // Determine the actual type based on the form data
      const actualType = data.formType || data.event_type || modalType;

      if (actualType === "Game" || actualType === "Practice") {
        if (editingItem && "event_type" in editingItem) {
          // Check if this is a recurring practice being edited
          if (
            actualType === "Practice" &&
            editingItem.recurring_group_id
          ) {
            // Update recurring practice group
            const updatedSchedules = await updateRecurringPractice(
              editingItem.recurring_group_id,
              {
                team_id: selectedTeam === "__GLOBAL__" ? null : selectedTeam,
                event_type: "Practice",
                date_time: new Date(data.date_time as string).toISOString(),
                title: (data.title as string) || undefined,
                location: data.location as string,
                description: (data.description as string) || undefined,
                is_global: selectedTeam === "__GLOBAL__",
                recurringType: data.recurringType as "count" | "date",
                recurringCount: data.recurringCount as number,
                recurringEndDate:
                  (data.recurringEndDate as string) || undefined,
                selectedDays: data.selectedDays as number[],
              }
            );

            // Remove old schedules and add new ones
            setSchedules((prev) => {
              const filtered = prev.filter(
                (item) =>
                  item.recurring_group_id !== editingItem.recurring_group_id
              );
              return [...filtered, ...updatedSchedules];
            });
            toast.success(
              `Updated recurring practice with ${updatedSchedules.length} schedules!`
            );
          } else {
            // Update single schedule
            const updatedData = await updateSchedule(editingItem.id, {
              event_type: data.event_type as
                | "Game"
                | "Practice"
                | "Tournament"
                | "Meeting",
              date_time: data.date_time as string,
              location: data.location as string,
              opponent: (data.opponent as string) || undefined,
              description: (data.description as string) || undefined,
            });
            setSchedules((prev) =>
              prev.map((item) =>
                item.id === updatedData.id ? updatedData : item
              )
            );
            toast.success("Schedule updated!");
          }
        } else {
          // Check if this is a recurring practice
          if (actualType === "Practice" && data.isRecurring) {
            // Create recurring practice schedules
            const newSchedules = await addRecurringPractice({
              team_id: selectedTeam === "__GLOBAL__" ? null : selectedTeam,
              event_type: "Practice",
              date_time: new Date(data.date_time as string).toISOString(),
              title: (data.title as string) || undefined,
              location: data.location as string,
              description: (data.description as string) || undefined,
              is_global: selectedTeam === "__GLOBAL__",
              recurringType: data.recurringType as "count" | "date",
              recurringCount: data.recurringCount as number,
              recurringEndDate: (data.recurringEndDate as string) || undefined,
              selectedDays: data.selectedDays as number[],
            });
            setSchedules((prev) => [...prev, ...newSchedules]);
            toast.success(
              `Created ${newSchedules.length} recurring practice schedules!`
            );
          } else {
            // Create single schedule
            const newSchedule = await addSchedule({
              team_id:
                selectedTeam === "__GLOBAL__"
                  ? "00000000-0000-0000-0000-000000000000"
                  : selectedTeam,
              event_type: data.event_type as
                | "Game"
                | "Practice"
                | "Tournament"
                | "Meeting",
              date_time: new Date(data.date_time as string).toISOString(),
              location: data.location as string,
              opponent: (data.opponent as string) || undefined,
              description: (data.description as string) || undefined,
              is_global: selectedTeam === "__GLOBAL__",
            });
            setSchedules((prev) => [...prev, newSchedule]);
            toast.success("Schedule created!");
          }
        }
      } else if (actualType === "Update") {
        let imageUrl: string | undefined;

        // Handle image upload if present
        if (data.image) {
          const imageFile = data.image as File;
          const fileName = `${Date.now()}-${imageFile.name}`;
          devLog("Client upload to team-updates:", { fileName });
          const { error: uploadError } = await supabase.storage
            .from("team-updates")
            .upload(`team_updates/${fileName}`, imageFile, { upsert: true });
          if (uploadError) {
            devError("Client image upload error:", uploadError);
            throw new Error(uploadError.message);
          }
          const { data: urlData } = supabase.storage
            .from("team-updates")
            .getPublicUrl(`team_updates/${fileName}`);
          imageUrl = urlData.publicUrl;
          devLog("Client upload success:", { imageUrl });
        }

        if (editingItem && "title" in editingItem) {
          // Update existing update
          const updatedData = await updateUpdate(editingItem.id, {
            title: sanitizeInputWithProfanity(
              data.title as string,
              "update title"
            ),
            content: sanitizeInputWithProfanity(
              data.content as string,
              "update content"
            ),
            image_url: imageUrl,
            date_time: data.date_time as string | null,
          });
          setUpdates((prev) =>
            prev.map((item) =>
              item.id === updatedData.id ? updatedData : item
            )
          );
          toast.success("Update updated!");
        } else {
          // Create new update
          const newUpdate = await addUpdate({
            team_id: selectedTeam === "__GLOBAL__" ? null : selectedTeam,
            title: sanitizeInputWithProfanity(
              data.title as string,
              "update title"
            ),
            content: sanitizeInputWithProfanity(
              data.content as string,
              "update content"
            ),
            date_time: data.date_time as string | null,
            image_url: imageUrl,
            is_global: selectedTeam === "__GLOBAL__",
            created_by: userId!,
          });
          setUpdates((prev) => [...prev, newUpdate]);

          // If date_time is provided, also save to schedules table
          if (data.date_time && data.saveToSchedules) {
            const newSchedule = await addSchedule({
              team_id: selectedTeam === "__GLOBAL__" ? null : selectedTeam,
              event_type: "Update",
              date_time: new Date(data.date_time as string).toISOString(),
              title: sanitizeInputWithProfanity(
                data.title as string,
                "update title"
              ),
              location: "N/A", // Updates don't have location
              opponent: undefined, // Updates don't have opponent
              description: sanitizeInputWithProfanity(
                data.content as string,
                "update content"
              ),
              is_global: selectedTeam === "__GLOBAL__",
            });
            setSchedules((prev) => [...prev, newSchedule]);
          }

          toast.success("Update created!");
        }
      } else if (actualType === "Drill") {
        let imageUrl: string | undefined;

        // Handle image upload if present
        if (data.image) {
          const imageFile = data.image as File;
          const fileName = `${Date.now()}-${imageFile.name}`;
          devLog("Client upload to practice-drills:", { fileName });
          const { error: uploadError } = await supabase.storage
            .from("team-updates")
            .upload(`practice_drills/${fileName}`, imageFile, { upsert: true });
          if (uploadError) {
            devError("Client image upload error:", uploadError);
            throw new Error(uploadError.message);
          }
          const { data: urlData } = supabase.storage
            .from("team-updates")
            .getPublicUrl(`practice_drills/${fileName}`);
          imageUrl = urlData.publicUrl;
          devLog("Client upload success:", { imageUrl });
        }

        if (editingItem && "title" in editingItem) {
          // Update existing drill
          const updatedData = await updatePracticeDrill(
            editingItem.id,
            {
              title: sanitizeInputWithProfanity(
                data.title as string,
                "drill title"
              ),
              skills: data.skills as string[],
              equipment: data.equipment as string[],
              time: sanitizeInputWithProfanity(
                data.time as string,
                "drill time"
              ),
              instructions: sanitizeInputWithProfanity(
                data.instructions as string,
                "drill instructions"
              ),
              additional_info: data.additional_info
                ? sanitizeInputWithProfanity(
                    data.additional_info as string,
                    "drill additional info"
                  )
                : undefined,
              benefits: sanitizeInputWithProfanity(
                data.benefits as string,
                "drill benefits"
              ),
              difficulty: data.difficulty as string,
              category: data.category as string,
              image_url: imageUrl,
            },
            userId!,
            isAdmin
          );
          setDrills((prev) =>
            prev.map((item) =>
              item.id === updatedData.id ? updatedData : item
            )
          );
          toast.success("Drill updated!");
        } else {
          // Create new drill
          const newDrill = await createPracticeDrill(
            {
              team_id:
                selectedTeam === "__GLOBAL__"
                  ? "00000000-0000-0000-0000-000000000000"
                  : selectedTeam,
              title: sanitizeInputWithProfanity(
                data.title as string,
                "drill title"
              ),
              skills: data.skills as string[],
              equipment: data.equipment as string[],
              time: sanitizeInputWithProfanity(
                data.time as string,
                "drill time"
              ),
              instructions: sanitizeInputWithProfanity(
                data.instructions as string,
                "drill instructions"
              ),
              additional_info: data.additional_info
                ? sanitizeInputWithProfanity(
                    data.additional_info as string,
                    "drill additional info"
                  )
                : undefined,
              benefits: sanitizeInputWithProfanity(
                data.benefits as string,
                "drill benefits"
              ),
              difficulty: data.difficulty as string,
              category: data.category as string,
              image_url: imageUrl,
            },
            userId!
          );
          setDrills((prev) => [...prev, newDrill]);
          toast.success("Drill created!");
        }
      }

      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      devError("Modal submit error:", err);
      toast.error(`Failed to save: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = generateCSRFToken();
    // setCsrfToken(token);
    document.cookie = `csrf-token=${token}; Path=/; SameSite=Strict`;

    const fetchData = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) {
          router.push("/coaches/login");
          return;
        }

        setUserId(user.user.id); // Set user ID for created_by
        // Set last login time to current time
        setLastLoginTime(new Date());
        // Extract last name from email or use first_name
        const email = user.user.email || "";
        const firstName = user.user.user_metadata?.first_name || "";
        const lastName = email.includes("@")
          ? email.split("@")[0].split(".").pop() || ""
          : "";
        const capitalizedLastName =
          lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
        setUserName(firstName || capitalizedLastName || email);

        const userData = await getUserRole(user.user.id);
        if (!userData) {
          throw new Error("User role not found");
        }
        const admin = userData.role === "admin";
        setIsAdmin(admin);

        // Fetch teams based on user role
        let teamsData: Team[];
        if (admin) {
          // Admins see all teams
          devLog("Fetching all teams for admin user");
          teamsData = await fetchTeams();
        } else {
          // Coaches see only their assigned teams
          devLog("Fetching assigned teams for coach user:", user.user.id);
          teamsData = await fetchTeamsByCoachId(user.user.id);
        }
        devLog("Teams loaded:", `${teamsData.length} teams`);
        setTeams(teamsData);

        // Load messages for the message board stats
        await loadMessages();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        devError("Fetch initial data error:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Listen for authentication state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/coaches/login");
        } else if (event === "SIGNED_IN" && session?.user) {
          // User signed in, refresh the data
          try {
            setUserId(session.user.id);
            setLastLoginTime(new Date());

            const email = session.user.email || "";
            const firstName = session.user.user_metadata?.first_name || "";
            const lastName = email.includes("@")
              ? email.split("@")[0].split(".").pop() || ""
              : "";
            const capitalizedLastName =
              lastName.charAt(0).toUpperCase() +
              lastName.slice(1).toLowerCase();
            setUserName(firstName || capitalizedLastName || email);

            const userData = await getUserRole(session.user.id);
            if (userData) {
              const admin = userData.role === "admin";
              setIsAdmin(admin);

              // Fetch teams based on user role
              let teamsData: Team[];
              if (admin) {
                teamsData = await fetchTeams();
              } else {
                teamsData = await fetchTeamsByCoachId(session.user.id);
              }
              setTeams(teamsData);
            }
          } catch (err) {
            devError("Auth state change error:", err);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!selectedTeam) return;

    const loadTeamData = async () => {
      try {
        devLog("loadTeamData called for team:", selectedTeam);
        const teamIdForFetch =
          selectedTeam === "__GLOBAL__" ? "__GLOBAL__" : selectedTeam;
        const [schedulesData, updatesData, drillsData] = await Promise.all([
          fetchSchedulesByTeamId(teamIdForFetch),
          fetchTeamUpdates(teamIdForFetch),
          selectedTeam !== "__GLOBAL__"
            ? getPracticeDrills(selectedTeam)
            : Promise.resolve([]),
        ]);
        devLog("Fetched updates data:", updatesData);
        setSchedules(schedulesData);
        setUpdates(updatesData);
        setDrills(drillsData);
        // setNewsList(newsData); // Commented out - newsList not used in new design
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        devError("Fetch team data error:", err);
        setError(errorMessage);
      }
    };

    loadTeamData();

    // Realtime: listen to all CRUD operations, with status/error handling
    let pollInterval: number | null = null;
    const channel = supabase
      .channel(`team_${selectedTeam}_updates`)
      // Schedules table events
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "schedules",
          filter:
            selectedTeam === "__GLOBAL__"
              ? `is_global=eq.true`
              : `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "schedules",
          filter:
            selectedTeam === "__GLOBAL__"
              ? `is_global=eq.true`
              : `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "schedules",
          filter:
            selectedTeam === "__GLOBAL__"
              ? `is_global=eq.true`
              : `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      // Team updates table events
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "team_updates",
          filter:
            selectedTeam === "__GLOBAL__"
              ? `is_global=eq.true`
              : `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "team_updates",
          filter:
            selectedTeam === "__GLOBAL__"
              ? `is_global=eq.true`
              : `team_id=eq.${selectedTeam}`,
        },
        (payload) => {
          devLog(
            "Dashboard received team update UPDATE (filtered):",
            payload.new
          );
          loadTeamData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "team_updates",
        },
        (payload) => {
          devLog(
            "Dashboard received team update UPDATE (unfiltered):",
            payload.new
          );
          // Only reload if this update is relevant to the current team
          const update = payload.new as TeamUpdate;
          const isRelevant =
            selectedTeam === "__GLOBAL__"
              ? update.is_global
              : update.team_id === selectedTeam;

          if (isRelevant) {
            devLog("Update is relevant, reloading data");
            loadTeamData();
          } else {
            devLog("Update is not relevant, skipping reload");
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "team_updates",
          filter:
            selectedTeam === "__GLOBAL__"
              ? `is_global=eq.true`
              : `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          devLog("Real-time subscription status: SUBSCRIBED");
          if (pollInterval) {
            window.clearInterval(pollInterval);
            pollInterval = null;
          }
        } else if (status === "CHANNEL_ERROR") {
          devError("Real-time subscription error:");
          // Fallback: lightweight polling every 30s to keep data fresh
          if (!pollInterval) {
            pollInterval = window.setInterval(() => {
              loadTeamData();
            }, 30000);
          }
        } else if (status === "CLOSED") {
          devLog("Real-time subscription status: CLOSED");
        }
      });

    return () => {
      if (pollInterval) {
        window.clearInterval(pollInterval);
      }
      supabase.removeChannel(channel);
    };
  }, [selectedTeam]);

  // Prevent body scroll when delete modal is open
  useEffect(() => {
    if (showDeleteConfirm) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Prevent scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scrolling
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [showDeleteConfirm]);

  // Prevent body scrolling when profanity modal is open
  useEffect(() => {
    if (showProfanityModal) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Prevent scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Restore scrolling
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [showProfanityModal]);

  // const handleSchedule = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedTeam) {
  //     toast.error("Please select a team");
  //     return;
  //   }
  //   // For program-wide schedules, we'll use a placeholder team_id and set is_global=true

  //   // Client-side validation
  //   if (!scheduleEventType) {
  //     toast.error("Event type is required");
  //     return;
  //   }
  //   if (!scheduleDateTime) {
  //     toast.error("Date and time are required");
  //     return;
  //   }
  //   if (!scheduleLocation) {
  //     toast.error("Location is required");
  //     return;
  //   }

  //   // Validate recurring practice options
  //   if (scheduleEventType === "Practice" && isRecurring) {
  //     if (
  //       recurringType === "count" &&
  //       (recurringCount < 2 || recurringCount > 52)
  //     ) {
  //       toast.error("Number of practices must be between 2 and 52");
  //       return;
  //     }
  //     if (recurringType === "date" && !recurringEndDate) {
  //       toast.error("End date is required for recurring practices");
  //       return;
  //     }
  //     if (
  //       recurringType === "date" &&
  //       recurringEndDate &&
  //       new Date(recurringEndDate) <= new Date(scheduleDateTime)
  //     ) {
  //       toast.error("End date must be after the start date");
  //       return;
  //     }
  //   }

  //   try {
  //     setLoading(true);
  //     const storedCsrf = document.cookie
  //       .split("; ")
  //       .find((row) => row.startsWith("csrf-token="))
  //       ?.split("=")[1];
  //     if (!storedCsrf || storedCsrf !== csrfToken) {
  //       throw new Error("Invalid CSRF token");
  //     }

  //     if (editing && editing.type === "schedule") {
  //       const updatedData = await updateSchedule(editing.id, {
  //         event_type: scheduleEventType as
  //           | "Game"
  //           | "Practice"
  //           | "Tournament"
  //           | "Meeting",
  //         date_time: scheduleDateTime,
  //         location: scheduleLocation,
  //         opponent: scheduleOpponent || undefined,
  //         description: scheduleDescription || undefined,
  //       });
  //       setSchedules((prev) =>
  //         prev.map((item) => (item.id === updatedData.id ? updatedData : item))
  //       );
  //       toast.success("Schedule updated!");
  //       setEditing(null);
  //     } else {
  //       // Handle recurring practices
  //       if (scheduleEventType === "Practice" && isRecurring) {
  //         const startDate = new Date(scheduleDateTime);
  //         const schedules: Schedule[] = [];

  //         // Calculate how many practices to create
  //         let practiceCount = 0;
  //         if (recurringType === "count") {
  //           practiceCount = recurringCount;
  //         } else if (recurringType === "date" && recurringEndDate) {
  //           const endDate = new Date(recurringEndDate);
  //           const weeksDiff = Math.ceil(
  //             (endDate.getTime() - startDate.getTime()) /
  //               (7 * 24 * 60 * 60 * 1000)
  //           );
  //           practiceCount = Math.max(1, weeksDiff);
  //         } else {
  //           practiceCount = 4; // Default fallback
  //         }

  //         // Create multiple practice events (weekly)
  //         for (let i = 0; i < practiceCount; i++) {
  //           const practiceDate = new Date(
  //             startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000
  //           ); // Add 7 days for each week

  //           const newSchedule = await addSchedule({
  //             team_id:
  //               selectedTeam === "__GLOBAL__"
  //                 ? "00000000-0000-0000-0000-000000000000"
  //                 : selectedTeam,
  //             event_type: "Practice",
  //             date_time: practiceDate.toISOString(), // Full ISO string for proper parsing
  //             location: scheduleLocation,
  //             opponent: scheduleOpponent || undefined,
  //             description: scheduleDescription || undefined,
  //             is_global: selectedTeam === "__GLOBAL__",
  //           });
  //           schedules.push(newSchedule);
  //         }

  //         setSchedules((prev) => [...prev, ...schedules]);
  //         toast.success(`${practiceCount} recurring practices created!`);
  //       } else {
  //         // Single event (non-recurring or not a practice)
  //         const newSchedule = await addSchedule({
  //           team_id:
  //             selectedTeam === "__GLOBAL__"
  //               ? "00000000-0000-0000-0000-000000000000"
  //               : selectedTeam,
  //           event_type: scheduleEventType as
  //             | "Game"
  //             | "Practice"
  //             | "Tournament"
  //             | "Meeting",
  //           date_time: new Date(scheduleDateTime).toISOString(),
  //           location: scheduleLocation,
  //           opponent: scheduleOpponent || undefined,
  //           description: scheduleDescription || undefined,
  //           is_global: selectedTeam === "__GLOBAL__",
  //         });
  //         setSchedules((prev) => [...prev, newSchedule]);
  //         toast.success("Schedule created!");
  //       }
  //     }

  //     setScheduleEventType("");
  //     setScheduleDateTime("");
  //     setScheduleLocation("");
  //     setScheduleOpponent("");
  //     setScheduleDescription("");

  //     // Reset recurring practice fields
  //     setIsRecurring(false);
  //     setRecurringType("count");
  //     setRecurringCount(4);
  //     setRecurringEndDate("");
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "Unknown error";
  //     devError("Schedule error:", err);
  //     toast.error(`Failed to save schedule: ${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleTeamUpdate = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedTeam) {
  //     toast.error("Please select a team");
  //     return;
  //   }
  //   if (!userId) {
  //     toast.error("User not authenticated");
  //     return;
  //   }
  //   if (!updateTitle) {
  //     toast.error("Title is required");
  //     return;
  //   }
  //   if (!updateContent) {
  //     toast.error("Content is required");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     let imagePath: string | undefined;

  //     // Client-side upload if image (fixes server File issue + RLS)
  //     if (updateImage) {
  //       const fileName = `${Date.now()}-${updateImage.name}`;
  //       devLog("Client upload to team-updates:", { fileName });
  //       const { error: uploadError } = await supabase.storage
  //         .from("team-updates")
  //         .upload(`team_updates/${fileName}`, updateImage, { upsert: true });
  //       if (uploadError) {
  //         devError("Client image upload error:", uploadError);
  //         throw new Error(uploadError.message);
  //       }
  //       const { data: urlData } = supabase.storage
  //         .from("team-updates")
  //         .getPublicUrl(`team_updates/${fileName}`);
  //       imagePath = urlData.publicUrl;
  //       devLog("Client upload success:", { imagePath });
  //     }

  //     // Server insert (no File; uses admin to set created_by safely)
  //     if (editing && editing.type === "update") {
  //       const updatedData = await updateUpdate(editing.id, {
  //         title: sanitizeInput(updateTitle),
  //         content: sanitizeInput(updateContent),
  //         image_url: imagePath, // New image overrides old
  //       });
  //       setUpdates((prev) =>
  //         prev.map((item) => (item.id === updatedData.id ? updatedData : item))
  //       );
  //       toast.success("Team update updated!");
  //     } else {
  //       const newUpdate = await addUpdate({
  //         team_id: selectedTeam === "__GLOBAL__" ? null : selectedTeam,
  //         title: sanitizeInput(updateTitle),
  //         content: sanitizeInput(updateContent),
  //         image_url: imagePath,
  //         is_global: selectedTeam === "__GLOBAL__",
  //         created_by: userId,
  //       });
  //       setUpdates((prev) => [...prev, newUpdate]);
  //       toast.success("Team update added!");
  //     }

  //     // Reset form + preview
  //     setUpdateTitle("");
  //     setUpdateContent("");
  //     setUpdateImage(null);
  //     setImagePreview(null);
  //     setEditing(null);
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "Unknown error";
  //     devError("Team update error:", err);
  //     toast.error(`Failed: ${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // Prevent any form submission or page scroll
  //   e.preventDefault();
  //   e.stopPropagation();

  //   // Save current scroll position
  //   scrollPositionRef.current = window.scrollY;

  //   const file = e.target.files?.[0] || null;
  //   setUpdateImage(file);
  //   if (file) {
  //     setImagePreview(URL.createObjectURL(file)); // Client preview
  //   } else {
  //     setImagePreview(null);
  //     URL.revokeObjectURL(imagePreview || ""); // Cleanup
  //   }

  //   // Restore scroll position after state update
  //   setTimeout(() => {
  //     window.scrollTo(0, scrollPositionRef.current);
  //   }, 0);
  // };

  const handleDeleteSchedule = (id: string, eventType: "Game" | "Practice") => {
    setDeleteTarget({
      id,
      type: eventType.toLowerCase() as "game" | "practice",
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteUpdate = (id: string) => {
    setDeleteTarget({ id, type: "update" });
    setShowDeleteConfirm(true);
  };

  // const handleNews = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedTeam) {
  //     toast.error("Please select a team");
  //     return;
  //   }
  //   if (selectedTeam === "__GLOBAL__") {
  //     toast.error(
  //       "Program-wide selection is only for Updates. Choose a team for news."
  //     );
  //     return;
  //   }
  //   if (!userId) {
  //     toast.error("User not authenticated");
  //     return;
  //   }
  //   if (!newsTitle) {
  //     toast.error("Title is required");
  //     return;
  //   }
  //   if (!newsContent) {
  //     toast.error("Content is required");
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     let imagePath: string | undefined;
  //     if (newsImage) {
  //       const fileName = `${Date.now()}-${newsImage.name}`;
  //       const { error: uploadError } = await supabase.storage
  //         .from("news")
  //         .upload(fileName, newsImage);
  //       if (uploadError) {
  //         devError("Image upload error:", uploadError);
  //         throw new Error(uploadError.message);
  //       }
  //       const { data: urlData } = supabase.storage
  //         .from("news")
  //         .getPublicUrl(fileName);
  //       imagePath = urlData.publicUrl;
  //     }

  //     if (editing && editing.type === "news") {
  //       const updatedData = await updateNews(editing.id, {
  //         title: newsTitle,
  //         content: newsContent,
  //         image_url: imagePath,
  //       });
  //       setNewsList((prev) =>
  //         prev.map((item) => (item.id === updatedData.id ? updatedData : item))
  //       );
  //       toast.success("News updated!");
  //     } else {
  //       const newNews = await addNews({
  //         team_id: selectedTeam,
  //         title: newsTitle,
  //         content: newsContent,
  //         image_url: imagePath,
  //       });
  //       setNewsList((prev) => [...prev, newNews]);
  //       toast.success("News added!");
  //     }

  //     setNewsTitle("");
  //     setNewsContent("");
  //     setNewsImage(null);
  //     setEditing(null);
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "Unknown error";
  //     devError("News error:", err);
  //     toast.error(`Failed to save news: ${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleDeleteNews = async (id: string) => {
  //   try {
  //     setLoading(true);
  //     await deleteNews(id);
  //     setNewsList((prev) => prev.filter((item) => item.id !== id));
  //     toast.success("News deleted!");
  //   } catch (err) {
  //     const errorMessage = err instanceof Error ? err.message : "Unknown error";
  //     devError("Delete news error:", err);
  //     toast.error(`Failed to delete news: ${errorMessage}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-[#0A2342] text-white">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1">
          <div className="flex items-center justify-between h-12">
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity duration-300"
            >
              <div className="p-1 rounded-md transition-all duration-300 ease-out w-14 h-7 sm:w-16 sm:h-8 relative bg-transparent">
                <Image
                  src="/logo4.png"
                  alt="WCS Basketball Logo"
                  fill
                  sizes="(max-width: 640px) 56px, 64px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="md:hidden font-bebas text-base sm:text-lg transition-colors duration-300 ease-out text-navy">
                World Class
              </span>
              <span className="hidden md:inline font-bebas text-lg transition-colors duration-300 ease-out text-navy">
                World Class
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-900 font-inter text-sm sm:text-base">
                Coach {userName?.split(" ").pop() || ""}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md transition-all duration-300 ease-out text-navy hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      isMobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16m-7 6h7"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Dropdown */}
      <div
        className={`fixed top-12 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-navy font-inter font-medium text-base hover:text-red hover:bg-gray-100 rounded-md px-4 py-3 transition-all duration-200 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/coaches/login");
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-navy font-inter font-medium text-base hover:text-red hover:bg-gray-100 rounded-md px-4 py-3 transition-all duration-200 text-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
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
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full p-3 bg-white text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a team</option>
            {isAdmin && (
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
        {selectedTeam && (
          <div className="mb-6 flex justify-center">
            <div className="w-32 h-32 relative bg-white rounded-full flex items-center justify-center p-2">
              <div className="w-24 h-24 relative">
                <Image
                  src={
                    selectedTeam === "__GLOBAL__"
                      ? "/logos/logo2.png"
                      : teams.find((team) => team.id === selectedTeam)
                          ?.logo_url || "/logos/logo2.png"
                  }
                  alt={
                    selectedTeam === "__GLOBAL__"
                      ? "All Teams"
                      : teams.find((team) => team.id === selectedTeam)?.name ||
                        "Team Logo"
                  }
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 mb-4">Error: {error}</p>}

        {selectedTeam ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {(() => {
                const nextGame = getNextGame();
                return (
                  <StatCard
                    title="Next Game"
                    value={
                      nextGame
                        ? `${nextGame.days} day${
                            nextGame.days === 1 ? "" : "s"
                          }`
                        : "N/A"
                    }
                    subtitle={
                      nextGame ? `vs ${nextGame.opponent}` : "No upcoming games"
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
                    {/* Center seams (straight) */}
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
                    {/* Symmetric side seams (Bezier curves) */}
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
                    onClick={() => openModal("Game")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors"
                  >
                    + Add Game
                  </button>
                </div>
                <div className="space-y-3">
                  {schedules
                    .filter((s) => s.event_type === "Game")
                    .slice(0, 3)
                    .map((schedule) => (
                      <GameCard
                        key={schedule.id}
                        schedule={schedule}
                        onEdit={(s) => openModal("Game", s)}
                        onDelete={() =>
                          handleDeleteSchedule(schedule.id, "Game")
                        }
                        canEdit={canEditSchedule(schedule)}
                        canDelete={canDeleteSchedule(schedule)}
                      />
                    ))}
                  {schedules.filter((s) => s.event_type === "Game").length ===
                    0 && (
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
                      onClick={() => openModal("Practice")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors"
                    >
                      + Add Practice
                    </button>
                    <button
                      onClick={handleDeleteAllPractices}
                      className="bg-red text-white px-4 py-2 rounded-md text-sm font-inter hover:opacity-90 transition-opacity"
                    >
                      Delete All Practices
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {schedules
                    .filter((s) => s.event_type === "Practice")
                    .slice(0, 3)
                    .map((schedule) => (
                      <PracticeCard
                        key={schedule.id}
                        schedule={schedule}
                        onEdit={(s) => openModal("Practice", s)}
                        onDelete={() =>
                          handleDeleteSchedule(schedule.id, "Practice")
                        }
                        canEdit={canEditSchedule(schedule)}
                        canDelete={canDeleteSchedule(schedule)}
                      />
                    ))}
                  {schedules.filter((s) => s.event_type === "Practice")
                    .length === 0 && (
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
                    onClick={() => openModal("Update")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700 transition-colors"
                  >
                    + Add Update
                  </button>
                </div>
                <div className="space-y-3">
                  {updates.slice(0, 3).map((update) => (
                    <AnnouncementCard
                      key={update.id}
                      update={update}
                      onEdit={(u) => openModal("Update", u)}
                      onDelete={handleDeleteUpdate}
                      canEdit={canEditUpdate(update)}
                      canDelete={canDeleteUpdate(update)}
                    />
                  ))}
                  {updates.length === 0 && (
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
                    onClick={() => openModal("Drill")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-inter hover:bg-blue-700"
                  >
                    + Add Drill
                  </button>
                </div>
                <div className="space-y-3">
                  {drills.length > 0 ? (
                    drills.map((drill) => (
                      <DrillCard
                        key={drill.id}
                        drill={drill}
                        onEdit={() => {
                          setEditingItem(drill);
                          setModalType("Drill");
                          setIsModalOpen(true);
                        }}
                        onDelete={() => {
                          setDeleteTarget({ id: drill.id, type: "drill" });
                          setShowDeleteConfirm(true);
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No practice drills yet</p>
                      <p className="text-xs mt-1">
                        Click &quot;Add Drill&quot; to create your first drill
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
                userName={userName}
                isAdmin={isAdmin}
              />
            </div>

            {/* Back to Teams Link */}
            <div className="text-center mt-12">
              <Link
                href="/teams"
                className="text-blue-400 hover:text-blue-300 text-lg font-bebas inline-block"
                aria-label="Back to teams"
              >
                ← Back to Teams
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">
              Select a team to manage content.
            </p>
          </div>
        )}

        {/* Schedule Modal */}
        <ScheduleModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          onProfanityError={(errors) => {
            setProfanityErrors(errors);
            setShowProfanityModal(true);
          }}
          type={modalType}
          editingData={editingItem}
          loading={loading}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete{" "}
                  {deleteTarget?.type === "drill"
                    ? "Drill"
                    : deleteTarget?.type === "game"
                    ? "Game"
                    : deleteTarget?.type === "practice"
                    ? "Practice"
                    : deleteTarget?.type === "update"
                    ? "Update"
                    : deleteTarget?.type === "bulk_practices"
                    ? "All Practices"
                    : "Item"}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {deleteTarget?.type === "bulk_practices"
                    ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone and will permanently remove all practice schedules for this team.`
                    : `This action cannot be undone. The ${deleteTarget?.type} will be permanently removed.`}
                </p>
                <div className="flex space-x-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteTarget(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
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
                    style={{
                      minWidth: "100px",
                      padding: "8px 24px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "white",
                      backgroundColor: "#dc2626",
                      border: "2px solid #b91c1c",
                      borderRadius: "6px",
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.5 : 1,
                      display: "inline-block",
                      textAlign: "center",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.backgroundColor = "#b91c1c";
                        e.currentTarget.style.boxShadow =
                          "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.backgroundColor = "#dc2626";
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                  >
                    {submitting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
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
    </div>
  );
}
