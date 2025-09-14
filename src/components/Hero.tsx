"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const { ref, inView } = useInView({ triggerOnce: true });
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/images/girls free throw.jpg",
      alt: "Girls free throw shot",
    },
    { id: 2, image: "/images/boys team.jpg", alt: "Boys team huddle" },
    { id: 3, image: "/images/girls rebound.jpg", alt: "Girls rebound action" },
    {
      id: 4,
      image: "/images/girls jump.jpg",
      alt: "Girls jump shot",
    },
    { id: 5, image: "/images/boys team2.jpg", alt: "Boys team second huddle" },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inView) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 3000); // 3-second transition
    }
    return () => clearInterval(interval);
  }, [inView, slides.length]);

  return (
    <motion.div
      ref={ref}
      className="relative h-[500px] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full"
      >
        <Image
          src={slides[currentSlide].image}
          alt={slides[currentSlide].alt}
          fill
          className="object-cover"
          priority={currentSlide === 0}
          sizes="100vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder-team-default.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl font-bebas uppercase text-white"
          >
            Welcome to WCS Youth Basketball
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl font-inter mt-2 text-white"
          >
            Empowering Kids 8-18 with Skills and Character
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-4"
          >
            <Link
              href="/register"
              className="bg-red text-white font-bold px-6 py-3 rounded hover:bg-opacity-90 transition duration-300"
            >
              Join Now
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
