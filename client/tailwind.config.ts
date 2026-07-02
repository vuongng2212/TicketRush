import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Editorial palette — anti-AI, no glow, no purple gradient
        ink: {
          DEFAULT: '#0A0A0A',      // primary background (near-black, not pure)
          2: '#111111',             // alt surface
          3: '#1A1A1A',             // hover surface
        },
        paper: '#FFFFFF',          // text on dark
        coral: {
          DEFAULT: '#F24726',       // primary accent — hot coral
          2: '#D63B1F',             // hover
        },
        hairline: '#333333',       // 1px dividers
        muted: '#999999',          // secondary text
      },
      backgroundImage: {
        'no-gradient': 'none',
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Archivo Black"', 'system-ui', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        label: ['"Archivo Narrow"', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      fontSize: {
        // Editorial scale — 200px hero, 80px section, 24px body
        'hero': ['200px', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'section': ['80px', { lineHeight: '0.95', letterSpacing: '-0.01em' }],
        'display': ['48px', { lineHeight: '1.0', letterSpacing: '-0.01em' }],
        'title': ['24px', { lineHeight: '1.2' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'small': ['14px', { lineHeight: '1.4' }],
        'label': ['12px', { lineHeight: '1.3', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        // Editorial = 0px corners everywhere (anti-AI)
        none: '0',
        DEFAULT: '0',
      },
      // No box-shadow glows. Only hairline.
      boxShadow: {
        none: 'none',
        hairline: 'inset 0 0 0 1px #333333',
      },
      // No animations — Editorial is instant
      animation: {},
      keyframes: {},
    },
  },
  plugins: [],
};

export default config;
