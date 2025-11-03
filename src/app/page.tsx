import React from "react";
import Hero from "../components/Hero";
import LogoMarquee from "../components/LogoMarquee";
import FanZone from "../components/FanZone";
import TeamUpdates from "../components/TeamUpdates";
import { fetchTeams } from "../lib/actions";

export default async function Home() {
  let teamsError: string | null = null;
  try {
    await fetchTeams();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (
      errorMessage.includes("placeholder") ||
      errorMessage.includes("Missing required environment variables")
    ) {
      teamsError =
        "Database connection not configured. Please set up environment variables.";
    } else {
      teamsError = errorMessage;
    }
  }
  // Temporarily disable coaches fetching due to database schema issue
  const coachesError = null;

  return (
    <div className="bg-navy min-h-screen text-white">
      <Hero />
      <LogoMarquee />
      <FanZone teamsError={teamsError} coachesError={coachesError} />
      <TeamUpdates
        maxUpdates={3}
        disableSwiping={true}
        showViewMoreText={true}
      />
    </div>
  );
}
