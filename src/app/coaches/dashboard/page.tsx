// src/app/coaches/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError, generateCSRFToken } from "@/lib/security";
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

        const userData = await getUserRole(user.user.id);
        if (!userData) {
          throw new Error("User role not found");
        }
        const admin = userData.role === "admin";
        setIsAdmin(admin);

        let teamsData: Team[] = [];
        if (admin) {
          teamsData = await fetchTeams();
        } else {
          const { data: coachData } = await supabase
            .from("coaches")
            .select("id")
            .eq("user_id", user.user.id)
            .single();
          if (!coachData) {
            throw new Error("Coach not found");
          }

          const { data, error } = await supabase
            .from("team_coaches")
            .select("teams(*)")
            .eq("coach_id", coachData.id);
          if (error) throw error;
          teamsData =
            data?.map((tc: { teams: Team[] }) => tc.teams).flat() || [];
        }
        devLog("Teams fetched:", teamsData);
        setTeams(teamsData);
        if (teamsData.length > 0) {
          setSelectedTeam(teamsData[0].id);
        }
      } catch (err: unknown) {
        devError("Dashboard data fetch error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred loading dashboard";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    if (selectedTeam) {
      const fetchLists = async () => {
        try {
          const schedulesData = await fetchSchedulesByTeamId(selectedTeam);
          setSchedules(schedulesData);
          const updatesData = await fetchTeamUpdates(selectedTeam);
          setUpdates(updatesData);
          const newsData = await fetchNews(selectedTeam);
          setNewsList(newsData);
          devLog("Lists fetched for team:", selectedTeam);
        } catch (err: unknown) {
          devError("Lists fetch error:", err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : "An error occurred loading lists";
          setError(errorMessage);
        }
      };

      fetchLists();
    }
  }, [selectedTeam]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !scheduleDateTime ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(scheduleDateTime)
      ) {
        throw new Error("Invalid date/time format (use YYYY-MM-DDTHH:MM)");
      }
      const data = {
        event_type: scheduleEventType,
        date_time: scheduleDateTime,
        location: scheduleLocation,
        opponent: scheduleOpponent,
        description: scheduleDescription,
        team_id: selectedTeam,
      };
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error("User not authenticated");
      await addSchedule(data, user.user.id);
      window.location.reload();
    } catch (err: unknown) {
      devError("Add schedule error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error adding schedule";
      setError(errorMessage);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: updateTitle,
        content: updateContent,
        team_id: selectedTeam,
        image: updateImage || undefined,
        deleted_at: null,
      };
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error("User not authenticated");
      await addUpdate(data, user.user.id);
      window.location.reload();
    } catch (err: unknown) {
      devError("Add update error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error adding update";
      setError(errorMessage);
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: newsTitle,
        content: newsContent,
        team_id: selectedTeam,
        image: newsImage || undefined,
        deleted_at: null,
      };
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error("User not authenticated");
      await addNews(data, user.user.id);
      window.location.reload();
    } catch (err: unknown) {
      devError("Add news error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error adding news";
      setError(errorMessage);
    }
  };

  const startEdit = (
    item: Schedule | TeamUpdate | News,
    type: "schedule" | "update" | "news"
  ) => {
    setEditing({ id: item.id, type, data: item });
    if (type === "schedule" && "event_type" in item) {
      setScheduleEventType(item.event_type || "");
      // Normalize date_time to YYYY-MM-DDTHH:MM for datetime-local
      const date = new Date(item.date_time);
      const normalizedDateTime = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
      setScheduleDateTime(normalizedDateTime);
      setScheduleLocation(item.location || "");
      setScheduleOpponent(item.opponent || "");
      setScheduleDescription(item.description || "");
    } else if (type === "update" && "title" in item) {
      setUpdateTitle(item.title || "");
      setUpdateContent(item.content || "");
    } else if (type === "news" && "title" in item) {
      setNewsTitle(item.title || "");
      setNewsContent(item.content || "");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editing) return;
      const { id, type } = editing;
      if (type === "schedule") {
        if (
          !scheduleDateTime ||
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(scheduleDateTime)
        ) {
          throw new Error("Invalid date/time format");
        }
        const data = {
          event_type: scheduleEventType,
          date_time: scheduleDateTime,
          location: scheduleLocation,
          opponent: scheduleOpponent,
          description: scheduleDescription,
        };
        await updateSchedule(id, data);
      } else if (type === "update") {
        const data = {
          title: updateTitle,
          content: updateContent,
          image: updateImage || undefined,
        };
        await updateUpdate(id, data);
      } else if (type === "news") {
        const data = {
          title: newsTitle,
          content: newsContent,
          image: newsImage || undefined,
        };
        await updateNews(id, data);
      }
      setEditing(null);
      window.location.reload();
    } catch (err: unknown) {
      devError("Update item error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error updating item";
      setError(errorMessage);
    }
  };

  const handleDelete = async (
    id: string,
    type: "schedule" | "update" | "news"
  ) => {
    if (window.confirm("Confirm soft delete?")) {
      try {
        if (type === "schedule") {
          await deleteSchedule(id);
        } else if (type === "update") {
          await deleteUpdate(id);
        } else if (type === "news") {
          await deleteNews(id);
        }
        window.location.reload();
      } catch (err: unknown) {
        devError("Delete item error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error deleting item";
        setError(errorMessage);
      }
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red text-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bebas uppercase">Coaches Dashboard</h1>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full p-2 bg-gray-800 rounded-md border border-gray-700"
        >
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        {selectedTeam ? (
          <>
            <section className="space-y-4">
              <h2 className="text-2xl font-bebas uppercase">Schedules</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Date/Time</th>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-left">Opponent</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length > 0 ? (
                    schedules.map((item) => (
                      <tr key={item.id} className="border-b border-gray-800">
                        <td className="p-2">{item.event_type}</td>
                        <td className="p-2">{item.date_time}</td>
                        <td className="p-2">{item.location}</td>
                        <td className="p-2">{item.opponent}</td>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2">
                          <button
                            className="text-red hover:underline mr-2"
                            onClick={() => startEdit(item, "schedule")}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red hover:underline"
                            onClick={() => handleDelete(item.id, "schedule")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-2 text-center text-gray-400">
                        No schedules yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <form
                onSubmit={
                  editing && editing.type === "schedule"
                    ? handleUpdate
                    : handleAddSchedule
                }
                className="space-y-4"
              >
                <input type="hidden" name="csrf-token" value={csrfToken} />
                <div>
                  <label
                    htmlFor="schedule-event-type"
                    className="block text-sm font-inter"
                  >
                    Event Type
                  </label>
                  <select
                    id="schedule-event-type"
                    value={scheduleEventType}
                    onChange={(e) => setScheduleEventType(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                    required
                  >
                    <option value="">Select Event Type</option>
                    <option value="Game">Game</option>
                    <option value="Practice">Practice</option>
                    <option value="Tournament">Tournament</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="schedule-date-time"
                    className="block text-sm font-inter"
                  >
                    Date and Time
                  </label>
                  <input
                    id="schedule-date-time"
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="schedule-location"
                    className="block text-sm font-inter"
                  >
                    Location
                  </label>
                  <input
                    id="schedule-location"
                    type="text"
                    value={scheduleLocation}
                    onChange={(e) => setScheduleLocation(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="schedule-opponent"
                    className="block text-sm font-inter"
                  >
                    Opponent (optional)
                  </label>
                  <input
                    id="schedule-opponent"
                    type="text"
                    value={scheduleOpponent}
                    onChange={(e) => setScheduleOpponent(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="schedule-description"
                    className="block text-sm font-inter"
                  >
                    Description (optional)
                  </label>
                  <input
                    id="schedule-description"
                    type="text"
                    value={scheduleDescription}
                    onChange={(e) => setScheduleDescription(e.target.value)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : editing && editing.type === "schedule"
                    ? "Update Schedule"
                    : "Add Schedule"}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bebas uppercase">Team Updates</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Content</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.length > 0 ? (
                    updates.map((item) => (
                      <tr key={item.id} className="border-b border-gray-800">
                        <td className="p-2">{item.title}</td>
                        <td className="p-2">{item.content}</td>
                        <td className="p-2">
                          <button
                            className="text-red hover:underline mr-2"
                            onClick={() => startEdit(item, "update")}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red hover:underline"
                            onClick={() => handleDelete(item.id, "update")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-gray-400">
                        No updates yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <form
                onSubmit={
                  editing && editing.type === "update"
                    ? handleUpdate
                    : handleAddUpdate
                }
                className="space-y-4"
              >
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
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
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
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
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
                    onChange={(e) =>
                      setUpdateImage(e.target.files?.[0] || null)
                    }
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : editing && editing.type === "update"
                    ? "Update Update"
                    : "Add Update"}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bebas uppercase">News</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Content</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.length > 0 ? (
                    newsList.map((item) => (
                      <tr key={item.id} className="border-b border-gray-800">
                        <td className="p-2">{item.title}</td>
                        <td className="p-2">{item.content}</td>
                        <td className="p-2">
                          <button
                            className="text-red hover:underline mr-2"
                            onClick={() => startEdit(item, "news")}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red hover:underline"
                            onClick={() => handleDelete(item.id, "news")}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-2 text-center text-gray-400">
                        No news yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <form
                onSubmit={
                  editing && editing.type === "news"
                    ? handleUpdate
                    : handleAddNews
                }
                className="space-y-4"
              >
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
                    onChange={(e) => setNewsImage(e.target.files?.[0] || null)}
                    className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : editing && editing.type === "news"
                    ? "Update News"
                    : "Add News"}
                </button>
              </form>
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
