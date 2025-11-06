"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CoachNateAd2 from "./CoachNateAd2";

// Special BE LEGENDARY ad component matching the exact design
const BeLegendaryAd = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/register");
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="BE LEGENDARY - Train. Compete. Rise above. Click to register."
      className="relative w-full overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent bg-transparent"
    >
      {/* Background Image - container height is half of original (1200/200 aspect ratio) */}
      <div
        className="relative w-full bg-transparent"
        style={{ aspectRatio: "1200/180" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/BE_LEDENDARY_BACKGROUND_AD.jpg"
            alt=""
            fill
            className="object-contain"
            priority={true}
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Dark Gradient Overlay - darker on left, lighter on right */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"
          aria-hidden="true"
        />

        {/* Content - positioned absolutely over the image */}
        <div className="absolute inset-0 flex flex-row items-center justify-between px-3 sm:px-4 md:px-6 lg:px-4 py-3 sm:py-4 md:py-6 lg:py-8">
          {/* Left: Text Content */}
          <div className="flex-1 max-w-2xl z-10">
            {/* Wrapper to align tagline with headline's right edge */}
            <div className="w-fit pl-1 sm:pl-2 md:pl-4 lg:pl-6 xl:pl-8">
              <motion.h2
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 2 }}
                className="font-bebas-bold-italic text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-white mb-0 drop-shadow-2xl leading-tight"
              >
                BE LEGENDARY
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 2.5 }}
                className="font-bebas text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white drop-shadow-lg text-right -mt-1 sm:-mt-2 md:-mt-3 lg:-mt-4"
              >
                Train. Compete. Rise above.
              </motion.p>
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex-shrink-0 flex items-center justify-center z-10 mr-4 sm:mr-6 md:mr-8 lg:mr-12 ml-2 sm:ml-4 md:ml-6 lg:ml-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 2.6 }}
            >
              <Image
                src="/logo.png"
                alt="World Class Sports Basketball Logo"
                width={200}
                height={200}
                className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 object-contain drop-shadow-2xl"
                priority={true}
              />
            </motion.div>
          </div>

          {/* Right: CTA Button */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4 z-10 ml-2 sm:ml-4 md:ml-8 lg:ml-4 xl:ml-6">
            {/* Red CTA Button */}
            <motion.button
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 2.8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="bg-red text-white font-bebas-bold-italic px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-3 lg:py-4 rounded-lg text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl uppercase tracking-wide hover:bg-red-700 transition-colors duration-200 shadow-2xl focus:outline-none focus:ring-4 focus:ring-red focus:ring-offset-2 whitespace-nowrap"
              aria-label="Get in the game"
            >
              GET IN THE GAME
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ads = [
    { id: "be-legendary", component: <BeLegendaryAd key="be-legendary" /> },
    { id: "coach-nate-2", component: <CoachNateAd2 key="coach-nate-2" /> },
  ];

  // Auto-rotate carousel every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  return (
    <section
      className="bg-[#F6F6F6] py-2 sm:py-3"
      aria-label="Promotional advertisements"
    >
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={ads[currentIndex].id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              {ads[currentIndex].component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
