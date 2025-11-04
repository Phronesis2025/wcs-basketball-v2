"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import StartNowModal from "./StartNowModal";

interface StartNowButtonProps {
  variant?: "default" | "navbar" | "hero";
  onOpen?: () => void; // Callback when modal opens (e.g., to close mobile menu)
}

export default function StartNowButton({ variant = "default", onOpen }: StartNowButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Navbar variant: matches the old Register button size (px-4 py-2 text-sm)
  // Hero variant: large button with scale effect
  // Default: uses hero styling
  const getClassName = () => {
    if (variant === "navbar") {
      // On homepage (black background), use red button; otherwise use navy
      return isHome
        ? "bg-red text-white font-bold px-4 py-2 rounded hover:bg-red-700 transition duration-300 text-sm"
        : "bg-navy text-white font-bold px-4 py-2 rounded hover:bg-opacity-90 transition duration-300 text-sm";
    } else if (variant === "hero") {
      return "bg-red text-white font-bebas font-bold rounded-lg hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 uppercase shadow-2xl hover:shadow-red-500/25 mb-4 sm:mb-3 min-h-[48px] touch-manipulation";
    } else {
      // Default uses hero styling
      return "bg-red text-white font-bebas font-bold rounded-lg hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 uppercase shadow-2xl hover:shadow-red-500/25 mb-4 sm:mb-3 min-h-[48px] touch-manipulation";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Stop event propagation to prevent parent onClick (like closing mobile menu) from firing immediately
    e.stopPropagation();
    // Set modal state first - this is synchronous and will update React state
    setIsModalOpen(true);
    // Call onOpen callback if provided (e.g., to close mobile menu after modal opens)
    // Use requestAnimationFrame to ensure modal state is committed and rendered before closing menu
    if (onOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          onOpen();
        });
      });
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
            if (onOpen) {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  onOpen();
                });
              });
            }
          }
        }}
        className={getClassName()}
        aria-label="Start Now - Open registration options"
        aria-haspopup="dialog"
      >
        Start Now
      </button>
      {isModalOpen && (
        <StartNowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

