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
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center space-x-6">
        <div className="relative w-24 h-24">
          {profileData.image_url ? (
            <Image
              className="rounded-full object-cover border-2 border-white/20"
              src={profileData.image_url}
              alt={`${profileData.first_name} ${profileData.last_name}`}
              width={96}
              height={96}
            />
          ) : (
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-slate-300 font-inter">
                {profileData.first_name?.[0]}
                {profileData.last_name?.[0]}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-semibold text-white font-inter mb-1">
            {profileData.first_name} {profileData.last_name}
          </h2>
          <p className="text-slate-400 font-inter">{profileData.email}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-inter ${
                profileData.is_active
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {profileData.is_active ? "Active" : "Inactive"}
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-inter">
              {isAdmin ? "Admin" : "Coach"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

