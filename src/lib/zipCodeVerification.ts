/**
 * Zip code verification utilities
 * Converts zip codes to coordinates and verifies they're within service area
 */

import { devError } from "./security";

// Cache for zip code coordinates to reduce API calls
const zipCodeCache = new Map<string, { lat: number; lng: number; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get coordinates for a zip code using geocoding API
 * Uses free tier of geocod.io or similar service
 * @param zipCode 5-digit zip code
 * @returns Promise with latitude and longitude, or null if not found
 */
export async function getZipCodeCoordinates(
  zipCode: string
): Promise<{ lat: number; lng: number } | null> {
  // Validate zip code format
  const cleanZip = zipCode.trim().replace(/\D/g, "");
  if (cleanZip.length !== 5) {
    return null;
  }

  // Check cache first
  const cached = zipCodeCache.get(cleanZip);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { lat: cached.lat, lng: cached.lng };
  }

  try {
    // Use zippopotam.us free API (no key required)
    // Note: This works server-side. For client-side, use the /api/verify-zip route
    const response = await fetch(
      `https://api.zippopotam.us/us/${cleanZip}`,
      {
        // Add headers to help with CORS if needed
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // If API fails, try fallback
      return await getZipCodeCoordinatesFallback(cleanZip);
    }

    const data = await response.json();
    if (data.places && data.places.length > 0) {
      const place = data.places[0];
      const coords = {
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude),
      };

      // Cache the result
      zipCodeCache.set(cleanZip, {
        ...coords,
        timestamp: Date.now(),
      });

      return coords;
    }

    return await getZipCodeCoordinatesFallback(cleanZip);
  } catch (error) {
    devError("Error geocoding zip code:", error);
    // Try fallback
    return await getZipCodeCoordinatesFallback(cleanZip);
  }
}

/**
 * Fallback method to get zip code coordinates
 */
async function getZipCodeCoordinatesFallback(
  zipCode: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    // Try using a different free geocoding service as fallback
    // Using Nominatim (OpenStreetMap) - free and no API key required
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=us&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'WCS Basketball App',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const result = data[0];
      const coords = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };

      // Cache the result
      zipCodeCache.set(zipCode, {
        ...coords,
        timestamp: Date.now(),
      });

      return coords;
    }

    return null;
  } catch (error) {
    devError("Error in fallback geocoding:", error);
    return null;
  }
}

/**
 * Verify if a zip code is within the service radius
 * @param zipCode 5-digit zip code
 * @returns Promise with verification result
 */
export async function verifyZipCodeInRadius(
  zipCode: string
): Promise<{ allowed: boolean; distance?: number; error?: string }> {
  const coords = await getZipCodeCoordinates(zipCode);

  if (!coords) {
    return {
      allowed: false,
      error: "Invalid zip code or unable to verify location",
    };
  }

  const { isWithinRadius } = await import("./locationVerification");
  const allowed = isWithinRadius(coords.lat, coords.lng);

  // Calculate distance for informational purposes
  const { calculateDistance, SALINA_COORDINATES } = await import("./locationVerification");
  const distance = calculateDistance(
    SALINA_COORDINATES.latitude,
    SALINA_COORDINATES.longitude,
    coords.lat,
    coords.lng
  );

  return {
    allowed,
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
  };
}

