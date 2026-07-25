/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Navy — primary brand color, used for headers, nav, primary actions
        'brand-navy': '#14205E',
        'brand-navy-dark': '#0B1440',
        'brand-navy-light': '#33469C',
        // A soft, blue-tinted neutral — replaces plain gray for a more
        // "on-brand" feel in cards, section backgrounds, and dividers
        'brand-navy-50': '#EEF1FA',
        'brand-navy-100': '#E1E6F5',

        // Red — accent only: primary CTAs, alerts, key highlights
        'brand-red': '#D81E24',
        'brand-red-dark': '#A81419',
        'brand-red-light': '#FBEAEA',

        // Neutrals — kept blue-leaning (not flat gray) so everything
        // feels part of the same palette
        'text-black': '#0A0E27',
        'text-gray': '#48507A',
        'bg-light': '#F6F7FC',
        'bg-white': '#FFFFFF',
        'bg-inset': '#EFF1F8',

        'border-light': 'rgba(20,32,94,0.08)',
        'border-subtle': 'rgba(20,32,94,0.08)',
        'border-medium': 'rgba(20,32,94,0.16)',
        'border-strong': 'rgba(20,32,94,0.28)',
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(20,32,94,0.06), 0 1px 3px rgba(20,32,94,0.10)',
        'card-hover': '0 4px 8px rgba(20,32,94,0.08), 0 12px 24px rgba(20,32,94,0.12)',
        'panel': '0 2px 4px rgba(20,32,94,0.06), 0 16px 40px rgba(20,32,94,0.14)',
        'diagram-viewer': '0 8px 16px rgba(0,0,0,0.24), 0 24px 64px rgba(0,0,0,0.32)',
        'button': '0 1px 2px rgba(20,32,94,0.12), 0 2px 4px rgba(20,32,94,0.08)',
        'input-focus': '0 0 0 3px rgba(216,30,36,0.15)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};