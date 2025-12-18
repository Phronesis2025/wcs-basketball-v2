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

const TestimonialCard: React.FC<{ testimonials: Testimonial[]; delay: number; interval: number; glimmerDelay: number }> = ({ 
  testimonials, 
  delay,
  interval,
  glimmerDelay
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    // Start with front side showing
    setIsFlipped(false);
    
    const flipInterval = setInterval(() => {
      // Flip to back side (keep same testimonial)
      setIsFlipped(true);
      
      // After half the interval, flip back to front and change testimonial
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, interval / 2);
    }, interval);

    return () => clearInterval(flipInterval);
  }, [testimonials.length, interval]);

  const currentTestimonial = testimonials[currentIndex];
  // Back side always shows a different testimonial than the front
  const backTestimonial = testimonials[(currentIndex + 1) % testimonials.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="testimonial-card-wrapper"
    >
      <div className={`testimonial-card-container ${isFlipped ? 'hover' : ''}`}>
        {/* Front Side - Dark Gray - Full Testimonial */}
        <div className="testimonial-card-front">
          <div className="testimonial-card-inner">
            {/* Star Rating */}
            <div className="flex gap-1 mb-4 justify-center">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 star-glimmer"
                  style={{
                    animationDelay: `${glimmerDelay + i * 0.2}s`,
                  }}
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-neutral-200 text-xs md:text-sm leading-relaxed mb-6 font-inter font-normal">
              &ldquo;{currentTestimonial.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-medium font-inter">
                  {currentTestimonial.initials}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium font-inter">
                  {currentTestimonial.name}
                </p>
                <p className="text-neutral-400 text-xs font-normal font-inter">{currentTestimonial.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - Darker Blue - Another Testimonial */}
        <div className="testimonial-card-back">
          <div className="testimonial-card-inner">
            {/* Star Rating */}
            <div className="flex gap-1 mb-4 justify-center">
              {[...Array(backTestimonial.rating)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 star-glimmer"
                  style={{
                    animationDelay: `${glimmerDelay + i * 0.2}s`,
                  }}
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-neutral-200 text-xs md:text-sm leading-relaxed mb-6 font-inter font-normal">
              &ldquo;{backTestimonial.quote}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-medium font-inter">
                  {backTestimonial.initials}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium font-inter">
                  {backTestimonial.name}
                </p>
                <p className="text-neutral-400 text-xs font-normal font-inter">{backTestimonial.role}</p>
              </div>
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
      className="pt-8 md:pt-12 pb-16 md:pb-24 bg-black mx-4 sm:mx-6 lg:mx-8"
      aria-label="Player Testimonials"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            glimmerDelay={0}
          />
          
          {/* Card 2 - rotates every 9 seconds */}
          <TestimonialCard
            testimonials={[allTestimonials[1], allTestimonials[4]]}
            delay={0.15}
            interval={9000}
            glimmerDelay={0.7}
          />
          
          {/* Card 3 - rotates every 10 seconds */}
          <TestimonialCard
            testimonials={[allTestimonials[2], allTestimonials[5]]}
            delay={0.3}
            interval={10000}
            glimmerDelay={1.4}
          />
        </div>
      </div>
    </section>
  );
}

