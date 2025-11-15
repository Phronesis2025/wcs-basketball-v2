// src/components/dashboard/coach-profile/ProfileHeader.tsx
import React from "react";
import Image from "next/image";
import { CoachProfileData } from "./hooks/useProfile";

interface ProfileHeaderProps {
  profileData: CoachProfileData;
  isAdmin: boolean;
}

export default function ProfileHeader({
  profileData,
  isAdmin,
}: ProfileHeaderProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center space-x-6">
        <div className="relative w-24 h-24">
          {profileData.image_url ? (
            <Image
              className="rounded-full object-cover border-2 border-gray-600"
              src={profileData.image_url}
              alt={`${profileData.first_name} ${profileData.last_name}`}
              width={96}
              height={96}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bebas text-gray-400">
                {profileData.first_name?.[0]}
                {profileData.last_name?.[0]}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bebas text-white uppercase">
            {profileData.first_name} {profileData.last_name}
          </h2>
          <p className="text-gray-300 font-inter">{profileData.email}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-inter ${
                profileData.is_active
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}
            >
              {profileData.is_active ? "Active" : "Inactive"}
            </span>
            <span className="px-3 py-1 bg-navy text-white rounded-full text-xs font-inter">
              {isAdmin ? "Admin" : "Coach"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

