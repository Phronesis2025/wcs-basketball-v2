"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchTeamById } from "@/lib/actions";
import type { Player, Payment, Parent } from "@/types/supabase";
import { devError } from "@/lib/security";

export default function PaymentPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const source = search?.get("from") || undefined;
  const [paymentType, setPaymentType] = useState<
    "annual" | "monthly" | "custom"
  >("annual");
  const [customAmount, setCustomAmount] = useState("");
  const [remainingHint, setRemainingHint] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [teamLogoUrl, setTeamLogoUrl] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [parent, setParent] = useState<Parent | null>(null);
  const annualFee = useMemo(
    () => Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360),
    []
  );

  // Prefill custom amount from query (?custom=123.45)
  useEffect(() => {
    const custom = search?.get("custom");
    if (custom) {
      const n = Number(custom);
      if (!Number.isNaN(n)) setRemainingHint(n);
      setPaymentType("custom");
      setCustomAmount(String(Number(custom)));
    } else {
      setRemainingHint(null);
    }
  }, [search]);

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
          
          // Load parent information
          if (playerData.parent_id) {
            const { data: parentData, error: parentErr } = await supabase
              .from("parents")
              .select("*")
              .eq("id", playerData.parent_id)
              .single();
            if (!parentErr && parentData) {
              setParent(parentData as Parent);
            }
            
            // Check if checkout is completed
            const parentResp = await fetch(`/api/parent/checkout-status?parent_id=${playerData.parent_id}`);
            if (parentResp.ok) {
              const parentData = await parentResp.json();
              if (!parentData.checkout_completed) {
                router.push(`/checkout/${playerId}`);
                return;
              }
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

        // Payments for this player
        const resp = await fetch(`/api/player/payments/${playerId}`, { cache: "no-store" });
        if (resp.ok) {
          const json = await resp.json();
          setPayments((json.payments || []) as Payment[]);
        } else {
          setPayments([]);
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

  const totalPaid = useMemo(
    () => (payments || []).filter((p) => isPaid(p.status)).reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [payments]
  );
  const remaining = Math.max(annualFee - totalPaid, 0);
  const remainingDisplay = Number.isFinite(remainingHint as number)
    ? Math.max(Number(remainingHint), 0)
    : remaining;
  const totalPaidDisplay = Number.isFinite(remainingHint as number)
    ? Math.max(annualFee - (remainingHint as number), totalPaid)
    : totalPaid;
  const lastPaidAt = useMemo(() => {
    const paid = (payments || []).filter((p) => isPaid(p.status));
    if (paid.length === 0) return null;
    return paid.map(p => new Date(p.created_at)).sort((a,b)=>b.getTime()-a.getTime())[0];
  }, [payments]);
  const hasAnyPaid = useMemo(() => (payments || []).some(p => isPaid(p.status)), [payments]);
  const nextDueDate = useMemo(() => {
    const base = lastPaidAt ? lastPaidAt : player ? new Date(player.created_at) : null;
    if (!base) return null;
    return new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
  }, [lastPaidAt, player]);

  const formatCurrency = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  const formatDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "—";
  const formatDateShort = (d: Date | null) =>
    d
      ? d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
      : "";

  const go = async () => {
    const resp = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: playerId,
        payment_type: paymentType,
        custom_amount:
          paymentType === "custom" ? Number(customAmount || 0) : undefined,
        from: source,
      }),
    });
    const j = await resp.json();
    if (j?.url) window.location.href = j.url;
  };

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
        const viewport = Math.min(window.innerWidth, document.documentElement.clientWidth || window.innerWidth);
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
    return (payments || []).filter((p) => isPaid(p.status)).map(p => {
      const paymentDate = new Date(p.created_at);
      const paymentType = (p.payment_type || "annual").toLowerCase();
      const isAnnual = paymentType === "annual";
      const monthlyFee = 30; // Monthly payment amount
      
      // Format description: "Player Name - Annual/Monthly - Year/Month"
      const year = paymentDate.getFullYear();
      const month = paymentDate.toLocaleDateString("en-US", { month: "long" });
      const typeLabel = isAnnual ? "Annual" : "Monthly";
      const periodLabel = isAnnual ? year.toString() : `${month} ${year}`;
      const description = `${player?.name || "Player"} - ${typeLabel} - ${periodLabel}`;
      
      // Price: show Monthly or Annual amount with label
      const priceAmount = isAnnual ? annualFee : monthlyFee;
      const priceLabel = isAnnual ? `Annual (${formatCurrency(annualFee)})` : `Monthly (${formatCurrency(monthlyFee)})`;
      
      // Qty: 12 for annual, 1 for monthly
      const quantity = isAnnual ? 12 : 1;
      
      // Amount: how much was actually paid
      const amountPaid = Number(p.amount) || 0;
      
      return {
        date: paymentDate,
        description,
        priceLabel,
        priceAmount,
        quantity,
        amountPaid,
        paymentType,
      };
    });
  }, [payments, player, annualFee]);

  const ensureHtml2Pdf = async (): Promise<any> => {
    const w = window as any;
    if (w.html2pdf) return w.html2pdf;
    const tryLoad = (src: string) => new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.referrerPolicy = 'no-referrer';
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load html2pdf'));
      document.body.appendChild(s);
    });
    try {
      await tryLoad('https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js');
    } catch {
      await tryLoad('https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js');
    }
    return (window as any).html2pdf;
  };

  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);

  const sendInvoice = async () => {
    if (!playerId || sendingInvoice) return;
    
    setSendingInvoice(true);
    setInvoiceMessage(null);
    
    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setInvoiceMessage(`Error: ${data.error || "Failed to send invoice"}`);
        return;
      }

      setInvoiceMessage(`Invoice Sent`);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setInvoiceMessage(null);
      }, 5000);
    } catch (error) {
      devError("send-invoice: Exception", error);
      setInvoiceMessage("Failed to send invoice. Please try again.");
    } finally {
      setSendingInvoice(false);
    }
  };

  useEffect(() => {
    const ap = (search?.get('autoprint') || '').toLowerCase() === '1';
    if (isPrint && ap) {
      setTimeout(() => {
        try { window.print(); } catch {}
      }, 300);
    }
  }, [isPrint, search]);

  // Format parent address
  const parentAddress = useMemo(() => {
    if (!parent) return "";
    const parts = [
      parent.address_line1,
      parent.address_line2,
      [parent.city, parent.state, parent.zip].filter(Boolean).join(", ")
    ].filter(Boolean);
    return parts.join(", ");
  }, [parent]);

  const invoiceDate = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
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
        }
        .print-mode nav,
        .print-mode header nav,
        .print-mode header {
          display: none !important;
        }
      `}</style>
      
      <div className={`${isPrint ? 'bg-white text-black pt-0' : 'bg-navy text-white pt-20'} min-h-screen pb-16 px-4`}>
        <div className={`${isPrint ? 'max-w-4xl' : 'max-w-3xl'} mx-auto`} ref={invoiceRef}>
          {/* Scaled desktop invoice on mobile to preserve aspect ratio */}
          <div
            className="mx-auto overflow-hidden"
            style={{ 
              width: isPrint ? undefined : `${Math.round(BASE_WIDTH * scale)}px`,
              height: isPrint || !invoiceHeight ? undefined : `${Math.round(invoiceHeight * scale)}px`
            }}
          >
            {/* Invoice Template - Matches image exactly */}
            <div
              ref={invoiceContentRef}
              className="bg-white text-black p-8"
              style={{
                width: BASE_WIDTH,
                transform: isPrint ? undefined : `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
            {/* Header: INVOICE on left, Logo on right */}
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-5xl font-bold uppercase tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
                INVOICE
              </h1>
              <div className="text-right flex flex-col items-end">
                <img src="/logo.png" alt="WCS Basketball" className="h-16 w-auto mb-2" />
                {/* Business address under logo */}
                <div className="text-sm mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <p className="text-right">World Class Sports</p>
                  <p className="text-right">123 World Class Ave.</p>
                  <p className="text-right">Salina, KS 67401</p>
                </div>
                {/* Team logo below address */}
                {teamLogoUrl && (
                  <img 
                    src={teamLogoUrl} 
                    alt={`${teamName} logo`} 
                    className="h-12 w-12 object-contain rounded-full mt-2"
                    onError={(e) => {
                      // Hide team logo if it fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
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
                    <span className="font-bold">Invoice #:</span> {invoiceNumber}
                  </p>
                </div>
                {isPaidInFull && (
                  <div className="bg-green-100 border-2 border-green-600 px-4 py-2 rounded">
                    <p className="text-sm font-bold text-green-800">PAID IN FULL</p>
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
                  <p>{parent ? `${parent.first_name || ""} ${parent.last_name || ""}`.trim() || "N/A" : "N/A"}</p>
                  {parentAddress && (
                    <p className="mt-1">{parentAddress}</p>
                  )}
                </div>
              </div>

              {/* Right: Player and Team */}
              <div className="text-right">
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-bold">Player:</span> {player?.name || "—"}
                  </p>
                  <p>
                    <span className="font-bold">Team:</span> {teamName || "Not Assigned Yet"}
                  </p>
                  <p className="mt-2">
                    {player?.parent_email || parent?.email || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-2" style={{ border: "1px solid #000" }}>
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black px-3 py-4 text-center text-sm font-bold">Date:</th>
                  <th className="border border-black px-3 py-4 text-center text-sm font-bold">Description</th>
                  <th className="border border-black px-3 py-4 text-center text-sm font-bold">Price</th>
                  <th className="border border-black px-3 py-4 text-center text-sm font-bold">Qty</th>
                  <th className="border border-black px-3 py-4 text-center text-sm font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {/* Show paid payment items */}
                {paidPayments.map((payment, idx) => (
                  <tr key={idx} className="h-12">
                    <td className="border border-black px-3 py-4 text-sm align-middle">{formatDateShort(payment.date)}</td>
                    <td className="border border-black px-3 py-4 text-sm align-middle">{payment.description}</td>
                    <td className="border border-black px-3 py-4 text-sm text-right align-middle">{payment.priceLabel}</td>
                    <td className="border border-black px-3 py-4 text-sm text-center align-middle">{payment.quantity}</td>
                    <td className="border border-black px-3 py-4 text-sm text-right align-middle">{formatCurrency(payment.amountPaid)}</td>
                  </tr>
                ))}
                {/* Always show at least 3 rows, add empty rows if needed */}
                {Array.from({ length: Math.max(3 - paidPayments.length, 0) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-12">
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
                  <span className="text-sm font-bold">{formatCurrency(totalPaid)}</span>
                </div>
              </div>
            </div>

            {/* Footer: Thank you message (left) and Total/Due boxes (right) */}
            <div className="flex items-start justify-between mt-8 mb-8">
              <div className="flex-1 pr-4">
                {isPaidInFull ? (
                  <div>
                    <p className="text-sm font-bold text-green-700 mb-2">
                      ✓ PAID IN FULL
                    </p>
                    <p className="text-sm">
                      This invoice has been paid in full. Thank you for your commitment to our club and players!
                    </p>
                  </div>
                ) : (
                  <p className="text-sm">
                    We're grateful for your commitment to our club and players—thank you for your payment.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {/* Total box */}
                <div className="border-2 border-black px-4 py-2 min-w-[200px]">
                  <p className="text-sm font-bold mb-1 text-right">Total:</p>
                  <p className="text-lg font-bold text-right">{formatCurrency(annualFee)}</p>
                  {isPaidInFull && (
                    <p className="text-xs text-green-700 font-semibold mt-1 text-right">PAID</p>
                  )}
                </div>
                {/* Due box */}
                <div className="border-2 border-black px-4 py-2 min-w-[200px]">
                  <p className="text-sm font-bold mb-1 text-right">Due:</p>
                  <p className="text-lg font-bold text-right">{formatCurrency(remaining)}</p>
                </div>
              </div>
            </div>

            {/* Footer: Payment Terms and Contact Info */}
            <div className="border-t border-gray-300 pt-3 mt-8 space-y-2">
              <div>
                <p className="text-[10px] font-bold mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>Payment Terms:</p>
                <p className="text-[10px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {isPaidInFull 
                    ? "This invoice has been paid in full. No further payment is required."
                    : "Payment is due upon receipt. Payments can be made online via Stripe."}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>Contact Information:</p>
                <p className="text-[10px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Email: info@wcsbasketball.com | Phone: (785) 123-4567
                </p>
              </div>
              <div>
                <p className="text-[10px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Tax ID: [To be added if applicable]
                </p>
              </div>
              <div className="mt-2">
                <p className="text-[10px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                  Thank you for your business!
                </p>
              </div>
            </div>
            </div>
          </div>

          {/* Send invoice button and payment selection (only when not printing) */}
          {!isPrint && (
            <>
              {hasAnyPaid && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => router.back()}
                      className="px-6 py-3 bg-gray-700 text-white font-bold rounded hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={sendInvoice}
                      disabled={sendingInvoice}
                      className="px-6 py-3 bg-red text-white font-bold rounded hover:bg-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingInvoice ? "Sending Invoice..." : "Email Invoice to Parent"}
                    </button>
                  </div>
                  {invoiceMessage && (
                    <div className={`p-3 rounded text-sm ${
                      invoiceMessage.includes("Error") || invoiceMessage.includes("Failed")
                        ? "bg-red-900/40 text-red-200 border border-red-500/40"
                        : "bg-green-900/40 text-green-200 border border-green-500/40"
                    }`}>
                      {invoiceMessage}
                    </div>
                  )}
                </div>
              )}

              {/* Payment selection */}
              {!isPaidInFull && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mt-6">
                  <h2 className="text-lg font-bebas uppercase mb-4">Choose Payment</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="plan"
                        checked={paymentType === "annual"}
                        onChange={() => setPaymentType("annual")}
                      />
                      Annual – {formatCurrency(annualFee)}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="plan"
                        checked={paymentType === "monthly"}
                        onChange={() => setPaymentType("monthly")}
                      />
                      Monthly – $30
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="plan"
                        checked={paymentType === "custom"}
                        onChange={() => setPaymentType("custom")}
                      />
                      Custom
                      <input
                        className="ml-2 border border-gray-600 bg-gray-800 text-white rounded px-2 py-1 w-28"
                        type="number"
                        step="1"
                        min="1"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        disabled={paymentType !== "custom"}
                      />
                    </label>
                  </div>

                  <button
                    onClick={go}
                    className="mt-6 w-full bg-red text-white font-bold py-3 rounded hover:bg-red/90"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}