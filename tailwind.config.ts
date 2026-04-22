import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'tech-blue': 'hsl(var(--tech-blue))',
        'gold-light': 'hsl(var(--gold-light))',
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Legacy Ivory & Gold tokens (kept for backward compat)
        gold: {
          DEFAULT: '#C9A84C',
          hover: '#B8860B',
          light: '#FEF3C7',
          dark: '#D4A853',
        },
        ivory: {
          DEFAULT: '#FAFAF8',
          card: '#FFFFFF',
          subtle: '#F5F4F2',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#2563EB',
        chart: {
          '1': 'hsl(var(--accent))',
          '2': '#16A34A',
          '3': '#2563EB',
          '4': '#D97706',
          '5': '#DC2626',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,.05)',
        md: '0 4px 6px rgba(0,0,0,.07)',
        lg: '0 10px 15px rgba(0,0,0,.1)',
        gold: '0 10px 40px -10px hsl(45 70% 50% / 0.5), 0 0 30px hsl(48 90% 60% / 0.2)',
        premium: '0 0 60px hsl(45 65% 52% / 0.18), 0 0 120px hsl(45 65% 52% / 0.08)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gold-shimmer': 'gold-shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
