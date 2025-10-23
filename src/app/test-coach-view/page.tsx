"use client";

import { useState, useEffect } from "react";
import CoachPlayersView from "@/components/CoachPlayersView";
import { Player, Team } from "@/types/supabase";

export default function TestCoachView() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    players: true,
  });

  // Mock user data - in real app this would come from auth
  const userName = "jason.boyer@wcs.com"; // This would be the logged-in coach's email

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const setEditingPlayer = (player: Player | null) => {
    console.log("Edit player:", player);
  };

  useEffect(() => {
    // Mock data loading
    const loadData = async () => {
      try {
        // In a real app, you would fetch from your API
        // For now, we'll use mock data
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="bg-navy min-h-screen text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            Coach View Test
          </h1>
          <p className="text-white text-lg font-inter mb-8 text-center">
            This demonstrates how coaches will see only their assigned players
          </p>
        </div>

        <CoachPlayersView
          teams={teams}
          players={players}
          userName={userName}
          managementDataLoading={loading}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          setEditingPlayer={setEditingPlayer}
        />
      </div>
    </div>
  );
}
