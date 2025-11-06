"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

// Coach Nate Ad 2 - with new background and animated gradient
const CoachNateAd2 = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/tournament-signup");
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
        @keyframes neon-flicker-mobile {
          0%, 85%, 100% {
            text-shadow: none;
          }
          86%, 88% {
            text-shadow:
              -0.02rem -0.02rem 0.1rem #fff,
              0.02rem 0.02rem 0.1rem #fff,
              0 0 0.2rem #08f,
              0 0 0.4rem #08f;
          }
          87%, 89% {
            text-shadow:
              -0.02rem -0.02rem 0.1rem #fff,
              0.02rem 0.02rem 0.1rem #fff,
              0 0 0.2rem #f40,
              0 0 0.4rem #f40;
          }
          15%, 17% {
            text-shadow:
              -0.02rem -0.02rem 0.1rem #fff,
              0.02rem 0.02rem 0.1rem #fff,
              0 0 0.2rem #f40,
              0 0 0.4rem #f40;
          }
          16%, 18% {
            text-shadow:
              -0.02rem -0.02rem 0.1rem #fff,
              0.02rem 0.02rem 0.1rem #fff,
              0 0 0.2rem #08f,
              0 0 0.4rem #08f;
          }
          45%, 47% {
            text-shadow:
              -0.02rem -0.02rem 0.1rem #fff,
              0.02rem 0.02rem 0.1rem #fff,
              0 0 0.2rem #08f,
              0 0 0.4rem #08f;
          }
          46%, 48% {
            text-shadow:
              -0.02rem -0.02rem 0.1rem #fff,
              0.02rem 0.02rem 0.1rem #fff,
              0 0 0.2rem #f40,
              0 0 0.4rem #f40;
          }
        }
        .neon-text {
          animation: neon-flicker 15s infinite;
        }
        @media (max-width: 640px) {
          .neon-text {
            animation: neon-flicker-mobile 15s infinite;
          }
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
        aria-label="Coach Nate Classic - January 31 - Boys • February 1 - Girls. Click to view tournament information."
        className="relative w-full overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent bg-transparent"
      >
        {/* Background Image - container height is half of original (1200/200 aspect ratio) */}
        <div
          className="relative w-full bg-transparent"
          style={{ aspectRatio: "1200/180" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/CNC ad background1.jpg"
              alt=""
              fill
              className="object-cover"
              priority={true}
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>

          {/* Dark Blue Gradient Overlay - slowly fades in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeIn" }}
            className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-900/90 to-blue-900/85"
            aria-hidden="true"
          />

          {/* Content - positioned absolutely over the image, centered */}
          <div className="absolute inset-0 flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-4 py-3 sm:py-4 md:py-6 lg:py-8">
            {/* Centered Text Content - fades in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-center z-10"
            >
              <h2 className="font-bebas-bold-italic text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl text-white mb-0 leading-tight neon-text">
                COACH NATE CLASSIC
              </h2>
              <p className="font-bebas text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white drop-shadow-lg -mt-1 sm:-mt-1 md:-mt-2 lg:-mt-2">
                JANUARY 31 - BOYS • FEBRUARY 1 - GIRLS
              </p>
            </motion.div>
          </div>

          {/* World Class Logo - drops in last with bounce */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 2.5,
            }}
            className="absolute left-0 sm:left-1 md:left-2 lg:left-3 -top-2 sm:-top-3 md:-top-4 z-10"
          >
            <Image
              src="/World_Class_Logo 23.png"
              alt="World Class Logo"
              width={200}
              height={200}
              className="w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 2xl:w-60 2xl:h-60 object-contain drop-shadow-2xl"
              priority={true}
            />
          </motion.div>

          {/* Bucket Hat Image - bounces in from the right */}
          <motion.div
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 10, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 3,
            }}
            className="absolute right-0 sm:right-2 md:right-4 lg:right-6 -top-2 sm:-top-3 md:-top-4 z-10"
          >
            <Image
              src="/buckethat.png"
              alt="Bucket hat on basketball"
              width={200}
              height={200}
              className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 2xl:w-64 2xl:h-64 object-contain drop-shadow-2xl"
              priority={true}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CoachNateAd2;
