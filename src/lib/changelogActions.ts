import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { devError } from "@/lib/security";
import { ChangelogEntry } from "@/types/supabase";

export async function fetchChangelog(userId?: string): Promise<ChangelogEntry[]> {
  try {
    const headers: Record<string, string> = {};
    if (userId) headers["x-user-id"] = userId;
    const resp = await fetch("/api/admin/changelog", { headers });
    if (!resp.ok) throw new Error(await resp.text());
    return (await resp.json()) as ChangelogEntry[];
  } catch (e) {
    devError("fetchChangelog error", e);
    return [];
  }
}

export async function createChangelogEntry(
  entry: Omit<ChangelogEntry, "id" | "created_at" | "updated_at" | "created_by">,
  userId: string
): Promise<ChangelogEntry | null> {
  try {
    const resp = await fetch("/api/admin/changelog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify(entry),
    });
    if (!resp.ok) throw new Error(await resp.text());
    return (await resp.json()) as ChangelogEntry;
  } catch (e) {
    devError("createChangelogEntry error", e);
    return null;
  }
}

export async function updateChangelogEntry(
  id: string,
  updates: Partial<ChangelogEntry>,
  userId: string
): Promise<ChangelogEntry | null> {
  try {
    const resp = await fetch("/api/admin/changelog", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!resp.ok) throw new Error(await resp.text());
    return (await resp.json()) as ChangelogEntry;
  } catch (e) {
    devError("updateChangelogEntry error", e);
    return null;
  }
}

export async function deleteChangelogEntry(id: string, userId: string): Promise<boolean> {
  try {
    const resp = await fetch(`/api/admin/changelog?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        "x-user-id": userId,
      },
    });
    return resp.ok;
  } catch (e) {
    devError("deleteChangelogEntry error", e);
    return false;
  }
}

export function getCategoryColor(category: ChangelogEntry["category"]): string {
  switch (category) {
    case "added":
      return "text-green-400";
    case "changed":
      return "text-blue-400";
    case "fixed":
      return "text-yellow-400";
    case "removed":
      return "text-red-400";
    case "security":
      return "text-orange-400";
    case "deprecated":
      return "text-gray-400";
    default:
      return "text-gray-300";
  }
}

