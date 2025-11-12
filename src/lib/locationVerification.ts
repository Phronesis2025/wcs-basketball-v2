/**
 * Location verification utilities
 * Calculates distances and checks if locations are within service radius
 */

// Salina, Kansas coordinates
export const SALINA_COORDINATES = {
  latitude: 38.8403,
  longitude: -97.6114,
};

// Service radius in miles
export const SERVICE_RADIUS_MILES = 50;

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if coordinates are within service radius of Salina, Kansas
 * @param latitude Latitude to check
 * @param longitude Longitude to check
 * @returns true if within radius, false otherwise
 */
export function isWithinRadius(
  latitude: number,
  longitude: number
): boolean {
  const distance = calculateDistance(
    SALINA_COORDINATES.latitude,
    SALINA_COORDINATES.longitude,
    latitude,
    longitude
  );

  return distance <= SERVICE_RADIUS_MILES;
}

/**
 * Verify if a location (city, state) is in Kansas
 * @param state State code or name
 * @returns true if in Kansas, false otherwise
 */
export function isInKansas(state: string | null | undefined): boolean {
  if (!state) return false;
  const normalizedState = state.trim().toUpperCase();
  return normalizedState === "KS" || normalizedState === "KANSAS";
}

