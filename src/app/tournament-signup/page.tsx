// src/app/tournament-signup/page.tsx
"use client";

// import { useState } from "react";
import Link from "next/link";

export default function TournamentSignup() {
  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Tournament Sign Up">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
              Tournament Sign Up
            </h1>

            {/* Tournament Information */}
            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-6 sm:p-8 mb-8">
              <h2 className="text-3xl sm:text-4xl font-bebas font-bold mb-4 text-center text-red uppercase">
                Coach Nate Classic 2026
              </h2>

              <p className="text-lg font-inter text-gray-300 mb-6 text-center">
                Join us for an exciting tournament honoring one of our club's
                founding members. The Coach Nate Classic celebrates the legacy
                and dedication of Coach Nate, whose passion for the game and
                commitment to developing young athletes helped establish the
                foundation of our basketball community.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-red font-bebas text-xl font-bold mb-2">
                    Registration Deadline
                  </div>
                  <div className="text-white font-inter text-lg">
                    January 30, 2026
                  </div>
                  <div className="text-gray-400 font-inter text-sm mt-1">
                    Don't miss out!
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-red font-bebas text-xl font-bold mb-2">
                    Entry Fee
                  </div>
                  <div className="text-white font-inter text-lg">
                    $180 per team
                  </div>
                  <div className="text-gray-400 font-inter text-sm mt-1">
                    Competitive pricing
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-red font-bebas text-xl font-bold mb-2">
                    Divisions
                  </div>
                  <div className="text-white font-inter text-lg">
                    9 divisions
                  </div>
                  <div className="text-gray-400 font-inter text-sm mt-1">
                    All skill levels welcome
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-center text-gray-400 font-inter text-sm">
                  Ready to compete? Complete your registration below to secure
                  your team's spot in this prestigious tournament.
                </p>
              </div>
            </div>

            {/* Tourneymachine Registration Form */}
            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-4 sm:p-8 mb-8 overflow-hidden">
              {/* Wrapper to hide the top ad section */}
              <div
                className="w-full overflow-hidden"
                style={{ maxHeight: "3000px" }}
              >
                <div
                  className="w-full -mt-[85px] md:-mt-[250px]"
                  style={{
                    height: "3200px", // Increased height to compensate for the negative margin
                  }}
                >
                  <iframe
                    style={{
                      display: "block",
                      overflow: "scroll",
                    }}
                    src="https://tourneymachine.com/Public/Results/TournamentEmbed.aspx?IDTournament=h2025110322180881499b2c2309fc540"
                    height="3200px"
                    width="100%"
                    allowFullScreen
                    frameBorder="0"
                    scrolling="yes"
                    className="min-h-[3200px]"
                    title="Tournament Registration Form"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/schedules"
                className="text-red hover:underline font-inter"
                aria-label="View tournament schedules"
              >
                ← Back to Schedules
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
