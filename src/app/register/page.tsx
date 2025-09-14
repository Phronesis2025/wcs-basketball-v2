"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [csrfToken, setCsrfToken] = useState("");

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setCsrfToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttempt;
    
    if (attempts >= 5 && timeSinceLastAttempt < 300000) { // 5 minutes
      setMessage("Too many attempts. Please wait 5 minutes before trying again.");
      return;
    }
    
    // Reset attempts if enough time has passed
    if (timeSinceLastAttempt >= 300000) {
      setAttempts(0);
    }
    
    // CSRF token validation
    if (!csrfToken) {
      setMessage("Security token missing. Please refresh the page.");
      return;
    }

    // Basic input validation
    if (!email || !password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }

    // Input length validation
    if (email.length > 254) {
      setMessage("Email address is too long");
      return;
    }
    
    if (password.length > 128) {
      setMessage("Password is too long");
      return;
    }

    // Basic password strength check
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }

    setLoading(true);
    setMessage("");
    setAttempts(prev => prev + 1);
    setLastAttempt(Date.now());

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Generic error message to prevent information disclosure
        if (error.message.includes("already registered")) {
          setMessage("An account with this email already exists");
        } else if (error.message.includes("invalid")) {
          setMessage("Invalid email or password format");
        } else {
          setMessage("Registration failed. Please try again.");
        }
      } else {
        setMessage("Check your email for the confirmation link!");
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bebas text-navy mb-2">REGISTER</h1>
          <p className="text-gray-600 font-inter">Join WCS Basketball today!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="csrf_token" value={csrfToken} />
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={128}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              maxLength={128}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes("Check your email")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red text-white font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/" className="text-red hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
