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
    description: "Your registration is being reviewed",
    icon: "⏳",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20 border-yellow-400/50",
  },
  on_hold: {
    status: "on_hold",
    label: "On Hold",
    description: "Registration is temporarily on hold",
    icon: "⏸️",
    color: "text-orange-400",
    bgColor: "bg-orange-400/20 border-orange-400/50",
  },
  approved: {
    status: "approved",
    label: "Approved",
    description: "Player has been assigned to a team",
    icon: "✅",
    color: "text-green-400",
    bgColor: "bg-green-400/20 border-green-400/50",
  },
  rejected: {
    status: "rejected",
    label: "Rejected",
    description: "Registration was not approved",
    icon: "❌",
    color: "text-red-400",
    bgColor: "bg-red-400/20 border-red-400/50",
  },
  active: {
    status: "active",
    label: "Active",
    description: "Player is enrolled and active",
    icon: "🏀",
    color: "text-blue-400",
    bgColor: "bg-blue-400/20 border-blue-400/50",
  },
};

const STATUS_ORDER: Player["status"][] = ["pending", "on_hold", "approved", "rejected", "active"];

export default function StatusTimeline({ playerId, initialStatus = "pending" }: StatusTimelineProps) {
  const [currentStatus, setCurrentStatus] = useState<Player["status"]>(initialStatus);
  const [player, setPlayer] = useState<Player | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Get status index for ordering
  const getStatusIndex = (status: Player["status"]) => {
    return STATUS_ORDER.indexOf(status);
  };

  // Check if status is completed
  const isStatusCompleted = (status: Player["status"]) => {
    return getStatusIndex(status) <= getStatusIndex(currentStatus);
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!playerId) return;

    // Initial fetch
    const fetchPlayer = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .single();

      if (error) {
        devError("StatusTimeline: Fetch error", error);
        return;
      }

      if (data) {
        setPlayer(data as Player);
        setCurrentStatus(data.status || "pending");
        if (data.updated_at) {
          setLastUpdate(new Date(data.updated_at));
        }
      }
    };

    fetchPlayer();

    // Subscribe to changes
    const channel = supabase
      .channel(`player-status-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "players",
          filter: `id=eq.${playerId}`,
        },
        (payload) => {
          devLog("StatusTimeline: Status changed", payload.new);
          const updatedPlayer = payload.new as Player;
          setPlayer(updatedPlayer);
          const newStatus = updatedPlayer.status || "pending";
          
          if (newStatus !== currentStatus) {
            setCurrentStatus(newStatus);
            setLastUpdate(new Date());
            
            // Show toast notification
            const statusConfig = STATUS_CONFIG[newStatus];
            if (statusConfig) {
              toast.success(
                `Status updated: ${statusConfig.label}`,
                {
                  icon: statusConfig.icon,
                  duration: 5000,
                }
              );
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playerId, currentStatus]);

  // Get status steps in order - only show relevant statuses
  const getRelevantSteps = (): StatusStep[] => {
    // Normal flow: pending -> approved -> active
    const normalFlow: Player["status"][] = ["pending", "approved", "active"];
    
    // If status is on_hold or rejected, show those in the appropriate position
    if (currentStatus === "on_hold") {
      // Show: pending -> on_hold
      return ["pending", "on_hold"]
        .map((status) => STATUS_CONFIG[status])
        .filter(Boolean);
    } else if (currentStatus === "rejected") {
      // Show: pending -> rejected
      return ["pending", "rejected"]
        .map((status) => STATUS_CONFIG[status])
        .filter(Boolean);
    } else {
      // Normal flow - show up to current status
      const currentIndex = normalFlow.indexOf(currentStatus);
      const statusesToShow = normalFlow.slice(0, currentIndex + 1);
      
      return statusesToShow
        .map((status) => STATUS_CONFIG[status])
        .filter(Boolean);
    }
  };

  const steps = getRelevantSteps();
  const currentStepIndex = steps.findIndex((s) => s.status === currentStatus);

  return (
    <div className="w-full" role="region" aria-labelledby="status-timeline-title" aria-live="polite">
      {/* SVG Filter for Electric Border */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="turbulent-displace" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise1" seed="1" />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise2" seed="1" />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise3" seed="2" />
            <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
              <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="10" result="noise4" seed="2" />
            <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
              <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

            <feDisplacementMap in="SourceGraphic" in2="combinedNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </defs>
      </svg>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 id="status-timeline-title" className="text-lg sm:text-xl font-bebas text-white uppercase">
          Registration Status
        </h3>
        {lastUpdate && (
          <span className="text-xs text-gray-400" aria-label={`Last updated at ${lastUpdate.toLocaleTimeString()}`}>
            Updated {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Timeline Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {steps.map((step, index) => {
          const isCurrent = step.status === currentStatus;
          const isCompleted = getStatusIndex(step.status) < getStatusIndex(currentStatus);
          
          // Determine border color for active card - use status color or default to orange/red
          const electricColor = isCurrent 
            ? (step.status === "approved" ? "#10b981" : step.status === "pending" ? "#fbbf24" : step.status === "active" ? "#3b82f6" : "#dd8448")
            : null;

          return (
            <div
              key={step.status}
              className={`
                relative rounded-lg transition-all duration-300
                ${isCurrent 
                  ? "p-[2px]" 
                  : "p-4 sm:p-5"
                }
                ${isCompleted && !isCurrent
                  ? "bg-gray-800/40 border-2 border-gray-600/50 opacity-70"
                  : !isCurrent
                  ? "bg-gray-800/50 border-2 border-gray-700/50"
                  : ""
                }
                ${isCurrent ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900" : ""}
              `}
            >
              {/* Card Content - Must render first (behind border) */}
              <div className={`
                relative rounded-lg
                ${isCurrent ? "bg-gray-900 p-4 sm:p-5 -mt-[4px] -ml-[4px]" : "p-4 sm:p-5"}
              `}>
                  {/* Icon */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`
                        flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl
                        ${isCompleted ? step.bgColor : "bg-gray-700"}
                        transition-all duration-300
                      `}
                      role="img"
                      aria-label={`${step.label} ${isCompleted ? "completed" : "pending"} status`}
                    >
                      <span className={isCompleted ? step.color : "text-gray-400"} aria-hidden="true">
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
                          <strong>Reason:</strong> {player.rejection_reason}
                        </div>
                      )}

                      {/* Additional info for on_hold status */}
                      {step.status === "on_hold" && (
                        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded text-xs text-orange-300">
                          Waiting for additional review
                        </div>
                      )}

                      {/* Show payment link for approved status */}
                      {step.status === "approved" && isCurrent && (
                        <div className="mt-3">
                          <a
                            href={`/checkout/${playerId}`}
                            className="inline-block bg-red text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded hover:bg-red/90 transition-colors"
                          >
                            Complete Registration & Payment →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              
              {/* Electric Border Container for Active Card - Must be on top */}
              {isCurrent && (
                <>
                  {/* Background Glow - Behind everything */}
                  <div 
                    className="absolute inset-0 rounded-lg blur-[32px] scale-110 opacity-30 -z-10"
                    style={{
                      background: `linear-gradient(-30deg, ${electricColor}88, transparent, ${electricColor}88)`
                    }}
                  />
                  
                  {/* Border Outer - matches reference structure */}
                  <div 
                    className="absolute inset-0 rounded-lg border-2 pointer-events-none z-20"
                    style={{
                      borderColor: `${electricColor}80`,
                      paddingRight: '4px',
                      paddingBottom: '4px'
                    }}
                  >
                    {/* Glow Layer 1 */}
                    <div 
                      className="absolute inset-0 rounded-lg border-2"
                      style={{
                        borderColor: `${electricColor}99`,
                        filter: 'blur(1px)'
                      }}
                    />
                    
                    {/* Glow Layer 2 */}
                    <div 
                      className="absolute inset-0 rounded-lg border-2"
                      style={{
                        borderColor: electricColor,
                        filter: 'blur(4px)'
                      }}
                    />
                  </div>
                  
                  {/* Main Border with Electric Filter - TOP LAYER */}
                  <div 
                    className="absolute inset-0 rounded-lg border-2 pointer-events-none z-30"
                    style={{
                      borderColor: electricColor,
                      filter: 'url(#turbulent-displace)',
                      marginTop: '-4px',
                      marginLeft: '-4px'
                    }}
                  />
                  
                  {/* Overlay 1 */}
                  <div 
                    className="absolute inset-0 rounded-lg opacity-100 mix-blend-overlay scale-110 blur-2xl pointer-events-none z-10"
                    style={{
                      background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)'
                    }}
                  />
                  
                  {/* Overlay 2 */}
                  <div 
                    className="absolute inset-0 rounded-lg opacity-50 mix-blend-overlay scale-110 blur-2xl pointer-events-none z-10"
                    style={{
                      background: 'linear-gradient(-30deg, white, transparent 30%, transparent 70%, white)'
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Summary */}
      <div className="mt-4 p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-sm sm:text-base text-gray-300">
          <strong className="text-white">Current Status:</strong>{" "}
          <span className={STATUS_CONFIG[currentStatus]?.color || "text-white font-semibold"}>
            {STATUS_CONFIG[currentStatus]?.label || currentStatus}
          </span>
          {player?.rejected_at && (
            <span className="block mt-1 text-xs text-gray-400">
              Rejected on {new Date(player.rejected_at).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

