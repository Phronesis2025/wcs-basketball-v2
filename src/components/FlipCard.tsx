"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { devError, devLog } from "@/lib/security";

interface FlipCardProps {
  images: string[];
  interval: number;
  className?: string;
  alt: string;
}

export default function FlipCard({ images, interval, className = "", alt }: FlipCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

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

  // Handle image load errors
  const handleImageError = (index: number, url: string) => {
    devError(`Failed to load image at index ${index}: ${url}`);
    setImageErrors(prev => new Set([...prev, index]));
    
    // Try next image if current one failed
    if (index === currentIndex && images.length > 1) {
      const nextIndex = (index + 1) % images.length;
      if (!imageErrors.has(nextIndex)) {
        setCurrentIndex(nextIndex);
      }
    }
  };

  // Don't render if no images or all images have errors
  if (images.length === 0 || !images[currentIndex]) {
    return null;
  }

  // Skip to next valid image if current one has an error
  let displayIndex = currentIndex;
  while (imageErrors.has(displayIndex) && images.length > 1) {
    displayIndex = (displayIndex + 1) % images.length;
    if (displayIndex === currentIndex) break; // Avoid infinite loop
  }

  if (imageErrors.has(displayIndex) && images.length === imageErrors.size) {
    // All images failed to load
    devError(`All images failed to load for ${alt}`);
    return null;
  }

  const currentImageUrl = images[displayIndex];
  
  if (!currentImageUrl) {
    return null;
  }

  return (
    <div className={`flip-card-container ${className}`}>
      <div className={`flip-card-inner ${isFlipping ? 'flipping' : ''}`}>
        <div className="flip-card-face relative">
          <div className="relative w-full h-full">
            <Image
              src={currentImageUrl}
              alt={alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain"
              style={{ filter: 'grayscale(85%)' }}
              priority={false}
              unoptimized={currentImageUrl?.startsWith('http')}
              onError={() => handleImageError(displayIndex, currentImageUrl)}
              onLoad={() => devLog(`Successfully loaded image: ${currentImageUrl}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

