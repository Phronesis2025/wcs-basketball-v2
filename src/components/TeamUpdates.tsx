// src/components/TeamUpdates.tsx
"use client";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Team, TeamUpdate } from "@/types/supabase";
import { sanitizeInput } from "@/lib/security";

interface TeamUpdatesProps {
  team: Team;
  updates: TeamUpdate[];
}

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function TeamUpdates({ team, updates }: TeamUpdatesProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<TeamUpdate | null>(null);

  return (
    <section aria-label="Team Updates" className="mt-8 space-y-4">
      <h2 className="text-2xl font-bebas uppercase text-center">
        Team Updates
      </h2>
      {updates.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {updates.slice(0, 3).map((update) => (
            <button
              key={update.id}
              onClick={() => setSelectedUpdate(update)}
              className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 shadow-sm h-80 flex flex-col"
              aria-label={`View details for ${update.title}`}
            >
              <h4 className="text-red-600 font-bebas uppercase text-base border-b border-red-500/50 pb-1">
                {team.name} News
              </h4>
              <h3 className="text-xl font-bebas mt-2 text-white line-clamp-2">
                {sanitizeInput(update.title)}
              </h3>
              <p className="text-gray-300 font-inter leading-relaxed mt-1 line-clamp-3 flex-grow">
                {sanitizeInput(update.content)}
              </p>
              <div className="mt-2 flex-shrink-0">
                {update.image_url ? (
                  <Image
                    src={update.image_url}
                    alt={update.title}
                    width={400}
                    height={128}
                    className="w-full h-24 object-cover rounded-md"
                    sizes="(max-width: 390px) 100vw, 400px"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-800/50 rounded-md flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 text-center">
          <p className="text-gray-300 font-inter">No updates available</p>
        </div>
      )}
      {updates.length > 3 && (
        <div className="text-center mt-4">
          <Link
            href="/updates"
            className="text-red-600 hover:underline text-base font-bebas"
            aria-label="View all team updates"
          >
            View More
          </Link>
        </div>
      )}
      {selectedUpdate && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-labelledby="modal-title"
          onClick={() => setSelectedUpdate(null)}
        >
          <motion.div
            className="bg-gray-900/90 rounded-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-red-600 font-bebas uppercase text-base">
              {team.name} News
            </h3>
            <h2
              id="modal-title"
              className="text-2xl font-bebas mt-2 text-white"
            >
              {sanitizeInput(selectedUpdate.title)}
            </h2>
            <p className="text-gray-300 font-inter leading-relaxed mt-2">
              {sanitizeInput(selectedUpdate.content)}
            </p>
            {selectedUpdate.image_url && (
              <Image
                src={selectedUpdate.image_url}
                alt={selectedUpdate.title}
                width={600}
                height={256}
                className="w-full h-auto max-h-64 sm:max-h-80 object-contain rounded-md mt-4"
                sizes="(max-width: 390px) 100vw, 600px"
              />
            )}
            <button
              onClick={() => setSelectedUpdate(null)}
              className="mt-4 w-full bg-red-600 text-white font-bebas uppercase py-3 rounded-md hover:bg-red-700 text-base"
              aria-label="Close modal"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
