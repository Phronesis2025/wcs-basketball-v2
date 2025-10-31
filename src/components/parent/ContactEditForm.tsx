"use client";

import { useState, useEffect } from "react";

interface ContactEditFormProps {
  email: string;
  initialFirstName: string | null;
  initialLastName: string | null;
  initialPhone: string | null;
  initialEmergencyContact: string | null;
  initialEmergencyPhone: string | null;
  onSave: (
    firstName: string,
    lastName: string,
    phone: string,
    emergencyContact: string,
    emergencyPhone: string
  ) => Promise<void>;
  onPasswordReset: () => Promise<void>;
}

export default function ContactEditForm({
  email,
  initialFirstName,
  initialLastName,
  initialPhone,
  initialEmergencyContact,
  initialEmergencyPhone,
  onSave,
  onPasswordReset,
}: ContactEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const [phone, setPhone] = useState(initialPhone || "");
  const [emergencyContact, setEmergencyContact] = useState(
    initialEmergencyContact || ""
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    initialEmergencyPhone || ""
  );

  useEffect(() => {
    setFirstName(initialFirstName || "");
    setLastName(initialLastName || "");
    setPhone(initialPhone || "");
    setEmergencyContact(initialEmergencyContact || "");
    setEmergencyPhone(initialEmergencyPhone || "");
  }, [
    initialFirstName,
    initialLastName,
    initialPhone,
    initialEmergencyContact,
    initialEmergencyPhone,
  ]);

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s()-]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const handleSave = async () => {
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Invalid phone number format");
      return;
    }

    if (!validatePhone(emergencyPhone)) {
      setError("Invalid emergency phone number format");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(
        firstName,
        lastName,
        phone,
        emergencyContact,
        emergencyPhone
      );
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update contact information");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsResettingPassword(true);
    setError(null);
    try {
      await onPasswordReset();
      setShowPasswordResetModal(false);
    } catch (err) {
      setError("Failed to send password reset email");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCancel = () => {
    setFirstName(initialFirstName || "");
    setLastName(initialLastName || "");
    setPhone(initialPhone || "");
    setEmergencyContact(initialEmergencyContact || "");
    setEmergencyPhone(initialEmergencyPhone || "");
    setIsEditing(false);
    setError(null);
  };

  return (
    <>
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bebas text-white uppercase">
                Reset Password
              </h2>
              <button
                onClick={() => setShowPasswordResetModal(false)}
                disabled={isResettingPassword}
                className="text-gray-400 hover:text-white disabled:opacity-50"
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

            {/* Content */}
            <div className="p-6">
              <p className="text-white font-inter mb-6">
                Are you sure you want to reset your password? You'll receive an
                email with instructions to create a new password.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={handlePasswordReset}
                  disabled={isResettingPassword}
                  className="flex-1 bg-red text-white font-bebas uppercase py-2 rounded-md hover:bg-red/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isResettingPassword ? "Sending..." : "Reset Password"}
                </button>
                <button
                  onClick={() => setShowPasswordResetModal(false)}
                  disabled={isResettingPassword}
                  className="px-6 py-2 bg-gray-600 text-white font-bebas uppercase rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Contact Information
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Edit
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!isEditing}
            className="w-full border rounded px-3 py-2 text-black disabled:text-black disabled:bg-gray-50"
              placeholder="First name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!isEditing}
            className="w-full border rounded px-3 py-2 text-black disabled:text-black disabled:bg-gray-50"
              placeholder="Last name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!isEditing}
            className="w-full border rounded px-3 py-2 text-black disabled:text-black disabled:bg-gray-50"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              disabled={!isEditing}
            className="w-full border rounded px-3 py-2 text-black disabled:text-black disabled:bg-gray-50"
              placeholder="Emergency contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Phone
            </label>
            <input
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              disabled={!isEditing}
            className="w-full border rounded px-3 py-2 text-black disabled:text-black disabled:bg-gray-50"
              placeholder="(555) 123-4567"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red text-white rounded hover:bg-red/90 transition disabled:opacity-60"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          )}

          {!isEditing && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowPasswordResetModal(true)}
                className="w-full px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 transition"
              >
                Reset Password
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
