"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface FlipCardProps {
  images: string[];
  interval: number;
  className?: string;
  alt: string;
}

export default function FlipCard({ images, interval, className = "", alt }: FlipCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (images.length === 0) return;
    
    const flipInterval = setInterval(() => {
      setIsFlipping(true);
      
      // Change image at halfway point of flip
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 300);
      
      // Reset flip state
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }, interval);

    return () => clearInterval(flipInterval);
  }, [images.length, interval]);

  // Don't render if no images
  if (images.length === 0 || !images[currentIndex]) {
    return null;
  }

  return (
    <div className={`flip-card-container ${className}`}>
      <div className={`flip-card-inner ${isFlipping ? 'flipping' : ''}`}>
        <div className="flip-card-face relative">
          <div className="relative w-full h-full">
            <Image
              src={images[currentIndex]}
              alt={alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain"
              style={{ filter: 'grayscale(85%)' }}
              priority={false}
              unoptimized={images[currentIndex]?.startsWith('http')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

