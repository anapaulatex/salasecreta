/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'hsl(var(--gold) / <alpha-value>)',
          soft: 'hsl(var(--gold-soft) / <alpha-value>)',
          deep: 'hsl(var(--gold-deep) / <alpha-value>)',
          foreground: 'hsl(var(--gold-foreground) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 8px 30px -8px hsl(36 55% 58% / 0.35)',
        'gold-lg': '0 14px 45px -10px hsl(36 55% 58% / 0.45)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-deep)))',
      },
    },
  },
  plugins: [],
}
