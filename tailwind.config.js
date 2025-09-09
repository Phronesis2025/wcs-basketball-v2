module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1C2526",
        red: "#D91E18",
        white: "#FFFFFF",
        accent: {
          DEFAULT: "#002C51",
          light: "#004080",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        bebas: ["Bebas Neue", "sans-serif"],
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(90deg, #1C2526 0%, #002C51 100%)",
      },
    },
  },
  plugins: [],
};
