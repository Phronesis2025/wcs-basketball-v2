"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Hero from "@/components/Hero";
import ValuesSection from "@/components/ValuesSection";
import { FaFacebookF } from "react-icons/fa";
import Link from "next/link";

const teams = [
  { name: "WCS Warriors", ageGroup: "U12 Boys", logo: "/logos/warriors.png" },
  { name: "WCS Sharks", ageGroup: "U14 Girls", logo: "/logos/sharks.png" },
  { name: "WCS Blue", ageGroup: "U10 Boys", logo: "/logos/blue.png" },
];

const newsItems = [
  "Game Day Announced for Sep 15, 2025",
  "New Coaching Clinic This Weekend",
  "Season Kickoff Party Details",
];

export default function Home() {
  const { ref: teamsRef, inView: teamsInView } = useInView({
    triggerOnce: true,
  });
  const { ref: newsRef, inView: newsInView } = useInView({ triggerOnce: true });
  const { ref: coachesRef, inView: coachesInView } = useInView({
    triggerOnce: true,
  });
  const { ref: shopRef, inView: shopInView } = useInView({ triggerOnce: true });

  return (
    <div className="bg-navy min-h-screen text-white">
      {/* Hero Section */}
      <Hero />

      {/* Values Section */}
      <ValuesSection />

      {/* News Carousel */}
      <div ref={newsRef} className="max-w-7xl mx-auto px-4 py-8 my-8">
        <h2 className="text-3xl font-bebas text-center mb-6">Latest News</h2>
        <div className="relative w-full overflow-hidden">
          <div className="flex space-x-4 animate-scroll">
            {newsItems.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 50 }}
                animate={newsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white text-navy p-4 rounded-lg shadow-md min-w-[300px] flex items-center justify-center"
              >
                <Link href="/news" className="font-inter text-lg">
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>
          <style>
            {`
              .animate-scroll {
                animation: scroll 15s infinite linear;
              }
              @keyframes scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
              }
            `}
          </style>
        </div>
      </div>

      {/* Team Previews */}
      <div ref={teamsRef} className="bg-gray-50 py-16 my-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bebas text-gray-900 mb-4">
              OUR TEAMS
            </h2>
            <p className="text-lg text-gray-600 font-inter">
              Meet our competitive youth basketball teams
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teams.map((team, index) => (
              <motion.div
                key={team.name}
                initial={{ opacity: 0, x: -50 }}
                animate={teamsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={team.logo}
                      alt={`${team.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = "flex";
                        }
                      }}
                    />
                    <span className="text-lg font-bebas text-gray-600 hidden">
                      {team.name.slice(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bebas text-gray-900 mb-2">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-inter mb-3">
                    {team.ageGroup}
                  </p>
                  <p className="text-gray-600 font-inter text-sm leading-relaxed">
                    <Link
                      href="/teams"
                      className="text-gray-600 hover:text-red transition duration-300"
                    >
                      Competitive youth basketball team focused on skill
                      development and teamwork.
                    </Link>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Coaches Corner */}
      <div ref={coachesRef} className="bg-gray-50 py-16 my-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bebas text-gray-900 mb-4">
              COACHES CORNER
            </h2>
            <p className="text-lg text-gray-600 font-inter">
              Meet our experienced coaching staff
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={coachesInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bebas text-gray-600">JD</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  COACH JOHNSON
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  Head Coach
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed">
                  <Link
                    href="/coaches"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    Former college player with 10+ years of coaching experience.
                    Specializes in fundamentals and player development.
                  </Link>
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 0 }}
              animate={coachesInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bebas text-gray-600">SM</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  COACH SMITH
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  Assistant Coach
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed">
                  <Link
                    href="/coaches"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    Youth basketball specialist with a focus on teamwork and
                    character building. Certified in sports psychology.
                  </Link>
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={coachesInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bebas text-gray-600">DW</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  COACH WILLIAMS
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  Skills Coach
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed">
                  <Link
                    href="/coaches"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    Professional trainer with expertise in shooting mechanics
                    and defensive strategies. Works with all age groups.
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Shop Section */}
      <div ref={shopRef} className="bg-white py-16 my-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bebas text-gray-900 mb-4">SHOP</h2>
            <p className="text-lg text-gray-600 font-inter">
              Get your WCS Basketball gear and equipment
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={shopInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bebas text-gray-600">
                    JERSEY
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  TEAM JERSEY
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  Official WCS Basketball Jersey
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed mb-4">
                  <Link
                    href="/shop"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    High-quality team jersey with player number and team logo.
                    Available in all sizes.
                  </Link>
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bebas text-red-600">
                    $35.00
                  </span>
                  <button className="bg-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-opacity-90 transition duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={shopInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bebas text-gray-600">BALL</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  BASKETBALL
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  Official Game Ball
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed mb-4">
                  <Link
                    href="/shop"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    Professional-grade basketball perfect for practice and
                    games. Official size and weight.
                  </Link>
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bebas text-red-600">
                    $25.00
                  </span>
                  <button className="bg-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-opacity-90 transition duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={shopInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bebas text-gray-600">HAT</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bebas text-gray-900 mb-2">
                  TEAM HAT
                </h3>
                <p className="text-sm text-gray-600 font-inter mb-3">
                  WCS Basketball Cap
                </p>
                <p className="text-gray-600 font-inter text-sm leading-relaxed mb-4">
                  <Link
                    href="/shop"
                    className="text-gray-600 hover:text-red transition duration-300"
                  >
                    Stylish team cap with embroidered logo. Adjustable fit for
                    all ages. Show your team pride!
                  </Link>
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bebas text-red-600">
                    $20.00
                  </span>
                  <button className="bg-red text-white px-4 py-2 rounded text-sm font-bold hover:bg-opacity-90 transition duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy py-4 text-center">
        <p className="text-base">
          © 2025 WCS Basketball | Contact: info@wcsbasketball.com
        </p>
      </footer>
    </div>
  );
}
