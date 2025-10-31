"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

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
    }>
  >([]);
  const [playerName, setPlayerName] = useState<string>("");
  const from = (search?.get("from") || "").toLowerCase();

  useEffect(() => {
    // Generate confetti particles only on client side
    const particles = Array.from({ length: 80 }, () => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      color: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][
        Math.floor(Math.random() * 5)
      ],
      rotation: Math.random() * 360,
      duration: `${2.5 + Math.random() * 2.5}s`,
      size: 6 + Math.floor(Math.random() * 8),
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
    const playerId = search?.get("player");
    if (!playerId) return;
    (async () => {
      const { data } = await supabase
        .from("players")
        .select("name")
        .eq("id", playerId)
        .single();
      if (data?.name) setPlayerName(data.name);
    })();
  }, [search]);

  return (
    <div className="bg-navy min-h-screen text-white pt-20 pb-16 px-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute animate-confetti rounded-sm"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                animationDuration: particle.duration,
                width: particle.size,
                height: particle.size,
              }}
            >
              <div className="w-full h-full" />
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
                  You can view your updated balance and receipts in your profile.
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
                  {from === "billing" ? "Your balance and due dates have been updated" : "Practice schedules and team information will be shared"}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  {from === "billing" ? "A receipt has been emailed to you" : "You'll receive updates about games and tournaments"}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  {from === "billing" ? "You can continue managing payments in your profile" : "Your coach will reach out with welcome information"}
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/parent/profile"
              className="flex-1 bg-red text-white font-bold py-3 px-6 rounded text-center hover:bg-red/90 transition"
            >
              View My Profile
            </Link>
            {from === "billing" ? (
              <Link
                href="/parent/profile?tab=billing"
                className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded text-center hover:bg-gray-600 transition"
              >
                Back to Billing
              </Link>
            ) : (
              <Link
                href="/teams"
                className="flex-1 bg-gray-700 text-white font-semibold py-3 px-6 rounded text-center hover:bg-gray-600 transition"
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
    <Suspense fallback={<div className="bg-navy min-h-screen text-white pt-20 px-4">Loading...</div>}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
