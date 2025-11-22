/**
 * Tailwind CSS configuration for WCS v2.0
 * Defines custom colors, fonts, and design tokens
 */
module.exports = {
  // Purge content paths for optimal bundle size
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // Custom color palette matching WCS brand
      colors: {
        navy: "#002C51", // Primary brand color
        red: "#D91E18", // Secondary brand color
        white: "#FFFFFF", // Base white
        accent: {
          DEFAULT: "#002C51", // Matches navy
          light: "#004080", // Lighter navy variant
        },
      },
      // Custom font families
      fontFamily: {
        inter: ["Inter", "sans-serif"], // Body text font
        bebas: ["Bebas Neue", "sans-serif"], // Display font for headings
      },
      // Custom background images
      backgroundImage: {
        "navy-gradient": "linear-gradient(90deg, #002C51 0%, #002C51 100%)", // Navy gradient
      },
      // Custom tracking (letter-spacing) for reference design
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
  },
  plugins: [],
};
