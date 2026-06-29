import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Off-black base (no pure #000000)
        'dark-bg': '#0a0a0a',
        'dark-bg-2': '#111111',
        'dark-surface': '#1a1a1a',
        'dark-surface-2': '#161616',
        'dark-border': '#222222',

        // Electric palette — kill safe purple, lean cyan + magenta + lime
        'electric-blue': '#00d4ff',
        'electric-cyan': '#0affed',
        'hot-magenta': '#ff2d7b',
        'hot-pink': '#ff006e',
        'lime-rush': '#39ff14',
        'acid-yellow': '#eaff00',
      },
      backgroundImage: {
        'gradient-electric':
          'linear-gradient(135deg, #00d4ff 0%, #ff2d7b 55%, #39ff14 100%)',
        'gradient-rush':
          'linear-gradient(120deg, #ff2d7b 0%, #ff006e 50%, #00d4ff 100%)',
        'gradient-deep':
          'linear-gradient(180deg, #0a0a0a 0%, #111111 60%, #0a0a0a 100%)',
        'gradient-grid':
          'linear-gradient(rgba(0, 212, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.07) 1px, transparent 1px)',
      },
      boxShadow: {
        'glow-blue':
          '0 0 24px rgba(0, 212, 255, 0.45), 0 0 60px rgba(0, 212, 255, 0.18)',
        'glow-magenta':
          '0 0 24px rgba(255, 45, 123, 0.45), 0 0 60px rgba(255, 45, 123, 0.18)',
        'glow-lime':
          '0 0 24px rgba(57, 255, 20, 0.5), 0 0 60px rgba(57, 255, 20, 0.2)',
        'inset-glow-blue': 'inset 0 0 24px rgba(0, 212, 255, 0.25)',
        'inset-glow-magenta': 'inset 0 0 24px rgba(255, 45, 123, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-orb': 'pulse-orb 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'energy-line': 'energy-line 4s linear infinite',
        orbit: 'orbit 14s linear infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        scramble: 'scramble 0.6s steps(8) forwards',
        'glow-sweep': 'glow-sweep 2.8s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 3s ease-in forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 18px rgba(0, 212, 255, 0.4)' },
          '50%': { boxShadow: '0 0 36px rgba(255, 45, 123, 0.7)' },
        },
        'pulse-orb': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow:
              '0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(255, 45, 123, 0.4)',
          },
          '50%': {
            transform: 'scale(1.06)',
            boxShadow:
              '0 0 60px rgba(57, 255, 20, 0.7), 0 0 120px rgba(0, 212, 255, 0.5)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
        'energy-line': {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': {
            transform: 'rotate(360deg) translateX(120px) rotate(-360deg)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scramble: {
          '0%': { filter: 'blur(8px)', opacity: '0' },
          '60%': { filter: 'blur(2px)', opacity: '1' },
          '100%': { filter: 'blur(0)', opacity: '1' },
        },
        'glow-sweep': {
          '0%, 100%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '50%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-40px) rotate(0deg)', opacity: '1' },
          '100%': {
            transform: 'translateY(420px) rotate(720deg)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;