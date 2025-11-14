"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { logClientError } from "@/lib/errorActions";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);

    // Also log to database for admin dashboard
    logClientError(error, {
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    });
  }, [error]);

  return (
    <div className="bg-navy min-h-screen text-white flex items-center justify-center" role="alert">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bebas mb-4">Something went wrong!</h1>
        <p className="text-lg mb-6">
          We&apos;re sorry, but something unexpected happened.
        </p>
        <button
          onClick={reset}
          className="bg-red text-white px-6 py-3 rounded hover:bg-opacity-90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 focus:ring-offset-navy"
          aria-label="Try again to reload the page"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
