"use client";

import { useState, useEffect } from "react";
import AdminOverviewContent from "@/components/AdminOverviewContent";
import { Player, Team, Coach } from "@/types/supabase";

export default function TestAdminView() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    coaches: true,
    teams: true,
    players: true,
  });
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [playerSearchTerm, setPlayerSearchTerm] = useState<string>("");

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  // Mock handlers - in real app these would be actual functions
  const mockHandler = (item: any) => {
    console.log("Mock handler called with:", item);
  };

  const mockSetState = (value: any) => {
    console.log("Mock setState called with:", value);
  };

  useEffect(() => {
    // Mock data loading
    const loadData = async () => {
      try {
        // In a real app, you would fetch from your API
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
            Admin View Test
          </h1>
          <p className="text-white text-lg font-inter mb-8 text-center">
            This demonstrates how admins will see all coaches, teams, and
            players
          </p>
        </div>

        <AdminOverviewContent
          teams={teams}
          players={players}
          coaches={coaches}
          managementDataLoading={loading}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          selectedTeamFilter={selectedTeamFilter}
          setSelectedTeamFilter={setSelectedTeamFilter}
          playerSearchTerm={playerSearchTerm}
          setPlayerSearchTerm={setPlayerSearchTerm}
          setEditingCoach={mockHandler}
          setEditingTeam={mockHandler}
          setEditingPlayer={mockHandler}
          setSelectedCoachForModal={mockHandler}
          setSelectedTeamForModal={mockHandler}
          setSelectedPlayerForModal={mockHandler}
          setShowEditCoachModal={mockSetState}
          setShowEditTeamModal={mockSetState}
          setShowEditPlayerModal={mockSetState}
          setCoachForm={mockSetState}
          setTeamForm={mockSetState}
          setPlayerForm={mockSetState}
          getCoachLoginStats={mockHandler}
          handleEditCoach={mockHandler}
          handleEditTeam={mockHandler}
          handleEditPlayer={mockHandler}
          handleDeleteCoach={mockHandler}
          handleDeleteTeam={mockHandler}
          handleDeletePlayer={mockHandler}
        />
      </div>
    </div>
  );
}
