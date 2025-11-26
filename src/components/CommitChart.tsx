"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import CommitsModal from "./CommitsModal";

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Handle bar click
  const handleBarClick = (data: CommitData) => {
    setSelectedDate(data.date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // Custom bar shape with click handler
  const CustomBar = (props: any) => {
    const { 
      payload, 
      tooltipPosition,
      parentViewBox,
      dataKey,
      ...rest 
    } = props;
    
    const handleClick = () => {
      if (payload) {
        handleBarClick(payload);
      }
    };
    
    // Extract only valid SVG rect attributes
    const {
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      opacity,
      style,
      className,
      onMouseEnter,
      onMouseLeave,
    } = rest;
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={opacity}
        className={className}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: "pointer", ...style }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
          <p className="text-slate-400 text-sm font-inter">Loading update history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2 font-inter">Error Loading Update History</p>
          <p className="text-slate-400 text-sm font-inter">{error}</p>
          {error.includes("GITHUB_OWNER") && (
            <p className="text-slate-500 text-xs mt-2 font-inter">
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
          <p className="text-slate-400 font-inter">No update history available</p>
        </div>
      </div>
    );
  }

  // Color for bars (blue theme matching app design)
  const barColor = "#3b82f6"; // blue-500

  return (
    <div className="space-y-4">
      {/* Header with toggle button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 font-inter">
            Development Activity
          </h3>
          <p className="text-xs text-slate-400 font-inter">
            Updates & improvements
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("month")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              viewMode === "month"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            By Month
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              viewMode === "day"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            By Day
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
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
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              shape={<CustomBar />}
              style={{ cursor: "pointer" }}
            >
              {chartData.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={barColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-slate-400">
        <p className="font-inter">
          Total: <span className="text-white font-semibold font-inter">{chartData.totalCommits}</span> update{chartData.totalCommits !== 1 ? "s" : ""} & improvement{chartData.totalCommits !== 1 ? "s" : ""}
          {viewMode === "month" ? " (last 6 months)" : " (last 6 months)"}
        </p>
        <p className="text-xs text-slate-500 mt-2 font-inter">
          Click on a bar to view commits for that period
        </p>
      </div>

      {/* Commits Modal */}
      {selectedDate && (
        <CommitsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          date={selectedDate}
          viewMode={viewMode}
          userId={userId}
        />
      )}
    </div>
  );
}

