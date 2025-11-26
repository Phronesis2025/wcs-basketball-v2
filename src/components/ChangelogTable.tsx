"use client";
import { useEffect, useMemo, useState } from "react";
import { ChangelogEntry } from "@/types/supabase";
import { fetchChangelog, getCategoryColor } from "@/lib/changelogActions";

type Props = {
  userId?: string | null;
  isAdmin?: boolean;
};

const CATEGORY_OPTIONS: Array<ChangelogEntry["category"] | "all"> = [
  "all",
  "added",
  "changed",
  "fixed",
  "removed",
  "security",
  "deprecated",
];

export default function ChangelogTable({ userId, isAdmin }: Props) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>(
    "all"
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchChangelog(userId || undefined);
        if (mounted) {
          // Ensure data is always an array
          setEntries(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching changelog:", error);
        if (mounted) setEntries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const filtered = useMemo(() => {
    // Ensure entries is an array before filtering
    if (!Array.isArray(entries)) return [];
    return entries.filter((e) => {
      const catOk = category === "all" || e.category === category;
      const q = search.trim().toLowerCase();
      const qOk = !q ||
        e.version.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [entries, category, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, ChangelogEntry[]>();
    for (const e of filtered) {
      const key = `${e.version}__${e.release_date}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).map(([key, list]) => {
      const [version, release_date] = key.split("__");
      return { version, release_date, items: list };
    });
  }, [filtered]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-white font-inter">Changelog</h2>
        <div className="flex gap-2">
          <input
            className="hidden md:block bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm font-inter placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            placeholder="Search version or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm font-inter focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300 font-inter">Loading changelog...</div>
      ) : grouped.length === 0 ? (
        <div className="text-slate-400 text-sm font-inter">No changelog entries yet.</div>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={`${group.version}-${group.release_date}`} className="bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="text-white font-semibold text-xl font-inter">Version {group.version}</div>
                <div className="text-slate-300 text-sm font-inter">{new Date(group.release_date).toLocaleDateString()}</div>
              </div>
              <div className="divide-y divide-white/10">
                {group.items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${getCategoryColor(item.category)} text-xs uppercase tracking-wide`}>[{item.category}]</span>
                      {!item.is_published && (
                        <span className="text-xs text-slate-400 font-inter">(unpublished)</span>
                      )}
                    </div>
                    <div className="text-white font-inter">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


