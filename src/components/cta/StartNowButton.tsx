"use client";

import { useState } from "react";
import StartNowModal from "./StartNowModal";

interface StartNowButtonProps {
  variant?: "default" | "navbar" | "hero";
}

export default function StartNowButton({ variant = "default" }: StartNowButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Navbar variant: matches the old Register button size (px-4 py-2 text-sm)
  // Hero variant: large button with scale effect
  // Default: uses hero styling
  const getClassName = () => {
    if (variant === "navbar") {
      return "bg-navy text-white font-bold px-4 py-2 rounded hover:bg-opacity-90 transition duration-300 text-sm min-h-[48px] touch-manipulation";
    } else if (variant === "hero") {
      return "bg-red text-white font-bebas font-bold rounded-lg hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 uppercase shadow-2xl hover:shadow-red-500/25 mb-4 sm:mb-3 min-h-[48px] touch-manipulation";
    } else {
      // Default uses hero styling
      return "bg-red text-white font-bebas font-bold rounded-lg hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 uppercase shadow-2xl hover:shadow-red-500/25 mb-4 sm:mb-3 min-h-[48px] touch-manipulation";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        className={getClassName()}
        aria-label="Start Now - Open registration options"
        aria-haspopup="dialog"
      >
        Start Now
      </button>
      <StartNowModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

