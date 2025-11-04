"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface AdProps {
  headline: string;
  subheadline: string;
  backgroundImage: string;
  gradientFrom: string;
  gradientTo: string;
}

const AdBanner = ({
  headline,
  subheadline,
  backgroundImage,
  gradientFrom,
  gradientTo,
}: AdProps) => {
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
      aria-label={`${headline} - ${subheadline}. Click to register.`}
      className="relative w-full h-[200px] sm:h-[250px] rounded-lg overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt=""
          fill
          className="object-cover"
          priority={false}
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6">
        {/* Left: Text Content */}
        <div className="flex-1 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
            {headline}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white font-medium drop-shadow-md">
            {subheadline}
          </p>
        </div>

        {/* Right: CTA Button */}
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="bg-white text-black font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm sm:text-base uppercase tracking-wide hover:bg-gray-100 transition-colors duration-200 shadow-lg focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2"
            aria-label="Sign up now"
          >
            Sign Up Now
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Unused ad data
export const unusedAds = [
  {
    headline: "OWN THE COURT",
    subheadline: "Youth basketball starts here. Join the movement.",
    backgroundImage: "/images/hero-court.jpg",
    gradientFrom: "from-navy/80",
    gradientTo: "to-blue-600/60",
  },
  {
    headline: "PLAY WITH PURPOSE",
    subheadline: "Build skills. Build character. Build your game.",
    backgroundImage: "/images/fans-cheering.jpg",
    gradientFrom: "from-navy/80",
    gradientTo: "to-blue-600/60",
  },
];

export default AdBanner;


