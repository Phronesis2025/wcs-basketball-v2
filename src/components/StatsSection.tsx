"use client";

import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  value: string;
  description: string;
  delay: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, description, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-enter ${delay} ${isVisible ? "fade-enter-active" : ""} group`}
    >
      <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter group-hover:text-blue-500 transition-colors font-inter">
        {value}
      </h3>
      <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest font-inter">
        {description}
      </p>
    </div>
  );
};

export default function StatsSection() {
  return (
    <section
      id="metrics"
      className="py-16 border-y border-white/5 bg-[#0A0A0A] relative z-20"
      aria-label="Key Statistics"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          <StatCard value="300+" description="Players Through WCS" delay="" />
          <StatCard value="20" description="Teams" delay="delay-100" />
          <StatCard value="7" description="State Championships" delay="delay-200" />
        </div>
      </div>
    </section>
  );
}

