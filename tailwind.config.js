/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './index.ts',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // App specific Status colors
        'sync-green': '#A3E635',   // Lime 400 - IN_SYNC
        'sync-yellow': '#FACC15',  // NEEDS_UPDATE
        'sync-red': '#EF4444',     // BLOCKED (Use red from reference image)
        'sync-blue': '#60A5FA',    // HELP_REQUESTED
        // Neon Fitness Brand palette (Reference Images)
        brand: {
          50:  '#F7FEE7', // Lime 50
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635', // Main lime green accent (bottom nav, active buttons)
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#14532d', // deep green gradient background
          950: '#052e16',
        },
        surface: {
          DEFAULT: '#09090B', // Very dark/black background
          card:    '#18181B', // Slightly lighter dark grey for cards
          elevated:'#27272A',
          border:  '#27272A',
        },
      },
      fontFamily: {
        sans:   ['Inter_400Regular', 'sans-serif'],
        inter:  ['Inter_400Regular', 'sans-serif'],
        'inter-medium': ['Inter_500Medium', 'sans-serif'],
        'inter-semibold': ['Inter_600SemiBold', 'sans-serif'],
        'inter-bold': ['Inter_700Bold', 'sans-serif'],
        heading: ['SpaceGrotesk_700Bold', 'sans-serif'],
        'space-semibold': ['SpaceGrotesk_600SemiBold', 'sans-serif'],
        'space-bold': ['SpaceGrotesk_700Bold', 'sans-serif'],
        mono:   ['SpaceMono', 'monospace'],
      },
      fontSize: {
        'screen-title': ['28px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
        'section-title': ['22px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'card-title': ['18px', { lineHeight: '24px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'label': ['14px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '16px' }],
      },
    },
  },
  plugins: [],
};
