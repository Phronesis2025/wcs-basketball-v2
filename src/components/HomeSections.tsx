"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

export default function HomeSections() {
  const { ref: coachesRef, inView: coachesInView } = useInView({
    triggerOnce: true,
  });
  const { ref: shopRef, inView: shopInView } = useInView({ triggerOnce: true });

  return (
    <>
      {/* Coaches Section */}
      <section
        ref={coachesRef}
        className="bg-[#002C51] py-12"
        aria-label="Our Coaches"
      >
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-white text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase"
            initial={{ opacity: 0, y: 50 }}
            animate={coachesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Our Coaches
          </motion.h2>
          <motion.p
            className="text-white text-base font-inter text-center mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={coachesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Meet our experienced coaching staff dedicated to developing young
            athletes both on and off the court.
          </motion.p>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={coachesInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/coaches/login"
                className="inline-block bg-blue-600 text-white font-medium font-inter rounded-md hover:bg-blue-700 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-base px-6 py-3 uppercase no-underline"
              >
                Meet Our Coaches
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section ref={shopRef} className="bg-gray-100 py-12" aria-label="Shop">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-[#002C51] text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase"
            initial={{ opacity: 0, y: 50 }}
            animate={shopInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Shop
          </motion.h2>
          <motion.p
            className="text-gray-700 text-base font-inter text-center mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={shopInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get your WCS Basketball gear and support your team with our official
            merchandise.
          </motion.p>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={shopInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/shop"
                className="inline-block bg-[#002C51] text-white font-medium font-inter rounded-md hover:bg-[#001a33] hover:scale-105 focus:ring-2 focus:ring-[#002C51] focus:ring-offset-2 transition-all duration-300 text-base px-6 py-3 uppercase no-underline"
              >
                Visit Shop
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
