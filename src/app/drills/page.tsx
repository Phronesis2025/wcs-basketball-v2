// src/app/drills/page.tsx
"use client";
import { fetchPracticeDrills } from "@/lib/actions";
import { PracticeDrill } from "@/types/supabase";
import { useState, useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { motion, Variants } from "framer-motion";
import { sanitizeInput } from "@/lib/security";

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function DrillsPage() {
  const [drills, setDrills] = useState<PracticeDrill[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [selectedDrill, setSelectedDrill] = useState<PracticeDrill | null>(
    null
  );

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
          className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrills.length > 0 ? (
              filteredDrills.map((drill) => (
                <motion.div
                  key={drill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setSelectedDrill(drill)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDrill(drill);
                    }
                  }}
                  aria-label={`View ${drill.title} drill details`}
                >
                  <div className="flex-shrink-0">
                    <h4 className="text-red-600 font-bebas uppercase text-base border-b border-red-500/50 pb-1">
                      {drill.category} • {drill.skills.join(", ")}
                    </h4>
                    <h3 className="text-2xl font-bebas mt-2 text-white line-clamp-1 leading-tight overflow-hidden">
                      {sanitizeInput(drill.title)}
                    </h3>
                    <p
                      className="text-gray-300 font-inter leading-tight mt-4 text-sm lg:text-base overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: "1.2em",
                        maxHeight: "2.4em",
                      }}
                    >
                      Equipment: {drill.equipment.join(", ")}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col justify-between mt-4">
                    <div className="flex-shrink-0 mb-4">
                      {drill.image_url ? (
                        <Image
                          src={drill.image_url}
                          alt={drill.title}
                          width={400}
                          height={192}
                          className="w-full h-32 md:h-40 lg:h-48 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-32 md:h-40 lg:h-48 bg-gray-800/50 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 text-sm">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 py-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedDrill(drill);
                        }}
                        className="w-full bg-red text-white font-bebas uppercase py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        aria-label={`View details for ${drill.title}`}
                        type="button"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-gray-900/50 border border-red-500/50 rounded-lg p-4 text-center">
                <p className="text-gray-300 font-inter">No drills available.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Drill Details Modal */}
      {selectedDrill && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDrill(null)}
        >
          <motion.div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-inter">
                      {selectedDrill.category}
                    </span>
                    <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-inter">
                      {selectedDrill.difficulty}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bebas font-bold uppercase text-black">
                    {sanitizeInput(selectedDrill.title)}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedDrill(null)}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Close modal"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Key Information */}
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-inter text-gray-600 uppercase">
                      Skills
                    </p>
                    <p className="text-lg font-inter text-gray-900">
                      {selectedDrill.skills.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-inter text-gray-600 uppercase">
                      Equipment
                    </p>
                    <p className="text-lg font-inter text-gray-900">
                      {selectedDrill.equipment.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-inter text-gray-600 uppercase">
                      Duration
                    </p>
                    <p className="text-lg font-inter text-gray-900">
                      {selectedDrill.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Drill Diagram/Image */}
            {selectedDrill.image_url && (
              <div className="p-6">
                <div className="bg-gray-100 rounded-lg p-4">
                  <Image
                    src={selectedDrill.image_url}
                    alt={selectedDrill.title}
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-red-600 mr-3"></div>
                <h3 className="text-2xl font-bebas font-bold text-gray-900">
                  Instructions
                </h3>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-line">
                  {sanitizeInput(selectedDrill.instructions)}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bebas font-bold text-gray-900">
                  Benefits
                </h3>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 font-inter leading-relaxed">
                  {sanitizeInput(selectedDrill.benefits)}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            {selectedDrill.additional_info && (
              <div className="p-6">
                <h3 className="text-2xl font-bebas font-bold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-line">
                    {sanitizeInput(selectedDrill.additional_info)}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
