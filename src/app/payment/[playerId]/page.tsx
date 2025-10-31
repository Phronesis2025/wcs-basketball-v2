"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchTeamById } from "@/lib/actions";
import type { Player, Payment } from "@/types/supabase";
import { devError } from "@/lib/security";

export default function PaymentPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const source = search?.get("from") || undefined; // e.g., 'billing' for existing payments
  const [paymentType, setPaymentType] = useState<
    "annual" | "monthly" | "custom"
  >("annual");
  const [customAmount, setCustomAmount] = useState("");
  const [remainingHint, setRemainingHint] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState<string>("");
  const [payments, setPayments] = useState<Payment[]>([]);
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

  // Load player, team and payments
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
          
          // Check if checkout is completed - fetch parent data
          if (playerData.parent_id) {
            const parentResp = await fetch(`/api/parent/checkout-status?parent_id=${playerData.parent_id}`);
            if (parentResp.ok) {
              const parentData = await parentResp.json();
              if (!parentData.checkout_completed) {
                // Redirect to checkout form
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
            } catch {}
          }
        }

        // Payments for this player (via server to avoid RLS issues)
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

  const downloadInvoice = async () => {
    try {
      const html2pdf = await ensureHtml2Pdf();
      const element = invoiceRef.current;
      if (!element) return;
      const filename = `invoice-${(payments[0]?.id || playerId).toString().slice(0,8)}.pdf`;
      const opt = {
        margin:       0.5,
        filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      devError('Invoice download failed', e);
      // Fallback to print view auto-print
      const url = new URL(window.location.href);
      url.searchParams.set('print','1');
      url.searchParams.set('autoprint','1');
      window.open(url.toString(), '_blank');
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

  return (
    <div className={`${isPrint ? 'bg-white text-black' : 'bg-navy text-white'} min-h-screen pt-20 pb-16 px-4`}>
      <div className="max-w-3xl mx-auto" ref={invoiceRef}>
        {/* Header */}
        <div className={`${isPrint ? 'bg-white border border-gray-300' : 'bg-gray-900/50 border border-gray-700'} rounded-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="WCS Logo" className={`${isPrint ? 'opacity-90' : ''} h-10 w-auto`} />
              <h1 className={`text-[clamp(1.5rem,4vw,2rem)] font-bebas uppercase ${isPrint ? 'text-black' : ''}`}>Invoice</h1>
            </div>
            {!isPrint && hasAnyPaid && (
              <button
                onClick={downloadInvoice}
                className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Download Invoice
              </button>
            )}
          </div>
          <div className={`mt-2 text-sm ${isPrint ? 'text-gray-600' : 'text-gray-300'}`}>
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span className="ml-4">No.: {(payments[0]?.id || playerId).toString().slice(0,8)}</span>
          </div>
        </div>

        {/* Summary */}
        <div className={`${isPrint ? 'bg-white border border-gray-300' : 'bg-gray-900/50 border border-gray-700'} rounded-lg p-6 mb-6`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className={`${isPrint ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Player</p>
              <p className={`${isPrint ? 'text-black' : 'text-white'} font-semibold`}>{player?.name || "—"}</p>
            </div>
            <div>
              <p className={`${isPrint ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Team</p>
              <p className={`${isPrint ? 'text-black' : 'text-white'} font-semibold`}>{teamName || "Not Assigned Yet"}</p>
            </div>
            <div>
              <p className={`${isPrint ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Total Due</p>
              <p className={`${isPrint ? 'text-black' : 'text-green-400'} font-semibold`}>{formatCurrency(annualFee)}</p>
            </div>
            <div>
              <p className={`${isPrint ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Total Paid</p>
              <p className={`${isPrint ? 'text-black' : 'text-white'} font-semibold`}>{formatCurrency(totalPaidDisplay)}</p>
            </div>
            <div>
              <p className={`${isPrint ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Remaining Balance</p>
              <p className={`${isPrint ? 'text-black' : 'text-yellow-300'} font-semibold`}>{formatCurrency(remainingDisplay)}</p>
            </div>
            <div>
              <p className={`${isPrint ? 'text-gray-600' : 'text-gray-400'} text-sm`}>Next Payment Due</p>
              <p className={`${isPrint ? 'text-black' : 'text-white'} font-semibold`}>{formatDate(nextDueDate)}</p>
            </div>
          </div>
        </div>

        {/* Helpful details */}
        <div className={`${isPrint ? 'bg-white border border-gray-300' : 'bg-gray-900/50 border border-gray-700'} rounded-lg p-6 mb-6`}>
          <h2 className={`text-lg font-bebas uppercase mb-3 ${isPrint ? 'text-black' : ''}`}>Details</h2>
          <ul className={`list-disc list-inside ${isPrint ? 'text-black' : 'text-gray-300'} text-sm space-y-1`}>
            <li>Grade: <span className="text-white font-semibold">{player?.grade || "—"}</span></li>
            <li>Jersey Number: <span className="text-white font-semibold">{player?.jersey_number ?? "Not Assigned"}</span></li>
            <li>Waiver Signed: <span className="font-semibold {player?.waiver_signed ? 'text-green-400' : 'text-yellow-300'}">{player?.waiver_signed ? "Yes" : "Pending"}</span></li>
            <li>Parent Email: <span className="text-white font-semibold">{player?.parent_email || "—"}</span></li>
          </ul>
        </div>

        {/* Payment selection */}
        <div className={`${(isPrint || isPaidInFull) ? 'hidden' : 'bg-gray-900/50 border border-gray-700'} rounded-lg p-6`}>
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

          {!isPaidInFull && (
            <button
              onClick={go}
              className="mt-6 w-full bg-red text-white font-bold py-3 rounded"
            >
              Proceed to Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
