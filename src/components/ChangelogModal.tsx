"use client";
import { useState } from "react";
import { ChangelogEntry } from "@/types/supabase";
import { createChangelogEntry, updateChangelogEntry } from "@/lib/changelogActions";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  editing?: ChangelogEntry | null;
  onSaved?: () => void;
};

const CATEGORIES: ChangelogEntry["category"][] = [
  "added",
  "changed",
  "fixed",
  "removed",
  "security",
  "deprecated",
];

export default function ChangelogModal({ isOpen, onClose, userId, editing, onSaved }: Props) {
  const [form, setForm] = useState({
    version: editing?.version || "",
    release_date: editing?.release_date || new Date().toISOString().slice(0, 10),
    category: (editing?.category || "added") as ChangelogEntry["category"],
    description: editing?.description || "",
    is_published: editing?.is_published ?? true,
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async () => {
    if (!form.version || !form.release_date || !form.description) return;
    setSaving(true);
    try {
      if (editing) {
        await updateChangelogEntry(editing.id, form as any, userId);
      } else {
        await createChangelogEntry(form as any, userId);
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto pt-20 sm:pt-20">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto mx-1 sm:mx-0">
        <h3 className="text-xl font-bebas text-white mb-4">{editing ? "Edit" : "Add"} Changelog Entry</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Version</label>
            <input name="version" value={form.version} onChange={onChange} className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Release Date</label>
              <input type="date" name="release_date" value={form.release_date} onChange={onChange} className="w-full max-w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2 box-border" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Category</label>
              <select name="category" value={form.category} onChange={onChange} className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} rows={4} className="w-full bg-gray-800 text-white border border-gray-600 rounded px-3 py-2" />
          </div>
          <div className="flex items-center gap-2">
            <input id="is_published" type="checkbox" name="is_published" checked={form.is_published} onChange={onChange} />
            <label htmlFor="is_published" className="text-sm text-gray-300">Published</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-200 bg-gray-700 rounded-md">Cancel</button>
          <button disabled={saving} onClick={submit} className="px-6 py-2 text-sm font-semibold text-white bg-[red] hover:bg-[#b80000] rounded-md">
            {saving ? "Saving..." : editing ? "Save Changes" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}


