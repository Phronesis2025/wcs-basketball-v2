"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccess() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<
    Array<{
      left: string;
      delay: string;
      color: string;
      rotation: number;
      duration: string;
    }>
  >([]);

  useEffect(() => {
    // Generate confetti particles only on client side
    const particles = Array.from({ length: 50 }, () => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      color: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][
        Math.floor(Math.random() * 5)
      ],
      rotation: Math.random() * 360,
      duration: `${2 + Math.random() * 2}s`,
    }));

    setConfettiParticles(particles);
    setShowConfetti(true);

    // Hide confetti after animation completes
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                animationDuration: particle.duration,
              }}
            >
              <div className="w-full h-full" />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <svg
              className="w-16 h-16 text-green-600"
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
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-bebas font-bold text-navy uppercase">
            Payment Successful!
          </h1>

          {/* Celebration Message */}
          <div className="space-y-4">
            <p className="text-xl text-gray-800 font-medium">
              Your child is officially registered and ready to start their
              journey!
            </p>
            <p className="text-lg text-gray-700">
              They're about to embark on an incredible adventure to become a
              champion.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left">
              <p className="text-gray-800 font-medium">What happens next?</p>
              <ul className="mt-2 text-gray-700 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Practice schedules and team information will be shared
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  You'll receive updates about games and tournaments
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Your coach will reach out with welcome information
                </li>
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-red to-navy rounded-lg p-6 text-white">
            <p className="text-lg font-semibold mb-2">Let's Get Started! 🏀</p>
            <p className="text-sm opacity-90">
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
            <Link
              href="/teams"
              className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded text-center hover:bg-gray-300 transition"
            >
              Explore Teams
            </Link>
          </div>

          <div className="pt-4 text-sm text-gray-600">
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
