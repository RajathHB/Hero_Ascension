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
        // Light cream theme
        cream: {
          50: '#FFFDF7',
          100: '#FFF9EB',
          200: '#FFF3D6',
          300: '#FFE8B8',
          400: '#F5DEB3',
          500: '#E8D5A3',
          600: '#C4B18A',
        },
        warm: {
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#ECEADE',
          300: '#DDD9CC',
          400: '#C4BFAE',
          500: '#9E9A8C',
          600: '#7A7668',
          700: '#5C584C',
          800: '#3D3A32',
          900: '#2A2824',
        },
        plasma: {
          400: '#2A9D8F',
          500: '#238A7E',
          600: '#1B6E64',
        },
        ember: {
          400: '#E76F51',
          500: '#D45A3C',
          600: '#B84A2F',
        },
        arcane: {
          400: '#9B72CF',
          500: '#8255B8',
          600: '#6B3FA0',
        },
        gold: {
          400: '#E9C46A',
          500: '#D4A843',
          600: '#B88F2F',
        },
        jade: {
          400: '#52B788',
          500: '#3DA876',
          600: '#2D8A5E',
        },
        rose: {
          400: '#E07A8E',
          500: '#D15D74',
          600: '#B84A5E',
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
        'grid-pattern': 'linear-gradient(rgba(42,157,143,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(42,157,143,0.04) 1px, transparent 1px)',
        'hero-gradient': 'linear-gradient(135deg, #FFFDF7 0%, #FFF9EB 40%, #F5F5F0 100%)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'elevated': '0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'plasma': '0 4px 20px rgba(42,157,143,0.15)',
        'ember': '0 4px 20px rgba(231,111,81,0.15)',
        'arcane': '0 4px 20px rgba(155,114,207,0.15)',
        'gold': '0 4px 20px rgba(233,196,106,0.15)',
        'jade': '0 4px 20px rgba(82,183,136,0.15)',
      },
    },
  },
  plugins: [],
}
