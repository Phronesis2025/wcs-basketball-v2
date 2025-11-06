"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

// Coach Nate Ad component - duplicate of Be Legendary ad structure
const CoachNateAd = () => {
  const router = useRouter();

  const handleClick = () => {
    // Update this route if needed
    router.push("/register");
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes neon-flicker {
          0%, 85%, 100% {
            text-shadow: none;
          }
          86%, 88% {
            text-shadow:
              -0.05rem -0.05rem 0.3rem #fff,
              0.05rem 0.05rem 0.3rem #fff,
              0 0 0.5rem #08f,
              0 0 1rem #08f,
              0 0 1.5rem #08f;
          }
          87%, 89% {
            text-shadow:
              -0.05rem -0.05rem 0.3rem #fff,
              0.05rem 0.05rem 0.3rem #fff,
              0 0 0.5rem #f40,
              0 0 1rem #f40,
              0 0 1.5rem #f40;
          }
          15%, 17% {
            text-shadow:
              -0.05rem -0.05rem 0.3rem #fff,
              0.05rem 0.05rem 0.3rem #fff,
              0 0 0.5rem #f40,
              0 0 1rem #f40,
              0 0 1.5rem #f40;
          }
          16%, 18% {
            text-shadow:
              -0.05rem -0.05rem 0.3rem #fff,
              0.05rem 0.05rem 0.3rem #fff,
              0 0 0.5rem #08f,
              0 0 1rem #08f,
              0 0 1.5rem #08f;
          }
          45%, 47% {
            text-shadow:
              -0.05rem -0.05rem 0.3rem #fff,
              0.05rem 0.05rem 0.3rem #fff,
              0 0 0.5rem #08f,
              0 0 1rem #08f,
              0 0 1.5rem #08f;
          }
          46%, 48% {
            text-shadow:
              -0.05rem -0.05rem 0.3rem #fff,
              0.05rem 0.05rem 0.3rem #fff,
              0 0 0.5rem #f40,
              0 0 1rem #f40,
              0 0 1.5rem #f40;
          }
        }
        .neon-text {
          animation: neon-flicker 15s infinite;
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
        aria-label="Coach Nate - Train. Compete. Rise above. Click to register."
        className="relative w-full rounded-xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent bg-transparent"
      >
        {/* Background Image - container height is half of original (1200/200 aspect ratio) */}
        <div
          className="relative w-full bg-transparent"
          style={{ aspectRatio: "1200/180" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/coachNateAd.jpg"
              alt=""
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          {/* Dark Gradient Overlay - darker on left, lighter on right */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"
            aria-hidden="true"
          />

          {/* Content - positioned absolutely over the image, centered */}
          <div className="absolute inset-0 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-4 py-3 sm:py-4 md:py-6 lg:py-8">
            {/* Centered Text Content */}
            <div className="text-center z-10">
              <h2 className="font-bebas-bold-italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-white mb-0 leading-tight neon-text">
                COACH NATE CLASSIC
              </h2>
              <p className="font-bebas text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white drop-shadow-lg -mt-1 sm:-mt-1 md:-mt-2 lg:-mt-2">
                JANUARY 31 - BOYS • FEBRUARY 1 - GIRLS
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachNateAd;
