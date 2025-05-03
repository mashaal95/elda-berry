const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure this covers your source files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}); 