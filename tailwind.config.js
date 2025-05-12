module.exports = {
  content: ['./**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#0d8b9c',    // Teal/turquoise from the logo
        secondary: '#0a3b5c',  // Dark navy blue from the logo text
        accent: '#e6f7ff',     // Light blue from the logo background
        teal: {
          DEFAULT: '#2A7F83',
          dark: '#236e72',
          light: '#e0f7f8'
        }
      },
    },
  },
  plugins: [],
}