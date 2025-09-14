"use client";

import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";

interface NewsItem {
  id: number;
  title: string;
  date: string;
  image: string;
  description: string;
  details: string;
}

export default function NewsCarousel() {
  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: "Championship Victory!",
      date: "May 10, 2025",
      image: "/images/placeholder-news-1.png",
      description: "Our U-14 team won the regional championship!",
      details:
        "The Salina Youth Basketball Club's U-14 team secured a stunning victory at the Central Kansas Regional Championship on May 10, 2025. With a final score of 52-48, the team showcased exceptional teamwork and skill. Coach Smith praised the players for their dedication and strategic play, especially in the final quarter where they mounted a comeback from a 10-point deficit.",
    },
    {
      id: 2,
      title: "Summer Camp Registration Open",
      date: "May 5, 2025",
      image: "/images/placeholder-news-2.png",
      description: "Join our summer basketball camp starting June 1.",
      details:
        "Registration is now open for the Salina Youth Basketball Club's Summer Camp, starting June 1, 2025. The camp will run for 6 weeks, offering intensive training sessions, skill workshops, and friendly matches. Open to players aged 8-16, the camp will be led by experienced coaches, including guest appearances from local pros. Sign up now to secure your spot!",
    },
    {
      id: 3,
      title: "New Merch Drop",
      date: "April 28, 2025",
      image: "/images/placeholder-news-3.jpg",
      description: "Check out our latest team apparel in the shop.",
      details:
        "We've just released a new line of team apparel in the Salina Youth Basketball Club shop! From jerseys to hoodies, our latest collection features the club's navy and red colors with bold designs. Available for players, parents, and fans, these items are perfect for showing your support at games or training sessions. Visit the shop today!",
    },
  ];

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  const openModal = (item: NewsItem) => {
    // Sanitize the news item data
    const sanitizedItem = {
      ...item,
      title: sanitizeInput(item.title),
      description: sanitizeInput(item.description),
      details: sanitizeInput(item.details),
    };
    setSelectedNews(sanitizedItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedNews(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && modalRef.current && closeButtonRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeModal();
          return;
        }
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      closeButtonRef.current.focus();

      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isModalOpen]);

  return (
    <section className="py-16 bg-navy">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bebas uppercase text-white mb-2">
            Latest News
          </h2>
          <p className="text-lg font-inter text-white/80">
            Stay up to date with WCS Basketball events and announcements
          </p>
        </div>
        <div className="relative">
          <Swiper
            className="rounded-lg overflow-hidden"
            modules={[Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            navigation={{
              nextEl: ".news-next",
              prevEl: ".news-prev",
            }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {newsItems.map((item) => (
              <SwiperSlide key={item.id}>
                <motion.div
                  className="bg-white text-navy rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => openModal(item)}
                  onKeyDown={(e) => e.key === "Enter" && openModal(item)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Read more about ${item.title}`}
                >
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder-news.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bebas text-xl uppercase text-navy mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="font-inter text-sm text-gray-700 mb-2">
                      {item.date}
                    </p>
                    <p className="font-inter text-sm text-gray-700 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
          <button
            className="news-prev absolute left-0 top-1/2 -translate-y-1/2 bg-red text-white p-3 rounded-full hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 z-10"
            aria-label="Previous news"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="news-next absolute right-0 top-1/2 -translate-y-1/2 bg-red text-white p-3 rounded-full hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 z-10"
            aria-label="Next news"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && selectedNews && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <div
              ref={modalRef}
              className="bg-white text-navy rounded-lg max-w-2xl w-full mx-4 p-6 relative"
            >
              <button
                ref={closeButtonRef}
                onClick={closeModal}
                onKeyDown={(e) => e.key === "Enter" && closeModal()}
                className="absolute top-4 right-4 text-navy hover:text-red focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-sm transition-colors duration-300"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h3
                id="modal-title"
                className="font-bebas text-3xl font-semibold mb-4 uppercase text-navy"
              >
                {selectedNews.title}
              </h3>
              <div className="relative w-full h-48 overflow-hidden mb-4">
                <Image
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-top rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder-news.png";
                  }}
                />
              </div>
              <p className="text-base font-inter mb-2 text-gray-700">
                {selectedNews.date}
              </p>
              <p className="text-base font-inter text-gray-700">
                {selectedNews.details}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
