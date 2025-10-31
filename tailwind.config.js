/**
 * Tailwind CSS Configuration
 *
 * This file extends the default Tailwind configuration to include our brand's
 * specific design system, such as custom colors and fonts. The build process
 * uses this file to generate a CSS file that is perfectly tailored to our site.
 */
module.exports = {
  content: [
    // === MIGRATION UPDATE ===
    // Tell Tailwind to scan all HTML and JS files inside the 'src' directory.
    './src/**/*.{html,js}',
  ],
  theme: {
    extend: {
      colors: {
        'parchment': '#FBF9F6',
        'charcoal': '#3D352E',
        'stone': '#78716C',
        'burnt-orange': '#D97706',
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'roboto': ['"Roboto"', 'sans-serif'],
        'southern': ['"Great Vibes"', 'cursive'],
      },
    },
  },
  plugins: [],
}
