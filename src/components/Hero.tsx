"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxStyle = (speed: number) => ({
    transform: `translate3d(0, ${scrollY * speed}px, 0)`,
    willChange: 'transform',
  });

  return (
    <section
      id="home"
      className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center bg-[#030303]"
      aria-label="Hero"
    >
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/[0.05] blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center z-20 relative">
        {/* Badge with pulsing dot */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-300 font-inter">
            Winter Leagues Open
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-white leading-[0.9] text-balance mb-8 font-inter">
          BUILT FOR
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            THE GAME.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 text-lg leading-relaxed max-w-xl mb-10 text-balance font-light font-inter">
          The premier destination for youth basketball development, competitive
          tournaments, and elite training.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 font-inter"
          >
            Find a Program
          </Link>
        </div>
      </div>

      {/* Parallax Image Grid */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Left Column */}
        <div
          className="absolute left-[5%] md:left-[10%] top-[20%] w-48 md:w-64 aspect-[3/4] rounded-lg overflow-hidden opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.05}px)`,
          }}
        >
          <Image
            src="/images/boys team.jpg"
            alt="Team"
            fill
            sizes="(max-width: 768px) 192px, 256px"
            className="object-cover grayscale"
            priority={false}
          />
        </div>
        <div
          className="absolute left-[2%] md:left-[5%] top-[70%] w-40 md:w-56 aspect-[3/4] rounded-lg overflow-hidden opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        >
          <Image
            src="/images/basketball-action.jpg"
            alt="Play"
            fill
            sizes="(max-width: 768px) 160px, 224px"
            className="object-cover grayscale"
            priority={false}
          />
        </div>

        {/* Right Column */}
        <div
          className="absolute right-[5%] md:right-[10%] top-[15%] w-56 md:w-72 aspect-[3/4] rounded-lg overflow-hidden opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.08}px)`,
          }}
        >
          <Image
            src="/images/basketball-closeup.jpg"
            alt="Hoop"
            fill
            sizes="(max-width: 768px) 224px, 288px"
            className="object-cover grayscale"
            priority={false}
          />
        </div>
        <div
          className="absolute right-[2%] md:right-[8%] top-[65%] w-44 md:w-60 aspect-[3/4] rounded-lg overflow-hidden opacity-20"
          style={{
            transform: `translateY(${scrollY * 0.12}px)`,
          }}
        >
          <Image
            src="/images/girls free throw.jpg"
            alt="Coach"
            fill
            sizes="(max-width: 768px) 176px, 240px"
            className="object-cover grayscale"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
