"use client";

import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface UploadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  userId: string;
  logoType: "team" | "club";
  teamName?: string;
}

export default function UploadLogoModal({
  isOpen,
  onClose,
  onUploadSuccess,
  userId,
  logoType,
  teamName,
}: UploadLogoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [inputTeamName, setInputTeamName] = useState(teamName || "");
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ file: File; teamName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type (images only)
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("File must be an image");
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async (overwrite: boolean = false) => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    if (logoType === "team" && !inputTeamName.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("logoType", logoType);
      formData.append("overwrite", overwrite.toString());
      if (logoType === "team" && inputTeamName.trim()) {
        formData.append("teamName", inputTeamName.trim());
      }

      const response = await fetch("/api/resources/upload-logo", {
        method: "POST",
        headers: {
          "x-user-id": userId,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if file exists and needs overwrite confirmation
        if (response.status === 409 && errorData.error === "FILE_EXISTS") {
          setPendingUpload({ file, teamName: inputTeamName.trim() });
          setShowOverwriteConfirm(true);
          setUploading(false);
          return;
        }
        
        throw new Error(errorData.error || "Failed to upload logo");
      }

      toast.success("Logo uploaded successfully!");
      setFile(null);
      setInputTeamName(teamName || "");
      setShowOverwriteConfirm(false);
      setPendingUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload logo"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleOverwriteConfirm = () => {
    if (pendingUpload) {
      setShowOverwriteConfirm(false);
      handleUpload(true);
    }
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteConfirm(false);
    setPendingUpload(null);
    setUploading(false);
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setInputTeamName(teamName || "");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-md mx-4 my-auto flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
          <h3 className="text-2xl font-bebas text-white uppercase">
            Upload {logoType === "team" ? "Team" : "Club"} Logo
          </h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <div className="space-y-4">
          {logoType === "team" && (
            <div>
              <label className="block text-sm font-inter text-white mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={inputTeamName}
                onChange={(e) => setInputTeamName(e.target.value)}
                disabled={uploading}
                placeholder="Enter team name"
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-1 font-inter">
                Logo will be saved as: logo-{inputTeamName.toLowerCase().replace(/\s+/g, "-") || "team-name"}.png
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-inter text-white mb-2">
              Select Logo Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              disabled={uploading}
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bebas file:bg-[red] file:text-white hover:file:bg-[#b80000] disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-2 font-inter">
              Allowed types: PNG, JPG, JPEG, GIF, SVG (Max 5MB)
            </p>
          </div>

          {file && (
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
              <p className="text-white font-inter text-sm">
                Selected: <span className="font-medium">{file.name}</span>
              </p>
              <p className="text-gray-400 font-inter text-xs mt-1">
                Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              {file.type.startsWith("image/") && (
                <div className="mt-3">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="max-w-full max-h-48 object-contain rounded"
                  />
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        <div className="flex space-x-4 p-6 pt-4 border-t border-gray-600 flex-shrink-0">
            <button
              onClick={() => handleUpload(false)}
              disabled={!file || uploading || (logoType === "team" && !inputTeamName.trim()) || showOverwriteConfirm}
              className="flex-1 px-6 py-2 bg-[red] text-white font-bebas uppercase rounded-md hover:bg-[#b80000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="flex-1 px-6 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
        </div>

        {/* Overwrite Confirmation Modal */}
        {showOverwriteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
            <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-md mx-4 p-6">
              <h3 className="text-xl font-bebas text-white uppercase mb-4">
                File Already Exists
              </h3>
              <p className="text-white font-inter mb-6">
                A file with this name already exists. Do you want to overwrite it?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleOverwriteConfirm}
                  className="flex-1 px-6 py-2 bg-[red] text-white font-bebas uppercase rounded-md hover:bg-[#b80000] transition-colors"
                >
                  Yes, Overwrite
                </button>
                <button
                  onClick={handleOverwriteCancel}
                  className="flex-1 px-6 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

