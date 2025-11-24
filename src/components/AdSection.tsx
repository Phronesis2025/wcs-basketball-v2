"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CNCAd from "./CNCAd";
import AnimatedBannerAd from "./AnimatedBannerAd";

export default function AdSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Show both the CNC ad and the new animated banner ad
  const ads = [
    { id: "cnc-ad", component: <CNCAd key="cnc-ad" /> },
    {
      id: "animated-banner-ad",
      component: <AnimatedBannerAd key="animated-banner-ad" />,
    },
  ];

  // Auto-rotate carousel every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 7000); // 7 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  return (
    <section
      className="bg-[#050505] py-2 sm:py-3 border-t border-white/5"
      aria-label="Promotional advertisements"
    >
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {ads[currentIndex] && (
              <motion.div
                key={ads[currentIndex].id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                {ads[currentIndex].component}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
