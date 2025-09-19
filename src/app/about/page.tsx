"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useMediaQuery } from "react-responsive";

const values = [
  {
    title: "Fundamentals First",
    description:
      "Mastering ball-handling, shooting, passing, defense, and footwork.",
    image: "/images/fundamentalsfirst.png",
  },
  {
    title: "Basketball IQ",
    description:
      "Understanding the game, reading situations, and making smart decisions.",
    image: "/images/basketballiq.png",
  },
  {
    title: "Work Ethic",
    description:
      "Committing to consistent practice and striving for excellence.",
    image: "/images/workethic.png",
  },
  {
    title: "Teamwork",
    description:
      "Playing unselfishly and supporting others on and off the court.",
    image: "/images/teamwork.png",
  },
  {
    title: "Leadership",
    description:
      "Leading by example with humility, communication, and accountability.",
    image: "/images/leadership.png",
  },
  {
    title: "Discipline",
    description:
      "Training the mind and body to stay focused, resilient, and coachable.",
    image: "/images/discipline.png",
  },
  {
    title: "Adaptability",
    description: "Learning to adjust, improve, and overcome challenges.",
    image: "/images/adaptability.png",
  },
  {
    title: "Mental Toughness",
    description: "Competing with confidence and composure under pressure.",
    image: "/images/mental-toughness.png",
  },
];

export default function About() {
  const { ref, inView } = useInView({ triggerOnce: true });
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="py-12" aria-label="About WCS Basketball">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 uppercase">
              About World Class Sports Kansas
            </h1>
            <p className="text-lg font-inter mb-6 max-w-3xl mx-auto">
              Founded in 2010, World Class Sports Kansas began as a community
              initiative to empower youth through basketball. Growing from a
              small local league, WCS has become a cornerstone of youth sports
              in Kansas, fostering character, confidence, and community through
              competitive programs and dedicated mentorship.
            </p>
            <p className="text-lg font-inter mb-12 max-w-3xl mx-auto">
              Built on the mission to develop well-rounded athletes, WCS offers
              a positive, competitive environment where young players learn
              discipline, respect, and perseverance. Our programs emphasize
              skill-building, teamwork, and leadership, inspiring the next
              generation of athletes and leaders both on and off the court.
            </p>
          </motion.div>
          <div ref={ref}>
            <h2 className="text-white text-[clamp(2rem,4vw,2.5rem)] font-bebas font-bold mb-8 text-center uppercase">
              Our Values
            </h2>
            <div
              className={
                isMobile
                  ? "space-y-4"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              }
            >
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  whileHover={isMobile ? {} : { scale: 1.05 }}
                >
                  <div className="h-48 bg-gray-200">
                    <img
                      src={value.image}
                      alt={value.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-value.png";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bebas text-navy mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 font-inter text-sm">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
