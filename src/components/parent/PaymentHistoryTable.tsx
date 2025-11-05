"use client";

import { useState } from "react";
import { Payment, Player } from "@/types/supabase";

// Invoice Email Button Component
function InvoiceEmailButton({ playerId, playerName }: { playerId: string; playerName: string }) {
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendInvoice = async () => {
    if (sendingInvoice) return;
    
    setSendingInvoice(true);
    setMessage(null);
    
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
        setMessage(`Error: ${data.error || "Failed to send invoice"}`);
        return;
      }

      setMessage(`Invoice Sent`);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      setMessage("Failed to send invoice. Please try again.");
    } finally {
      setSendingInvoice(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={sendInvoice}
        disabled={sendingInvoice}
        className="px-4 py-2 bg-red text-white rounded hover:bg-red/90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        {sendingInvoice ? "Sending..." : "Email Invoice"}
      </button>
      {message && (
        <div className={`absolute top-full mt-2 left-0 right-0 p-2 rounded text-xs whitespace-nowrap z-10 ${
          message.includes("Error") || message.includes("Failed")
            ? "bg-red-100 text-red-800 border border-red-300"
            : "bg-green-100 text-green-800 border border-green-300"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

interface PaymentHistoryTableProps {
  payments: Payment[];
  children?: Player[];
  annualFeeUsd?: number;
}

export default function PaymentHistoryTable({
  payments,
  children = [],
  annualFeeUsd,
}: PaymentHistoryTableProps) {
  const annualFee = Number(
    annualFeeUsd ?? Number(process.env.NEXT_PUBLIC_ANNUAL_FEE_USD || 360)
  );
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600 text-lg">No payment history yet</p>
        <p className="text-gray-500 text-sm mt-2">
          Payment records will appear here once processed
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      annual: "Annual Fee",
      monthly: "Monthly",
      custom: "Custom Payment",
    };
    return labels[type] || type;
  };

  // Build augmented list including players with no payments
  const playersById = new Map<string, Player>();
  children.forEach((c) => playersById.set(c.id, c));

  const paymentsByPlayer = new Map<string, Payment[]>();
  (payments || []).forEach((p) => {
    if (!paymentsByPlayer.has(p.player_id)) paymentsByPlayer.set(p.player_id, []);
    paymentsByPlayer.get(p.player_id)!.push(p);
  });

  const augmentedPayments: Payment[] = [
    ...payments,
    ...children
      .filter((c) => !paymentsByPlayer.has(c.id))
      .map((c) => ({
        id: `no-pay-${c.id}`,
        player_id: c.id,
        stripe_payment_id: null,
        amount: 0,
        payment_type: "annual",
        status: "pending",
        created_at: c.created_at,
        updated_at: c.created_at,
        player_name: c.name,
      } as Payment)),
  ];

  const isApproved = (playerId: string) => {
    const p = playersById.get(playerId);
    const status = (p?.status || "").toString().toLowerCase();
    return status === "approved" || status === "active";
  };

  const totalPaid = augmentedPayments
    .filter((p) => (p.status || "").toString().toLowerCase().includes("paid") || (p.status || "").toString().toLowerCase() === "succeeded")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const pendingAmount = augmentedPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Per-player totals for remaining balance and due date
  const paidByPlayer = new Map<string, number>();
  const lastPaidDateByPlayer = new Map<string, Date>();
  augmentedPayments.forEach((p) => {
    const s = (p.status || "").toString().toLowerCase();
    if (s === "paid" || s === "succeeded" || s.includes("paid")) {
      paidByPlayer.set(
        p.player_id,
        (paidByPlayer.get(p.player_id) || 0) + (Number(p.amount) || 0)
      );
      const existing = lastPaidDateByPlayer.get(p.player_id);
      const paidAt = new Date(p.created_at);
      if (!existing || paidAt > existing) {
        lastPaidDateByPlayer.set(p.player_id, paidAt);
      }
    }
  });

  const getRemainingForPlayer = (playerId: string) => {
    const paid = paidByPlayer.get(playerId) || 0;
    return Math.max(annualFee - paid, 0);
  };

  const getDueDateForPlayer = (playerId: string) => {
    // If there is a previous paid payment, due date is 30 days after that
    const lastPaid = lastPaidDateByPlayer.get(playerId);
    if (lastPaid) {
      return new Date(lastPaid.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    // Otherwise, fall back to 30 days after player creation (first invoice cycle)
    const player = playersById.get(playerId);
    if (!player) return null;
    const created = new Date(player.created_at);
    return new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
  };

  // Check if player has at least one paid payment
  const hasPaidPayment = (playerId: string) => {
    return paidByPlayer.has(playerId) && paidByPlayer.get(playerId)! > 0;
  };

  // Get unique players (for invoice section)
  const uniquePlayers = Array.from(playersById.values()).filter((player) => {
    const approved = isApproved(player.id);
    const hasPaid = hasPaidPayment(player.id);
    return approved && hasPaid;
  });

  return (
    <div className="space-y-6">
      {/* Invoice Section - Show for approved players with payments */}
      {uniquePlayers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Invoices</h3>
            <p className="text-sm text-gray-600 mt-1">
              View and email invoices for your children
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {uniquePlayers.map((player) => {
                const playerPaid = paidByPlayer.get(player.id) || 0;
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{player.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Total Paid: {formatAmount(playerPaid)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={`/payment/${player.id}`}
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition text-sm font-medium"
                      >
                        View Invoice
                      </a>
                      <InvoiceEmailButton playerId={player.id} playerName={player.name} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
          {totalPaid > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Total paid:{" "}
              <span className="font-semibold">{formatAmount(totalPaid)}</span>
            </p>
          )}
        </div>

      <div className="overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Child
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {augmentedPayments
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                  {formatDate(payment.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {payment.player_name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                  {getPaymentTypeLabel(payment.payment_type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 hidden lg:table-cell">
                  {formatAmount(payment.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatAmount(getRemainingForPlayer(payment.player_id))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                  {(() => {
                    const remaining = getRemainingForPlayer(payment.player_id);
                    if (remaining <= 0) return "—";
                    const due = getDueDateForPlayer(payment.player_id);
                    return due ? formatDate(due.toISOString()) : "—";
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {(() => {
                    const remaining = getRemainingForPlayer(payment.player_id);
                    const approved = isApproved(payment.player_id);
                    if (remaining <= 0 || !approved) return null;
                    // Use the same link format as the approval email (checkout page)
                    const url = `/checkout/${payment.player_id}?from=billing`;
                    return (
                      <a
                        href={url}
                        className="inline-block px-3 py-1.5 bg-red text-white rounded hover:bg-red/90 transition"
                      >
                        Pay
                      </a>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked list */}
      <div className="md:hidden divide-y divide-gray-200">
        {augmentedPayments
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((payment) => {
            const remaining = getRemainingForPlayer(payment.player_id);
            const approved = isApproved(payment.player_id);
            return (
              <div key={payment.id} className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{payment.player_name || "Unknown"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">{formatAmount(remaining)}</span>
                  {remaining > 0 && approved && (
                    <a
                      href={`/checkout/${payment.player_id}?from=billing`}
                      className="px-3 py-1.5 bg-red text-white rounded text-sm"
                    >
                      Pay
                    </a>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {pendingAmount > 0 && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Pending payments:</span>{" "}
            {formatAmount(pendingAmount)}
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
