"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const shopItems = [
  {
    name: "TEAM JERSEY",
    subtitle: "Official WCS Basketball Jersey",
    description:
      "High-quality team jersey with player number and team logo. Available in all sizes.",
    price: "$35.00",
    image: "/images/placeholder-news-1.png",
  },
  {
    name: "BASKETBALL",
    subtitle: "Official Game Ball",
    description:
      "Professional-grade basketball perfect for practice and games. Official size and weight.",
    price: "$25.00",
    image: "/basketball.jpg",
  },
  {
    name: "TEAM HAT",
    subtitle: "WCS Basketball Cap",
    description:
      "Stylish team cap with embroidered logo. Adjustable fit for all ages. Show your team pride!",
    price: "$20.00",
    image: "/images/placeholder-news-2.png",
  },
];

export default function Shop() {
  const { ref, inView } = useInView({ triggerOnce: true });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section ref={ref} className="bg-white py-12" aria-label="Gear">
      <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-navy text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
          Gear
        </h2>
        <p className="text-gray-600 text-lg font-inter mb-8 text-center">
          Get your WCS Basketball gear and equipment.
        </p>
        <div
          className={
            isMobile ? "space-y-4" : "grid grid-cols-1 md:grid-cols-3 gap-8"
          }
        >
          {shopItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              whileHover={isMobile ? {} : { scale: 1.05 }}
            >
              <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder-shop.jpg";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-navy mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  {item.subtitle}
                </p>
                <p className="text-gray-600 font-inter text-sm mb-4">
                  {item.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bebas text-red-600">
                    {item.price}
                  </span>
                  <Link
                    href="/shop"
                    className="bg-red text-white font-medium font-inter rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 text-sm px-5 py-2.5 uppercase"
                  >
                    Add to Cart
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
