// src/components/dashboard/coach-profile/AccountSection.tsx
import React from "react";
import { CoachProfileData } from "./hooks/useProfile";
import { formatDate } from "./utils/profileUtils";

interface AccountSectionProps {
  profileData: CoachProfileData;
  onShowPasswordModal: () => void;
}

export default function AccountSection({
  profileData,
  onShowPasswordModal,
}: AccountSectionProps) {
  return (
    <div>
      <h3 className="text-2xl font-semibold text-white mb-6 font-inter">
        Account Management
      </h3>

      <div className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3 font-inter">
            Security
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-inter">Password</span>
              <button
                onClick={onShowPasswordModal}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Change Password
              </button>
            </div>
            {profileData.last_password_reset && (
              <div>
                <label className="block text-sm font-inter text-slate-400 mb-1">
                  Last Password Changed
                </label>
                <p className="text-white font-inter">
                  {formatDate(profileData.last_password_reset)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-3 font-inter">
            Account Status
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-inter">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-inter ${
                  profileData.is_active
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {profileData.is_active ? "Active" : "Inactive"}
              </span>
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
      </div>
    </div>
  );
}

