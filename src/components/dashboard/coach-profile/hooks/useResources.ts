// src/components/dashboard/coach-profile/hooks/useResources.ts
import { useState, useEffect, useCallback } from "react";
import { devError } from "@/lib/security";
import { listResources } from "@/lib/actions";
import toast from "react-hot-toast";

export interface ResourceItem {
  name: string;
  path: string;
  size: number;
  created_at: string;
  url: string;
  teamName?: string;
}

export interface ResourcesData {
  documents: ResourceItem[];
  teamLogos: ResourceItem[];
  clubLogos: ResourceItem[];
}

interface UseResourcesProps {
  userId: string | null;
  activeSection: string;
}

export const useResources = ({ userId, activeSection }: UseResourcesProps) => {
  const [resourcesData, setResourcesData] = useState<ResourcesData | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTeamLogoModal, setShowTeamLogoModal] = useState(false);
  const [showClubLogoModal, setShowClubLogoModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadItem, setDownloadItem] = useState<{
    url: string;
    name: string;
    fileName: string;
    type: "image" | "document";
    size?: number;
    displayName?: string;
    bucket?: string;
    path?: string;
  } | null>(null);

  const fetchResources = useCallback(async () => {
    if (activeSection !== "resources" || !userId) return;

    setResourcesLoading(true);
    try {
      const data = await listResources();
      setResourcesData(data);
    } catch (error) {
      devError("Error fetching resources:", error);
      toast.error("Failed to load resources");
      setResourcesData({
        documents: [],
        teamLogos: [],
        clubLogos: [],
      });
    } finally {
      setResourcesLoading(false);
    }
  }, [activeSection, userId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleResourceClick = useCallback((
    url: string,
    name: string,
    fileName: string,
    type: "image" | "document",
    size?: number,
    displayName?: string,
    bucket?: string,
    path?: string
  ) => {
    setDownloadItem({ url, name, fileName, type, size, displayName, bucket, path });
    setShowDownloadModal(true);
  }, []);

  const handleDeleteResource = useCallback(async () => {
    if (!downloadItem || !downloadItem.bucket || !downloadItem.path || !userId) {
      toast.error("Missing information to delete file");
      return;
    }

    try {
      const response = await fetch(
        `/api/resources/delete?bucket=${encodeURIComponent(downloadItem.bucket)}&path=${encodeURIComponent(downloadItem.path)}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) {
        const { extractApiErrorMessage } = await import("@/lib/errorHandler");
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      toast.success("File deleted successfully!");
      setShowDownloadModal(false);
      setDownloadItem(null);
      
      // Refresh resources list
      await fetchResources();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete file"
      );
    }
  }, [downloadItem, userId, fetchResources]);

  const handleDownloadConfirm = useCallback(async () => {
    if (!downloadItem) return;

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = downloadItem.url;
      link.download = downloadItem.fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading ${downloadItem.fileName}...`);
      setShowDownloadModal(false);
      setDownloadItem(null);
    } catch (error) {
      devError("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  }, [downloadItem]);

  const handleUploadSuccess = useCallback(async () => {
    // Refresh resources list after successful upload
    if (activeSection === "resources" && userId) {
      await fetchResources();
    }
  }, [activeSection, userId, fetchResources]);

  return {
    resourcesData,
    resourcesLoading,
    showUploadModal,
    setShowUploadModal,
    showTeamLogoModal,
    setShowTeamLogoModal,
    showClubLogoModal,
    setShowClubLogoModal,
    showDownloadModal,
    setShowDownloadModal,
    downloadItem,
    setDownloadItem,
    handleResourceClick,
    handleDeleteResource,
    handleDownloadConfirm,
    handleUploadSuccess,
    fetchResources,
  };
};

