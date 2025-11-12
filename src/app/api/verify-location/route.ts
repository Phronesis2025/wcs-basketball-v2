import { NextRequest, NextResponse } from "next/server";
import { isWithinRadius, isInKansas } from "@/lib/locationVerification";

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string | null {
  // Check various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return request.ip || null;
}

/**
 * Get location from IP address using free IP geolocation service
 */
async function getLocationFromIP(ip: string): Promise<{
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zip?: string;
} | null> {
  try {
    // Use free tier of ip-api.com (no API key required for basic usage)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,lat,lon,city,region,zip`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === "success" && data.lat && data.lon) {
      return {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city,
        state: data.region,
        zip: data.zip,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching location from IP:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    if (!ip) {
      // If we can't get IP, allow access (fail open for development)
      // In production, you might want to fail closed
      return NextResponse.json({
        allowed: true,
        reason: "Unable to determine location, allowing access",
      });
    }

    // Skip verification for localhost/development
    if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return NextResponse.json({
        allowed: true,
        reason: "Development/local network detected",
      });
    }

    const location = await getLocationFromIP(ip);

    if (!location) {
      // If geolocation fails, allow access (fail open)
      // You can change this to fail closed if preferred
      return NextResponse.json({
        allowed: true,
        reason: "Unable to verify location, allowing access",
      });
    }

    // Check if within 50-mile radius (more accurate than state check)
    // Mobile IP geolocation can be inaccurate, so we rely on radius check
    const withinRadius = isWithinRadius(location.latitude, location.longitude);
    
    // If not in Kansas state but within radius, still allow (mobile IP may be inaccurate)
    const isKansas = isInKansas(location.state);
    
    // If within radius OR in Kansas state, allow access
    // This handles cases where mobile IP shows different state but user is actually in Kansas
    if (withinRadius || isKansas) {
      return NextResponse.json({
        allowed: true,
        location: {
          city: location.city,
          state: location.state,
          zip: location.zip,
        },
      });
    }

    // If not within radius and not in Kansas, block access
    return NextResponse.json({
      allowed: false,
      reason: `Access is limited to residents within 50 miles of Salina, Kansas. Your location appears to be ${location.city ? `in ${location.city}, ` : ""}${location.state || "outside the service area"}.`,
      location: {
        city: location.city,
        state: location.state,
        zip: location.zip,
      },
    });
  } catch (error) {
    console.error("Location verification error:", error);
    // Fail open - allow access if there's an error
    return NextResponse.json({
      allowed: true,
      reason: "Error verifying location, allowing access",
    });
  }
}

