"use client";

import { useInView } from "react-intersection-observer";
import Image from "next/image";

export default function Shop() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section ref={ref} className="bg-black py-12" aria-label="Shop Coming Soon">
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`shop-section ${inView ? "shop-section-visible" : ""}`}>
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text Content - Left Side */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-white text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-6 uppercase">
                Gear Coming Soon
              </h2>
              <p className="text-white text-lg font-inter max-w-2xl mx-auto lg:mx-0">
                Get ready to grab your WCS Basketball t-shirts, hats, and more.
                Our shop is launching soon!
              </p>
            </div>

            {/* Image - Right Side */}
            <div className="relative h-48 lg:h-64 w-full max-w-md lg:max-w-lg flex-shrink-0">
              <Image
                src="/images/shop-teaser.jpg"
                alt="Shop Coming Soon"
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/shop-teaser.jpg";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
