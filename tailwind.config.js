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
        // SyncTracker status colors
        'sync-green': '#22c55e',   // IN_SYNC
        'sync-yellow': '#eab308',  // NEEDS_UPDATE
        'sync-red': '#ef4444',     // BLOCKED
        'sync-blue': '#3b82f6',    // HELP_REQUESTED
        // Brand palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7b96fa',
          500: '#5a6ff4',
          600: '#4350e8',
          700: '#3640d0',
          800: '#2d34a8',
          900: '#2a3185',
          950: '#1a1e52',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#1a1d27',
          elevated:'#22253a',
          border:  '#2e3148',
        },
      },
      fontFamily: {
        sans:   ['Inter', 'sans-serif'],
        mono:   ['SpaceMono', 'monospace'],
      },
    },
  },
  plugins: [],
};
