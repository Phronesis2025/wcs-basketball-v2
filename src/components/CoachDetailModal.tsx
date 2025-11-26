"use client";

import React from "react";
import { Coach, Team } from "@/types/supabase";
import Image from "next/image";
import { useScrollLock } from "@/hooks/useScrollLock";

interface CoachDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  coach: Coach | null;
  teams: Team[];
  loginStats: {
    total_logins: number;
    last_login_at: string | null;
    first_login_at: string | null;
    is_active: boolean;
  } | null;
}

export default function CoachDetailModal({
  isOpen,
  onClose,
  onEdit,
  coach,
  teams,
  loginStats,
}: CoachDetailModalProps) {
  // Lock scroll when modal is open
  useScrollLock(isOpen);

  if (!isOpen || !coach) return null;

  // Get teams assigned to this coach
  const assignedTeams = teams.filter((team: Team) =>
    team.team_coaches?.some(
      (teamCoach: any) => teamCoach.coaches?.email === coach.email
    )
  );

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate days since last login
  const getDaysSinceLogin = () => {
    if (!loginStats?.last_login_at) return null;
    const lastLogin = new Date(loginStats.last_login_at);
    const now = new Date();

    // Set both dates to start of day for accurate day comparison
    const lastLoginDate = new Date(
      lastLogin.getFullYear(),
      lastLogin.getMonth(),
      lastLogin.getDate()
    );
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const diffTime = todayDate.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysSinceLogin = getDaysSinceLogin();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto pt-20 sm:pt-20">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto mx-1 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              {coach.image_url ? (
                <Image
                  className="rounded-full object-cover"
                  src={coach.image_url}
                  alt={`${coach.first_name} ${coach.last_name}`}
                  width={64}
                  height={64}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-xl">
                    {coach.first_name[0]}
                    {coach.last_name[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {coach.first_name} {coach.last_name}
              </h2>
              <p className="text-gray-600">{coach.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Edit Coach"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Bio */}
              {coach.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Bio
                  </h3>
                  <p className="text-gray-700">{coach.bio}</p>
                </div>
              )}

              {/* Quote */}
              {coach.quote && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Quote
                  </h3>
                  <p className="text-gray-700 italic">"{coach.quote}"</p>
                </div>
              )}

              {/* Team Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Team Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Teams Assigned:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {assignedTeams.length}
                    </span>
                  </div>

                  {assignedTeams.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Team Names:
                      </p>
                      <div className="space-y-1">
                        {assignedTeams.map((team) => (
                          <div
                            key={team.id}
                            className="flex items-center justify-between bg-white rounded px-3 py-2"
                          >
                            <span className="text-sm text-gray-900">
                              {team.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {team.age_group} - {team.gender}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No teams assigned</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Login Statistics */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Login Statistics
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {/* Total Logins */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Total Logins:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {loginStats?.total_logins || 0}
                  </span>
                </div>

                {/* Last Login */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Last Login:
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">
                      {formatDate(loginStats?.last_login_at)}
                    </div>
                    {daysSinceLogin !== null && (
                      <div
                        className={`text-xs ${
                          daysSinceLogin > 30
                            ? "text-red-600"
                            : daysSinceLogin > 7
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {daysSinceLogin === 0
                          ? "Today"
                          : daysSinceLogin === 1
                          ? "Yesterday"
                          : `${daysSinceLogin} days ago`}
                      </div>
                    )}
                  </div>
                </div>

                {/* First Login */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    First Login:
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(loginStats?.first_login_at)}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      loginStats?.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {loginStats?.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Activity Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Teams Managed:</span>
                    <span className="font-medium text-blue-900">
                      {assignedTeams.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Login Frequency:</span>
                    <span className="font-medium text-blue-900">
                      {loginStats?.total_logins > 0
                        ? `${Math.round(
                            loginStats.total_logins / 30
                          )} per month`
                        : "No logins"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Last Activity:</span>
                    <span className="font-medium text-blue-900">
                      {daysSinceLogin === null
                        ? "Never"
                        : daysSinceLogin === 0
                        ? "Today"
                        : daysSinceLogin === 1
                        ? "Yesterday"
                        : `${daysSinceLogin} days ago`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
