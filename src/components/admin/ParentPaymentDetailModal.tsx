"use client";

import React, { useState, useEffect } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { devError } from "@/lib/security";
import toast from "react-hot-toast";

interface ParentPaymentData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  players: Array<{
    id: string;
    name: string;
    status: string | null;
    team_id: string | null;
  }>;
  payment_status: "Paid" | "Pending" | "Overdue";
  total_paid: number;
  pending_amount: number;
  total_due: number;
  last_payment_date: string | null;
  due_date: string | null;
}

interface Payment {
  id: string;
  player_id: string;
  player_name?: string;
  amount: number;
  status: string;
  payment_type: string;
  created_at: string;
  updated_at: string;
}

interface ParentProfile {
  parent: {
    email: string;
    name: string;
    phone: string | null;
    emergency_contact: string | null;
    emergency_phone: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    checkout_completed?: boolean;
  };
  children: Array<{
    id: string;
    name: string;
    status: string | null;
  }>;
  payments: Payment[];
  total_paid: number;
  pending_payments: number;
}

interface ParentPaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  parent: ParentPaymentData | null;
  userId: string | null;
  onRefresh?: () => void;
}

export default function ParentPaymentDetailModal({
  isOpen,
  onClose,
  parent,
  userId,
  onRefresh,
}: ParentPaymentDetailModalProps) {
  useScrollLock(isOpen);

  const [detailedProfile, setDetailedProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Fetch detailed profile when modal opens
  useEffect(() => {
    if (isOpen && parent) {
      fetchDetailedProfile();
    } else {
      setDetailedProfile(null);
      setShowDetails(false);
    }
  }, [isOpen, parent]);

  const fetchDetailedProfile = async () => {
    if (!parent) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/parent/profile?email=${encodeURIComponent(parent.email)}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const { extractApiErrorMessage } = await import("@/lib/errorHandler");
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      const { extractApiResponseData } = await import("@/lib/errorHandler");
      const profile = await extractApiResponseData<ParentProfile>(response);
      setDetailedProfile(profile);
    } catch (error) {
      devError("Error fetching parent profile:", error);
      toast.error("Failed to load parent details");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!parent || !userId || sendingReminder) return;

    setSendingReminder(true);
    const loadingToast = toast.loading("Sending payment reminder...");

    try {
      const response = await fetch("/api/admin/parents/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ email: parent.email }),
      });

      if (!response.ok) {
        const { extractApiErrorMessage } = await import("@/lib/errorHandler");
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      toast.dismiss(loadingToast);
      toast.success("Payment reminder sent successfully");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : "Failed to send reminder"
      );
    } finally {
      setSendingReminder(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!parent || sendingInvoice) return;

    setSendingInvoice(true);
    const loadingToast = toast.loading("Sending invoice...");

    try {
      const response = await fetch("/api/send-parent-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: parent.email }),
      });

      if (!response.ok) {
        const { extractApiErrorMessage } = await import("@/lib/errorHandler");
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      toast.dismiss(loadingToast);
      toast.success("Invoice sent successfully");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : "Failed to send invoice"
      );
    } finally {
      setSendingInvoice(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!parent || !userId || !detailedProfile || markingPaid) return;

    const pendingPayments = detailedProfile.payments.filter(
      (p) => p.status === "pending"
    );

    if (pendingPayments.length === 0) {
      toast.error("No pending payments to mark as paid");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to mark ${pendingPayments.length} pending payment(s) as paid?`
      )
    ) {
      return;
    }

    setMarkingPaid(true);
    const loadingToast = toast.loading("Marking payments as paid...");

    try {
      const response = await fetch("/api/admin/payments/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          paymentIds: pendingPayments.map((p) => p.id),
        }),
      });

      if (!response.ok) {
        const { extractApiErrorMessage } = await import("@/lib/errorHandler");
        const errorMessage = await extractApiErrorMessage(response);
        throw new Error(errorMessage);
      }

      toast.dismiss(loadingToast);
      toast.success("Payments marked as paid successfully");
      
      // Refresh data
      await fetchDetailedProfile();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error ? error.message : "Failed to mark payments as paid"
      );
    } finally {
      setMarkingPaid(false);
    }
  };

  if (!isOpen || !parent) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getParentName = () => {
    const firstName = parent.first_name || "";
    const lastName = parent.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || parent.email;
  };

  const formatAddress = () => {
    const parts = [
      parent.address_line1,
      parent.address_line2,
      [parent.city, parent.state, parent.zip].filter(Boolean).join(", "),
    ].filter(Boolean);
    return parts.join(", ") || "Not provided";
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500 text-white";
      case "Pending":
        return "bg-yellow-500 text-white";
      case "Overdue":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bebas uppercase text-black">
            Parent Payment Details
          </h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
              <p className="text-gray-600">Loading parent details...</p>
            </div>
          ) : (
            <>
              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Payment Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                        parent.payment_status
                      )}`}
                    >
                      {parent.payment_status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Paid
                    </label>
                    <p className="text-black font-semibold">
                      {formatCurrency(parent.total_paid)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pending Amount
                    </label>
                    <p className="text-black font-semibold">
                      {formatCurrency(parent.pending_amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Due
                    </label>
                    <p className="text-black font-semibold">
                      {formatCurrency(parent.total_due)}
                    </p>
                  </div>
                </div>
                {parent.due_date && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <p className="text-black">{formatDate(parent.due_date)}</p>
                  </div>
                )}
              </div>

              {/* Parent Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  Parent Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <p className="text-black">{getParentName()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-black">{parent.email}</p>
                  </div>
                  {parent.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-black">{parent.phone}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-black">{formatAddress()}</p>
                  </div>
                </div>
              </div>

              {/* Players */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  Players ({parent.players.length})
                </h3>
                <div className="space-y-2">
                  {parent.players.map((player) => (
                    <div
                      key={player.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-black font-medium">{player.name}</p>
                          <p className="text-gray-600 text-sm">
                            Status: {player.status || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment History */}
              {detailedProfile && detailedProfile.payments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Payment History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-gray-300">
                          <th className="py-2 pr-4 text-gray-700">Date</th>
                          <th className="py-2 pr-4 text-gray-700">Player</th>
                          <th className="py-2 pr-4 text-gray-700">Amount</th>
                          <th className="py-2 pr-4 text-gray-700">Type</th>
                          <th className="py-2 text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedProfile.payments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-gray-200"
                          >
                            <td className="py-2 pr-4 text-black">
                              {formatDate(payment.created_at)}
                            </td>
                            <td className="py-2 pr-4 text-black">
                              {payment.player_name || "Unknown"}
                            </td>
                            <td className="py-2 pr-4 text-black">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-2 pr-4 text-black capitalize">
                              {payment.payment_type || "N/A"}
                            </td>
                            <td className="py-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleSendReminder}
                    disabled={sendingReminder || parent.payment_status === "Paid"}
                    className="w-full bg-yellow-600 text-white rounded-md px-4 py-2 hover:bg-yellow-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingReminder ? "Sending..." : "Send Payment Reminder"}
                  </button>
                  <button
                    onClick={handleSendInvoice}
                    disabled={sendingInvoice}
                    className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingInvoice ? "Sending..." : "Send Invoice"}
                  </button>
                  {detailedProfile &&
                    detailedProfile.payments.some((p) => p.status === "pending") && (
                      <button
                        onClick={handleMarkAsPaid}
                        disabled={markingPaid}
                        className="w-full bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed sm:col-span-2"
                      >
                        {markingPaid
                          ? "Marking as Paid..."
                          : "Mark Pending Payments as Paid"}
                      </button>
                    )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

