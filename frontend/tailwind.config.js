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
        // Luxury Dark Theme Primary Colors
        black: {
          deep: '#050505',
          midnight: '#0A0A0A',
          card: '#0D1117',
          DEFAULT: '#050505',
        },
        navy: {
          950: '#071026',
          900: '#0A1F44',
          DEFAULT: '#0A1F44',
          800: '#0E2954',
          700: '#14376F',
          600: '#1E3A8A',
          500: '#2563EB',
        },
        blue: {
          royal: '#1E3A8A',
          electric: '#3B82F6',
          neon: '#60A5FA',
          muted: '#1E293B',
        },
        // Strict Accent Colors
        safe: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.4)',
          dark: '#064E3B',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.4)',
          dark: '#78350F',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.55)',
          dark: '#7F1D1D',
          light: '#FEE2E2',
        },
        sos: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.65)',
        },
        // Muted Luxury Slate for typography
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-card': '0 8px 32px -4px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(59, 130, 246, 0.2)',
        'glass-panel': '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow-electric': '0 0 25px rgba(59, 130, 246, 0.45)',
        'glow-royal': '0 0 35px rgba(30, 58, 138, 0.6)',
        'glow-safe': '0 0 25px rgba(16, 185, 129, 0.4)',
        'glow-warning': '0 0 25px rgba(245, 158, 11, 0.4)',
        'glow-danger': '0 0 30px rgba(239, 68, 68, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '20px',
        'glass-heavy': '32px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-sos': 'pulseSOS 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'radar': 'radar 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSOS: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 45px rgba(239, 68, 68, 0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
