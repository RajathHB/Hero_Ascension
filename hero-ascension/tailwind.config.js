/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Bebas Neue"', 'cursive'],
        'body': ['"Rajdhani"', 'sans-serif'],
        'mono': ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        void: {
          950: '#020408',
          900: '#050c14',
          800: '#0a1628',
          700: '#0f2040',
        },
        plasma: {
          400: '#00f5ff',
          500: '#00d4e8',
          600: '#00a8c0',
        },
        ember: {
          400: '#ff6b35',
          500: '#ff4500',
          600: '#cc3700',
        },
        arcane: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        jade: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 10px currentColor, 0 0 20px currentColor' },
          '100%': { textShadow: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.8' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.6' },
          '99%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse at top, #0a1628 0%, #020408 70%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      boxShadow: {
        'plasma': '0 0 15px rgba(0,245,255,0.4), 0 0 30px rgba(0,245,255,0.1)',
        'ember': '0 0 15px rgba(255,107,53,0.4), 0 0 30px rgba(255,107,53,0.1)',
        'arcane': '0 0 15px rgba(192,132,252,0.4), 0 0 30px rgba(192,132,252,0.1)',
        'gold': '0 0 15px rgba(251,191,36,0.4), 0 0 30px rgba(251,191,36,0.1)',
        'jade': '0 0 15px rgba(52,211,153,0.4), 0 0 30px rgba(52,211,153,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
