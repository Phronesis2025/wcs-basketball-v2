"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

export default function Shop() {
  const { ref, inView } = useInView({ triggerOnce: true });
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  return (
    <section ref={ref} className="bg-navy py-12" aria-label="Shop Coming Soon">
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
          whileHover={isMobile ? {} : { scale: 1.05 }}
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/shop-teaser.jpg";
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
