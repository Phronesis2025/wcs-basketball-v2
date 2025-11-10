"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after 4 seconds
    const timer = setTimeout(() => {
      router.replace("/");
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-navy min-h-screen text-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto mb-6 text-red"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-bebas font-bold mb-6 uppercase">
          Thank You!
        </h1>

        <div className="space-y-4 mb-8">
          <p className="text-xl sm:text-2xl font-inter text-gray-200">
            Thank you for your participation and support
          </p>
          <p className="text-lg sm:text-xl font-inter text-gray-300">
            of the WCS Basketball program.
          </p>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-400 mb-4">
            Redirecting to home page...
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red text-white rounded hover:bg-red/90 transition font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

