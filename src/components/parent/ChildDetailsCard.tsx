"use client";

import { Player } from "@/types/supabase";

interface ChildDetailsCardProps {
  child: Player;
}

export default function ChildDetailsCard({ child }: ChildDetailsCardProps) {
  // Calculate age from date of birth
  const calculateAge = (birthdate: string | null) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = calculateAge(child.date_of_birth);

  const getStatusColor = () => {
    switch (child.status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = () => {
    switch (child.status) {
      case "active":
        return "Active";
      case "approved":
        return "Approved";
      default:
        return "Pending";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{child.name}</h2>
          <p className="text-gray-600 mt-1">
            {child.gender} • {child.grade && `Grade ${child.grade}`}
            {age && ` • Age ${age}`}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}
        >
          {getStatusLabel()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-600">Jersey Number</p>
          <p className="font-semibold">
            {child.jersey_number || "Not assigned"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Birthdate</p>
          <p className="font-semibold">
            {child.date_of_birth
              ? new Date(child.date_of_birth).toLocaleDateString()
              : "Not provided"}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Waiver Signed</p>
          <p className="font-semibold">
            {child.waiver_signed ? (
              <span className="text-green-600">✓ Yes</span>
            ) : (
              <span className="text-yellow-600">Pending</span>
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Team</p>
          <p className="font-semibold">
            {child.team_id ? "Assigned" : "Not yet assigned"}
          </p>
        </div>
      </div>
    </div>
  );
}
