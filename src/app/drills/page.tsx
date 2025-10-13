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

const getCategoryColor = (category: string) => {
  // Normalize the category by trimming whitespace and converting to lowercase for comparison
  const normalizedCategory = category?.trim().toLowerCase();

  // Use case-insensitive matching
  if (normalizedCategory === "drill") {
    return "bg-blue-100 text-blue-700";
  } else if (normalizedCategory === "warm-up") {
    return "bg-green-100 text-green-700";
  } else if (normalizedCategory === "conditioning") {
    return "bg-orange-100 text-orange-700";
  } else if (normalizedCategory === "skill development") {
    return "bg-purple-100 text-purple-700";
  } else if (normalizedCategory === "team building") {
    return "bg-yellow-100 text-yellow-700";
  } else {
    return "bg-gray-100 text-gray-700";
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Basic":
      return "bg-gray-100 text-gray-700";
    case "Intermediate":
      return "bg-blue-100 text-blue-700";
    case "Advanced":
      return "bg-orange-100 text-orange-700";
    case "Expert":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function DrillsPage() {
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [selectedDrill, setSelectedDrill] = useState<PracticeDrill | null>(
    null
  );

  const [drills, setDrills] = useState<PracticeDrill[]>([]);
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

  // Real-time subscription for new drills - DISABLED for performance
  // useEffect(() => {
  //   const channel = supabase
  //     .channel("practice_drills")
  //     .on(
  //       "postgres_changes",
  //       { event: "INSERT", schema: "public", table: "practice_drills" },
  //       () => {
  //         // Invalidate and refetch drills when new ones are added
  //         // This will trigger a refetch with React Query
  //         window.location.reload(); // Simple approach for now
  //       }
  //     )
  //     .subscribe();
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedDrill) {
      // Disable body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable body scroll
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedDrill]);

  // Predefined time categories
  const timeCategories = [
    { value: "all", label: "All Times" },
    { value: "under-5", label: "< 5 minutes" },
    { value: "5-10", label: "5-10 minutes" },
    { value: "10-15", label: "10-15 minutes" },
    { value: "15-30", label: "15-30 minutes" },
  ];

  const uniqueSkills = [...new Set(drills.flatMap((drill) => drill.skills))];

  // Function to categorize drill time into time buckets
  const getTimeCategory = (timeString: string) => {
    // Extract numeric value from time string (e.g., "15 minutes" -> 15)
    const numericTime = parseInt(timeString.replace(/\D/g, ""));

    if (numericTime < 5) return "under-5";
    if (numericTime >= 5 && numericTime <= 10) return "5-10";
    if (numericTime > 10 && numericTime <= 15) return "10-15";
    if (numericTime > 15 && numericTime <= 30) return "15-30";

    // For times outside our categories, return null (will be filtered out)
    return null;
  };

  const filteredDrills = drills.filter((drill) => {
    const timeMatch =
      timeFilter === "all" || getTimeCategory(drill.time) === timeFilter;
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
            <p className="text-red font-inter">
              Failed to load drills. Please try again.
            </p>
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
                {timeCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
            <div className="bg-red-600 text-white px-8 pt-8 pb-2 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex gap-3 mb-2">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-inter ${getCategoryColor(
                        selectedDrill.category
                      )}`}
                    >
                      {selectedDrill.category}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-inter ${getDifficultyColor(
                        selectedDrill.difficulty
                      )}`}
                    >
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
            <div className="p-8 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/skill.png"
                      alt="Skills icon"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-bebas text-gray-600 uppercase mb-1">
                      Skills
                    </p>
                    <p className="text-base font-inter text-gray-900">
                      {selectedDrill.skills.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/equip.png"
                      alt="Equipment icon"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-bebas text-gray-600 uppercase mb-1">
                      Equipment
                    </p>
                    <p className="text-base font-inter text-gray-900">
                      {selectedDrill.equipment.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/time.png"
                      alt="Duration icon"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  </div>
                  <div>
                    <p className="text-lg font-bebas text-gray-600 uppercase mb-1">
                      Duration
                    </p>
                    <p className="text-base font-inter text-gray-900">
                      {selectedDrill.time}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-red-600 mr-3 flex-shrink-0"></div>
                <h3 className="text-2xl font-bebas font-bold text-gray-900 text-left">
                  Benefits
                </h3>
              </div>
              <div className="prose max-w-none">
                <p className="text-sm text-gray-700 font-inter leading-relaxed text-left italic">
                  {sanitizeInput(selectedDrill.benefits)}
                </p>
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
                    className="w-full lg:w-3/4 lg:mx-auto h-auto rounded-lg"
                    sizes="(max-width: 1024px) 100vw, 75vw"
                  />
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-red-600 mr-3 flex-shrink-0"></div>
                <h3 className="text-2xl font-bebas font-bold text-gray-900 text-left">
                  Instructions
                </h3>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-line text-left">
                  {sanitizeInput(selectedDrill.instructions)}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            {selectedDrill.additional_info && (
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-red-600 mr-3 flex-shrink-0"></div>
                  <h3 className="text-2xl font-bebas font-bold text-gray-900 text-left">
                    Additional Information
                  </h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-line text-left">
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
