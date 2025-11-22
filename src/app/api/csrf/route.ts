import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken, createCSRFCookie, devError } from "@/lib/security";
import { ValidationError, ApiError, handleApiError, formatSuccessResponse } from "@/lib/errorHandler";

/**
 * API endpoint to generate and return CSRF tokens
 * GET: Generate a new CSRF token and set it in cookies
 */
export async function GET() {
  try {
    // Generate a new CSRF token
    const csrfToken = generateCSRFToken();

    // Create the CSRF cookie
    const csrfCookie = createCSRFCookie(csrfToken, {
      maxAge: 3600, // 1 hour
      httpOnly: false, // Allow JavaScript access for forms
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Return the token in JSON response
    const response = formatSuccessResponse({
      csrfToken,
    });

    // Set the CSRF token cookie
    response.headers.set("Set-Cookie", csrfCookie);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST endpoint to validate CSRF tokens
 * This can be used to validate tokens before processing state-changing operations
 */
export async function POST(request: NextRequest) {
  try {
    const { csrfToken } = await request.json();

    if (!csrfToken) {
      throw new ValidationError("CSRF token is required");
    }

    // Get the expected token from cookies
    const expectedToken = request.cookies.get("csrf-token")?.value;

    if (!expectedToken) {
      throw new ValidationError("No CSRF token found in cookies");
    }

    // Validate the token
    const isValid = csrfToken === expectedToken;

    if (!isValid) {
      throw new ApiError("Invalid CSRF token", 403);
    }

    return formatSuccessResponse({
      valid: true,
      message: "CSRF token is valid",
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}
