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
              <h2 className="font-bebas-bold-italic text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-white mb-0 drop-shadow-2xl leading-tight">
                BE LEGENDARY
              </h2>
              <p className="font-bebas-light text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white drop-shadow-lg text-right -mt-1 sm:-mt-2 md:-mt-3 lg:-mt-4">
                Train. Compete. Rise above.
              </p>
            </div>
          </div>

          {/* Right: CTA Button */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4 z-10 ml-2 sm:ml-4 md:ml-8 lg:ml-12 xl:ml-16">
            {/* Red CTA Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="bg-red text-white font-bebas-bold-italic px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-3 lg:py-4 rounded-lg text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl uppercase tracking-wide hover:bg-red-700 transition-colors duration-200 shadow-2xl focus:outline-none focus:ring-4 focus:ring-red focus:ring-offset-2 whitespace-nowrap"
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
