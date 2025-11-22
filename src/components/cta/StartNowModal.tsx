"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  useScrollLock(isOpen);

  // Handle mounting on client side for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleEmailSignUp = () => {
    onClose();
    router.push("/register");
  };

  const handleLogin = () => {
    onClose();
    router.push("/parent/login");
  };

  // Render modal using portal to document body so it's not affected by parent component unmounting
  return createPortal(
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-3 sm:p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 sm:p-5 md:p-6 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto max-h-[85vh] sm:max-h-[90vh] md:max-h-[calc(100vh-3rem)] overflow-y-auto shadow-xl"
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
            <h2 id="start-now-modal-title" className="text-2xl font-inter font-semibold text-white text-center">
              {isAuthenticated ? "Continue Your Journey" : "Get Started with WCS Basketball"}
            </h2>
          </div>

          <div className="space-y-4">
            {isAuthenticated ? (
              <>
                <p className="text-neutral-400 text-center font-inter">
                  You're already signed in. Continue to your profile or register another child.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/parent/profile");
                    }}
                    className="w-full bg-gradient-to-b from-[#003d70] to-[#002C51] text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity min-h-[48px] font-inter shadow-lg shadow-[#002C51]/50"
                  >
                    Go to Profile
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/register?fromProfile=true");
                    }}
                    className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 rounded-lg hover:bg-white/10 transition-colors min-h-[48px] font-inter"
                  >
                    Add Another Child
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-neutral-400 text-center font-inter">
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
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#0A0A0A] text-neutral-500 font-inter">or</span>
                  </div>
                </div>

                {/* Email Sign Up */}
                <button
                  onClick={handleEmailSignUp}
                  className="w-full bg-white/5 border border-white/10 text-white font-medium py-3 rounded-lg hover:bg-white/10 transition-colors min-h-[48px] font-inter"
                >
                  Continue with Email
                </button>

                {/* Login Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-neutral-400 font-inter">
                    Already have an account?{" "}
                    <button
                      onClick={handleLogin}
                      className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Close button removed; users can click outside modal to close */}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
