import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#EBE4DA',
          300: '#DDD3C4',
          400: '#C7B9A4',
          500: '#AD9B82',
        },
        terracotta: {
          50: '#FDF4F2',
          100: '#FCE6E2',
          200: '#F9D1CA',
          300: '#F2AFA3',
          400: '#E88674',
          500: '#D95D39',
          600: '#C44A27',
          700: '#A4391C',
          800: '#87321A',
          900: '#6F2E1B',
        },
        slate: {
          850: '#192028',
          900: '#141A20',
          950: '#0D1115',
        },
        forest: {
          50: '#F0F8F5',
          100: '#DBEFE7',
          500: '#2E6F56',
          600: '#235843',
          700: '#1C4434',
        },
        amber: {
          500: '#E58B24',
          600: '#C77218',
        },
        ocean: {
          50: '#F0F7FA',
          500: '#2A7B9B',
          600: '#20627C',
        },
        provenance: {
          live: '#10B981',
          estimated: '#F59E0B',
          ai: '#6366F1',
          user: '#8B5CF6',
          unavailable: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cal Sans', 'Cabinet Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        warm: '0 4px 20px -2px rgba(42, 33, 24, 0.08), 0 2px 6px -2px rgba(42, 33, 24, 0.04)',
        elevated: '0 12px 32px -4px rgba(42, 33, 24, 0.12), 0 4px 12px -2px rgba(42, 33, 24, 0.06)',
        kinetic: '0 20px 48px -8px rgba(217, 93, 57, 0.16), 0 8px 16px -4px rgba(42, 33, 24, 0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dash': 'dash 20s linear infinite',
      },
      keyframes: {
        dash: {
          to: {
            strokeDashoffset: '-1000',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
