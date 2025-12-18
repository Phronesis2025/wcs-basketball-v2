"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

/**
 * CNC Ad Component with Spotlight Effect
 * Features a gentle spotlight animation that moves back and forth across the image
 * Matches the style of the new page with dark backgrounds and blue accents
 */
const CNCAd = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/tournament-signup");
  };

  return (
    <>
      {/* CSS for spotlight animation and text effects */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes spotlight {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .spotlight-overlay {
          background: radial-gradient(
            ellipse 60% 100% at center,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.08) 20%,
            rgba(255, 255, 255, 0.05) 30%,
            rgba(255, 255, 255, 0.02) 40%,
            transparent 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: spotlight 8s ease-in-out infinite;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .neon-outline-text {
          color: #00a8ff !important;
          -webkit-text-stroke: 1px #00d4ff !important;
          text-stroke: 1px #00d4ff !important;
          font-family: 'IntegralCF Bold Oblique', 'Arial Black', 'Impact', sans-serif !important;
          font-weight: 400 !important;
          letter-spacing: 0.05em !important;
          white-space: nowrap !important;
          font-style: normal !important;
          text-transform: uppercase !important;
          text-shadow: 
            0 0 5px rgba(0, 168, 255, 0.5),
            0 0 10px rgba(0, 168, 255, 0.3),
            0 0 15px rgba(0, 168, 255, 0.2);
          /* Ensure font loads on mobile */
          font-display: swap !important;
        }
        .text-glow {
          filter: drop-shadow(0 0 10px rgba(0, 168, 255, 0.4)) 
                  drop-shadow(0 0 20px rgba(0, 168, 255, 0.3))
                  drop-shadow(0 0 30px rgba(0, 168, 255, 0.2));
        }
      `,
        }}
      />
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
        aria-label="Coach Nate Classic - Click to sign up for tournament"
        className="relative w-full overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent bg-transparent"
      >
        {/* Background Image Container */}
        <div
          className="relative w-full bg-transparent"
          style={{ aspectRatio: "1200/180" }}
        >
          {/* Background Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/CNC ad background1.jpg"
              alt="World Class Sports athletes"
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          {/* Dark Gradient Overlay - darker to let spotlight shine through */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/85 to-black/90"
            aria-hidden="true"
          />

          {/* Spotlight Effect - moves back and forth, shines through the dark gradient */}
          <div
            className="absolute inset-0 spotlight-overlay"
            aria-hidden="true"
          />

          {/* Basketball Bucket Hat Image - Right Side with Blue Glow */}
          <div className="absolute right-0 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-[5] h-full sm:h-[120%] md:h-[140%] aspect-square flex items-center justify-center">
            {/* Soft Blue Glow Background */}
            <div
              className="absolute inset-0 bg-blue-500/15 blur-3xl rounded-full scale-150"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-blue-400/10 blur-2xl rounded-full scale-125"
              aria-hidden="true"
            />
            <Image
              src="/basketballbucket.png"
              alt="Basketball with bucket hat"
              width={200}
              height={200}
              className="object-contain h-full w-auto relative z-10 drop-shadow-2xl"
              priority={true}
            />
          </div>

          {/* Text Content with Neon Blue Outline */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 z-10">
            {/* Soft Blue Glow Background */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-full h-full max-w-4xl flex flex-col items-center justify-center">
                <div className="w-full h-32 sm:h-40 md:h-48 bg-blue-500/10 blur-3xl rounded-full" />
              </div>
            </div>

            {/* Text Content */}
            <div className="relative text-center">
              {/* Coach Nate Classic - One Line */}
              <h2
                className="neon-outline-text text-glow text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-2 sm:mb-3 md:mb-4 leading-tight"
                style={{ fontFamily: "'IntegralCF Bold Oblique', 'Arial Black', 'Impact', sans-serif" }}
              >
                Coach Nate Classic
              </h2>

              {/* Date and Event Info */}
              <p className="text-white font-bebas text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl uppercase tracking-wide drop-shadow-lg">
                Jan 31 • Boys | Feb 1 • Girls
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CNCAd;
