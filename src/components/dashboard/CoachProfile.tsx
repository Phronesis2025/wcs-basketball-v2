"use client";

import React, { useState, useEffect } from "react";
import { devLog } from "@/lib/security";
import ProfileImageUpload from "./ProfileImageUpload";
import ChangePasswordModal from "./ChangePasswordModal";
import MessageBoard from "./MessageBoard";
import BasketballLoader from "../BasketballLoader";
import UploadDocumentModal from "./UploadDocumentModal";
import UploadLogoModal from "./UploadLogoModal";
import DownloadConfirmModal from "./DownloadConfirmModal";
import { useProfile } from "./coach-profile/hooks/useProfile";
import { useResources } from "./coach-profile/hooks/useResources";
import { useMentions } from "./coach-profile/hooks/useMentions";
import ProfileHeader from "./coach-profile/ProfileHeader";
import QuickStats from "./coach-profile/QuickStats";
import SidebarNavigation from "./coach-profile/SidebarNavigation";
import PersonalInfoSection from "./coach-profile/PersonalInfoSection";
import TeamsSection from "./coach-profile/TeamsSection";
import ActivitySection from "./coach-profile/ActivitySection";
import AccountSection from "./coach-profile/AccountSection";
import ResourcesSection from "./coach-profile/ResourcesSection";

interface CoachProfileProps {
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  isAdmin: boolean;
  initialSection?: string | null;
  onMentionRead?: () => void;
  messageBoardRefreshTrigger?: number;
  scrollToMessageId?: string | null;
}

export default function CoachProfile({
  userId,
  userEmail,
  userName,
  isAdmin,
  initialSection,
  onMentionRead,
  messageBoardRefreshTrigger,
  scrollToMessageId,
}: CoachProfileProps) {
  // Debug: Log isAdmin prop received
  useEffect(() => {
    devLog("CoachProfile - isAdmin prop received:", isAdmin);
    devLog("CoachProfile - isAdmin type:", typeof isAdmin);
  }, [isAdmin]);

  // Use custom hooks for state management
  const profileHook = useProfile({ userId });
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const resourcesHook = useResources({ userId, activeSection });
  const mentionsHook = useMentions({ userId, activeSection });

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

  // Handle initialSection prop to navigate to specific section
  useEffect(() => {
    if (initialSection && initialSection !== activeSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection, activeSection]);

  const handleSave = async (updates: {
    first_name: string;
    last_name: string;
    phone: string;
    bio: string;
    quote: string;
  }) => {
    const result = await profileHook.updateProfile(updates);
    if (result.success) {
      setIsEditing(false);
    }
    return result;
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (profileHook.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BasketballLoader size={60} />
      </div>
    );
  }

  if (!profileHook.profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-inter">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <ProfileHeader
        profileData={profileHook.profileData}
        isAdmin={isAdmin}
      />

      {/* Quick Stats */}
      <QuickStats
        profileData={profileHook.profileData}
        messagesCount={mentionsHook.messages.length}
        unreadMentions={mentionsHook.unreadMentions}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <SidebarNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            {/* Personal Information Section */}
            {activeSection === "personal" && (
              <PersonalInfoSection
                profileData={profileHook.profileData}
                isEditing={isEditing}
                onEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={handleCancel}
                saving={profileHook.saving}
              />
            )}

            {/* Teams Section */}
            {activeSection === "teams" && (
              <TeamsSection profileData={profileHook.profileData} />
            )}

            {/* Activity Section */}
            {activeSection === "activity" && (
              <ActivitySection
                profileData={profileHook.profileData}
                messagesCount={mentionsHook.messages.length}
                unreadMentions={mentionsHook.unreadMentions}
              />
            )}

            {/* Account Section */}
            {activeSection === "account" && (
              <AccountSection
                profileData={profileHook.profileData}
                onShowPasswordModal={() => setShowPasswordModal(true)}
              />
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
              <div id="messages-section">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bebas text-white uppercase">
                    Coach Message Board
                  </h3>
                  {mentionsHook.unreadMentions > 0 && (
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-inter">
                      <span className="md:hidden">{mentionsHook.unreadMentions} unread</span>
                      <span className="hidden md:inline">
                        {mentionsHook.unreadMentions} unread mention{mentionsHook.unreadMentions !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                <div id="message-board-container">
                  <MessageBoard
                    userId={userId || ""}
                    userName={
                      (profileHook.profileData && `${profileHook.profileData.first_name || ""} ${profileHook.profileData.last_name || ""}`.trim()) ||
                      userName ||
                      "Coach"
                    }
                    isAdmin={isAdmin}
                    refreshTrigger={messageBoardRefreshTrigger}
                    scrollToMessageId={scrollToMessageId}
                    onMentionRead={() => {
                      // Refresh local unread mentions count
                      mentionsHook.fetchUnreadMentions();
                      // Notify parent component
                      if (onMentionRead) {
                        onMentionRead();
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Resources Section */}
            {activeSection === "resources" && (
              <ResourcesSection
                resourcesData={resourcesHook.resourcesData}
                resourcesLoading={resourcesHook.resourcesLoading}
                isAdmin={isAdmin}
                onShowUploadModal={() => resourcesHook.setShowUploadModal(true)}
                onShowTeamLogoModal={() => resourcesHook.setShowTeamLogoModal(true)}
                onShowClubLogoModal={() => resourcesHook.setShowClubLogoModal(true)}
                onResourceClick={resourcesHook.handleResourceClick}
              />
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

      {/* Upload Document Modal */}
      {resourcesHook.showUploadModal && userId && (
        <UploadDocumentModal
          isOpen={resourcesHook.showUploadModal}
          onClose={() => resourcesHook.setShowUploadModal(false)}
          onUploadSuccess={resourcesHook.handleUploadSuccess}
          userId={userId}
        />
      )}

      {/* Upload Team Logo Modal */}
      {resourcesHook.showTeamLogoModal && userId && (
        <UploadLogoModal
          isOpen={resourcesHook.showTeamLogoModal}
          onClose={() => resourcesHook.setShowTeamLogoModal(false)}
          onUploadSuccess={resourcesHook.handleUploadSuccess}
          userId={userId}
          logoType="team"
        />
      )}

      {/* Upload Club Logo Modal */}
      {resourcesHook.showClubLogoModal && userId && (
        <UploadLogoModal
          isOpen={resourcesHook.showClubLogoModal}
          onClose={() => resourcesHook.setShowClubLogoModal(false)}
          onUploadSuccess={resourcesHook.handleUploadSuccess}
          userId={userId}
          logoType="club"
        />
      )}

      {/* Download Confirmation Modal */}
      {resourcesHook.showDownloadModal && resourcesHook.downloadItem && (
        <DownloadConfirmModal
          isOpen={resourcesHook.showDownloadModal}
          onClose={() => {
            resourcesHook.setShowDownloadModal(false);
            resourcesHook.setDownloadItem(null);
          }}
          onConfirm={resourcesHook.handleDownloadConfirm}
          onDelete={resourcesHook.handleDeleteResource}
          fileName={resourcesHook.downloadItem.fileName}
          fileType={resourcesHook.downloadItem.type}
          fileUrl={resourcesHook.downloadItem.type === "image" ? resourcesHook.downloadItem.url : undefined}
          fileSize={resourcesHook.downloadItem.size}
          displayName={resourcesHook.downloadItem.displayName}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
