"use client";

import { useEffect, useState } from "react";

export default function ParallaxSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      {/* Continuous Parallax Background Image - Tall enough to cover entire page scroll */}
      <div
        className="absolute top-0 left-0 w-full h-[300vh]"
        style={{
          backgroundImage: 'url(/hoop-silhouette.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat-y',
          transform: `translateY(${scrollY * 0.4}px)`,
          willChange: 'transform',
        }}
      />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-transparent pointer-events-none" />
    </div>
  );
}

