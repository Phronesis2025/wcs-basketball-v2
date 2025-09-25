// src/app/coaches/drills/page.tsx
"use client";
import { fetchPracticeDrills } from "@/lib/actions";
import { PracticeDrill } from "@/types/supabase";
import { useState, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function DrillsPage() {
  const [drills, setDrills] = useState<PracticeDrill[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPracticeDrills();
        setDrills(data);
      } catch (err) {
        Sentry.captureException(err);
        setError("Failed to load drills");
      }
    };
    fetchData();

    const channel = supabase
      .channel("practice_drills")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "practice_drills" },
        (payload) => {
          setDrills((prev) => [...prev, payload.new as PracticeDrill]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const uniqueTimes = [...new Set(drills.map((drill) => drill.time))];
  const uniqueSkills = [...new Set(drills.flatMap((drill) => drill.skills))];

  const filteredDrills = drills.filter((drill) => {
    const timeMatch = timeFilter === "all" || drill.time === timeFilter;
    const skillMatch =
      skillFilter === "all" || drill.skills.includes(skillFilter);
    return timeMatch && skillMatch;
  });

  return (
    <div className="min-h-screen bg-navy text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-bebas mb-8 text-center"
          aria-label="Practice Drills"
        >
          Practice Drills
        </h1>
        {error && (
          <div className="mb-8 p-4 bg-gray-900/50 border border-red-500/50 rounded-lg">
            <p className="text-red font-inter">{error}</p>
          </div>
        )}
        <section className="mb-8" aria-label="Drill Filters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="time-filter"
                className="text-white font-inter text-sm mb-2 block"
              >
                Time
              </label>
              <select
                id="time-filter"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full bg-gray-900 text-white border border-red-500/50 rounded p-2"
              >
                <option value="all">All Times</option>
                {uniqueTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="skill-filter"
                className="text-white font-inter text-sm mb-2 block"
              >
                Skill
              </label>
              <select
                id="skill-filter"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full bg-gray-900 text-white border border-red-500/50 rounded p-2"
              >
                <option value="all">All Skills</option>
                {uniqueSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <section aria-label="Drills">
          <div className="grid grid-cols-1 gap-4">
            {filteredDrills.length > 0 ? (
              filteredDrills.map((drill) => (
                <div
                  key={drill.id}
                  className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4"
                >
                  <h2 className="text-xl font-bebas">{drill.title}</h2>
                  <p className="text-gray-300 font-inter">
                    Skills: {drill.skills.join(", ")}
                  </p>
                  <p className="text-gray-300 font-inter">Time: {drill.time}</p>
                  <p className="text-gray-300 font-inter">
                    Instructions: {drill.instructions}
                  </p>
                  {drill.image_url && (
                    <Image
                      src={drill.image_url}
                      alt={drill.title}
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-full h-auto mt-4 rounded-lg"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-300 font-inter">No drills available.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
