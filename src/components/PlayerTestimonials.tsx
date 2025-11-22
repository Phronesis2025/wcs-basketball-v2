"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  rating: number;
}

const testimonials: Testimonial[] = [
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
];

const TestimonialCard: React.FC<{ testimonial: Testimonial; delay: number }> = ({
  testimonial,
  delay,
}) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 md:p-8 flex flex-col justify-between hover:border-white/20 transition-colors"
    >
      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
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
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-white text-xs font-medium font-inter">
            {testimonial.initials}
          </span>
        </div>
        <div>
          <p className="text-white text-sm font-medium font-inter">
            {testimonial.name}
          </p>
          <p className="text-neutral-500 text-xs font-inter">{testimonial.role}</p>
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
      className="py-16 md:py-24 px-6 bg-[#030303] border-t border-white/5"
      aria-label="Player Testimonials"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-semibold tracking-tighter text-white text-center mb-12 md:mb-16 font-inter"
        >
          PLAYER TESTIMONIALS
        </motion.h2>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

