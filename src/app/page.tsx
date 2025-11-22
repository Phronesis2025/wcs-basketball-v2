import React from "react";
import Hero from "../components/Hero";
import QuoteSection from "../components/QuoteSection";
import StatsSection from "../components/StatsSection";
import ProgramsSection from "../components/ProgramsSection";
import LogoMarquee from "../components/LogoMarquee";
import PlayerTestimonials from "../components/PlayerTestimonials";
// import AdSection from "../components/AdSection"; // Removed from homepage but not deleted
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
    <div className="bg-[#030303] bg-grain min-h-screen">
      <Hero />
      <StatsSection />
      <ProgramsSection />
      <LogoMarquee />
      <PlayerTestimonials />
      <TeamUpdates
        maxUpdates={8}
        variant="compact-list"
        showViewMoreText={true}
      />
      <QuoteSection />
    </div>
  );
}
