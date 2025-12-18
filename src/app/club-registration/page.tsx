// src/app/club-registration/page.tsx
"use client";

// import { useState } from "react";
import Link from "next/link";

export default function ClubRegistration() {
  // const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement club registration logic
    alert("Club registration functionality coming soon!");
  };

  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="pt-20 pb-12 sm:pt-24" aria-label="Club Registration">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
              Club Registration
            </h1>
            
            <div className="bg-gray-900/50 border border-red-500/50 rounded-lg p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bebas font-bold mb-4 text-red">
                  Join World Class Sports
                </h2>
                <p className="text-lg font-inter text-gray-300 mb-6">
                  Register your child for the upcoming season. Complete the form below to begin the registration process.
                </p>
              </div>

              {/* Placeholder form structure */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Player Information */}
                <div className="border-b border-gray-700 pb-6">
                  <h3 className="text-xl font-bebas font-bold mb-4 text-red">Player Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="first-name" className="block text-sm font-inter font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        placeholder="Enter first name"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="last-name" className="block text-sm font-inter font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        placeholder="Enter last name"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label htmlFor="birth-date" className="block text-sm font-inter font-medium mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        id="birth-date"
                        className="w-full max-w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none box-border"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="grade" className="block text-sm font-inter font-medium mb-2">
                        Current Grade *
                      </label>
                      <select
                        id="grade"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        disabled
                      >
                        <option value="">Select grade</option>
                        <option value="3rd">3rd Grade</option>
                        <option value="4th">4th Grade</option>
                        <option value="5th">5th Grade</option>
                        <option value="6th">6th Grade</option>
                        <option value="7th">7th Grade</option>
                        <option value="8th">8th Grade</option>
                        <option value="9th">9th Grade</option>
                        <option value="10th">10th Grade</option>
                        <option value="11th">11th Grade</option>
                        <option value="12th">12th Grade</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="border-b border-gray-700 pb-6">
                  <h3 className="text-xl font-bebas font-bold mb-4 text-red">Parent/Guardian Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="parent-name" className="block text-sm font-inter font-medium mb-2">
                        Parent/Guardian Name *
                      </label>
                      <input
                        type="text"
                        id="parent-name"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        placeholder="Enter parent/guardian name"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="parent-email" className="block text-sm font-inter font-medium mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="parent-email"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        placeholder="Enter email address"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label htmlFor="parent-phone" className="block text-sm font-inter font-medium mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="parent-phone"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        placeholder="Enter phone number"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="emergency-contact" className="block text-sm font-inter font-medium mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        id="emergency-contact"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        placeholder="Enter emergency contact"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Team Preferences */}
                <div className="border-b border-gray-700 pb-6">
                  <h3 className="text-xl font-bebas font-bold mb-4 text-red">Team Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="team-preference" className="block text-sm font-inter font-medium mb-2">
                        Team Preference
                      </label>
                      <select
                        id="team-preference"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        disabled
                      >
                        <option value="">Select team preference</option>
                        <option value="boys">Boys Team</option>
                        <option value="girls">Girls Team</option>
                        <option value="coed">Coed Team</option>
                        <option value="no-preference">No Preference</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="experience-level" className="block text-sm font-inter font-medium mb-2">
                        Experience Level
                      </label>
                      <select
                        id="experience-level"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                        disabled
                      >
                        <option value="">Select experience level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-xl font-bebas font-bold mb-4 text-red">Additional Information</h3>
                  
                  <div>
                    <label htmlFor="medical-info" className="block text-sm font-inter font-medium mb-2">
                      Medical Information / Allergies
                    </label>
                    <textarea
                      id="medical-info"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                      placeholder="Any medical conditions or allergies we should know about"
                      disabled
                    />
                  </div>

                  <div className="mt-6">
                    <label htmlFor="additional-notes" className="block text-sm font-inter font-medium mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      id="additional-notes"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                      placeholder="Any additional information or special requests"
                      disabled
                    />
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled
                    className="bg-gray-600 text-gray-400 font-bebas uppercase py-3 px-8 rounded-lg cursor-not-allowed"
                  >
                    Registration Coming Soon
                  </button>
                </div>
              </form>
            </div>

            <div className="text-center">
              <Link
                href="/teams"
                className="text-red hover:underline font-inter"
                aria-label="View teams"
              >
                ← Back to Teams
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
