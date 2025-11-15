"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";

interface CommitData {
  date: string;
  count: number;
}

interface CommitChartData {
  data: CommitData[];
  totalCommits: number;
  repository: string;
}

interface CommitChartProps {
  userId?: string | null;
}

export default function CommitChart({ userId }: CommitChartProps) {
  const [viewMode, setViewMode] = useState<"month" | "day">("month");
  const [chartData, setChartData] = useState<CommitChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine chart height based on screen size
  const getChartHeight = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 300; // mobile
      if (window.innerWidth < 1024) return 400; // tablet
      return 500; // desktop
    }
    return 400; // default
  };

  const [chartHeight, setChartHeight] = useState(getChartHeight());

  useEffect(() => {
    let mounted = true;

    const fetchCommits = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/admin/commits?groupBy=${viewMode}&monthsBack=6`,
          {
            headers: userId ? { "x-user-id": userId } : {},
          }
        );

        if (!response.ok) {
          const { extractApiErrorMessage } = await import("@/lib/errorHandler");
          const errorMessage = await extractApiErrorMessage(response);
          throw new Error(errorMessage);
        }

        const { extractApiResponseData } = await import("@/lib/errorHandler");
        const result = await extractApiResponseData<CommitChartData>(response);

        if (mounted) {
          setChartData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load update history"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCommits();

    return () => {
      mounted = false;
    };
  }, [viewMode, userId]);

  useEffect(() => {
    const handleResize = () => {
      setChartHeight(getChartHeight());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format x-axis labels based on view mode
  const formatXAxisLabel = (dateStr: string) => {
    try {
      if (viewMode === "month") {
        // Format as "Jan 2024"
        const date = parseISO(`${dateStr}-01`);
        return format(date, "MMM yyyy");
      } else {
        // Format as "Jan 15"
        const date = parseISO(dateStr);
        return format(date, "MMM d");
      }
    } catch {
      return dateStr;
    }
  };

  // Format tooltip
  const formatTooltip = (value: number, name: string, props: any) => {
    const dateStr = props.payload.date;
    let formattedDate = dateStr;

    try {
      if (viewMode === "month") {
        const date = parseISO(`${dateStr}-01`);
        formattedDate = format(date, "MMMM yyyy");
      } else {
        const date = parseISO(dateStr);
        formattedDate = format(date, "MMMM d, yyyy");
      }
    } catch {
      // Keep original if parsing fails
    }

    return [
      `${value} update${value !== 1 ? "s" : ""}`,
      formattedDate,
    ];
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dateStr = data.date;
      let formattedDate = dateStr;

      try {
        if (viewMode === "month") {
          const date = parseISO(`${dateStr}-01`);
          formattedDate = format(date, "MMMM yyyy");
        } else {
          const date = parseISO(dateStr);
          formattedDate = format(date, "MMMM d, yyyy");
        }
      } catch {
        // Keep original if parsing fails
      }

      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{formattedDate}</p>
          <p className="text-red-400">
            {data.count} update{data.count !== 1 ? "s" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-400 text-sm">Loading update history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Error Loading Update History</p>
          <p className="text-gray-400 text-sm">{error}</p>
          {error.includes("GITHUB_OWNER") && (
            <p className="text-gray-500 text-xs mt-2">
              Please configure GITHUB_OWNER and GITHUB_REPO environment variables in Vercel.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!chartData || chartData.data.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-center">
          <p className="text-gray-400">No update history available</p>
        </div>
      </div>
    );
  }

  // Color for bars (red theme matching app design)
  const barColor = "#dc2626"; // red-600

  return (
    <div className="space-y-4">
      {/* Header with toggle button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bebas text-white mb-1">
            Development Activity
          </h3>
          <p className="text-xs text-gray-400">
            Updates & improvements
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              viewMode === "month"
                ? "bg-[red] text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            By Month
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              viewMode === "day"
                ? "bg-[red] text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            By Day
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData.data}
            margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: 20,
            }}
          >
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxisLabel}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              angle={viewMode === "day" ? -45 : 0}
              textAnchor={viewMode === "day" ? "end" : "middle"}
              height={viewMode === "day" ? 80 : 40}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              width={40}
              label={{ value: "Updates", angle: -90, position: "insideLeft", fill: "#9ca3af", style: { textAnchor: "middle" } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-gray-400">
        <p>
          Total: <span className="text-white font-semibold">{chartData.totalCommits}</span> update{chartData.totalCommits !== 1 ? "s" : ""} & improvement{chartData.totalCommits !== 1 ? "s" : ""}
          {viewMode === "month" ? " (last 6 months)" : " (last 6 months)"}
        </p>
      </div>
    </div>
  );
}

