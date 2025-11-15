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
      <h3 className="text-2xl font-bebas text-white mb-6 uppercase">
        Account Management
      </h3>

      <div className="space-y-6">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-lg font-bebas text-white mb-3">
            Security
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-inter">Password</span>
              <button
                onClick={onShowPasswordModal}
                className="px-4 py-2 bg-[red] text-white font-bebas uppercase rounded-md hover:bg-[#b80000] transition-colors"
              >
                Change Password
              </button>
            </div>
            {profileData.last_password_reset && (
              <div>
                <label className="block text-sm font-inter text-gray-400 mb-1">
                  Last Password Changed
                </label>
                <p className="text-white font-inter">
                  {formatDate(profileData.last_password_reset)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-lg font-bebas text-white mb-3">
            Account Status
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-inter">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-inter ${
                  profileData.is_active
                    ? "bg-green-900 text-green-300"
                    : "bg-red-900 text-red-300"
                }`}
              >
                {profileData.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-inter text-gray-400 mb-1">
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

