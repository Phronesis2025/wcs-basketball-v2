"use client";

import { useInView } from "react-intersection-observer";
import Image from "next/image";

export default function Shop() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section ref={ref} className="bg-navy py-12" aria-label="Shop Coming Soon">
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center shop-section ${
            inView ? "shop-section-visible" : ""
          }`}
        >
          <h2 className="text-white text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 uppercase">
            Gear Coming Soon
          </h2>
          <p className="text-white text-lg font-inter mb-8 max-w-2xl mx-auto">
            Get ready to grab your WCS Basketball t-shirts, hats, and more. Our
            shop is launching soon!
          </p>
          <div className="relative h-48 bg-gray-200 flex items-center justify-center mx-auto max-w-md">
            <Image
              src="/images/shop-teaser.jpg"
              alt="Shop Coming Soon"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/shop-teaser.jpg";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
