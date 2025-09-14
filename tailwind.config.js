module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#002C51", // Updated to new blue
        red: "#D91E18",
        white: "#FFFFFF",
        accent: {
          DEFAULT: "#002C51", // Matches new navy
          light: "#004080",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        bebas: ["Bebas Neue", "sans-serif"],
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(90deg, #002C51 0%, #002C51 100%)", // Updated gradient
      },
    },
  },
  plugins: [],
};
