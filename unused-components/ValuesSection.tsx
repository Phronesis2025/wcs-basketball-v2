"use client";

// Removed Framer Motion for better performance
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface Value {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  example: string;
  image: string;
}

export default function ValuesSection() {
  const values: Value[] = [
    {
      id: 1,
      title: "Fundamentals First",
      description:
        "Mastering ball-handling, shooting, passing, defense, and footwork.",
      longDescription:
        "Fundamentals First builds a strong foundation, ensuring players master essential skills like dribbling, shooting, and defense through disciplined practice, setting them up for long-term success.",
      example:
        "In practice, players focus on perfecting their shooting form, repeating drills to ensure muscle memory and consistency.",
      image: "/images/fundamentalsfirst.png",
    },
    {
      id: 2,
      title: "Basketball IQ",
      description:
        "Understanding the game, reading situations, and making smart decisions.",
      longDescription:
        "Basketball IQ empowers players to read the court, anticipate plays, and make strategic decisions, fostering a deeper understanding of the game&apos;s nuances and team dynamics.",
      example:
        "A player recognizes a defensive gap and calls a play to exploit it, leading to an easy basket.",
      image: "/images/basketballiq.png",
    },
    {
      id: 3,
      title: "Work Ethic",
      description:
        "Committing to consistent practice and striving for excellence.",
      longDescription:
        "Work Ethic drives players to show up, put in the effort, and pursue excellence daily, building habits that translate to success in basketball and beyond.",
      example:
        "A player stays after practice to work on free throws, aiming to improve their percentage before the next game.",
      image: "/images/workethic.png",
    },
    {
      id: 4,
      title: "Teamwork",
      description:
        "Playing unselfishly and supporting others on and off the court.",
      longDescription:
        "Teamwork fosters unselfish play, encouraging players to prioritize team goals, communicate effectively, and uplift teammates, creating a cohesive and supportive unit.",
      example:
        "In a game, a player passes to an open teammate for a game-winning shot instead of forcing a contested one.",
      image: "/images/teamwork.png",
    },
    {
      id: 5,
      title: "Leadership",
      description:
        "Leading by example with humility, communication, and accountability.",
      longDescription:
        "Leadership inspires players to guide their team with humility, clear communication, and accountability, setting a positive example for peers both on and off the court.",
      example:
        "A player rallies teammates during a timeout, encouraging focus and teamwork to mount a comeback.",
      image: "/images/leadership.png",
    },
    {
      id: 6,
      title: "Discipline",
      description:
        "Training the mind and body to stay focused, resilient, and coachable.",
      longDescription:
        "Discipline strengthens players&apos; mental and physical resilience, ensuring they stay focused, follow coaching, and remain coachable under pressure, driving personal growth.",
      example:
        "A player adheres to a strict training schedule, balancing schoolwork and practice to stay prepared.",
      image: "/images/discipline.png",
    },
    {
      id: 7,
      title: "Adaptability",
      description: "Learning to adjust, improve, and overcome challenges.",
      longDescription:
        "Adaptability equips players to adjust to new strategies, overcome setbacks, and embrace feedback, fostering growth and versatility in dynamic game situations.",
      example:
        "A player switches defensive roles mid-game to counter an opponent&apos;s star player, adjusting seamlessly.",
      image: "/images/adaptability.png",
    },
  ];

  const [startIndex, setStartIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<Value | null>(null);
  // Removed slide direction state for simpler implementation

  const openModal = (value: Value) => {
    setSelectedValue(value);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedValue(null);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 3 + values.length) % values.length);
  };

  const handleNext = () => {
    setStartIndex((prev) => (prev + 3) % values.length);
  };

  // Removed complex animation variants for better performance

  // Compute the 3 visible cards for the current page (wraps around)
  const visibleValues: Value[] = [0, 1, 2].map((offset) => {
    const valueIndex = (startIndex + offset) % values.length;
    return values[valueIndex];
  });

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-bebas text-4xl mb-2 uppercase text-navy">
            Our Values
          </h2>
          <p className="font-inter text-lg text-gray-600">
            What we teach our young athletes goes beyond basketball
          </p>
        </div>
        <div className="relative">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 pb-4">
            {visibleValues.map((value) => (
              <div
                key={`${value.id}-${startIndex}`}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 values-card"
                onClick={() => openModal(value)}
                onKeyDown={(e) => e.key === "Enter" && openModal(value)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${value.title}`}
              >
                <div className="relative w-full h-32 sm:h-40 lg:h-48 overflow-hidden">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/placeholder-team-default.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60" />
                </div>
                <div className="p-2 sm:p-4 lg:p-6">
                  <h3 className="font-bebas text-sm sm:text-lg lg:text-2xl mb-1 sm:mb-2 uppercase text-navy">
                    {value.title}
                  </h3>
                  <p className="font-inter text-xs sm:text-sm leading-relaxed text-gray-700 line-clamp-2 sm:line-clamp-3">
                    {value.description}
                  </p>
                  <Link
                    href={`/about#${value.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="mt-2 sm:mt-4 inline-block text-red font-bold hover:underline text-xs sm:text-sm"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-red text-white p-2 rounded-full hover:bg-opacity-90 transition duration-300"
            onClick={handlePrev}
            aria-label="Previous values"
          >
            <FaArrowLeft />
          </button>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-red text-white p-2 rounded-full hover:bg-opacity-90 transition duration-300"
            onClick={handleNext}
            aria-label="Next values"
          >
            <FaArrowRight />
          </button>
        </div>

        {isModalOpen && selectedValue && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
            onClick={closeModal}
          >
            <div className="bg-gray-900 text-white rounded-lg max-w-xl w-full mx-4 p-6">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 focus:ring-2 focus:ring-red focus:ring-offset-2 rounded-sm transition-colors duration-300"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h3
                id="modal-title"
                className="font-bebas text-3xl font-semibold mb-4 uppercase border-b-2 border-red pb-2"
              >
                {selectedValue.title}
              </h3>
              <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                <Image
                  src={selectedValue.image}
                  alt={selectedValue.title}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder-team-default.jpg";
                  }}
                />
              </div>
              <p className="text-base font-inter mb-2">
                {selectedValue.longDescription}
              </p>
              <p className="text-base font-inter">
                <strong>Example:</strong> {selectedValue.example}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
