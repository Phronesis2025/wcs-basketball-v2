// src/components/dashboard/coach-profile/PersonalInfoSection.tsx
import React, { useState, useEffect } from "react";
import { CoachProfileData } from "./hooks/useProfile";

interface PersonalInfoSectionProps {
  profileData: CoachProfileData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: {
    first_name: string;
    last_name: string;
    phone: string;
    bio: string;
    quote: string;
  }) => Promise<{ success: boolean }>;
  onCancel: () => void;
  saving: boolean;
}

export default function PersonalInfoSection({
  profileData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  saving,
}: PersonalInfoSectionProps) {
  const [editForm, setEditForm] = useState({
    first_name: profileData.first_name || "",
    last_name: profileData.last_name || "",
    phone: profileData.phone || "",
    bio: profileData.bio || "",
    quote: profileData.quote || "",
  });

  // Update form when profile data changes
  useEffect(() => {
    setEditForm({
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
      phone: profileData.phone || "",
      bio: profileData.bio || "",
      quote: profileData.quote || "",
    });
  }, [profileData]);

  const handleSave = async () => {
    const result = await onSave(editForm);
    if (result.success) {
      // Form will be reset by parent component
    }
  };

  const handleCancel = () => {
    setEditForm({
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
      phone: profileData.phone || "",
      bio: profileData.bio || "",
      quote: profileData.quote || "",
    });
    onCancel();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white font-inter">
          Personal Information
        </h3>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter rounded-lg hover:bg-blue-500/30 transition-colors"
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
                className="w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
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
                className="w-full p-3 bg-white/5 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
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
              className="px-6 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-white/5 text-slate-300 border border-white/10 font-inter rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter text-slate-400 mb-1">
                First Name
              </label>
              <p className="text-white font-inter">
                {profileData.first_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-inter text-slate-400 mb-1">
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
            <p className="text-white font-inter">{profileData.email}</p>
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
              <label className="block text-sm font-inter text-slate-400 mb-1">
                Bio
              </label>
              <p className="text-white font-inter">{profileData.bio}</p>
            </div>
          )}

          {profileData.quote && (
            <div>
              <label className="block text-sm font-inter text-slate-400 mb-1">
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
  );
}

