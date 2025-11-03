"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useScrollLock } from "@/hooks/useScrollLock";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface StartNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StartNowModal({ isOpen, onClose }: StartNowModalProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleEmailSignUp = () => {
    onClose();
    router.push("/register");
  };

  const handleLogin = () => {
    onClose();
    router.push("/parent/login");
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bg-navy border border-red-500/50 rounded-lg p-4 md:p-6 w-full ${
          isOpen ? "h-screen w-screen md:h-auto md:w-auto md:max-w-md lg:max-w-lg" : ""
        }`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-now-modal-title"
      >
        <div className="space-y-4">
          <div className="mb-4">
            <h2 id="start-now-modal-title" className="text-2xl font-bebas text-white">
              {isAuthenticated ? "Continue Your Journey" : "Get Started with WCS Basketball"}
            </h2>
          </div>

          <div className="space-y-4">
            {isAuthenticated ? (
              <>
                <p className="text-gray-300 text-center">
                  You're already signed in. Continue to your profile or register another child.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/parent/profile");
                    }}
                    className="w-full bg-red text-white font-bold py-3 rounded hover:bg-red/90 transition-colors min-h-[48px]"
                  >
                    Go to Profile
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/register?fromProfile=true");
                    }}
                    className="w-full bg-gray-700 text-white font-bold py-3 rounded hover:bg-gray-600 transition-colors min-h-[48px]"
                  >
                    Add Another Child
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-300 text-center">
                  Choose how you'd like to get started
                </p>

                {/* Google OAuth - Primary */}
                <GoogleSignInButton
                  variant="primary"
                  className="w-full"
                  onSuccess={onClose}
                />

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-navy text-gray-400">or</span>
                  </div>
                </div>

                {/* Email Sign Up */}
                <button
                  onClick={handleEmailSignUp}
                  className="w-full bg-gray-700 text-white font-bold py-3 rounded hover:bg-gray-600 transition-colors min-h-[48px]"
                >
                  Continue with Email
                </button>

                {/* Login Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button
                      onClick={handleLogin}
                      className="text-red hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClose();
              }
            }}
            className="bg-gray-700 text-white font-inter rounded p-2 mt-4 w-full min-h-[48px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2"
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
