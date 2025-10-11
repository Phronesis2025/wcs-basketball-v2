"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

interface Coach {
  initials: string;
  name: string;
  role: string;
  description: string;
}

const coaches: Coach[] = [
  {
    initials: "JD",
    name: "COACH JOHNSON",
    role: "Head Coach",
    description:
      "Former college player with 10+ years of coaching experience. Specializes in fundamentals and player development.",
  },
  {
    initials: "SM",
    name: "COACH SMITH",
    role: "Assistant Coach",
    description:
      "Expert in game strategy with a passion for mentoring young athletes.",
  },
  {
    initials: "TW",
    name: "COACH WILLIAMS",
    role: "Skills Coach",
    description:
      "Professional trainer with expertise in shooting mechanics and defensive strategies. Works with all age groups.",
  },
];

export default function Coaches() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section
      ref={ref}
      className="bg-gray-50 py-16 my-8"
      aria-label="Coaches Corner"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bebas text-gray-900 mb-4">
            COACHES CORNER
          </h2>
          <p className="text-lg text-gray-600 font-inter">
            Meet our experienced coaching staff
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coaches.map((coach, index) => (
            <motion.div
              key={coach.name}
              initial={{
                opacity: 0,
                x: index === 0 ? -50 : index === 1 ? 0 : 50,
              }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bebas text-gray-600">
                    {coach.initials}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  {coach.name}
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  {coach.role}
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed">
                  <Link
                    href="/coaches/login"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    {coach.description}
                  </Link>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
