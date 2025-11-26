"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { devError, devLog } from "@/lib/security";

interface FlipCardProps {
  images: string[];
  interval: number;
  className?: string;
  alt: string;
  hasEdgeBlur?: boolean; // For non-logo/equip images
}

export default function FlipCard({
  images,
  interval,
  className = "",
  alt,
  hasEdgeBlur = false,
}: FlipCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (images.length === 0) return;

    // Use the interval prop to calculate timing
    // interval = total cycle time (display + fade out + fade in)
    const fadeOutDuration = 500; // 0.5s fade out
    const fadeInDuration = 500; // 0.5s fade in
    const displayDuration = interval - fadeOutDuration - fadeInDuration; // Remaining time for display

    // Start with first image fading in
    setIsFading(true);
    setTimeout(() => {
      setIsFading(false);
    }, fadeInDuration);

    const fadeInterval = setInterval(() => {
      // After display duration, start fade out
      setTimeout(() => {
        setIsFading(true);

        // After fade out completes, change image and fade in
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % images.length);

          // Start fade in for new image
          setTimeout(() => {
            setIsFading(false);
          }, 10);
        }, fadeOutDuration);
      }, displayDuration);
    }, interval);

    return () => clearInterval(fadeInterval);
  }, [images.length, interval]);

  // Handle image load errors
  const handleImageError = (index: number, url: string) => {
    devError(`Failed to load image at index ${index}: ${url}`);
    setImageErrors((prev) => new Set([...prev, index]));

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
    <div className={`hero-image-fade-container ${className}`}>
      <div
        className={`hero-image-fade ${isFading ? "fading-out" : "fading-in"}`}
      >
        <div
          className={`relative w-full h-full ${
            hasEdgeBlur ? "hero-image-edge-blur" : ""
          }`}
        >
          <Image
            src={currentImageUrl}
            alt={alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-contain ${
              hasEdgeBlur ? "hero-image-blurred" : ""
            }`}
            style={{ filter: "grayscale(85%)" }}
            priority={false}
            unoptimized={currentImageUrl?.startsWith("http")}
            onError={() => handleImageError(displayIndex, currentImageUrl)}
            onLoad={() =>
              devLog(`Successfully loaded image: ${currentImageUrl}`)
            }
          />
        </div>
      </div>
    </div>
  );
}
