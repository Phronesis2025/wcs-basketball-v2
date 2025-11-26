"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Player, Payment } from "@/types/supabase";
import { devError } from "@/lib/security";

function PaymentSelectContent() {
  const router = useRouter();
  const search = useSearchParams();
  const initialPlayerId = search?.get("playerId") || "";
  const from = search?.get("from") || "invoice";

  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] =
    useState<string>(initialPlayerId);
  const [paymentType, setPaymentType] = useState<
    "annual" | "monthly" | "quarterly" | "custom"
  >("annual");
  const [customAmount, setCustomAmount] = useState("");
  const [quarterlyFee, setQuarterlyFee] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const annualFee = useMemo(
    () => Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360),
    []
  );

  // Fetch quarterly price
  useEffect(() => {
    const fetchQuarterlyPrice = async () => {
      try {
        const response = await fetch("/api/get-price?type=quarterly");
        if (response.ok) {
          const data = await response.json();
          if (data.amount) {
            setQuarterlyFee(data.amount);
          }
        }
      } catch (error) {
        devError("Failed to fetch quarterly price", error);
      }
    };
    fetchQuarterlyPrice();
  }, []);

  // Load players for the parent
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);

        if (!initialPlayerId) {
          setError("No player ID provided");
          setLoading(false);
          return;
        }

        // Get the parent from the initial player
        const { data: initialPlayer, error: playerError } = await supabase
          .from("players")
          .select("parent_id, parent_email")
          .eq("id", initialPlayerId)
          .single();

        if (playerError || !initialPlayer) {
          setError("Player not found");
          setLoading(false);
          return;
        }

        // Fetch all children for this parent
        const { data: children, error: childrenError } = await supabase
          .from("players")
          .select("*")
          .eq("parent_id", initialPlayer.parent_id)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });

        if (childrenError) {
          devError("Failed to fetch children", childrenError);
          setError("Failed to load players");
          setLoading(false);
          return;
        }

        if (children && children.length > 0) {
          // Filter out players that are not approved or active
          // Only allow payment for approved/active players
          const approvedPlayers = children.filter((p) => {
            const status = (p.status || "").toString().toLowerCase();
            return status === "approved" || status === "active";
          }) as Player[];

          if (approvedPlayers.length === 0) {
            setError(
              "No approved players found. Players must be approved before payment."
            );
            setLoading(false);
            return;
          }

          setPlayers(approvedPlayers);
          // If initial player is in the approved list, select it; otherwise select first approved
          if (approvedPlayers.some((p) => p.id === initialPlayerId)) {
            setSelectedPlayerId(initialPlayerId);
          } else {
            setSelectedPlayerId(approvedPlayers[0].id);
          }

          // Fetch payments for all children via parent profile API
          // This is needed to calculate remaining balances
          try {
            if (initialPlayer.parent_email) {
              const profileResp = await fetch(
                `/api/parent/profile?email=${encodeURIComponent(
                  initialPlayer.parent_email
                )}`,
                { cache: "no-store" }
              );
              if (profileResp.ok) {
                const profileJson = await profileResp.json();
                if (Array.isArray(profileJson.payments)) {
                  setPayments(profileJson.payments as Payment[]);
                } else {
                  setPayments([]);
                }
              } else {
                setPayments([]);
              }
            } else {
              setPayments([]);
            }
          } catch (err) {
            devError("Failed to fetch payments", err);
            setPayments([]);
          }
        } else {
          setError("No players found");
        }
      } catch (error) {
        devError("Error loading players", error);
        setError("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [initialPlayerId]);

  const handleProceedToCheckout = async () => {
    if (!selectedPlayerId) {
      setError("Please select a player");
      return;
    }

    if (
      paymentType === "custom" &&
      (!customAmount || Number(customAmount) < 0.5)
    ) {
      setError("Custom amount must be at least $0.50");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_id: selectedPlayerId,
          payment_type: paymentType,
          custom_amount:
            paymentType === "custom" ? Number(customAmount || 0) : undefined,
          from: from,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      devError("Checkout error", err);
      setError(
        err.message || "Failed to proceed to checkout. Please try again."
      );
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate remaining balance for each player (what's left due, not the total)
  const getRemainingForPlayer = (playerId: string) => {
    const isPaid = (status: string | null | undefined) => {
      const s = (status || "").toString().toLowerCase();
      return s === "paid" || s === "succeeded" || s.includes("paid");
    };

    // Filter payments for this specific player
    const playerPayments = (payments || []).filter(
      (p) => p.player_id === playerId
    );

    // Sum all paid payments for this player
    const totalPaid = playerPayments
      .filter((p) => isPaid(p.status))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Return remaining balance: annual fee minus what's been paid
    // This is what's LEFT DUE, not the total
    return Math.max(annualFee - totalPaid, 0);
  };

  if (loading) {
    return (
      <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !players.length) {
    return (
      <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-lg text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bebas uppercase mb-8 text-center">
          Select Payment
        </h1>

        {/* Player Selection */}
        {players.length > 1 && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bebas uppercase mb-4">Select Player</h2>
            <div className="space-y-3">
              {players.map((player) => {
                const remaining = getRemainingForPlayer(player.id);
                return (
                  <label
                    key={player.id}
                    className="flex items-center justify-between gap-3 p-3 rounded hover:bg-gray-800/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="player"
                        checked={selectedPlayerId === player.id}
                        onChange={() => setSelectedPlayerId(player.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-lg">{player.name}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-300">
                      {formatCurrency(remaining)} due
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Payment Type Selection */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bebas uppercase mb-4">Choose Payment</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded hover:bg-gray-800/50 cursor-pointer">
              <input
                type="radio"
                name="plan"
                checked={paymentType === "annual"}
                onChange={() => setPaymentType("annual")}
                className="w-4 h-4"
              />
              <span className="text-lg">
                Annual – {formatCurrency(annualFee)}
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded hover:bg-gray-800/50 cursor-pointer">
              <input
                type="radio"
                name="plan"
                checked={paymentType === "monthly"}
                onChange={() => setPaymentType("monthly")}
                className="w-4 h-4"
              />
              <span className="text-lg">Monthly – $30</span>
            </label>
            {quarterlyFee !== null && (
              <label className="flex items-center gap-3 p-3 rounded hover:bg-gray-800/50 cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  checked={paymentType === "quarterly"}
                  onChange={() => setPaymentType("quarterly")}
                  className="w-4 h-4"
                />
                <span className="text-lg">
                  Quarterly – {formatCurrency(quarterlyFee)}
                </span>
              </label>
            )}
            <label className="flex items-center gap-3 p-3 rounded hover:bg-gray-800/50 cursor-pointer">
              <input
                type="radio"
                name="plan"
                checked={paymentType === "custom"}
                onChange={() => setPaymentType("custom")}
                className="w-4 h-4"
              />
              <span className="text-lg">Custom</span>
              <input
                className="ml-2 border border-gray-600 bg-gray-800 text-white rounded px-3 py-2 w-32"
                type="number"
                step="0.01"
                min="0.5"
                placeholder="$0.00"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                disabled={paymentType !== "custom"}
              />
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/40 border border-red-500/40 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition font-medium"
            disabled={processing}
          >
            Back
          </button>
          <button
            onClick={handleProceedToCheckout}
            disabled={processing}
            className="flex-1 px-6 py-3 bg-red text-white font-bold rounded hover:bg-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSelectPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentSelectContent />
    </Suspense>
  );
}
