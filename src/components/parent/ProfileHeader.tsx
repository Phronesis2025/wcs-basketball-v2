"use client";

interface ProfileHeaderProps {
  name: string;
  email: string;
  playerCount: number;
}

export default function ProfileHeader({
  name,
  email,
  playerCount,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-700 mt-1 font-medium">{name}</p>
        <p className="text-gray-600 text-sm mt-1">{email}</p>
        <p className="text-gray-500 text-sm mt-2">
          {playerCount} {playerCount === 1 ? "Player" : "Players"} Registered
        </p>
      </div>
    </div>
  );
}
