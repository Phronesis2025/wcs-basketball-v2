// src/lib/uptime-robot.ts
"use server";

import { devLog, devError } from "./security";

export interface UptimeRobotMonitor {
  id: string;
  friendly_name: string;
  url: string;
  type: number;
  status: number; // 0 = paused, 1 = not checked yet, 2 = up, 8 = seems down, 9 = down
  uptime_ratio: number; // Percentage (e.g., 99.5)
}

export interface UptimeRobotResponse {
  stat: "ok" | "fail";
  monitors?: UptimeRobotMonitor[];
  error?: {
    type: string;
    message: string;
  };
}

/**
 * Fetch uptime data from UptimeRobot API
 * @param apiKey UptimeRobot API key (from environment variable)
 * @returns Average uptime percentage across all monitors
 */
export async function fetchUptimeRobotData(
  apiKey?: string
): Promise<{ uptime: number; monitors: number }> {
  try {
    const apiKeyToUse = apiKey || process.env.UPTIMEROBOT_API_KEY;

    if (!apiKeyToUse) {
      devLog("UptimeRobot API key not configured - using placeholder");
      return { uptime: 99.9, monitors: 0 };
    }

    // UptimeRobot API endpoint
    const url = "https://api.uptimerobot.com/v2/getMonitors";

    const formData = new URLSearchParams();
    formData.append("api_key", apiKeyToUse);
    formData.append("format", "json");
    formData.append("statuses", "2-9"); // Only active monitors (up, down, etc.)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      devError("UptimeRobot API error:", response.status, response.statusText);
      return { uptime: 99.9, monitors: 0 };
    }

    const data: UptimeRobotResponse = await response.json();

    if (data.stat !== "ok" || !data.monitors) {
      devError("UptimeRobot API returned error:", data.error?.message || "Unknown error");
      return { uptime: 99.9, monitors: 0 };
    }

    // Calculate average uptime across all monitors
    const activeMonitors = data.monitors.filter(
      (monitor) => monitor.status !== 0 && monitor.status !== 1
    );

    if (activeMonitors.length === 0) {
      return { uptime: 99.9, monitors: 0 };
    }

    const totalUptime = activeMonitors.reduce(
      (sum, monitor) => sum + (monitor.uptime_ratio || 0),
      0
    );
    const averageUptime = totalUptime / activeMonitors.length;

    devLog(
      `UptimeRobot: ${activeMonitors.length} active monitors, average uptime: ${averageUptime.toFixed(2)}%`
    );

    return {
      uptime: Math.round(averageUptime * 10) / 10, // Round to 1 decimal place
      monitors: activeMonitors.length,
    };
  } catch (err) {
    devError("Failed to fetch UptimeRobot data:", err);
    return { uptime: 99.9, monitors: 0 };
  }
}

