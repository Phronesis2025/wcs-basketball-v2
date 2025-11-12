"use client";

import { useState, useEffect, useRef } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

interface BasketballProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number; // 0-100
  isComplete: boolean;
  error: string | null;
}

export default function BasketballProgressModal({
  isOpen,
  onClose,
  progress,
  isComplete,
  error,
}: BasketballProgressModalProps) {
  const [facts, setFacts] = useState<
    Array<{ emoji: string; fact_text: string }>
  >([]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const factIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useScrollLock(isOpen);

  // Fetch facts immediately when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset facts and fetch fresh ones each time modal opens
      setFacts([]);
      setCurrentFactIndex(0);

      fetch("/api/basketball-facts")
        .then((res) => res.json())
        .then((data) => {
          if (data.facts && data.facts.length > 0) {
            setFacts(data.facts);
            setCurrentFactIndex(0);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch basketball facts", err);
        });
    }
  }, [isOpen]);

  // Rotate facts every 5 seconds - start immediately when facts are loaded
  useEffect(() => {
    if (isOpen && facts.length > 0 && !isComplete && !error) {
      // Clear any existing interval
      if (factIntervalRef.current) {
        clearInterval(factIntervalRef.current);
      }

      // Fixed interval of 5 seconds
      const interval = 5000; // 5000ms

      factIntervalRef.current = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
      }, interval);

      return () => {
        if (factIntervalRef.current) {
          clearInterval(factIntervalRef.current);
          factIntervalRef.current = null;
        }
      };
    }
  }, [isOpen, facts.length, isComplete, error]);

  // Auto-close after 3 seconds when complete
  useEffect(() => {
    if (isComplete && !error) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      closeTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 3000);

      return () => {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
      };
    }
  }, [isComplete, error, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (factIntervalRef.current) {
        clearInterval(factIntervalRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const currentFact = facts[currentFactIndex] || null;

  // Calculate circumference for circular progress (radius = 45, so circumference = 2 * π * 45 ≈ 283)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl p-8 flex flex-col items-center border border-gray-700">
        {/* Modal Title */}
        {!isComplete && !error && (
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            While we prepare your invoice, did you know...
          </h2>
        )}

        {/* Simple Circular Progress Indicator */}
        {!isComplete && !error && (
          <div className="relative mb-8">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#374151"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#ef4444"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            {/* Progress percentage in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}

        {/* Status Message */}
        {isComplete && !error && (
          <div className="mb-6 text-center">
            <p className="text-2xl font-bold text-green-500 mb-2">
              Email Sent!
            </p>
            <p className="text-sm text-gray-400">
              Your invoice has been sent successfully.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 text-center">
            <p className="text-xl font-bold text-red-500 mb-2">Error</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        )}

        {/* Basketball Fact - No emoji */}
        {!isComplete && !error && (
          <div className="w-full text-center mb-6 min-h-[80px] flex items-center justify-center">
            <div className="max-w-md">
              {currentFact ? (
                <p className="text-base text-gray-300 leading-relaxed">
                  {currentFact.fact_text}
                </p>
              ) : (
                <p className="text-base text-gray-500 leading-relaxed">
                  Loading interesting facts...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Close button (only show if error or if user wants to close manually) */}
        {(error || isComplete) && (
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red text-white rounded hover:bg-red/90 transition"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
