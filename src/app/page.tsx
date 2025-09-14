"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { FaFacebookF } from "react-icons/fa";

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
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true });
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
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 50 }}
        animate={heroInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <img
          src="/hero-basketball.jpg"
          alt="Basketball action shot"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        <div className="text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-5xl lg:text-7xl font-bebas uppercase leading-tight"
          >
            <div>Welcome to WCS Youth</div>
            <div className="text-5xl md:text-5xl lg:text-7xl">BASKETBALL</div>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl font-inter mt-6 font-light"
          >
            Empowering Kids 8-18 with Skills and Character
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8"
          >
            <Link
              href="/register"
              className="bg-red text-white font-bold px-6 py-3 rounded hover:bg-opacity-90 transition duration-300"
            >
              Join Now
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Our Values Section */}
      <div className="bg-white py-16 my-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bebas text-gray-900 mb-4">
              OUR VALUES
            </h2>
            <p className="text-base text-gray-600 font-inter">
              What we teach our young athletes goes beyond basketball
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bebas text-gray-900 mb-3">
                CHARACTER BUILDING
              </h3>
              <p className="text-gray-600 font-inter text-base leading-relaxed">
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-red transition duration-300"
                >
                  We instill values of respect, integrity, and sportsmanship in
                  every player.
                </Link>
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bebas text-gray-900 mb-3">
                SKILL DEVELOPMENT
              </h3>
              <p className="text-gray-600 font-inter text-base leading-relaxed">
                <Link
                  href="/coaches"
                  className="text-gray-600 hover:text-red transition duration-300"
                >
                  Expert coaching focused on fundamentals and advanced
                  basketball techniques.
                </Link>
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bebas text-gray-900 mb-3">
                TEAMWORK
              </h3>
              <p className="text-gray-600 font-inter text-base leading-relaxed">
                <Link
                  href="/teams"
                  className="text-gray-600 hover:text-red transition duration-300"
                >
                  Teaching collaboration, leadership, and communication through
                  basketball.
                </Link>
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bebas text-gray-900 mb-3">
                EXCELLENCE
              </h3>
              <p className="text-gray-600 font-inter text-base leading-relaxed">
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-red transition duration-300"
                >
                  Striving for personal best both on and off the court.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

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
            {/* Coach 1 */}
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

            {/* Coach 2 */}
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

            {/* Coach 3 */}
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
            {/* Product 1 */}
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

            {/* Product 2 */}
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

            {/* Product 3 */}
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
