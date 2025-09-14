'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

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
  }, [error]);

  return (
    <div className="bg-navy min-h-screen text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bebas mb-4">Something went wrong!</h1>
        <p className="text-lg mb-6">We&apos;re sorry, but something unexpected happened.</p>
        <button
          onClick={reset}
          className="bg-red text-white px-6 py-3 rounded hover:bg-opacity-90 transition duration-300"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
