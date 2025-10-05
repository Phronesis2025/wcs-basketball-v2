// src/app/coaches/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  devLog,
  devError,
  generateCSRFToken,
  sanitizeInput,
} from "@/lib/security";
import {
  addSchedule,
  updateSchedule,
  deleteSchedule,
  addUpdate,
  updateUpdate,
  deleteUpdate,
  addNews,
  updateNews,
  deleteNews,
  fetchSchedulesByTeamId,
  fetchTeamUpdates,
  fetchNews,
  fetchTeams,
  getUserRole,
} from "@/lib/actions";
import { Team, Schedule, TeamUpdate, News } from "@/types/supabase";

export default function CoachesDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // New: Mobile preview
  const router = useRouter();

  // Schedule form fields
  const [scheduleEventType, setScheduleEventType] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [scheduleOpponent, setScheduleOpponent] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");

  // Team update form fields
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateImage, setUpdateImage] = useState<File | null>(null);

  // News form fields
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImage, setNewsImage] = useState<File | null>(null);

  // Lists for edit/delete
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [updates, setUpdates] = useState<TeamUpdate[]>([]);
  const [newsList, setNewsList] = useState<News[]>([]);

  // Editing state
  const [editing, setEditing] = useState<{
    id: string;
    type: "schedule" | "update" | "news";
    data: Schedule | TeamUpdate | News;
  } | null>(null);

  // Carousel state for updates and schedules
  const [updateCarouselIndex, setUpdateCarouselIndex] = useState(0);
  const [scheduleCarouselIndex, setScheduleCarouselIndex] = useState(0);

  // Carousel navigation functions
  const nextUpdate = () => {
    const maxIndex = Math.max(0, updates.length - 3);
    setUpdateCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevUpdate = () => {
    setUpdateCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  const nextSchedule = () => {
    const maxIndex = Math.max(0, schedules.length - 3);
    setScheduleCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSchedule = () => {
    setScheduleCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  // Get the last 3 updates for carousel
  const getCarouselUpdates = () => {
    return updates.slice(updateCarouselIndex, updateCarouselIndex + 3);
  };

  // Get the last 3 schedules for carousel
  const getCarouselSchedules = () => {
    return schedules.slice(scheduleCarouselIndex, scheduleCarouselIndex + 3);
  };

  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    document.cookie = `csrf-token=${token}; Path=/; SameSite=Strict`;

    const fetchData = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) {
          router.push("/coaches/login");
          return;
        }

        setUserId(user.user.id); // Set user ID for created_by

        const userData = await getUserRole(user.user.id);
        if (!userData) {
          throw new Error("User role not found");
        }
        const admin = userData.role === "admin";
        setIsAdmin(admin);

        const teamsData = await fetchTeams();
        setTeams(teamsData);
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

  useEffect(() => {
    if (!selectedTeam) return;

    const loadTeamData = async () => {
      try {
        const [schedulesData, updatesData, newsData] = await Promise.all([
          fetchSchedulesByTeamId(selectedTeam),
          fetchTeamUpdates(selectedTeam),
          fetchNews(selectedTeam),
        ]);
        setSchedules(schedulesData);
        setUpdates(updatesData);
        setNewsList(newsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        devError("Fetch team data error:", err);
        setError(errorMessage);
      }
    };

    loadTeamData();

    const channel = supabase
      .channel(`team_${selectedTeam}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedules",
          filter: `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_updates",
          filter: `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "news",
          filter: `team_id=eq.${selectedTeam}`,
        },
        () => loadTeamData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTeam]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }

    // Client-side validation
    if (!scheduleEventType) {
      toast.error("Event type is required");
      return;
    }
    if (!scheduleDateTime) {
      toast.error("Date and time are required");
      return;
    }
    if (!scheduleLocation) {
      toast.error("Location is required");
      return;
    }

    try {
      setLoading(true);
      const storedCsrf = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf-token="))
        ?.split("=")[1];
      if (!storedCsrf || storedCsrf !== csrfToken) {
        throw new Error("Invalid CSRF token");
      }

      if (editing && editing.type === "schedule") {
        const updatedData = await updateSchedule(editing.id, {
          event_type: scheduleEventType as
            | "Game"
            | "Practice"
            | "Tournament"
            | "Meeting",
          date_time: scheduleDateTime,
          location: scheduleLocation,
          opponent: scheduleOpponent || undefined,
          description: scheduleDescription || undefined,
        });
        setSchedules((prev) =>
          prev.map((item) => (item.id === updatedData.id ? updatedData : item))
        );
        toast.success("Schedule updated!");
        setEditing(null);
      } else {
        const newSchedule = await addSchedule({
          team_id: selectedTeam,
          event_type: scheduleEventType as
            | "Game"
            | "Practice"
            | "Tournament"
            | "Meeting",
          date_time: scheduleDateTime,
          location: scheduleLocation,
          opponent: scheduleOpponent || undefined,
          description: scheduleDescription || undefined,
        });
        setSchedules((prev) => [...prev, newSchedule]);
        toast.success("Schedule created!");
      }

      setScheduleEventType("");
      setScheduleDateTime("");
      setScheduleLocation("");
      setScheduleOpponent("");
      setScheduleDescription("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      devError("Schedule error:", err);
      toast.error(`Failed to save schedule: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    if (!updateTitle) {
      toast.error("Title is required");
      return;
    }
    if (!updateContent) {
      toast.error("Content is required");
      return;
    }

    try {
      setLoading(true);
      let imagePath: string | undefined;

      // Client-side upload if image (fixes server File issue + RLS)
      if (updateImage) {
        const fileName = `${Date.now()}-${updateImage.name}`;
        devLog("Client upload to team-updates:", { fileName });
        const { error: uploadError } = await supabase.storage
          .from("team-updates")
          .upload(`team_updates/${fileName}`, updateImage, { upsert: true });
        if (uploadError) {
          devError("Client image upload error:", uploadError);
          throw new Error(uploadError.message);
        }
        const { data: urlData } = supabase.storage
          .from("team-updates")
          .getPublicUrl(`team_updates/${fileName}`);
        imagePath = urlData.publicUrl;
        devLog("Client upload success:", { imagePath });
      }

      // Server insert (no File; uses admin to set created_by safely)
      if (editing && editing.type === "update") {
        const updatedData = await updateUpdate(editing.id, {
          title: sanitizeInput(updateTitle),
          content: sanitizeInput(updateContent),
          image_url: imagePath, // New image overrides old
          updated_by: userId,
        });
        setUpdates((prev) =>
          prev.map((item) => (item.id === updatedData.id ? updatedData : item))
        );
        toast.success("Team update updated!");
      } else {
        const newUpdate = await addUpdate({
          team_id: selectedTeam,
          title: sanitizeInput(updateTitle),
          content: sanitizeInput(updateContent),
          image_url: imagePath,
          created_by: userId,
        });
        setUpdates((prev) => [...prev, newUpdate]);
        toast.success("Team update added!");
      }

      // Reset form + preview
      setUpdateTitle("");
      setUpdateContent("");
      setUpdateImage(null);
      setImagePreview(null);
      setEditing(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      devError("Team update error:", err);
      toast.error(`Failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUpdateImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file)); // Client preview
    } else {
      setImagePreview(null);
      URL.revokeObjectURL(imagePreview || ""); // Cleanup
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      setLoading(true);
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((item) => item.id !== id));
      toast.success("Schedule deleted!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      devError("Delete schedule error:", err);
      toast.error(`Failed to delete schedule: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUpdate = async (id: string) => {
    try {
      setLoading(true);
      await deleteUpdate(id);
      setUpdates((prev) => prev.filter((item) => item.id !== id));
      toast.success("Team update deleted!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      devError("Delete team update error:", err);
      toast.error(`Failed to delete team update: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
      toast.error("Please select a team");
      return;
    }
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    if (!newsTitle) {
      toast.error("Title is required");
      return;
    }
    if (!newsContent) {
      toast.error("Content is required");
      return;
    }

    try {
      setLoading(true);
      let imagePath: string | undefined;
      if (newsImage) {
        const fileName = `${Date.now()}-${newsImage.name}`;
        const { error: uploadError } = await supabase.storage
          .from("news")
          .upload(fileName, newsImage);
        if (uploadError) {
          devError("Image upload error:", uploadError);
          throw new Error(uploadError.message);
        }
        const { data: urlData } = supabase.storage
          .from("news")
          .getPublicUrl(fileName);
        imagePath = urlData.publicUrl;
      }

      if (editing && editing.type === "news") {
        const updatedData = await updateNews(editing.id, {
          title: newsTitle,
          content: newsContent,
          image_url: imagePath,
        });
        setNewsList((prev) =>
          prev.map((item) => (item.id === updatedData.id ? updatedData : item))
        );
        toast.success("News updated!");
      } else {
        const newNews = await addNews({
          team_id: selectedTeam,
          title: newsTitle,
          content: newsContent,
          image_url: imagePath,
        });
        setNewsList((prev) => [...prev, newNews]);
        toast.success("News added!");
      }

      setNewsTitle("");
      setNewsContent("");
      setNewsImage(null);
      setEditing(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      devError("News error:", err);
      toast.error(`Failed to save news: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      setLoading(true);
      await deleteNews(id);
      setNewsList((prev) => prev.filter((item) => item.id !== id));
      toast.success("News deleted!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      devError("Delete news error:", err);
      toast.error(`Failed to delete news: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bebas uppercase mb-6">
          Coaches Dashboard
        </h1>
        {error && <p className="text-red-500 mb-4">Error: {error}</p>}
        <div className="mb-6">
          <label
            htmlFor="team-select"
            className="block text-sm font-inter mb-2"
          >
            Select Team
          </label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-700"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
        {selectedTeam ? (
          <>
            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-bebas uppercase">Schedules</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form onSubmit={handleSchedule} className="space-y-4">
                  <input type="hidden" name="csrf-token" value={csrfToken} />
                  <div>
                    <label
                      htmlFor="event-type"
                      className="block text-sm font-inter"
                    >
                      Event Type
                    </label>
                    <select
                      id="event-type"
                      value={scheduleEventType}
                      onChange={(e) => setScheduleEventType(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                      required
                    >
                      <option value="">Select event type</option>
                      <option value="Game">Game</option>
                      <option value="Practice">Practice</option>
                      <option value="Tournament">Tournament</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="date-time"
                      className="block text-sm font-inter"
                    >
                      Date & Time
                    </label>
                    <input
                      id="date-time"
                      type="datetime-local"
                      value={scheduleDateTime}
                      onChange={(e) => setScheduleDateTime(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-inter"
                    >
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={scheduleLocation}
                      onChange={(e) => setScheduleLocation(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="opponent"
                      className="block text-sm font-inter"
                    >
                      Opponent (optional)
                    </label>
                    <input
                      id="opponent"
                      type="text"
                      value={scheduleOpponent}
                      onChange={(e) => setScheduleOpponent(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-inter"
                    >
                      Description (optional)
                    </label>
                    <textarea
                      id="description"
                      value={scheduleDescription}
                      onChange={(e) => setScheduleDescription(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600 flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#D91E18"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="#FFFFFF"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : editing && editing.type === "schedule" ? (
                      "Update Schedule"
                    ) : (
                      "Add Schedule"
                    )}
                  </button>
                </form>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bebas text-white">
                        Recent Schedules
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={prevSchedule}
                          disabled={scheduleCarouselIndex === 0}
                          className="bg-gray-700 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                          aria-label="Previous schedules"
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
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={nextSchedule}
                          disabled={
                            scheduleCarouselIndex >=
                            Math.max(0, schedules.length - 3)
                          }
                          className="bg-gray-700 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                          aria-label="Next schedules"
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {getCarouselSchedules().length > 0 ? (
                      <div className="space-y-3">
                        {getCarouselSchedules().map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-gray-900/50 border border-red-500/50 rounded-lg p-3"
                          >
                            <h4 className="text-base font-bebas text-white line-clamp-1">
                              {schedule.event_type}:{" "}
                              {schedule.opponent || "N/A"}
                            </h4>
                            <p className="text-gray-300 font-inter text-sm mt-1">
                              {new Date(schedule.date_time).toLocaleString()}
                            </p>
                            <p className="text-gray-300 font-inter text-sm">
                              {schedule.location}
                            </p>
                            {schedule.description && (
                              <p className="text-gray-300 font-inter text-sm line-clamp-1 mt-1">
                                {schedule.description}
                              </p>
                            )}
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() =>
                                  setEditing({
                                    id: schedule.id,
                                    type: "schedule",
                                    data: schedule,
                                  })
                                }
                                className="bg-gray-700 text-white font-inter rounded px-2 py-1 text-xs hover:bg-gray-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSchedule(schedule.id)
                                }
                                className="bg-red-600 text-white font-inter rounded px-2 py-1 text-xs hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 font-inter text-sm">
                        No schedules available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-gray-700 my-8"></div>

            <section className="space-y-4 mb-8">
              <h2 className="text-2xl font-bebas uppercase">Team Updates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form onSubmit={handleTeamUpdate} className="space-y-4">
                  <input type="hidden" name="csrf-token" value={csrfToken} />
                  <div>
                    <label
                      htmlFor="update-title"
                      className="block text-sm font-inter"
                    >
                      Title
                    </label>
                    <input
                      id="update-title"
                      type="text"
                      value={updateTitle}
                      onChange={(e) => setUpdateTitle(e.target.value)}
                      className="w-full mt-1 p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="update-content"
                      className="block text-sm font-inter"
                    >
                      Content
                    </label>
                    <textarea
                      id="update-content"
                      value={updateContent}
                      onChange={(e) => setUpdateContent(e.target.value)}
                      className="w-full mt-1 p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="update-image"
                      className="block text-sm font-inter"
                    >
                      Image (optional)
                    </label>
                    <input
                      id="update-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full mt-1 p-3 bg-gray-800 text-white rounded-md border border-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bebas file:uppercase file:bg-red file:text-white hover:file:bg-red-600"
                    />
                    {imagePreview && (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={400}
                        height={128}
                        className="mt-2 w-full h-32 object-cover rounded-md max-w-full"
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600 flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#D91E18"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="#FFFFFF"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : editing && editing.type === "update" ? (
                      "Update Team Update"
                    ) : (
                      "Add Team Update"
                    )}
                  </button>
                </form>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bebas text-white">
                        Recent Updates
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={prevUpdate}
                          disabled={updateCarouselIndex === 0}
                          className="bg-gray-700 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                          aria-label="Previous updates"
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
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={nextUpdate}
                          disabled={
                            updateCarouselIndex >=
                            Math.max(0, updates.length - 3)
                          }
                          className="bg-gray-700 text-white p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                          aria-label="Next updates"
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {getCarouselUpdates().length > 0 ? (
                      <div className="space-y-3">
                        {getCarouselUpdates().map((update) => (
                          <div
                            key={update.id}
                            className="bg-gray-900/50 border border-red-500/50 rounded-lg p-3"
                          >
                            <h4 className="text-base font-bebas text-white line-clamp-1">
                              {update.title}
                            </h4>
                            <p className="text-gray-300 font-inter text-sm line-clamp-2 mt-1">
                              {update.content}
                            </p>
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() =>
                                  setEditing({
                                    id: update.id,
                                    type: "update",
                                    data: update,
                                  })
                                }
                                className="bg-gray-700 text-white font-inter rounded px-2 py-1 text-xs hover:bg-gray-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUpdate(update.id)}
                                className="bg-red-600 text-white font-inter rounded px-2 py-1 text-xs hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 font-inter text-sm">
                        No updates available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="border-t border-gray-700 my-8"></div>

            <section className="space-y-4">
              <h2 className="text-2xl font-bebas uppercase">News</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <form onSubmit={handleNews} className="space-y-4">
                  <input type="hidden" name="csrf-token" value={csrfToken} />
                  <div>
                    <label
                      htmlFor="news-title"
                      className="block text-sm font-inter"
                    >
                      Title
                    </label>
                    <input
                      id="news-title"
                      type="text"
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="news-content"
                      className="block text-sm font-inter"
                    >
                      Content
                    </label>
                    <textarea
                      id="news-content"
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="news-image"
                      className="block text-sm font-inter"
                    >
                      Image (optional)
                    </label>
                    <input
                      id="news-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewsImage(e.target.files?.[0] || null)
                      }
                      className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600 flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="#D91E18"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="#FFFFFF"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    ) : editing && editing.type === "news" ? (
                      "Update News"
                    ) : (
                      "Add News"
                    )}
                  </button>
                </form>
                <div className="space-y-4">
                  {newsList.map((news) => (
                    <div
                      key={news.id}
                      className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-bebas">{news.title}</h3>
                      <p className="text-gray-300 font-inter">{news.content}</p>
                      {news.image_url && (
                        <Image
                          src={news.image_url}
                          alt={news.title}
                          width={400}
                          height={200}
                          className="w-full h-auto mt-2 rounded"
                        />
                      )}
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() =>
                            setEditing({
                              id: news.id,
                              type: "news",
                              data: news,
                            })
                          }
                          className="bg-gray-700 text-white font-inter rounded p-2 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNews(news.id)}
                          className="bg-red-600 text-white font-inter rounded p-2 text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bebas uppercase">Practice Drills</h2>
              {/* Existing drill form and list */}
            </section>

            <div className="text-center mt-12">
              <Link
                href="/teams"
                className="text-red hover:underline text-lg font-bebas inline-block"
                aria-label="Back to teams"
              >
                ← Back to Teams
              </Link>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center">
            Select a team to manage content.
          </p>
        )}
      </div>
    </div>
  );
}
