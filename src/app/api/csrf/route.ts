import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken, createCSRFCookie, devError } from "@/lib/security";

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
    const response = NextResponse.json({
      csrfToken,
      success: true,
    });

    // Set the CSRF token cookie
    response.headers.set("Set-Cookie", csrfCookie);

    return response;
  } catch (error) {
    devError("Error generating CSRF token:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "CSRF token is required" },
        { status: 400 }
      );
    }

    // Get the expected token from cookies
    const expectedToken = request.cookies.get("csrf-token")?.value;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "No CSRF token found in cookies" },
        { status: 400 }
      );
    }

    // Validate the token
    const isValid = csrfToken === expectedToken;

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "CSRF token is valid",
    });
  } catch (error) {
    devError("Error validating CSRF token:", error);
    return NextResponse.json(
      { error: "Failed to validate CSRF token" },
      { status: 500 }
    );
  }
}
