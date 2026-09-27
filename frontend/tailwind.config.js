/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030B1A',
          900: '#06122B',
          DEFAULT: '#0A1F44', // Primary Navy Blue
          800: '#0E2A5C',
          700: '#163B7C',
          600: '#1F4F9E',
        },
        steel: {
          900: '#1A202C',
          800: '#2D3748', // Secondary Steel
          700: '#4A5568',
          600: '#718096',
          500: '#A0AEC0',
          400: '#CBD5E0',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Primary Accent Amber
          600: '#D97706',
          700: '#B45309',
        },
        crowd: {
          low: '#10B981',      // Emerald Green (Low)
          moderate: '#F59E0B', // Amber Yellow (Moderate)
          high: '#EF4444',     // Crimson Red (High)
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(245, 158, 11, 0.25)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
