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
    <main className="relative pt-32 pb-24 bg-black text-slate-300 antialiased selection:bg-blue-600 selection:text-white min-h-screen flex items-center justify-center px-4">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="mt-[-10%] h-[500px] w-[600px] rounded-full bg-blue-900/20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-900/30 border border-green-500/40 rounded-full mb-6">
            <svg
              className="w-12 h-12 text-green-400"
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
        </div>

        {/* Main Heading with Gradient */}
        <h1 className="mb-8 text-5xl font-semibold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 md:text-7xl font-inter relative z-20">
          Thank You!
        </h1>

        {/* Content Card */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 mb-8">
          <div className="space-y-4">
            <p className="text-xl sm:text-2xl font-inter text-white">
              Thank you for your participation and support
            </p>
            <p className="text-lg sm:text-xl font-inter text-slate-300">
              of the WCS Basketball program.
            </p>
          </div>
        </div>

        {/* Redirect Message and Button */}
        <div className="mt-8">
          <p className="text-sm text-gray-400 mb-6">
            Redirecting to home page...
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-red text-white font-semibold rounded-md hover:bg-red/90 transition-colors min-h-[48px] flex items-center justify-center"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

