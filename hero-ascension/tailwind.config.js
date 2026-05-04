/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['"Fraunces"', 'serif'],
        'sans': ['"Outfit"', 'sans-serif'],
        'display': ['"Fraunces"', 'serif'],
        'body': ['"Outfit"', 'sans-serif'],
      },
      colors: {
        // Light Theme Colors
        'hero-bg': '#F4F7FA',
        'hero-card': 'rgba(255, 255, 255, 0.7)',
        'hero-border': 'rgba(0, 0, 0, 0.05)',
        'hero-text': '#1A1C1E',
        'hero-muted': '#5F6368',
        
        // Dynamic Archetype Colors with Opacity Support
        'hero-accent': 'rgb(var(--hero-accent-rgb) / <alpha-value>)',
        'hero-accent-glow': 'var(--hero-accent-glow)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.8', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'hero-glow': '0 10px 20px -5px var(--hero-accent-glow)',
      },
    },
  },
  plugins: [],
}
