"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { devLog, devError } from "@/lib/security";
import Image from "next/image";
import ProfileImageUpload from "./ProfileImageUpload";
import ChangePasswordModal from "./ChangePasswordModal";
import MessageBoard from "./MessageBoard";
import { getMessages, getUnreadMentionCount } from "@/lib/messageActions";
import { CoachMessage } from "@/types/supabase";

interface CoachProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  image_url?: string;
  quote?: string;
  is_active: boolean;
  created_at: string;
  login_count: number;
  last_login_at?: string;
  last_password_reset?: string;
  last_active_at?: string | null;
  teams: Array<{
    id: string;
    name: string;
    logo_url?: string;
    age_group?: string;
    gender?: string;
  }>;
  // Activity metrics
  schedules_created: number;
  updates_created: number;
  drills_created: number;
  messages_posts: number;
  messages_replies: number;
}

interface CoachProfileProps {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  isAdmin: boolean;
}

export default function CoachProfile({
  userId,
  userEmail,
  userName,
  isAdmin,
}: CoachProfileProps) {
  const [profileData, setProfileData] = useState<CoachProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Message board state
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [unreadMentions, setUnreadMentions] = useState(0);

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    quote: "",
  });

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  // Heartbeat: record activity on mount and when tab becomes visible
  useEffect(() => {
    if (!userId) return;
    const ping = async () => {
      try {
        await fetch("/api/activity/heartbeat", {
          method: "POST",
          headers: { "x-user-id": userId },
        });
      } catch {}
    };

    ping();
    const onVisibility = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [userId]);

  // Fetch messages for message board
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) return;
      try {
        devLog("Fetching messages for profile...");
        const messagesData = await getMessages();
        setMessages(messagesData);
        devLog("Messages loaded:", messagesData.length);
      } catch (error) {
        devError("Error fetching messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [userId]);

  // Fetch unread mention count
  useEffect(() => {
    const fetchUnreadMentions = async () => {
      if (!userId) return;
      try {
        const count = await getUnreadMentionCount(userId);
        setUnreadMentions(count);
        devLog("Unread mentions:", count);
      } catch (error) {
        devError("Error fetching unread mentions:", error);
        setUnreadMentions(0);
      }
    };

    fetchUnreadMentions();

    // Set up interval to refresh count periodically when on messages section
    if (activeSection === "messages") {
      const interval = setInterval(fetchUnreadMentions, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [userId, messages, activeSection]); // Refresh when messages change or section changes

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      devLog("Fetching profile data for user:", userId);

      // Use the API route that includes activity metrics
      const response = await fetch(`/api/coach/profile?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch profile data");
      }

      const profileData: CoachProfileData = result.data;

      setProfileData(profileData);
      setEditForm({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone: profileData.phone || "",
        bio: profileData.bio || "",
        quote: profileData.quote || "",
      });
    } catch (error) {
      devError("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profileData || !userId) return;

    try {
      setSaving(true);
      devLog("Saving profile data");

      const response = await fetch("/api/coach/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          updates: {
            first_name: editForm.first_name,
            last_name: editForm.last_name,
            phone: editForm.phone,
            bio: editForm.bio,
            quote: editForm.quote,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        devError("Error updating profile:", errorData);
        return;
      }

      // Refresh profile data
      await fetchProfileData();
      setIsEditing(false);
    } catch (error) {
      devError("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditForm({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone: profileData.phone || "",
        bio: profileData.bio || "",
        quote: profileData.quote || "",
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysSinceLogin = () => {
    const ref = profileData?.last_active_at || profileData?.last_login_at;
    if (!ref) return null;
    const lastLogin = new Date(ref);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red"></div>
        <span className="ml-3 text-white font-inter">Loading profile...</span>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-inter">Failed to load profile data</p>
      </div>
    );
  }

  const daysSinceLogin = getDaysSinceLogin();

  return (
    <div className="space-y-8">
      {/* Profile Header */}
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

      {/* Quick Stats */}
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
            {messages.length}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-bebas text-white mb-4 uppercase">
              Profile Sections
            </h3>
            <nav className="space-y-2">
              {[
                { id: "personal", label: "Personal Info", icon: "👤" },
                { id: "teams", label: "Teams", icon: "🏀" },
                { id: "activity", label: "Activity", icon: "📊" },
                { id: "account", label: "Account", icon: "⚙️" },
                { id: "schedule", label: "Schedule", icon: "📅" },
                { id: "messages", label: "Messages", icon: "💬" },
                { id: "resources", label: "Resources", icon: "📚" },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md font-inter transition-colors ${
                    activeSection === section.id
                      ? "bg-[red] text-white"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            {/* Personal Information Section */}
            {activeSection === "personal" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bebas text-white uppercase">
                    Personal Information
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-[red] text-white font-bebas uppercase rounded-md hover:bg-[#b80000] transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-inter text-white mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              first_name: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-inter text-white mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              last_name: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter text-white mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-inter text-white mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        rows={4}
                        className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-inter text-white mb-2">
                        Quote
                      </label>
                      <textarea
                        value={editForm.quote}
                        onChange={(e) =>
                          setEditForm({ ...editForm, quote: e.target.value })
                        }
                        rows={2}
                        className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                        placeholder="Your favorite quote or motto..."
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-[red] text-white font-bebas uppercase rounded-md hover:bg-[#b80000] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-inter text-gray-400 mb-1">
                          First Name
                        </label>
                        <p className="text-white font-inter">
                          {profileData.first_name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-inter text-gray-400 mb-1">
                          Last Name
                        </label>
                        <p className="text-white font-inter">
                          {profileData.last_name}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-inter text-gray-400 mb-1">
                        Email
                      </label>
                      <p className="text-white font-inter">
                        {profileData.email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-inter text-gray-400 mb-1">
                        Phone
                      </label>
                      <p className="text-white font-inter">
                        {profileData.phone || "Not provided"}
                      </p>
                    </div>

                    {profileData.bio && (
                      <div>
                        <label className="block text-sm font-inter text-gray-400 mb-1">
                          Bio
                        </label>
                        <p className="text-white font-inter">
                          {profileData.bio}
                        </p>
                      </div>
                    )}

                    {profileData.quote && (
                      <div>
                        <label className="block text-sm font-inter text-gray-400 mb-1">
                          Quote
                        </label>
                        <p className="text-white font-inter italic">
                          "{profileData.quote}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Teams Section */}
            {activeSection === "teams" && (
              <div>
                <h3 className="text-2xl font-bebas text-white mb-6 uppercase">
                  Teams & Responsibilities
                </h3>
                {profileData.teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.teams.map((team) => (
                      <div
                        key={team.id}
                        className="bg-gray-800 border border-gray-600 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3">
                          {team.logo_url ? (
                            <Image
                              src={team.logo_url}
                              alt={team.name}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bebas text-gray-300">
                                🏀
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="text-lg font-bebas text-white">
                              {team.name}
                            </h4>
                            <p className="text-sm font-inter text-gray-400">
                              {team.age_group} • {team.gender}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 font-inter">No teams assigned</p>
                )}
              </div>
            )}

            {/* Activity Section */}
            {activeSection === "activity" && (
              <div>
                <h3 className="text-2xl font-bebas text-white mb-6 uppercase">
                  Activity & Analytics
                </h3>

                <div className="space-y-6">
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <h4 className="text-lg font-bebas text-white mb-3">
                      Activity Statistics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-inter text-gray-400 mb-1">
                          Total Logins
                        </label>
                        <p className="text-white font-inter text-xl">
                          {profileData.login_count}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-inter text-gray-400 mb-1">
                          Last Activity
                        </label>
                        <p className="text-white font-inter">
                          {formatDate(profileData.last_active_at || profileData.last_login_at)}
                          {daysSinceLogin !== null && (
                            <span className="text-gray-400 text-sm ml-2">
                              (
                              {daysSinceLogin === 0
                                ? "Today"
                                : daysSinceLogin === 1
                                ? "Yesterday"
                                : `${daysSinceLogin} days ago`}
                              )
                            </span>
                          )}
                        </p>
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

                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <h4 className="text-lg font-bebas text-white mb-3">
                      Content Created
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bebas text-white">
                          {profileData.schedules_created}
                        </div>
                        <div className="text-sm font-inter text-gray-400">
                          Schedules
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bebas text-white">
                          {profileData.updates_created}
                        </div>
                        <div className="text-sm font-inter text-gray-400">
                          Updates
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bebas text-white">
                          {profileData.drills_created}
                        </div>
                        <div className="text-sm font-inter text-gray-400">
                          Drills
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <h4 className="text-lg font-bebas text-white mb-3">
                      Message Board Activity
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bebas text-white">
                          {messages.length}
                        </div>
                        <div className="text-sm font-inter text-gray-400">
                          Total Messages
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bebas text-white">
                          {unreadMentions}
                        </div>
                        <div className="text-sm font-inter text-gray-400">
                          Unread Mentions
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Section */}
            {activeSection === "account" && (
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
                          onClick={() => setShowPasswordModal(true)}
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
            )}

            {/* Schedule Section */}
            {activeSection === "schedule" && (
              <div>
                <h3 className="text-2xl font-bebas text-white mb-6 uppercase">
                  Schedule & Availability
                </h3>
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">📅</div>
                  <h4 className="text-lg font-bebas text-white mb-2">
                    Coming Soon
                  </h4>
                  <p className="text-gray-400 font-inter">
                    Schedule management and availability features are in
                    development.
                  </p>
                </div>
              </div>
            )}

            {/* Messages Section */}
            {activeSection === "messages" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bebas text-white uppercase">
                    Coach Message Board
                  </h3>
                  {unreadMentions > 0 && (
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-inter">
                      {unreadMentions} unread mention
                      {unreadMentions !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                <MessageBoard
                  userId={userId || ""}
                  userName={
                    (profileData && `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim()) ||
                    userName ||
                    "Coach"
                  }
                  isAdmin={isAdmin}
                />
              </div>
            )}

            {/* Resources Section */}
            {activeSection === "resources" && (
              <div>
                <h3 className="text-2xl font-bebas text-white mb-6 uppercase">
                  Resources & Tools
                </h3>
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">📚</div>
                  <h4 className="text-lg font-bebas text-white mb-2">
                    Coming Soon
                  </h4>
                  <p className="text-gray-400 font-inter">
                    Resource management and drill library features are in
                    development.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          userId={userId}
        />
      )}
    </div>
  );
}
