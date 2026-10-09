/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#C2410C',
        'brand-dark': '#9A3412',
        cream: '#FFF7ED',
        surface: '#FFFFFF',
        ink: '#1C1917',
        muted: '#57534E',
        line: '#FED7AA',
        'correct-bg': '#DCFCE7',
        'correct-border': '#16A34A',
        'correct-text': '#14532D',
        'wrong-bg': '#FEE2E2',
        'wrong-border': '#DC2626',
        'wrong-text': '#7F1D1D',
        sponsor: '#F59E0B',
        focus: '#1D4ED8',
      },
    },
  },
  plugins: [],
};
