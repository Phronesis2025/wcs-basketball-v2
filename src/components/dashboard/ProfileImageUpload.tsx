"use client";

import React, { useState } from "react";
import Image from "next/image";
import { devLog, devError } from "@/lib/security";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  disabled?: boolean;
}

export default function ProfileImageUpload({
  currentImageUrl,
  onImageChange,
  disabled = false,
}: ProfileImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  const handleSave = () => {
    if (imageUrl.trim()) {
      onImageChange(imageUrl.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setImageUrl(currentImageUrl || "");
    setIsEditing(false);
  };

  const handleRemove = () => {
    setImageUrl("");
    onImageChange("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24">
          {imageUrl ? (
            <Image
              className="rounded-full object-cover border-2 border-gray-600"
              src={imageUrl}
              alt="Profile"
              width={96}
              height={96}
              onError={() => {
                devError("Failed to load image:", imageUrl);
                setImageUrl("");
              }}
            />
          ) : (
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bebas text-gray-400">👤</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          {!isEditing ? (
            <div className="space-y-2">
              <p className="text-white font-inter">
                {imageUrl ? "Profile image set" : "No profile image"}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                disabled={disabled}
                className="px-4 py-2 bg-red text-white font-bebas uppercase rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {imageUrl ? "Change Image" : "Add Image"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-inter text-white mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading || !imageUrl.trim()}
                  className="px-4 py-2 bg-red text-white font-bebas uppercase rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                {imageUrl && (
                  <button
                    onClick={handleRemove}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white font-bebas uppercase rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-blue-900/20 border border-blue-500 rounded-md p-3">
          <p className="text-sm font-inter text-blue-300">
            <strong>Note:</strong> Enter a direct URL to an image file (JPG,
            PNG, GIF). The image will be displayed at 96x96 pixels in a circular
            format.
          </p>
        </div>
      )}
    </div>
  );
}
