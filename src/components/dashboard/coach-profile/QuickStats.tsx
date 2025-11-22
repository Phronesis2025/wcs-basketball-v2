// src/components/dashboard/coach-profile/QuickStats.tsx
import React from "react";
import { CoachProfileData } from "./hooks/useProfile";

interface QuickStatsProps {
  profileData: CoachProfileData;
  messagesCount: number;
  unreadMentions: number;
}

export default function QuickStats({
  profileData,
  messagesCount,
  unreadMentions,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
        <div className="text-2xl font-bebas text-white">
          {profileData.login_count}
        </div>
        <div className="text-sm font-inter text-gray-400">Total Logins</div>
      </div>
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
        <div className="text-2xl font-bebas text-white">
          {profileData.teams.length}
        </div>
        <div className="text-sm font-inter text-gray-400">Teams</div>
      </div>
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
        <div className="text-2xl font-bebas text-white">
          {profileData.updates_created || 0}
        </div>
        <div className="text-sm font-inter text-gray-400">Updates</div>
      </div>
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
        <div className="text-2xl font-bebas text-white">
          {messagesCount}
        </div>
        <div className="text-sm font-inter text-gray-400">
          {unreadMentions > 0 ? (
            <span className="text-blue-400">
              {unreadMentions} mention{unreadMentions !== 1 ? "s" : ""}
            </span>
          ) : (
            "Messages"
          )}
        </div>
      </div>
    </div>
  );
}

