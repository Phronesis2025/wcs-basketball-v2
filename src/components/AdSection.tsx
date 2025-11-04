"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

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
      className="relative w-full rounded-xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent bg-transparent"
    >
      {/* Background Image - container height is half of original (1200/200 aspect ratio) */}
      <div
        className="relative w-full bg-transparent"
        style={{ aspectRatio: "1200/190" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/BE_LEDENDARY_BACKGROUND_AD.png"
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
        <div className="absolute inset-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-4 py-4 sm:py-8">
          {/* Left: Text Content */}
          <div className="flex-1 max-w-2xl z-10 mb-3 sm:mb-0">
            {/* Wrapper to align tagline with headline's right edge */}
            <div className="w-fit pl-2 sm:pl-4 md:pl-6 lg:pl-8">
              <h2 className="font-bebas-bold-italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-0 drop-shadow-2xl leading-tight">
                BE LEGENDARY
              </h2>
              <p className="font-bebas-light text-xs sm:text-sm md:text-base lg:text-lg text-white drop-shadow-lg text-right -mt-2 sm:-mt-3 md:-mt-4">
                Train. Compete. Rise above.
              </p>
            </div>
          </div>

          {/* Right: CTA Button */}
          <div className="flex-shrink-0 flex items-center gap-4 z-10 ml-0 sm:ml-8 md:ml-12 lg:ml-16">
            {/* Red CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="bg-red text-white font-bebas-bold-italic px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg text-sm sm:text-lg md:text-xl lg:text-2xl uppercase tracking-wide hover:bg-red-700 transition-colors duration-200 shadow-2xl focus:outline-none focus:ring-4 focus:ring-red focus:ring-offset-2 whitespace-nowrap"
              aria-label="Get in the game"
            >
              GET IN THE GAME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdSection() {
  return (
    <section
      className="bg-white py-8 sm:py-12"
      aria-label="Promotional advertisements"
    >
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Special BE LEGENDARY ad with exact design match */}
          <BeLegendaryAd />
        </div>
      </div>
    </section>
  );
}
