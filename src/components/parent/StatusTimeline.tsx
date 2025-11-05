"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Player } from "@/types/supabase";
import toast from "react-hot-toast";
import { devLog, devError } from "@/lib/security";

interface StatusTimelineProps {
  playerId: string;
  initialStatus?: Player["status"];
}

type StatusStep = {
  status: Player["status"];
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
};

const STATUS_CONFIG: Record<string, StatusStep> = {
  pending: {
    status: "pending",
    label: "Pending Review",
    description:
      "Your registration has been received and is awaiting our review.",
    icon: "⏳",
    color: "text-amber-400",
    bgColor: "bg-amber-900/20",
  },
  on_hold: {
    status: "on_hold",
    label: "On Hold",
    description:
      "We need additional information or action from you before we can proceed.",
    icon: "⏸️",
    color: "text-yellow-300",
    bgColor: "bg-yellow-900/20",
  },
  approved: {
    status: "approved",
    label: "Approved",
    description:
      "Your registration has been approved. You're almost ready to go!",
    icon: "✅",
    color: "text-emerald-400",
    bgColor: "bg-emerald-900/20",
  },
  rejected: {
    status: "rejected",
    label: "Rejected",
    description:
      "Unfortunately, your registration was not approved. See details below.",
    icon: "❌",
    color: "text-red-400",
    bgColor: "bg-red-900/20",
  },
  active: {
    status: "active",
    label: "Active",
    description:
      "You're fully registered and active! Check your team updates regularly.",
    icon: "🔥",
    color: "text-cyan-300",
    bgColor: "bg-cyan-900/20",
  },
};

const STATUS_ORDER: Player["status"][] = [
  "pending",
  "on_hold",
  "approved",
  "rejected",
  "active",
];

export default function StatusTimeline({
  playerId,
  initialStatus = "pending",
}: StatusTimelineProps) {
  const [currentStatus, setCurrentStatus] =
    useState<Player["status"]>(initialStatus);
  const [player, setPlayer] = useState<Player | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Get status index for ordering
  const getStatusIndex = (status: Player["status"]) => {
    return STATUS_ORDER.indexOf(status);
  };

  // Check if status is completed (works with dynamic display steps)
  const isStatusCompleted = (stepStatus: Player["status"]) => {
    // If rejected or on_hold, only show pending and the status itself
    if (currentStatus === "rejected" || currentStatus === "on_hold") {
      // In this case, pending is completed (past), and rejected/on_hold is current
      return stepStatus === "pending";
    }

    // Normal flow: pending < approved < active
    if (stepStatus === "pending") return true; // Always completed
    if (stepStatus === "approved") {
      return currentStatus === "approved" || currentStatus === "active";
    }
    if (stepStatus === "active") {
      return currentStatus === "active";
    }

    return false;
  };

  // Determine which steps to display based on current status
  const getDisplaySteps = (): StatusStep[] => {
    const baseSteps: Player["status"][] = ["pending", "approved", "active"];

    // If rejected or on_hold, replace approved and remove active
    if (currentStatus === "rejected" || currentStatus === "on_hold") {
      return [
        STATUS_CONFIG.pending,
        STATUS_CONFIG[currentStatus], // Replace approved with rejected/on_hold
      ];
    }

    // Normal flow: pending, approved, active
    return baseSteps.map(
      (status) => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    );
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!playerId) return;

    const channel = supabase
      .channel("player-status-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `id=eq.${playerId}`,
        },
        async (payload) => {
          try {
            devLog("Realtime: players change", payload);
            const updatedPlayer = payload.new as Player;
            setPlayer(updatedPlayer);

            const newStatus = updatedPlayer.status;
            if (newStatus !== currentStatus) {
              setCurrentStatus(newStatus);
              setLastUpdate(new Date());

              // Show toast notification
              const statusConfig =
                STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG];
              if (statusConfig) {
                toast.success(`Status updated: ${statusConfig.label}`, {
                  icon: statusConfig.icon,
                  duration: 5000,
                });
              }

              // Log to Sentry
              if (typeof window !== "undefined" && (window as any).Sentry) {
                (window as any).Sentry.captureEvent({
                  message: "Player Status Changed",
                  level: "info",
                  tags: {
                    player_id: playerId,
                    old_status: currentStatus,
                    new_status: newStatus,
                  },
                });
              }
            }
          } catch (err) {
            devError("Realtime handler error", err);
          }
        }
      )
      .subscribe();

    // Initial fetch of player data
    (async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .eq("id", playerId)
          .single();

        if (error) throw error;
        if (data) {
          setPlayer(data as Player);
          setCurrentStatus((data as Player).status);
        }
      } catch (err) {
        devError("Initial player fetch error", err);
      }
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId]);

  useEffect(() => {
    if (!playerId) return;

    // Update lastUpdate when current status changes
    setLastUpdate(new Date());
  }, [currentStatus, playerId]);

  // Determine steps to display based on current status
  const steps = getDisplaySteps();

  return (
    <div
      className="w-full rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/60 p-4 sm:p-5 shadow-2xl ring-1 ring-white/5 relative overflow-hidden"
      role="region"
      aria-labelledby="status-timeline-title"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          id="status-timeline-title"
          className="text-lg sm:text-xl font-bebas text-white uppercase"
        >
          Registration Status
        </h3>
        {lastUpdate && (
          <span
            className="text-xs text-gray-400"
            aria-label={`Last updated at ${lastUpdate.toLocaleTimeString()}`}
          >
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Timeline Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {steps.map((step, index) => {
          const isCurrent = step.status === currentStatus;
          const isCompleted = isStatusCompleted(step.status);

          return (
            <div
              key={step.status}
              className={`relative rounded-lg p-3 sm:p-4 transition-all duration-300 border ${
                isCurrent
                  ? "bg-slate-800/40 border-cyan-300/40 shadow-[0_0_0_1px_rgba(0,229,255,0.2),0_10px_30px_rgba(0,229,255,0.08)_inset]"
                  : isCompleted
                  ? "bg-slate-800/20 border-white/10"
                  : "bg-slate-900/30 border-white/5"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Content Row */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon Circle */}
                <div
                  className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center ${
                    isCompleted ? step.bgColor : "bg-slate-800"
                  } border border-white/10`}
                  role="img"
                  aria-label={`${step.label} ${
                    isCompleted ? "completed" : "pending"
                  } status`}
                >
                  <span
                    className={isCompleted ? step.color : "text-gray-400"}
                    aria-hidden="true"
                  >
                    {step.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`
                          font-semibold text-sm sm:text-base mb-1
                          ${isCompleted ? "text-gray-300" : "text-gray-400"}
                        `}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Additional info for rejected status */}
                  {step.status === "rejected" && player?.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
                      <strong className="block mb-1">Reason</strong>
                      <p className="whitespace-pre-wrap">
                        {player.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer meta (optional) */}
              {isCurrent && (
                <div className="mt-3 text-[11px] sm:text-xs text-cyan-200/80">
                  This is your current status.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current status footer pill */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs sm:text-sm text-gray-400">
          Current status:
          <span
            className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30"
            aria-live="polite"
          >
            {STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG]
              ?.label || currentStatus}
          </span>
          {player?.rejected_at && (
            <span className="block mt-1 text-xs text-gray-400">
              Rejected on {new Date(player.rejected_at).toLocaleDateString()}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
