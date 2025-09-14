"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

interface ShopItem {
  name: string;
  subtitle: string;
  description: string;
  price: string;
  placeholder: string;
}

const shopItems: ShopItem[] = [
  {
    name: "TEAM JERSEY",
    subtitle: "Official WCS Basketball Jersey",
    description:
      "High-quality team jersey with player number and team logo. Available in all sizes.",
    price: "$35.00",
    placeholder: "JERSEY",
  },
  {
    name: "BASKETBALL",
    subtitle: "Official Game Ball",
    description:
      "Professional-grade basketball perfect for practice and games. Official size and weight.",
    price: "$25.00",
    placeholder: "BALL",
  },
  {
    name: "TEAM HAT",
    subtitle: "WCS Basketball Cap",
    description:
      "Stylish team cap with embroidered logo. Adjustable fit for all ages. Show your team pride!",
    price: "$20.00",
    placeholder: "HAT",
  },
];

export default function Shop() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section ref={ref} className="bg-white py-16 my-8" aria-label="Shop">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bebas text-gray-900 mb-4">SHOP</h2>
          <p className="text-lg text-gray-600 font-inter">
            Get your WCS Basketball gear and equipment
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shopItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bebas text-gray-600">
                    {item.placeholder}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  {item.subtitle}
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed mb-4">
                  <Link
                    href="/shop"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    {item.description}
                  </Link>
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bebas text-red-600">
                    {item.price}
                  </span>
                  <button className="bg-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-opacity-90 transition duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
