"use client";

import { useEffect, useState } from "react";
import { Player } from "@/types/supabase";
import { fetchTeamById } from "@/lib/actions";

interface ChildDetailsCardProps {
  child: Player;
}

export default function ChildDetailsCard({ child }: ChildDetailsCardProps) {
  const [teamLogoUrl, setTeamLogoUrl] = useState<string>(
    "/apple-touch-icon.png"
  );
  const [teamName, setTeamName] = useState<string>("");
  const [coachNames, setCoachNames] = useState<string[]>([]);
  const [showBilling, setShowBilling] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const annualFee = Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360);

  useEffect(() => {
    let isMounted = true;
    const loadTeamLogo = async () => {
      try {
        if (child.team_id) {
          const team = await fetchTeamById(child.team_id);
          if (isMounted && team) {
            setTeamLogoUrl(team.logo_url || "/apple-touch-icon.png");
            setTeamName(team.name || "");
            const names = Array.isArray((team as any).coach_names)
              ? (team as any).coach_names.filter(Boolean)
              : [];
            setCoachNames(names);
          } else if (isMounted) {
            setTeamLogoUrl("/apple-touch-icon.png");
            setTeamName("");
            setCoachNames([]);
          }
        } else if (isMounted) {
          setTeamLogoUrl("/apple-touch-icon.png");
          setTeamName("");
          setCoachNames([]);
        }
      } catch {
        if (isMounted) {
          setTeamLogoUrl("/apple-touch-icon.png");
          setTeamName("");
          setCoachNames([]);
        }
      }
    };
    loadTeamLogo();
    return () => {
      isMounted = false;
    };
  }, [child.team_id]);

  const calculateAge = (birthdate: string | null) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = calculateAge(child.date_of_birth);

  const getStatusColor = () => {
    switch (child.status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = () => {
    switch (child.status) {
      case "active":
        return "Active";
      case "approved":
        return "Approved";
      default:
        return "Pending";
    }
  };

  const isApproved = () => {
    const s = (child.status || "").toLowerCase();
    return s === "approved" || s === "active";
  };

  const isPaid = (s?: string) =>
    (s || "").toLowerCase() === "paid" ||
    (s || "").toLowerCase() === "succeeded";
  const totalPaid = payments
    .filter((p) => isPaid(p.status))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remaining = Math.max(annualFee - totalPaid, 0);

  // Check if player is both approved AND has at least one successful payment
  const isApprovedAndPaid = () => {
    const approved = isApproved();
    const hasPaid = payments.some((p) => isPaid(p.status));
    return approved && hasPaid;
  };

  const loadBilling = async () => {
    setLoadingBilling(true);
    try {
      const resp = await fetch(`/api/player/payments/${child.id}`, {
        cache: "no-store",
      });
      if (resp.ok) {
        const json = await resp.json();
        setPayments(json.payments || []);
      }
    } finally {
      setLoadingBilling(false);
    }
  };

  // Preload once so the badge is accurate
  useEffect(() => {
    if (payments.length === 0 && !loadingBilling) {
      loadBilling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child.id]);

  useEffect(() => {
    if (showBilling && payments.length === 0 && !loadingBilling) {
      loadBilling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBilling]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 relative">
      {/* Card-level due badge (only show if approved and paid) */}
      {isApprovedAndPaid() && (
        <span
          className={`absolute top-2 right-2 rounded-full text-[10px] sm:text-xs px-2 py-0.5 font-semibold ${
            remaining > 0 ? "bg-red text-white" : "bg-green-600 text-white"
          }`}
        >
          {remaining > 0
            ? `Due ${new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(remaining)}`
            : "Due $0"}
        </span>
      )}
      {/* Top logo */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 sm:border-4 border-gray-200 shadow-md mx-auto flex items-center justify-center overflow-hidden relative">
        <img
          src={teamLogoUrl}
          alt="Team logo"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/apple-touch-icon.png";
          }}
        />
        {/* (badge moved to card top-right) */}
      </div>

      {/* Name */}
      <h2 className="text-l sm:text-2xl md:text-2xl lg:text-xl font-extrabold text-center text-gray-900 mt-3">
        {child.name}
      </h2>

      {/* Subline */}
      <p className="text-center text-gray-500 mt-1 text-xs sm:text-sm md:text-sm lg:text-xs">
        {child.gender || ""}
        {child.grade ? ` • Grade ${child.grade}` : ""}
        {age ? ` • Age ${age}` : ""}
      </p>

      {/* Status pill */}
      <div className="flex justify-center mt-3 sm:mt-4">
        <span
          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm md:text-xs font-semibold ${getStatusColor()}`}
        >
          {getStatusLabel()}
        </span>
      </div>

      {/* Info rows */}
      <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3 text-[11px] sm:text-sm md:text-sm lg:text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500 whitespace-nowrap">Team:</span>
          <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
            {child.team_id ? teamName || "Assigned" : "Not Assigned Yet"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500 whitespace-nowrap">Coach:</span>
          <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
            {child.team_id
              ? coachNames.length > 0
                ? coachNames.join(", ")
                : "Not Assigned Yet"
              : "Not Assigned Yet"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 whitespace-nowrap">
            Jersey<span className="hidden sm:inline"> Number</span>
          </span>
          <span className="font-semibold text-gray-900 whitespace-nowrap">
            {child.jersey_number || "Not Assigned"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 whitespace-nowrap">Birthdate</span>
          <span className="font-semibold text-gray-900 whitespace-nowrap">
            {child.date_of_birth
              ? (() => {
                  const [year, month, day] = child.date_of_birth.split("-");
                  const date = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                  );
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                })()
              : "Not provided"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 whitespace-nowrap">Waiver Signed</span>
          <span className="font-semibold text-green-600 whitespace-nowrap">
            {child.waiver_signed ? "✅ Yes" : "❌ No"}
          </span>
        </div>
      </div>

      {/* Billing toggle - only show if approved and paid */}
      {isApprovedAndPaid() ? (
        <div className="mt-4">
          <button
            className="w-full bg-gray-800 text-white rounded py-2 hover:bg-gray-700"
            onClick={() => setShowBilling((v) => !v)}
          >
            {showBilling ? "Hide Invoice" : "View Invoice"}
          </button>

          {showBilling && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
              {loadingBilling ? (
                <p className="text-gray-600 text-sm">Loading billing...</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Remaining</p>
                      <p className="font-semibold text-gray-900">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(remaining)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Paid</p>
                      <p className="font-semibold text-gray-900">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(totalPaid)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    {isApproved() && remaining > 0 && (
                      <a
                        href={`/payment/${child.id}?custom=${remaining.toFixed(
                          2
                        )}&from=billing`}
                        className="px-4 py-2 bg-red text-white rounded hover:bg-red/90"
                      >
                        Pay
                      </a>
                    )}
                    <a
                      href={`/payment/${child.id}`}
                      className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                      View full invoice
                    </a>
                  </div>

                  <div className="mt-3">
                    <p className="text-gray-500 text-xs mb-1">
                      Recent activity
                    </p>
                    <ul className="text-sm text-gray-900 space-y-1">
                      {payments.slice(0, 2).map((p) => (
                        <li key={p.id} className="flex justify-between">
                          <span>
                            {new Date(p.created_at).toLocaleDateString()} ·{" "}
                            {p.payment_type}
                          </span>
                          <span>
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(p.amount)}
                          </span>
                        </li>
                      ))}
                      {payments.length === 0 && (
                        <li className="text-gray-500">No activity yet</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 text-center">
            {!isApproved()
              ? "⏳ Awaiting admin approval. Payment information will be available after approval."
              : "⏳ Payment information will be available after your first payment."}
          </p>
        </div>
      )}
    </div>
  );
}
