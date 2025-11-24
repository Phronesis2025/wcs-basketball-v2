"use client";

import { useEffect, useRef, useState } from "react";
import { devError, devLog } from "@/lib/security";

interface StatCardProps {
  targetValue: number;
  description: string;
  delay: string;
  suffix?: string; // For "+" or other suffixes
}

const StatCard: React.FC<StatCardProps> = ({ targetValue, description, delay, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;

    const startAnimation = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      setHasAnimated(true);
      
      // Start count-up animation
      const duration = 3000; // 3 seconds
      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Linear easing (like the CodePen example)
        const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
        setDisplayValue(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure final value is exact
          setDisplayValue(targetValue);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStartedRef.current) {
            startAnimation();
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
      // Check if already visible on mount
      const rect = ref.current.getBoundingClientRect();
      const isVisibleOnMount = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisibleOnMount) {
        // Small delay to ensure component is fully mounted
        setTimeout(() => {
          if (!hasStartedRef.current) {
            startAnimation();
          }
        }, 100);
      } else {
        observer.observe(ref.current);
      }
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue]);

  return (
    <div
      ref={ref}
      className={`fade-enter ${delay} ${hasAnimated ? "fade-enter-active" : ""} group`}
    >
      <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter group-hover:text-blue-500 transition-colors font-inter">
        {displayValue}{suffix}
      </h3>
      <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest font-inter">
        {description}
      </p>
    </div>
  );
};

export default function StatsSection() {
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamCount = async () => {
      try {
        const response = await fetch('/api/stats/teams-count');
        if (!response.ok) {
          devError("Error fetching team count:", response.statusText);
          // Fallback to default value
          setTeamCount(20);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setTeamCount(data.count || 20);
        devLog(`Team count fetched: ${data.count}`);
      } catch (error) {
        devError("Error fetching team count:", error);
        // Fallback to default value
        setTeamCount(20);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamCount();
  }, []);

  return (
    <section
      id="metrics"
      className="py-16 bg-black relative z-20"
      aria-label="Key Statistics"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          <StatCard 
            targetValue={300} 
            description="Players Through WCS" 
            delay="" 
            suffix="+"
          />
          <StatCard 
            targetValue={teamCount || 20} 
            description="Teams" 
            delay="delay-100" 
          />
          <StatCard 
            targetValue={7} 
            description="State Championships" 
            delay="delay-200" 
          />
        </div>
      </div>
    </section>
  );
}

