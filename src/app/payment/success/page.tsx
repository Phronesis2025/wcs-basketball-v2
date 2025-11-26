"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { devLog, devError } from "@/lib/security";

function PaymentSuccessInner() {
  const search = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<
    Array<{
      left: string;
      delay: string;
      color: string;
      rotation: number;
      duration: string;
      size: number;
      type: "square" | "basketball";
    }>
  >([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const from = (search?.get("from") || "").toLowerCase();

  useEffect(() => {
    // Generate confetti particles only on client side
    // Increased from 80 to 150 particles for a more festive celebration
    const particles = Array.from({ length: 150 }, () => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      color: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][
        Math.floor(Math.random() * 5)
      ],
      rotation: Math.random() * 360,
      duration: `${2.5 + Math.random() * 2.5}s`,
      size: 6 + Math.floor(Math.random() * 8),
      // Make about 30% of particles basketballs (more basketballs now with increased total)
      type: Math.random() < 0.3 ? "basketball" : "square",
    }));

    setConfettiParticles(particles);
    if (from !== "billing") setShowConfetti(true);

    // Hide confetti after animation completes
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load player name if present in query (?player=<id>)
    const pid = search?.get("player");
    const sessionId = search?.get("session_id");

    if (!pid) return;
    setPlayerId(pid);

    (async () => {
      // Load player name
      const { data } = await supabase
        .from("players")
        .select("name")
        .eq("id", pid)
        .single();
      if (data?.name) setPlayerName(data.name);

      // Verify payment session and update status (for localhost testing where webhooks don't work)
      try {
        const verifyUrl = sessionId
          ? `/api/payment/verify-session?session_id=${encodeURIComponent(
              sessionId
            )}&player_id=${encodeURIComponent(pid)}`
          : `/api/payment/verify-session?player_id=${encodeURIComponent(pid)}`;

        const verifyResponse = await fetch(verifyUrl);
        const verifyResult = await verifyResponse.json();

        if (verifyResult.success && verifyResult.updated) {
          devLog("Payment verified and updated successfully", verifyResult);
        } else if (verifyResult.success && verifyResult.already_updated) {
          devLog("Payment already updated", verifyResult);
        } else {
          devLog("Payment verification result", verifyResult);
        }
      } catch (error) {
        devError("Error verifying payment session", error);
        // Don't show error to user - webhook will handle it in production
      }
    })();
  }, [search]);

  const handleDownloadWelcomeKit = async () => {
    if (!playerId || downloadLoading) return;

    setDownloadLoading(true);
    try {
      const response = await fetch(
        `/api/generate-welcome-kit?player_id=${playerId}`
      );
      if (!response.ok) {
        throw new Error("Failed to generate welcome kit");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WCS-Basketball-Welcome-Kit-${playerId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      devError("Error downloading welcome kit:", error);
      alert("Failed to download welcome kit. Please try again later.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                transform: `rotate(${particle.rotation}deg)`,
                animationDuration: particle.duration,
                width:
                  particle.type === "basketball"
                    ? particle.size * 1.5
                    : particle.size,
                height:
                  particle.type === "basketball"
                    ? particle.size * 1.5
                    : particle.size,
              }}
            >
              {particle.type === "basketball" ? (
                <span
                  className="text-2xl sm:text-3xl"
                  style={{ fontSize: `${particle.size * 1.5}px` }}
                >
                  🏀
                </span>
              ) : (
                <div
                  className="rounded-sm"
                  style={{
                    backgroundColor: particle.color,
                    width: "100%",
                    height: "100%",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-900/30 border border-green-500/40 rounded-full mb-2">
            <svg
              className="w-16 h-16 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bebas font-bold uppercase">
            {from === "billing" ? "Payment Received" : "Payment Successful!"}
          </h1>
          {playerName && (
            <p className="text-blue-300 text-lg italic -mt-2">{playerName}</p>
          )}

          {/* Celebration Message */}
          <div className="space-y-4">
            {from === "billing" ? (
              <>
                <p className="text-xl text-white font-medium">
                  Thanks! Your payment has been applied to your account.
                </p>
                <p className="text-lg text-gray-200">
                  You can view your updated balance and receipts in your
                  profile.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl text-white font-medium">
                  Your child is officially registered and ready to start their
                  journey!
                </p>
                <p className="text-lg text-gray-200">
                  They're about to embark on an incredible adventure to become a
                  champion.
                </p>
              </>
            )}
            <div className="bg-gray-900/60 border border-blue-500/40 rounded-lg p-4 text-left">
              <p className="text-white font-medium">What happens next?</p>
              <ul className="mt-2 text-gray-200 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  {from === "billing"
                    ? "Your balance and due dates have been updated"
                    : "Practice schedules and team information will be shared"}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  {from === "billing"
                    ? "A receipt has been emailed to you"
                    : "You'll receive updates about games and tournaments"}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  {from === "billing"
                    ? "You can continue managing payments in your profile"
                    : "Your coach will reach out with welcome information"}
                </li>
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-red to-navy rounded-lg p-6">
            <p className="text-lg font-semibold mb-2">Let's Get Started! 🏀</p>
            <p className="text-sm text-white/90">
              Your child's journey to becoming a champion begins now. Check your
              email for the payment receipt from Stripe and welcome information.
            </p>
          </div>

          {/* Welcome Kit Download (only show if not from billing) */}
          {from !== "billing" && playerId && (
            <div className="bg-gradient-to-r from-red to-navy rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">
                📦 Download Your Welcome Kit
              </h3>
              <p className="text-sm text-white/90 mb-4">
                Get your complete welcome package with all the information you
                need to get started!
              </p>
              <button
                onClick={handleDownloadWelcomeKit}
                disabled={downloadLoading}
                className="w-full md:w-auto bg-white text-red font-bold py-3 px-6 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {downloadLoading
                  ? "Generating PDF..."
                  : "📥 Download Welcome Kit PDF"}
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/parent/profile"
              className="flex-1 bg-red text-white font-bold py-3 px-6 rounded text-center hover:bg-red/90 transition min-h-[48px] flex items-center justify-center"
            >
              View My Profile
            </Link>
            {from === "billing" ? (
              <Link
                href="/parent/profile?tab=billing"
                className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded text-center hover:bg-gray-600 transition min-h-[48px] flex items-center justify-center"
              >
                Back to Billing
              </Link>
            ) : (
              <Link
                href="/teams"
                className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded text-center hover:bg-gray-600 transition min-h-[48px] flex items-center justify-center"
              >
                Explore Teams
              </Link>
            )}
          </div>

          <div className="pt-4 text-sm text-gray-300">
            <p>A payment receipt has been sent to your email from Stripe.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div className="bg-navy min-h-screen text-white pt-20 px-4">
          Loading...
        </div>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}
