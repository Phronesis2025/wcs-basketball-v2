// src/components/dashboard/coach-profile/hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { devLog, devError } from "@/lib/security";
import { extractApiResponseData, extractApiErrorMessage } from "@/lib/errorHandler";
import toast from "react-hot-toast";

export interface CoachProfileData {
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

interface UseProfileProps {
  userId: string | null;
}

export const useProfile = ({ userId }: UseProfileProps) => {
  const [profileData, setProfileData] = useState<CoachProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      devLog("Fetching profile data for user:", userId);

      const response = await fetch(`/api/coach/profile?userId=${userId}`);

      // extractApiResponseData already checks response.ok and throws if not ok
      // It also unwraps the data from {success: true, data: {...}} format
      const profileData = await extractApiResponseData<CoachProfileData>(response);
      
      setProfileData(profileData);
    } catch (error) {
      devError("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId, fetchProfileData]);

  const updateProfile = useCallback(
    async (updates: {
      first_name: string;
      last_name: string;
      phone: string;
      bio: string;
      quote: string;
    }) => {
      if (!profileData || !userId) return { success: false };

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
            updates,
          }),
        });

        if (!response.ok) {
          const errorMessage = await extractApiErrorMessage(response);
          devError("Error updating profile:", errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }

        // Refresh profile data
        await fetchProfileData();
        toast.success("Profile updated successfully");
        return { success: true };
      } catch (error) {
        devError("Error saving profile:", error);
        toast.error("Failed to update profile");
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      } finally {
        setSaving(false);
      }
    },
    [profileData, userId, fetchProfileData]
  );

  return {
    profileData,
    loading,
    saving,
    fetchProfileData,
    updateProfile,
  };
};

