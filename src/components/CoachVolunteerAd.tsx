"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

// Coach/Volunteer Ad - matching the style of BeLegendaryAd and CoachNateAd2
const CoachVolunteerAd = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/coach-volunteer-signup");
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
      aria-label="Become a Coach or Volunteer - Join WCS Basketball. Click to sign up."
      className="relative w-full overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent bg-transparent"
    >
      {/* Background Image - container height matches other ads (1200/180 aspect ratio) */}
      <div
        className="relative w-full bg-transparent"
        style={{ aspectRatio: "1200/180" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/volunteer.png"
            alt=""
            fill
            className="object-cover"
            priority={true}
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        {/* Dark Red Gradient Overlay - darker on left, lighter on right */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(65, 6, 6, 0.8), rgba(65, 6, 6, 0.6), rgba(65, 6, 6, 0.4))'
          }}
          aria-hidden="true"
        />

        {/* Content - positioned absolutely over the image */}
        <div className="absolute inset-0 flex flex-row items-center justify-between px-3 sm:px-4 md:px-6 lg:px-4 py-3 sm:py-4 md:py-6 lg:py-8">
          {/* Left: CTA Button */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4 z-10 mr-8 sm:mr-12 md:mr-16 lg:mr-20 xl:mr-24">
            {/* Red CTA Button */}
            <motion.button
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="bg-navy text-white font-bebas-bold-italic px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-3 lg:py-4 rounded-lg text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl uppercase tracking-wide hover:opacity-90 transition-opacity duration-200 shadow-2xl focus:outline-none focus:ring-4 focus:ring-navy focus:ring-offset-2 whitespace-nowrap"
              aria-label="Get involved"
            >
              Get Involved
            </motion.button>
          </div>

          {/* Right: Text Content */}
          <div className="flex-1 max-w-2xl z-10 flex justify-end">
            {/* Wrapper to align tagline with headline's right edge */}
            <div className="w-fit pr-1 sm:pr-2 md:pr-4 lg:pr-6 xl:pr-8 text-right">
              <motion.h2
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 2.2 }}
                className="font-bebas-bold-italic text-sm sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl text-white mb-0 drop-shadow-2xl leading-tight"
              >
                Lead. Inspire. Make a Difference.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 2.5 }}
                className="font-bebas text-[8px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white drop-shadow-lg -mt-1 sm:-mt-2 md:-mt-3 lg:-mt-4"
              >
                Join our team of volunteer coaches and mentors.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachVolunteerAd;

