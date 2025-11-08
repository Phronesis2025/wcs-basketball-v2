"use client";

import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  userId: string;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onUploadSuccess,
  userId,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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
      // Validate file type
      const allowedExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "txt", "csv"];
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        toast.error(
          "Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV"
        );
        return;
      }

      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("overwrite", overwrite.toString());

      const response = await fetch("/api/resources/upload", {
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
          setPendingFile(file);
          setShowOverwriteConfirm(true);
          setUploading(false);
          return;
        }
        
        throw new Error(errorData.error || "Failed to upload document");
      }

      toast.success("Document uploaded successfully!");
      setFile(null);
      setShowOverwriteConfirm(false);
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onUploadSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleOverwriteConfirm = () => {
    if (pendingFile) {
      setShowOverwriteConfirm(false);
      handleUpload(true);
    }
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteConfirm(false);
    setPendingFile(null);
    setUploading(false);
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
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
            Upload Document
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
          <div>
            <label className="block text-sm font-inter text-white mb-2">
              Select Document
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
              disabled={uploading}
              className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bebas file:bg-[red] file:text-white hover:file:bg-[#b80000] disabled:opacity-50"
            />
            <p className="text-xs text-gray-400 mt-2 font-inter">
              Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV (Max 10MB)
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
            </div>
          )}
          </div>
        </div>

        <div className="flex space-x-4 p-6 pt-4 border-t border-gray-600 flex-shrink-0">
            <button
              onClick={() => handleUpload(false)}
              disabled={!file || uploading || showOverwriteConfirm}
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

