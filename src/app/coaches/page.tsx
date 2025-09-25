// src/app/coaches/page.tsx
"use client";
import { fetchCoachesByTeamId } from "@/lib/actions";
import { Coach, Team } from "@/types/supabase";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    event_type: "",
    date_time: "",
    location: "",
  });
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data: coach } = await supabase
          .from("coaches")
          .select("id")
          .eq("id", user.user.id)
          .single();
        if (!coach) return;

        const { data: teamData } = await supabase
          .from("team_coaches")
          .select(
            "teams(id, name, age_group, gender, grade_level, logo_url, season)"
          )
          .eq("coach_id", coach.id)
          .single();

        if (teamData?.teams) {
          const team = teamData.teams as unknown as Team;
          setTeam(team);
          const coachesData = await fetchCoachesByTeamId(team.id);
          setCoaches(coachesData);
        }
      } catch (error) {
        Sentry.captureException(error);
        setError("Failed to load coaches data");
      }
    };

    fetchData();

    const channel = supabase
      .channel("schedules")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "schedules" },
        () => {
          // Trigger revalidation if needed
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return setError("No team assigned");
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("schedules").insert({
        ...newSchedule,
        team_id: team.id,
        created_by: user.user.id,
      });

      if (error) throw error;

      setSuccess("Schedule added successfully");
      setNewSchedule({ event_type: "", date_time: "", location: "" });
      setShowScheduleModal(false);
    } catch (err) {
      Sentry.captureException(err);
      setError("Failed to add schedule");
    }
  };

  return (
    <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-bebas mb-8 text-center"
          aria-label="Coaches Page"
        >
          Coaches
        </h1>
        {error && (
          <div className="mb-8 p-4 bg-gray-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red font-inter">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-8 p-4 bg-gray-900/50 border border-green-500/50 rounded-lg">
            <p className="text-green-500 font-inter">{success}</p>
          </div>
        )}
        <section className="mb-12" aria-label="Coaches">
          <h2 className="text-2xl font-bebas mb-4">Our Coaches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coaches.length > 0 ? (
              coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4"
                >
                  <Image
                    src={coach.image_url || "/logos/logo2.png"}
                    alt={`${coach.first_name} ${coach.last_name}`}
                    width={80}
                    height={80}
                    className="rounded-full mb-2"
                  />
                  <h3 className="text-xl font-bebas">
                    {coach.first_name} {coach.last_name}
                  </h3>
                  <p className="text-gray-300 font-inter">Team: {team?.name}</p>
                  <p className="text-gray-300 font-inter">{coach.bio}</p>
                  <p className="text-red font-inter italic mt-2">
                    “{coach.quote}”
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-inter">No coaches assigned.</p>
            )}
          </div>
        </section>
        <section className="mb-12" aria-label="Add Schedule">
          <h2 className="text-2xl font-bebas mb-4">Add Schedule</h2>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-red text-white font-bebas rounded p-2 hover:bg-red/80"
          >
            Add Schedule
          </button>

          {showScheduleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-red-500/50 rounded-lg p-6 max-w-md w-full">
                <h3 className="text-2xl font-bebas text-white mb-4">
                  Add Schedule
                </h3>
                <form onSubmit={handleAddSchedule} className="space-y-4">
                  <div>
                    <label
                      htmlFor="event_type"
                      className="text-white font-inter block mb-2"
                    >
                      Event Type
                    </label>
                    <select
                      id="event_type"
                      value={newSchedule.event_type}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setNewSchedule({
                          ...newSchedule,
                          event_type: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    >
                      <option value="">Select Type</option>
                      <option value="Game">Game</option>
                      <option value="Practice">Practice</option>
                      <option value="Tournament">Tournament</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="date_time"
                      className="text-white font-inter block mb-2"
                    >
                      Date/Time
                    </label>
                    <input
                      id="date_time"
                      type="datetime-local"
                      value={newSchedule.date_time}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewSchedule({
                          ...newSchedule,
                          date_time: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="text-white font-inter block mb-2"
                    >
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={newSchedule.location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewSchedule({
                          ...newSchedule,
                          location: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-red text-white font-bebas rounded p-2 flex-1"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="bg-gray-700 text-white font-bebas rounded p-2 flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
        <section className="mb-12" aria-label="Practice Drills">
          <h2 className="text-2xl font-bebas mb-4">Practice Drills</h2>
          <Link
            href="/coaches/drills"
            className="text-red hover:underline"
            aria-label="View all drills"
          >
            View All Drills
          </Link>
        </section>
      </div>
    </div>
  );
}
