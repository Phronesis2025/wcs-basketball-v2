// src/app/tournament-signup/page.tsx
"use client";

// import { useState } from "react";
import Link from "next/link";

export default function TournamentSignup() {
  // const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement tournament signup logic
    alert("Tournament signup functionality coming soon!");
  };

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Tournament Sign Up">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
              Tournament Sign Up
            </h1>
            
            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-red">
                  Coming Soon
                </h2>
                <p className="text-lg font-inter text-gray-300 mb-6">
                  Tournament registration will be available soon. Check back for updates on upcoming tournaments and registration details.
                </p>
              </div>

              {/* Placeholder form structure */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="player-name" className="block text-sm font-inter font-medium mb-2">
                      Player Name *
                    </label>
                    <input
                      type="text"
                      id="player-name"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder="Enter player name"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="team-name" className="block text-sm font-inter font-medium mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      id="team-name"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder="Enter team name"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-inter font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder="Enter email address"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-inter font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder="Enter phone number"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tournament" className="block text-sm font-inter font-medium mb-2">
                    Tournament Selection *
                  </label>
                  <select
                    id="tournament"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    disabled
                  >
                    <option value="">Select a tournament</option>
                    <option value="spring-2025">Spring Tournament 2025</option>
                    <option value="summer-2025">Summer Tournament 2025</option>
                    <option value="fall-2025">Fall Tournament 2025</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-inter font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                    placeholder="Any additional information or special requests"
                    disabled
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled
                    className="bg-gray-600 text-gray-400 font-bebas uppercase py-3 px-8 rounded-lg cursor-not-allowed"
                  >
                    Registration Coming Soon
                  </button>
                </div>
              </form>
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
