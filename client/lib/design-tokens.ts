/**
 * TicketRush Electric Rush Design Tokens
 * Color palette, typography, spacing, and animation definitions
 */

export const ELECTRIC_RUSH = {
  // === COLOR PALETTE ===
  colors: {
    // Primary Brand Colors
    electricBlue: '#00d4ff',    // Neon cyan - main accent
    hotMagenta: '#ff2d7b',      // Hot pink - CTAs, urgency
    limeRush: '#39ff14',        // Neon lime - success, "Buy Now"
    acidYellow: '#eaff00',      // Bright yellow - warnings, highlights
    electricPurple: '#c91dff',  // Neon purple - secondary accent

    // Background Colors
    offBlack: '#0a0e27',        // Primary background (cooler than pure black)
    surfaceDark: '#1a1f3a',     // Cards, surfaces (dark blue-gray)
    surfaceLight: '#252d4a',    // Elevated surfaces (hover states)

    // Text Colors
    textPrimary: '#ffffff',     // Main text (white)
    textSecondary: '#b0b5c1',   // Supporting text (cool gray)
    textTertiary: '#7a7f94',    // Disabled, secondary (darker gray)

    // Utility Colors
    error: '#ff4757',           // Error states
    warning: '#eaff00',         // Warnings (same as acidYellow)
    success: '#39ff14',         // Success (same as limeRush)

    // Transparent/Glow variants
    surfaceGlow: 'rgba(0, 212, 255, 0.1)',      // Cyan tint background
    glowCyan: 'rgba(0, 212, 255, 0.3)',         // Cyan glow
    glowMagenta: 'rgba(255, 45, 123, 0.3)',     // Magenta glow
    glowLime: 'rgba(57, 255, 20, 0.3)',         // Lime glow
  },

  // === TYPOGRAPHY ===
  typography: {
    // Font Families (use these for fontFamily CSS property)
    display: "'Space Grotesk', sans-serif",     // Headlines, kinetic text
    body: "'Inter', sans-serif",                // Body text, UI
    mono: "'Inter Mono', monospace",            // Metadata, prices, code

    // Text Style Sizes (use these for reference)
    h1: { size: '64px', weight: 700, lineHeight: '1.2' },    // Hero headline
    h2: { size: '42px', weight: 600, lineHeight: '1.25' },   // Section header
    h3: { size: '28px', weight: 600, lineHeight: '1.3' },    // Card title
    bodyLarge: { size: '20px', weight: 400, lineHeight: '1.6' },
    bodyText: { size: '16px', weight: 400, lineHeight: '1.5' },
    bodySmall: { size: '14px', weight: 400, lineHeight: '1.5' },
    caption: { size: '12px', weight: 500, lineHeight: '1.4' },
    label: { size: '12px', weight: 600, lineHeight: '1.4' },
  },

  // === SPACING ===
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },

  // === BORDER RADIUS ===
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // === SHADOWS ===
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.2)',
    glow_cyan: '0 0 20px rgba(0, 212, 255, 0.5)',
    glow_magenta: '0 0 20px rgba(255, 45, 123, 0.5)',
    glow_combined: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(255, 45, 123, 0.3)',
  },

  // === ANIMATIONS ===
  spring: {
    kinetic: { type: 'spring' as const, stiffness: 300, damping: 20 },
    smooth: { type: 'spring' as const, stiffness: 200, damping: 25 },
    bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
  },

  // Transition timings
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    verySlow: '800ms',
  },

  // Easing functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    elastic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // === BREAKPOINTS ===
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },

  // === Z-INDEX LAYERS ===
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 400,
    tooltip: 500,
    notification: 600,
  },
} as const;

// === GRADIENT DEFINITIONS ===
export const GRADIENTS = {
  // Button gradients
  buttonPrimary: 'linear-gradient(135deg, #39ff14 0%, #00d4ff 100%)',
  buttonHover: 'linear-gradient(135deg, #39ff14 0%, #00d4ff 50%, #ff2d7b 100%)',

  // Background gradients
  heroMesh: 'linear-gradient(45deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
  heroPulse: 'conic-gradient(from 0deg, #00d4ff, #ff2d7b, #c91dff, #00d4ff)',
  cardBorder: 'linear-gradient(135deg, #00d4ff, #ff2d7b, #39ff14)',

  // Text gradients
  textElectric: 'linear-gradient(90deg, #00d4ff 0%, #ff2d7b 100%)',
  textRainbow: 'linear-gradient(90deg, #00d4ff, #c91dff, #ff2d7b, #39ff14)',
} as const;

// === ANIMATION KEYFRAMES ===
export const KEYFRAMES = `
  @keyframes shine {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    }
    50% {
      box-shadow: 0 0 40px rgba(0, 212, 255, 0.8);
    }
  }

  @keyframes gradient-mesh {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes sweep {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// === TAILWIND CONFIG EXTENSION ===
export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        'electric': {
          'blue': ELECTRIC_RUSH.colors.electricBlue,
          'magenta': ELECTRIC_RUSH.colors.hotMagenta,
          'lime': ELECTRIC_RUSH.colors.limeRush,
          'yellow': ELECTRIC_RUSH.colors.acidYellow,
          'purple': ELECTRIC_RUSH.colors.electricPurple,
        },
        'dark': {
          'bg': ELECTRIC_RUSH.colors.offBlack,
          'surface': ELECTRIC_RUSH.colors.surfaceDark,
          'surface-light': ELECTRIC_RUSH.colors.surfaceLight,
        },
      },
      fontFamily: {
        display: ELECTRIC_RUSH.typography.display,
        mono: ELECTRIC_RUSH.typography.mono,
      },
      spacing: ELECTRIC_RUSH.spacing,
      borderRadius: ELECTRIC_RUSH.borderRadius,
      boxShadow: ELECTRIC_RUSH.shadows,
      animation: {
        'shine': 'shine 3s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
};

// === UTILITY FUNCTIONS ===
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba with custom opacity
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getContrastingText = (backgroundColor: string): string => {
  // Simple contrast detection
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? ELECTRIC_RUSH.colors.offBlack : ELECTRIC_RUSH.colors.textPrimary;
};

export default ELECTRIC_RUSH;
