// src/components/dashboard/coach-profile/ActivitySection.tsx
import React from "react";
import { CoachProfileData } from "./hooks/useProfile";
import { formatDate, getDaysSinceLogin, formatDaysSinceLogin } from "./utils/profileUtils";

interface ActivitySectionProps {
  profileData: CoachProfileData;
  messagesCount: number;
  unreadMentions: number;
}

export default function ActivitySection({
  profileData,
  messagesCount,
  unreadMentions,
}: ActivitySectionProps) {
  const daysSinceLogin = getDaysSinceLogin(
    profileData.last_active_at,
    profileData.last_login_at
  );

  return (
    <div>
      <h3 className="text-2xl font-semibold text-white mb-6 font-inter">
        Activity & Analytics
      </h3>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3 font-inter">
            Activity Statistics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-inter text-slate-400 mb-1">
                Total Logins
              </label>
              <p className="text-white font-inter text-xl">
                {profileData.login_count}
              </p>
            </div>
            <div>
              <label className="block text-sm font-inter text-slate-400 mb-1">
                Last Activity
              </label>
              <p className="text-white font-inter">
                {formatDate(profileData.last_active_at || profileData.last_login_at)}
                {daysSinceLogin !== null && (
                  <span className="text-slate-400 text-sm ml-2">
                    ({formatDaysSinceLogin(daysSinceLogin)})
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-inter text-slate-400 mb-1">
                Account Created
              </label>
              <p className="text-white font-inter">
                {formatDate(profileData.created_at)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3 font-inter">
            Content Created
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-white font-inter">
                {profileData.schedules_created}
              </div>
              <div className="text-sm font-inter text-slate-400">
                Schedules
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white font-inter">
                {profileData.updates_created}
              </div>
              <div className="text-sm font-inter text-slate-400">
                Updates
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white font-inter">
                {profileData.drills_created}
              </div>
              <div className="text-sm font-inter text-slate-400">
                Drills
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3 font-inter">
            Message Board Activity
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-white font-inter">
                {messagesCount}
              </div>
              <div className="text-sm font-inter text-slate-400">
                Total Messages
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-white font-inter">
                {unreadMentions}
              </div>
              <div className="text-sm font-inter text-slate-400">
                Unread Mentions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

