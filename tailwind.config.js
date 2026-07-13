/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#172263',
        'brand-navy-dark': '#0F1845',
        'brand-navy-light': '#2A3D7F',
        'brand-red': '#E82326',
        'brand-red-dark': '#C01D20',
        'brand-red-light': '#FBEAEA',
        'text-black': '#0A0E27',
        'text-gray': '#57585A',
        'bg-light': '#F7F8FC',
        'bg-white': '#FFFFFF',
        'bg-inset': '#F1F3F9',
        'border-light': 'rgba(23,34,99,0.08)',
        'border-subtle': 'rgba(23,34,99,0.08)',
        'border-medium': 'rgba(23,34,99,0.16)',
        'border-strong': 'rgba(23,34,99,0.28)',
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(23,34,99,0.06), 0 1px 3px rgba(23,34,99,0.10)',
        'card-hover': '0 4px 8px rgba(23,34,99,0.08), 0 12px 24px rgba(23,34,99,0.12)',
        'panel': '0 2px 4px rgba(23,34,99,0.06), 0 16px 40px rgba(23,34,99,0.14)',
        'diagram-viewer': '0 8px 16px rgba(0,0,0,0.24), 0 24px 64px rgba(0,0,0,0.32)',
        'button': '0 1px 2px rgba(23,34,99,0.12), 0 2px 4px rgba(23,34,99,0.08)',
        'input-focus': '0 0 0 3px rgba(232,35,38,0.15)',
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