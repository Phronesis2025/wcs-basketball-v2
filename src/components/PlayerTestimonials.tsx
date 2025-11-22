"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
}

const allTestimonials: Testimonial[] = [
  {
    quote: "WCS completely transformed my son's game. The coaches care about the player, not just the player. Highly recommended.",
    name: "Michael J.",
    role: "Parent, WCS",
    initials: "MJ",
    rating: 5,
  },
  {
    quote: "The AAU program here is top tier. We played against the best competition and I got exposure to college scouts I wouldn't have otherwise.",
    name: "David T.",
    role: "Parent, Travel",
    initials: "DT",
    rating: 5,
  },
  {
    quote: "Structure, discipline, and hard work. WCS doesn't cut corners. The facilities are great and the training is intense.",
    name: "Sarah R.",
    role: "Parent, Skills",
    initials: "SR",
    rating: 5,
  },
  {
    quote: "My daughter has grown so much in confidence and skill. The coaching staff truly cares about each player's development.",
    name: "Jennifer L.",
    role: "Parent, Academy",
    initials: "JL",
    rating: 5,
  },
  {
    quote: "Best basketball program in the area. The tournaments and competition level are outstanding. My son made varsity as a freshman!",
    name: "Robert K.",
    role: "Parent, Travel",
    initials: "RK",
    rating: 5,
  },
  {
    quote: "The fundamentals training here is unmatched. You can see real improvement week after week. Worth every penny.",
    name: "Amanda P.",
    role: "Parent, Skills",
    initials: "AP",
    rating: 5,
  },
];

const TestimonialCard: React.FC<{ testimonials: Testimonial[]; delay: number; interval: number }> = ({ 
  testimonials, 
  delay,
  interval 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    const flipInterval = setInterval(() => {
      setIsFlipping(true);
      
      // Change testimonial at halfway point of flip
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 300);
      
      // Reset flip state
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }, interval);

    return () => clearInterval(flipInterval);
  }, [testimonials.length, interval]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 md:p-8 flex flex-col justify-between hover:border-white/20 transition-colors perspective-1000"
    >
      <div className={`flip-card-inner ${isFlipping ? 'flipping' : ''}`}>
        <div className="flip-card-face-testimonial">
          {/* Star Rating */}
          <div className="flex gap-1 mb-4">
            {[...Array(currentTestimonial.rating)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 fill-white"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>

          {/* Quote */}
          <p className="text-neutral-300 text-sm md:text-base leading-relaxed mb-6 font-inter">
            &ldquo;{currentTestimonial.quote}&rdquo;
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white text-xs font-medium font-inter">
                {currentTestimonial.initials}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium font-inter">
                {currentTestimonial.name}
              </p>
              <p className="text-neutral-500 text-xs font-inter">{currentTestimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function PlayerTestimonials() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section
      ref={ref}
      className="pt-8 md:pt-12 pb-16 md:pb-24 px-6 bg-[#030303] border-t border-white/5"
      aria-label="Player Testimonials"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-12 md:mb-16 font-inter"
        >
          Player Testimonials
        </motion.h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 - rotates every 8 seconds */}
          <TestimonialCard
            testimonials={[allTestimonials[0], allTestimonials[3]]}
            delay={0}
            interval={8000}
          />
          
          {/* Card 2 - rotates every 9 seconds */}
          <TestimonialCard
            testimonials={[allTestimonials[1], allTestimonials[4]]}
            delay={0.15}
            interval={9000}
          />
          
          {/* Card 3 - rotates every 10 seconds */}
          <TestimonialCard
            testimonials={[allTestimonials[2], allTestimonials[5]]}
            delay={0.3}
            interval={10000}
          />
        </div>
      </div>
    </section>
  );
}

