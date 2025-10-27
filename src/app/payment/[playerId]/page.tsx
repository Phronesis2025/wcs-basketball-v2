"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<
    "annual" | "monthly" | "custom"
  >("annual");
  const [customAmount, setCustomAmount] = useState("");

  const go = async () => {
    const resp = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: playerId,
        payment_type: paymentType,
        custom_amount:
          paymentType === "custom" ? Number(customAmount || 0) : undefined,
      }),
    });
    const j = await resp.json();
    if (j?.url) window.location.href = j.url;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="plan"
              checked={paymentType === "annual"}
              onChange={() => setPaymentType("annual")}
            />
            Annual – $360
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
              className="ml-2 border rounded px-2 py-1 w-28"
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
          className="mt-6 w-full bg-red text-white font-bold py-3 rounded"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
