"use client";

import { useState } from "react";
import { Player } from "@/types/supabase";
import toast from "react-hot-toast";
import { devError } from "@/lib/security";

interface PlayerMedicalInfoProps {
  players: Player[];
  onUpdate: () => void;
}

interface MedicalFormData {
  medical_allergies: string;
  medical_conditions: string;
  medical_medications: string;
  doctor_name: string;
  doctor_phone: string;
}

export default function PlayerMedicalInfo({ players, onUpdate }: PlayerMedicalInfoProps) {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, MedicalFormData>>({});

  const getPlayerData = (player: Player): MedicalFormData => {
    // Always return current player data from props when not editing
    return {
      medical_allergies: player.medical_allergies || "",
      medical_conditions: player.medical_conditions || "",
      medical_medications: player.medical_medications || "",
      doctor_name: player.doctor_name || "",
      doctor_phone: player.doctor_phone || "",
    };
  };

  const handleEdit = (playerId: string, player: Player) => {
    setEditingPlayerId(playerId);
    // Initialize form with current player data
    setFormData({
      ...formData,
      [playerId]: getPlayerData(player),
    });
  };

  const handleCancel = (playerId: string) => {
    setEditingPlayerId(null);
    const updatedData = { ...formData };
    delete updatedData[playerId];
    setFormData(updatedData);
  };

  const handleChange = (playerId: string, field: keyof MedicalFormData, value: string) => {
    setFormData({
      ...formData,
      [playerId]: {
        ...formData[playerId],
        [field]: value,
      },
    });
  };

  const handleSave = async (playerId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/parent/update-player-medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: playerId,
          ...formData[playerId],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update medical information");
      }

      toast.success("Medical information updated successfully");
      setEditingPlayerId(null);
      onUpdate();
    } catch (error) {
      devError("Failed to update medical info:", error);
      toast.error("Failed to update medical information");
    } finally {
      setIsSaving(false);
    }
  };

  if (players.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">
        Player Medical Information
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        Manage medical information for each registered player
      </p>

      <div className="space-y-6">
        {players.map((player) => {
          const isEditing = editingPlayerId === player.id;
          // When editing, use form data; otherwise always use current player data
          const data = isEditing ? formData[player.id] : getPlayerData(player);

          return (
            <div
              key={player.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
            >
              {/* Player Name Header */}
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {player.name}
                </h4>
                {!isEditing && (
                  <button
                    onClick={() => handleEdit(player.id, player)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Medical Form Fields */}
              <div className="space-y-4">
                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Allergies
                  </label>
                  <textarea
                    value={data.medical_allergies}
                    onChange={(e) =>
                      handleChange(player.id, "medical_allergies", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full border border-gray-600 rounded px-3 py-2 text-white bg-gray-700 disabled:bg-gray-800 disabled:text-gray-400 resize-none"
                    placeholder="List any allergies (food, medication, environmental, etc.)"
                    rows={2}
                  />
                </div>

                {/* Medical Conditions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Medical Conditions
                  </label>
                  <textarea
                    value={data.medical_conditions}
                    onChange={(e) =>
                      handleChange(player.id, "medical_conditions", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full border border-gray-600 rounded px-3 py-2 text-white bg-gray-700 disabled:bg-gray-800 disabled:text-gray-400 resize-none"
                    placeholder="List any medical conditions (asthma, diabetes, heart conditions, etc.)"
                    rows={2}
                  />
                </div>

                {/* Current Medications */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Current Medications
                  </label>
                  <textarea
                    value={data.medical_medications}
                    onChange={(e) =>
                      handleChange(player.id, "medical_medications", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full border border-gray-600 rounded px-3 py-2 text-white bg-gray-700 disabled:bg-gray-800 disabled:text-gray-400 resize-none"
                    placeholder="List any medications currently being taken"
                    rows={2}
                  />
                </div>

                {/* Doctor Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Doctor Name
                    </label>
                    <input
                      type="text"
                      value={data.doctor_name}
                      onChange={(e) =>
                        handleChange(player.id, "doctor_name", e.target.value)
                      }
                      disabled={!isEditing}
                      className="w-full border border-gray-600 rounded px-3 py-2 text-white bg-gray-700 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="Primary care physician name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Doctor Phone
                    </label>
                    <input
                      type="tel"
                      value={data.doctor_phone}
                      onChange={(e) =>
                        handleChange(player.id, "doctor_phone", e.target.value)
                      }
                      disabled={!isEditing}
                      className="w-full border border-gray-600 rounded px-3 py-2 text-white bg-gray-700 disabled:bg-gray-800 disabled:text-gray-400"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleSave(player.id)}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-red text-white rounded hover:bg-red/90 transition disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => handleCancel(player.id)}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

