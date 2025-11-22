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
      className="w-full bg-[#0A0A0A] py-8 sm:py-10 text-white overflow-hidden border-t border-white/5"
      aria-label="Motivational quotes"
    >
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center min-h-[80px] flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              {/* Quote Text */}
              <blockquote className="font-inter font-medium text-lg sm:text-xl md:text-2xl leading-relaxed mb-3 text-white tracking-tight">
                "{currentQuote.quote_text}"
              </blockquote>
              {/* Author */}
              <p className="font-inter text-xs sm:text-sm text-neutral-400 uppercase tracking-widest">
                — {currentQuote.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

