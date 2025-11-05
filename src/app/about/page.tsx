"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Core values data for the About page
 * Each value represents a key principle of WCS Basketball
 */
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
    image: "/images/placeholder-news-1.webp",
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

/**
 * About page component displaying WCS Basketball information and core values
 * Features responsive design with scroll-based animations
 */
export default function About() {
  return (
    <div className="bg-navy min-h-screen text-white">
      <section
        className="pt-20 pb-12 sm:pt-24"
        aria-label="About WCS Basketball"
      >
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 uppercase">
              About World Class Sports
            </h1>
            <p className="text-lg font-inter mb-6 max-w-3xl mx-auto">
              WCS stands for World Class Sports. Our basketball club is meant
              for those players who have a desire for serious and competitive
              tournament competition. Since 2000, World Class Sports has made a
              name for itself by fielding teams known throughout the Midwest
              region as being highly competitive, talented, fundamentally sound,
              and well coached.
            </p>
            <h2 className="text-white text-[clamp(2rem,4vw,2.5rem)] font-bebas font-bold mb-8 text-center uppercase">
              Our Mission
            </h2>
            <p className="text-lg font-inter mb-12 max-w-3xl mx-auto">
              World Class Sports is a basketball club designed to provide a
              learning opportunity for youth in Salina, KS and the surrounding
              area to play competitive basketball. The goal of WCS is to teach
              young players the game of basketball. The game of basketball is
              taught with an emphasis on defense, sportsmanship, teamwork, and
              the improvement of each individual player so that they might
              become a successful young person in middle school and beyond, both
              on and off the basketball court.
            </p>
            <h2 className="text-white text-[clamp(2rem,4vw,2.5rem)] font-bebas font-bold mb-8 text-center uppercase">
              Our History
            </h2>
            <p className="text-lg font-inter mb-12 max-w-3xl mx-auto">
              In the summer of 2000 WCS came to Salina by way of a direct link
              to a screen printing and sport camp company named World Class
              Sports in Chicago, Illinois. This link was asked by World Class
              Sports to spread the word and get their name to more of the
              MidWest region of the U.S. World Class started by sponsoring two
              youth basketball teams. From these two teams, a basketball club
              was formed in the city of Salina, thus giving more youth the
              opportunity to play. Now since it's formation in 2000, the World
              Class Basketball Club has sponsored over 32 different teams
              encompassing over 300 kids ranging in levels from 2nd grade to 8th
              grade boys and girls.
            </p>
          </div>
          <div>
            <h2 className="text-white text-[clamp(2rem,4vw,2.5rem)] font-bebas font-bold mb-8 text-center uppercase">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <motion.div
                  key={value.title}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="h-48 bg-gray-200 relative">
                    <Image
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
