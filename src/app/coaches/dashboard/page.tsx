// src/app/coaches/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  devError,
  devLog,
  generateCSRFToken,
  validateCSRFToken,
} from "@/lib/security";
import { addSchedule, addUpdate, addDrill } from "@/lib/actions";
import { Team } from "@/types/supabase";

export default function CoachesDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
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

  // News form fields (not implemented yet)

  // Drill form fields
  const [drillTitle, setDrillTitle] = useState("");
  const [drillSkills, setDrillSkills] = useState("");
  const [drillEquipment, setDrillEquipment] = useState("");
  const [drillTime, setDrillTime] = useState("");
  const [drillInstructions, setDrillInstructions] = useState("");
  const [drillAdditionalInfo, setDrillAdditionalInfo] = useState("");
  const [drillBenefits, setDrillBenefits] = useState("");
  const [drillDifficulty, setDrillDifficulty] = useState("");
  const [drillCategory, setDrillCategory] = useState("");
  const [drillWeekNumber, setDrillWeekNumber] = useState("");
  const [drillImage, setDrillImage] = useState<File | null>(null);

  useEffect(() => {
    // Generate CSRF token
    const token = generateCSRFToken();
    setCsrfToken(token);
    document.cookie = `csrf-token=${token}; Path=/; SameSite=Strict`;

    // Fetch user's role and teams
    const fetchData = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) {
          router.push("/coaches/login");
          return;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.user.id)
          .single();
        if (!userData) {
          throw new Error("User role not found");
        }
        const admin = userData.role === "admin";
        setIsAdmin(admin);

        let teamsData: Team[] = [];
        if (admin) {
          // Admins see all teams
          const { data, error } = await supabase.from("teams").select("*");
          if (error) throw error;
          teamsData = data || [];
        } else {
          // Coaches see assigned teams
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
            .select("team_id, teams!inner(*)")
            .eq("coach_id", coachData.id);
          if (error) throw error;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          teamsData = data?.map((t: any) => t.teams) || [];
        }

        setTeams(teamsData);
        if (teamsData.length > 0) setSelectedTeam(teamsData[0].id);
      } catch (err) {
        devError("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (
    e: React.FormEvent,
    type: "schedule" | "update" | "news" | "drill"
  ) => {
    e.preventDefault();
    if (!selectedTeam && type !== "news") {
      // News isn't team-specific
      setError("Select a team");
      return;
    }

    setLoading(true);
    setError(null);

    // Validate CSRF
    const storedCsrf = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf-token="))
      ?.split("=")[1];
    if (!validateCSRFToken(csrfToken, storedCsrf || "")) {
      setError("Invalid CSRF token");
      setLoading(false);
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error("Not authenticated");

      let result;
      if (type === "schedule") {
        result = await addSchedule(
          {
            event_type: scheduleEventType,
            date_time: scheduleDateTime,
            location: scheduleLocation,
            team_id: selectedTeam,
          },
          user.user.id
        );
        // Reset form
        setScheduleEventType("");
        setScheduleDateTime("");
        setScheduleLocation("");
        setScheduleOpponent("");
        setScheduleDescription("");
      } else if (type === "update") {
        result = await addUpdate(
          {
            team_id: selectedTeam,
            title: updateTitle,
            content: updateContent,
            image: updateImage || undefined,
          },
          user.user.id
        );
        setUpdateTitle("");
        setUpdateContent("");
        setUpdateImage(null);
      } else if (type === "news") {
        // News functionality not implemented yet
        setError("News functionality not available yet");
        setLoading(false);
        return;
      } else if (type === "drill") {
        result = await addDrill(
          {
            team_id: selectedTeam,
            title: drillTitle,
            skills: drillSkills.split(",").map((s) => s.trim()),
            equipment: drillEquipment.split(",").map((s) => s.trim()),
            time: drillTime,
            instructions: drillInstructions,
            additional_info: drillAdditionalInfo,
            benefits: drillBenefits,
            difficulty: drillDifficulty,
            category: drillCategory,
            week_number: parseInt(drillWeekNumber),
            image: drillImage || undefined,
          },
          user.user.id
        );
        setDrillTitle("");
        setDrillSkills("");
        setDrillEquipment("");
        setDrillTime("");
        setDrillInstructions("");
        setDrillAdditionalInfo("");
        setDrillBenefits("");
        setDrillDifficulty("");
        setDrillCategory("");
        setDrillWeekNumber("");
        setDrillImage(null);
      }

      // Success message (optional, can remove if not needed)
      devLog(`${type} created:`, result);
    } catch (err) {
      devError(`${type} submission error:`, err);
      setError(`Failed to create ${type}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red mx-auto mb-4"></div>
          <p className="text-lg font-inter">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bebas uppercase mb-6 text-center">
          Coaches Dashboard
        </h1>
        {error && (
          <p className="text-red font-inter text-center mb-4">{error}</p>
        )}
        {!isAdmin && teams.length === 0 && (
          <p className="text-gray-300 font-inter text-center mb-4">
            No teams assigned to you.
          </p>
        )}
        <div className="mb-6">
          <label htmlFor="team-select" className="block text-sm font-inter">
            Select Team
          </label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
            disabled={teams.length === 0}
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Form */}
        <section className="mb-12">
          <h2 className="text-2xl font-bebas uppercase mb-4 text-center">
            Add Schedule
          </h2>
          <form
            onSubmit={(e) => handleSubmit(e, "schedule")}
            className="space-y-4"
          >
            <input type="hidden" name="csrf-token" value={csrfToken} />
            <div>
              <label htmlFor="event-type" className="block text-sm font-inter">
                Event Type
              </label>
              <select
                id="event-type"
                value={scheduleEventType}
                onChange={(e) => setScheduleEventType(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              >
                <option value="">Select Type</option>
                <option value="Game">Game</option>
                <option value="Practice">Practice</option>
                <option value="Tournament">Tournament</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>
            <div>
              <label htmlFor="date-time" className="block text-sm font-inter">
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
              <label htmlFor="location" className="block text-sm font-inter">
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
              <label htmlFor="opponent" className="block text-sm font-inter">
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
              <label htmlFor="description" className="block text-sm font-inter">
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
              className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Add Schedule"}
            </button>
          </form>
        </section>

        {/* Team Update Form */}
        <section className="mb-12">
          <h2 className="text-2xl font-bebas uppercase mb-4 text-center">
            Add Team Update
          </h2>
          <form
            onSubmit={(e) => handleSubmit(e, "update")}
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
                onChange={(e) => setUpdateImage(e.target.files?.[0] || null)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Add Update"}
            </button>
          </form>
        </section>

        {/* News Form - Coming Soon */}
        <section className="mb-12">
          <h2 className="text-2xl font-bebas uppercase mb-4 text-center">
            Add News
          </h2>
          <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-gray-300 font-inter">
              News functionality coming soon!
            </p>
          </div>
        </section>

        {/* Practice Drill Form */}
        <section className="mb-12">
          <h2 className="text-2xl font-bebas uppercase mb-4 text-center">
            Add Practice Drill
          </h2>
          <form
            onSubmit={(e) => handleSubmit(e, "drill")}
            className="space-y-4"
          >
            <input type="hidden" name="csrf-token" value={csrfToken} />
            <div>
              <label htmlFor="drill-title" className="block text-sm font-inter">
                Title
              </label>
              <input
                id="drill-title"
                type="text"
                value={drillTitle}
                onChange={(e) => setDrillTitle(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label
                htmlFor="drill-skills"
                className="block text-sm font-inter"
              >
                Skills (comma-separated)
              </label>
              <input
                id="drill-skills"
                type="text"
                value={drillSkills}
                onChange={(e) => setDrillSkills(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label
                htmlFor="drill-equipment"
                className="block text-sm font-inter"
              >
                Equipment (comma-separated)
              </label>
              <input
                id="drill-equipment"
                type="text"
                value={drillEquipment}
                onChange={(e) => setDrillEquipment(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label htmlFor="drill-time" className="block text-sm font-inter">
                Time
              </label>
              <input
                id="drill-time"
                type="text"
                value={drillTime}
                onChange={(e) => setDrillTime(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label
                htmlFor="drill-instructions"
                className="block text-sm font-inter"
              >
                Instructions
              </label>
              <textarea
                id="drill-instructions"
                value={drillInstructions}
                onChange={(e) => setDrillInstructions(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label
                htmlFor="drill-additional-info"
                className="block text-sm font-inter"
              >
                Additional Info (optional)
              </label>
              <textarea
                id="drill-additional-info"
                value={drillAdditionalInfo}
                onChange={(e) => setDrillAdditionalInfo(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
              />
            </div>
            <div>
              <label
                htmlFor="drill-benefits"
                className="block text-sm font-inter"
              >
                Benefits
              </label>
              <input
                id="drill-benefits"
                type="text"
                value={drillBenefits}
                onChange={(e) => setDrillBenefits(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label
                htmlFor="drill-difficulty"
                className="block text-sm font-inter"
              >
                Difficulty
              </label>
              <input
                id="drill-difficulty"
                type="text"
                value={drillDifficulty}
                onChange={(e) => setDrillDifficulty(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label
                htmlFor="drill-category"
                className="block text-sm font-inter"
              >
                Category
              </label>
              <input
                id="drill-category"
                type="text"
                value={drillCategory}
                onChange={(e) => setDrillCategory(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label
                htmlFor="drill-week-number"
                className="block text-sm font-inter"
              >
                Week Number
              </label>
              <input
                id="drill-week-number"
                type="number"
                value={drillWeekNumber}
                onChange={(e) => setDrillWeekNumber(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
                required
              />
            </div>
            <div>
              <label htmlFor="drill-image" className="block text-sm font-inter">
                Image (optional)
              </label>
              <input
                id="drill-image"
                type="file"
                accept="image/*"
                onChange={(e) => setDrillImage(e.target.files?.[0] || null)}
                className="w-full mt-1 p-2 bg-gray-800 text-white rounded-md border border-gray-700"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red-600 disabled:bg-gray-600"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Add Drill"}
            </button>
          </form>
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
      </div>
    </div>
  );
}
