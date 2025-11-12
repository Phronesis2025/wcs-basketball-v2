"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchTeamById } from "@/lib/actions";
import type { Player, Payment, Parent } from "@/types/supabase";
import { devError } from "@/lib/security";
import BasketballProgressModal from "@/components/ui/BasketballProgressModal";

export default function PaymentPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const source = search?.get("from") || undefined;
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [teamLogoUrl, setTeamLogoUrl] = useState<string | null>(null);
  const [hasMultipleTeams, setHasMultipleTeams] = useState<boolean>(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [parent, setParent] = useState<Parent | null>(null);
  const [allChildren, setAllChildren] = useState<Player[]>([]);
  const [quarterlyFee, setQuarterlyFee] = useState<number | null>(null);
  const annualFee = useMemo(
    () => Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360),
    []
  );

  // Fetch quarterly price on component mount (needed for payment history display)
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
        // If endpoint doesn't exist or fails, silently fail
        devError("Failed to fetch quarterly price", error);
      }
    };
    fetchQuarterlyPrice();
  }, []);

  // Hide navbar when in print mode
  useEffect(() => {
    const isPrint = (search?.get("print") || "").toLowerCase() === "1";
    if (isPrint) {
      document.body.classList.add("print-mode");
      // Also hide navbar with CSS
      const style = document.createElement("style");
      style.textContent = `
        .print-mode nav,
        .print-mode header nav,
        nav[data-print-hide="true"] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.body.classList.remove("print-mode");
        document.head.removeChild(style);
      };
    }
  }, [search]);

  // Load player, team, parent, and payments
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Player
        const { data: playerData, error: pErr } = await supabase
          .from("players")
          .select("*")
          .eq("id", playerId)
          .single();
        if (!pErr && playerData) {
          setPlayer(playerData as Player);

          // Load parent information and all children
          if (playerData.parent_id) {
            const { data: parentRecord, error: parentErr } = await supabase
              .from("parents")
              .select("*")
              .eq("id", playerData.parent_id)
              .single();
            if (!parentErr && parentRecord) {
              setParent(parentRecord as Parent);
            }

            // Fetch all children for this parent
            const { data: childrenData, error: childrenErr } = await supabase
              .from("players")
              .select("*")
              .eq("parent_id", playerData.parent_id)
              .eq("is_deleted", false);
            if (!childrenErr && childrenData) {
              setAllChildren(childrenData as Player[]);

              // Check if children are on multiple teams
              const teamIds = childrenData
                .map((c: any) => c.team_id)
                .filter((id: string | null) => id !== null);
              const uniqueTeamIds = new Set(teamIds);
              setHasMultipleTeams(uniqueTeamIds.size > 1);
            }

            // Resolve parent email for server API calls (prefer playerData.parent_email)
            const parentEmailForProfile =
              (playerData as any).parent_email ||
              (parentRecord as any)?.email ||
              null;

            // Check if checkout is completed
            const parentResp = await fetch(
              `/api/parent/checkout-status?parent_id=${playerData.parent_id}`
            );
            if (parentResp.ok) {
              const checkoutStatus = await parentResp.json();
              if (!checkoutStatus.checkout_completed) {
                router.push(`/checkout/${playerId}`);
                return;
              }
            }

            // Fetch all payments for this parent via server (uses admin key; avoids RLS limitations)
            try {
              if (parentEmailForProfile) {
                const profileResp = await fetch(
                  `/api/parent/profile?email=${encodeURIComponent(
                    parentEmailForProfile
                  )}`,
                  { cache: "no-store" }
                );
                if (profileResp.ok) {
                  const profileJson = await profileResp.json();
                  // Prefer server-provided children/payments to ensure completeness
                  if (
                    Array.isArray(profileJson.children) &&
                    profileJson.children.length > 0
                  ) {
                    setAllChildren(profileJson.children as Player[]);
                  }
                  if (Array.isArray(profileJson.payments)) {
                    // payments already include player_name
                    setPayments(profileJson.payments as Payment[]);
                  } else {
                    setPayments([]);
                  }
                } else {
                  // server call failed; keep whatever we already have
                }
              }
            } catch (err) {
              // Non-fatal; keep page rendering
              devError(
                "invoice: failed to fetch payments via profile API",
                err
              );
            }
          } else {
            // Fallback: fetch payments for just this player if no parent
            const resp = await fetch(`/api/player/payments/${playerId}`, {
              cache: "no-store",
            });
            if (resp.ok) {
              const json = await resp.json();
              setPayments((json.payments || []) as Payment[]);
            } else {
              setPayments([]);
            }
          }

          // Team
          if (playerData.team_id) {
            try {
              const t = await fetchTeamById(playerData.team_id);
              if (t?.name) setTeamName(t.name);
              if (t?.logo_url) setTeamLogoUrl(t.logo_url);
            } catch {}
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [playerId, router]);

  // Derived amounts
  const isPaid = (status: string | null | undefined) => {
    const s = (status || "").toString().toLowerCase();
    return s === "paid" || s === "succeeded" || s.includes("paid");
  };

  // Calculate total paid across all children
  const totalPaid = useMemo(
    () =>
      (payments || [])
        .filter((p) => isPaid(p.status))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [payments]
  );

  // Calculate total amount due (sum of annual fees for all children)
  const totalAmountDue = useMemo(
    () => (allChildren.length > 0 ? allChildren.length : 1) * annualFee,
    [allChildren.length, annualFee]
  );

  // Calculate remaining balance (total due minus total paid across all children)
  const remaining = Math.max(totalAmountDue - totalPaid, 0);
  const lastPaidAt = useMemo(() => {
    const paid = (payments || []).filter((p) => isPaid(p.status));
    if (paid.length === 0) return null;
    return paid
      .map((p) => new Date(p.created_at))
      .sort((a, b) => b.getTime() - a.getTime())[0];
  }, [payments]);
  const hasAnyPaid = useMemo(
    () => (payments || []).some((p) => isPaid(p.status)),
    [payments]
  );
  const nextDueDate = useMemo(() => {
    const base = lastPaidAt
      ? lastPaidAt
      : player
      ? new Date(player.created_at)
      : null;
    if (!base) return null;
    return new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
  }, [lastPaidAt, player]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  const formatDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";
  const formatDateShort = (d: Date | null) =>
    d
      ? d.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "";

  const isPrint = (search?.get("print") || "").toLowerCase() === "1";
  const isPaidInFull = remaining <= 0;
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const invoiceContentRef = useRef<HTMLDivElement | null>(null);

  // Scale the desktop invoice down on small screens while preserving aspect ratio
  const BASE_WIDTH = 768; // matches max-w-3xl (48rem)
  const [scale, setScale] = useState(1);
  const [invoiceHeight, setInvoiceHeight] = useState(0);

  useEffect(() => {
    if (isPrint) {
      setScale(1);
      return;
    }
    const computeScale = () => {
      try {
        const viewport = Math.min(
          window.innerWidth,
          document.documentElement.clientWidth || window.innerWidth
        );
        const available = Math.max(0, viewport - 32); // account for page padding (px-4)
        const s = Math.min(1, Math.max(0.5, available / BASE_WIDTH));
        setScale(s);
      } catch {}
    };
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, [isPrint]);

  // Measure invoice height and update wrapper to prevent empty space
  useEffect(() => {
    if (isPrint || !invoiceContentRef.current) return;

    const measureHeight = () => {
      if (invoiceContentRef.current) {
        const height = invoiceContentRef.current.offsetHeight;
        setInvoiceHeight(height);
      }
    };

    measureHeight();
    // Re-measure on window resize and after content loads
    window.addEventListener("resize", measureHeight);
    const timer = setTimeout(measureHeight, 100);

    return () => {
      window.removeEventListener("resize", measureHeight);
      clearTimeout(timer);
    };
  }, [isPrint, player, payments, parent, teamName]);

  // Get paid payments for invoice items with proper formatting
  const paidPayments = useMemo(() => {
    if (!payments || payments.length === 0) {
      return [];
    }

    // Filter for paid payments - check multiple status formats
    const paid = (payments || []).filter((p) => {
      const status = (p.status || "").toString().toLowerCase().trim();
      return (
        status === "paid" || status === "succeeded" || status.includes("paid")
      );
    });

    if (paid.length === 0) {
      return [];
    }

    return paid
      .map((p) => {
        const paymentDate = new Date(p.created_at);
        const paymentType = (p.payment_type || "annual").toLowerCase();
        const isAnnual = paymentType === "annual";
        const isMonthly = paymentType === "monthly";
        const isQuarterly = paymentType === "quarterly";
        const monthlyFee = 30; // Monthly payment amount
        const quarterlyFeeAmount = quarterlyFee || 90; // Quarterly amount (fallback to 90 if not loaded)

        // Format description: "Type - Period" (player name will be in separate column)
        const year = paymentDate.getFullYear();
        const month = paymentDate.toLocaleDateString("en-US", {
          month: "long",
        });
        let typeLabel = "Annual";
        let periodLabel = year.toString();
        if (isMonthly) {
          typeLabel = "Monthly";
          periodLabel = `${month} ${year}`;
        } else if (isQuarterly) {
          typeLabel = "Quarterly";
          periodLabel = `${month} ${year}`;
        }
        // Description without player name (player name will be shown in separate column)
        const description = `${typeLabel} - ${periodLabel}`;

        // Store player name separately for the Player column (first name only)
        const fullPlayerName =
          (p as any).player_name || player?.name || "Player";
        const playerName = fullPlayerName.split(" ")[0];

        // Price: show Annual, Monthly, or Quarterly amount with label
        let priceAmount = annualFee;
        let priceLabel = `Annual (${formatCurrency(annualFee)})`;
        if (isMonthly) {
          priceAmount = monthlyFee;
          priceLabel = `Monthly (${formatCurrency(monthlyFee)})`;
        } else if (isQuarterly) {
          priceAmount = quarterlyFeeAmount;
          priceLabel = `Quarterly (${formatCurrency(quarterlyFeeAmount)})`;
        }

        // Qty: 12 for annual, 1 for monthly/quarterly
        const quantity = isAnnual ? 12 : 1;

        // Amount: how much was actually paid
        const amountPaid = Number(p.amount) || 0;

        return {
          date: paymentDate,
          playerName,
          description,
          priceLabel,
          priceAmount,
          quantity,
          amountPaid,
          paymentType,
        };
      })
      .sort((a, b) => {
        // Sort by date, newest first
        return b.date.getTime() - a.date.getTime();
      });
  }, [payments, player, annualFee, quarterlyFee]);

  const ensureHtml2Pdf = async (): Promise<any> => {
    const w = window as any;
    if (w.html2pdf) return w.html2pdf;
    const tryLoad = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.crossOrigin = "anonymous";
        s.referrerPolicy = "no-referrer";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load html2pdf"));
        document.body.appendChild(s);
      });
    try {
      await tryLoad(
        "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js"
      );
    } catch {
      await tryLoad(
        "https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js"
      );
    }
    return (window as any).html2pdf;
  };

  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProgress, setModalProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendInvoice = async () => {
    if (!playerId || sendingInvoice || !parent?.email) return;

    setSendingInvoice(true);
    setShowModal(true);
    setModalProgress(0);
    setIsComplete(false);
    setError(null);

    // Start progress simulation
    // PDF generation typically takes 15-20 seconds, so we'll simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 2; // Increment by 0-2% each interval
      if (progress > 95) progress = 95; // Cap at 95% until completion
      setModalProgress(Math.min(progress, 95));
    }, 500); // Update every 500ms

    progressIntervalRef.current = progressInterval;

    try {
      const response = await fetch("/api/send-parent-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: parent.email }),
      });

      const data = await response.json();

      // Stop progress counter
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (!response.ok) {
        setError(data.error || "Failed to send invoice");
        setModalProgress(0);
        return;
      }

      // Complete progress
      setModalProgress(100);
      setIsComplete(true);
    } catch (error) {
      devError("send-parent-invoice: Exception", error);
      setError("Failed to send invoice. Please try again.");

      // Stop progress counter on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setModalProgress(0);
    } finally {
      setSendingInvoice(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalProgress(0);
    setIsComplete(false);
    setError(null);
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const ap = (search?.get("autoprint") || "").toLowerCase() === "1";
    if (isPrint && ap) {
      setTimeout(() => {
        try {
          window.print();
        } catch {}
      }, 300);
    }
  }, [isPrint, search]);

  // Format parent address
  const parentAddress = useMemo(() => {
    if (!parent) return "";
    const parts = [
      parent.address_line1,
      parent.address_line2,
      [parent.city, parent.state, parent.zip].filter(Boolean).join(", "),
    ].filter(Boolean);
    return parts.join(", ");
  }, [parent]);

  const invoiceDate = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const invoiceNumber = (payments[0]?.id || playerId).toString().slice(0, 8);

  if (loading) {
    return (
      <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-specific styles to hide navbar */}
      <style jsx global>{`
        @media print {
          nav,
          header nav,
          header {
            display: none !important;
          }
          /* Hide everything except the invoice content to ensure only invoice is printed */
          body * {
            visibility: hidden !important;
          }
          #invoice-root,
          #invoice-root * {
            visibility: visible !important;
          }
          #invoice-root {
            position: absolute;
            left: 0;
            top: 0;
          }
          /* Ensure any footer elements are never printed */
          .invoice-footer {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
        }
        .print-mode nav,
        .print-mode header nav,
        .print-mode header {
          display: none !important;
        }
      `}</style>

      <div
        className={`${
          isPrint ? "bg-white text-black pt-0" : "bg-navy text-white pt-20"
        } min-h-screen pb-16 px-4`}
      >
        <div
          className={`${isPrint ? "max-w-4xl" : "max-w-3xl"} mx-auto`}
          ref={invoiceRef}
        >
          {/* Scaled desktop invoice on mobile to preserve aspect ratio */}
          <div
            className="mx-auto"
            style={{
              width: isPrint
                ? undefined
                : `${Math.round(BASE_WIDTH * scale)}px`,
              overflow: isPrint ? "visible" : "visible",
            }}
          >
            {/* Invoice Template - Matches image exactly */}
            <div
              id="invoice-root"
              ref={invoiceContentRef}
              className="bg-white text-black p-8"
              style={{
                width: BASE_WIDTH,
                transform: isPrint ? undefined : `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {/* Header: INVOICE on left, Logo on right */}
              <div className="flex items-start justify-between mb-6">
                <h1
                  className="text-5xl font-bold uppercase tracking-tight"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  INVOICE
                </h1>
                <div className="text-right flex flex-col items-end">
                  <img
                    src="/logo.png"
                    alt="WCS Basketball"
                    className="h-16 w-auto mb-2"
                  />
                  {/* Business address under logo */}
                  <div
                    className="text-sm mb-2"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    <p className="text-right">World Class Sports</p>
                    <p className="text-right">123 World Class Ave.</p>
                    <p className="text-right">Salina, KS 67401</p>
                  </div>
                </div>
              </div>

              {/* Date and Invoice # */}
              <div className="mb-6 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-bold">Date:</span> {invoiceDate}
                    </p>
                    <p className="text-sm">
                      <span className="font-bold">Invoice #:</span>{" "}
                      {invoiceNumber}
                    </p>
                  </div>
                  {isPaidInFull && (
                    <div className="bg-green-100 border-2 border-green-600 px-4 py-2 rounded">
                      <p className="text-sm font-bold text-green-800">
                        PAID IN FULL
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Two-column layout: Bill to (left) and Player info (right) */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                {/* Left: Bill to */}
                <div>
                  <p className="font-bold text-sm mb-2">Bill to:</p>
                  <div className="text-sm">
                    <p>
                      {parent
                        ? `${parent.first_name || ""} ${
                            parent.last_name || ""
                          }`.trim() || "N/A"
                        : "N/A"}
                    </p>
                    {parentAddress && <p className="mt-1">{parentAddress}</p>}
                  </div>
                </div>

                {/* Right: Player and Team */}
                <div className="text-right">
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-bold">
                        {allChildren.length > 1 ? "Players" : "Player"}:
                      </span>{" "}
                      {allChildren.length > 1
                        ? `${allChildren.length} Players: ${allChildren
                            .map((c) => c.name.split(" ")[0])
                            .join(", ")}`
                        : player?.name?.split(" ")[0] || "—"}
                      {allChildren.length > 1 && (
                        <span className="text-xs text-gray-600 ml-1 block">
                          (Combined Invoice)
                        </span>
                      )}
                    </p>
                    {!hasMultipleTeams && (
                      <p>
                        <span className="font-bold">Team:</span>{" "}
                        {teamName || "Not Assigned Yet"}
                      </p>
                    )}
                    <p className="mt-2">
                      {player?.parent_email || parent?.email || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table
                className="w-full border-collapse mb-2"
                style={{
                  border: "1px solid #000",
                  display: "table",
                  visibility: "visible",
                }}
              >
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black px-3 py-4 text-center text-sm font-bold">
                      Date:
                    </th>
                    <th className="border border-black px-3 py-4 text-center text-sm font-bold">
                      Player
                    </th>
                    <th className="border border-black px-3 py-4 text-center text-sm font-bold">
                      Description
                    </th>
                    <th className="border border-black px-3 py-4 text-center text-sm font-bold">
                      Price
                    </th>
                    <th className="border border-black px-3 py-4 text-center text-sm font-bold">
                      Qty
                    </th>
                    <th className="border border-black px-3 py-4 text-center text-sm font-bold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show paid payment items */}
                  {paidPayments.map((payment, idx) => (
                    <tr key={idx} className="h-12">
                      <td className="border border-black px-3 py-4 text-sm align-middle">
                        {payment.date ? formatDateShort(payment.date) : ""}
                      </td>
                      <td className="border border-black px-3 py-4 text-sm align-middle font-medium">
                        {payment.playerName}
                      </td>
                      <td className="border border-black px-3 py-4 text-sm align-middle">
                        {payment.description}
                      </td>
                      <td className="border border-black px-3 py-4 text-sm text-right align-middle">
                        {payment.priceLabel}
                      </td>
                      <td className="border border-black px-3 py-4 text-sm text-center align-middle">
                        {payment.quantity}
                      </td>
                      <td className="border border-black px-3 py-4 text-sm text-right align-middle">
                        {formatCurrency(payment.amountPaid)}
                      </td>
                    </tr>
                  ))}
                  {/* Always show at least 3 rows, add empty rows if needed */}
                  {Array.from({
                    length: Math.max(3 - paidPayments.length, 0),
                  }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-12">
                      <td className="border border-black px-3 py-4 text-sm align-middle"></td>
                      <td className="border border-black px-3 py-4 text-sm align-middle"></td>
                      <td className="border border-black px-3 py-4 text-sm align-middle"></td>
                      <td className="border border-black px-3 py-4 text-sm align-middle"></td>
                      <td className="border border-black px-3 py-4 text-sm align-middle"></td>
                      <td className="border border-black px-3 py-4 text-sm align-middle"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal line */}
              <div className="flex justify-end mb-4">
                <div className="w-1/2 border-t border-black pt-2">
                  <div className="flex justify-between px-3">
                    <span className="text-sm font-bold">Subtotal:</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                  {allChildren.length > 1 && (
                    <div className="flex justify-between px-3 mt-1">
                      <span className="text-xs text-gray-600">
                        Total Due ({allChildren.length} children):
                      </span>
                      <span className="text-xs text-gray-600">
                        {formatCurrency(totalAmountDue)}
                      </span>
                    </div>
                  )}
                  {remaining > 0 && (
                    <div className="flex justify-between px-3 mt-1">
                      <span className="text-sm font-bold">
                        Remaining Balance:
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Terms and Contact (included in invoice body) */}
              <div className="mt-2 space-y-1">
                <p
                  className="text-[10px] font-bold mb-0.5"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Payment Terms:
                </p>
                <p
                  className="text-[10px]"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  {isPaidInFull
                    ? "This invoice has been paid in full. No further payment is required."
                    : "Payment is due upon receipt. Payments can be made online via Stripe."}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Contact: info@wcsbasketball.com • (785) 123-4567
                </p>
              </div>

              {/* Footer: Thank you message (left) and Total/Due boxes (right) - Hidden in print mode */}
              <div className="flex items-start justify-between mt-8 mb-8 invoice-footer">
                <div className="flex-1 pr-4">
                  {isPaidInFull ? (
                    <div>
                      <p className="text-sm font-bold text-green-700 mb-2">
                        ✓ PAID IN FULL
                      </p>
                      <p className="text-sm">
                        This invoice has been paid in full. Thank you for your
                        commitment to our club and players!
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm">
                      We're grateful for your commitment to our club and
                      players—thank you for your payment.
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {/* Total box */}
                  <div className="border-2 border-black px-4 py-2 min-w-[200px]">
                    <p className="text-sm font-bold mb-1 text-right">Total:</p>
                    <p className="text-lg font-bold text-right">
                      {formatCurrency(totalAmountDue)}
                      {allChildren.length > 1 && (
                        <span className="text-xs text-gray-600 ml-1 block">
                          ({allChildren.length} × {formatCurrency(annualFee)})
                        </span>
                      )}
                    </p>
                    {isPaidInFull && (
                      <p className="text-xs text-green-700 font-semibold mt-1 text-right">
                        PAID
                      </p>
                    )}
                  </div>
                  {/* Due box */}
                  <div className="border-2 border-black px-4 py-2 min-w-[200px]">
                    <p className="text-sm font-bold mb-1 text-right">Due:</p>
                    <p className="text-lg font-bold text-right">
                      {formatCurrency(remaining)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer: Payment Terms and Contact Info - Hidden in print mode */}
              <div className="border-t border-gray-300 pt-3 mt-8 space-y-2 invoice-footer">
                <div>
                  <p
                    className="text-[10px] font-bold mb-0.5"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    Payment Terms:
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    {isPaidInFull
                      ? "This invoice has been paid in full. No further payment is required."
                      : "Payment is due upon receipt. Payments can be made online via Stripe."}
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px] font-bold mb-0.5"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    Contact Information:
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    Email: info@wcsbasketball.com | Phone: (785) 123-4567
                  </p>
                </div>
                <div>
                  <p
                    className="text-[10px]"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    Tax ID: [To be added if applicable]
                  </p>
                </div>
                <div className="mt-2">
                  <p
                    className="text-[10px]"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    Thank you for your business!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button and Send Invoice Button - Side by side */}
          {!isPrint && (
            <div className="mt-6 flex flex-col gap-4">
              {hasAnyPaid && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition text-sm font-medium"
                  >
                    Back
                  </button>
                  <div className="flex-1 max-w-md">
                    <button
                      onClick={sendInvoice}
                      disabled={sendingInvoice}
                      className="w-full px-6 py-3 bg-red text-white font-bold rounded hover:bg-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingInvoice
                        ? "Sending Invoice..."
                        : "Email Invoice to Parent"}
                    </button>
                  </div>
                </div>
              )}
              {!hasAnyPaid && (
                <div className="flex justify-center">
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition text-sm font-medium"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Basketball Progress Modal */}
          <BasketballProgressModal
            isOpen={showModal}
            onClose={handleCloseModal}
            progress={modalProgress}
            isComplete={isComplete}
            error={error}
          />
        </div>
      </div>
    </>
  );
}
