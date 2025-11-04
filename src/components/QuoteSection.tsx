"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchQuotes } from "@/lib/actions";
import { Quote } from "@/types/supabase";
import { sanitizeInput } from "@/lib/security";

export default function QuoteSection() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quotes on component mount
  useEffect(() => {
    async function loadQuotes() {
      try {
        const fetchedQuotes = await fetchQuotes();
        // Sanitize quote text and author for XSS protection (defense in depth)
        const sanitizedQuotes = fetchedQuotes.map((quote) => ({
          ...quote,
          quote_text: sanitizeInput(quote.quote_text),
          author: sanitizeInput(quote.author),
        }));
        setQuotes(sanitizedQuotes);
        setIsLoading(false);
      } catch (error) {
        // Don't expose error details to client - just fail silently
        setIsLoading(false);
      }
    }
    loadQuotes();
  }, []);

  // Auto-rotate carousel every 7 seconds
  useEffect(() => {
    if (quotes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  // Don't render if loading or no quotes
  if (isLoading || quotes.length === 0) {
    return null;
  }

  const currentQuote = quotes[currentIndex];

  return (
    <section
      className="w-full bg-black py-2 text-white overflow-hidden border-t border-b border-red"
      aria-label="Motivational quotes"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center min-h-[80px] flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              {/* Quote Text */}
              <blockquote className="font-bebas-bold-italic text-lg sm:text-2xl leading-tight mb-2 line-clamp-2">
                {currentQuote.quote_text}
              </blockquote>
              {/* Author */}
              <p className="font-bebas-light text-sm sm:text-base line-clamp-1">
                — {currentQuote.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

