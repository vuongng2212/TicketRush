/**
 * TicketRush Editorial Music Discovery Design Tokens
 * Anti-AI: no glow, no rounded corners, no gradients, no motion
 * Inspired by Dice.fm + Boiler Room + Primavera Sound
 */

export const EDITORIAL = {
  // === COLOR PALETTE ===
  colors: {
    // Backgrounds
    ink: '#0A0A0A',         // Primary background (near-black)
    inkAlt: '#111111',      // Alt surface
    inkHover: '#1A1A1A',    // Hover state surface

    // Text
    paper: '#FFFFFF',       // Primary text
    muted: '#999999',       // Secondary text
    hairline: '#333333',    // 1px dividers

    // Accent
    coral: '#F24726',       // Hot coral — primary accent
    coralHover: '#D63B1F',  // Coral hover state
  },

  // === TYPOGRAPHY ===
  typography: {
    // Font families
    display: "'Bebas Neue', 'Archivo Black', sans-serif",
    body: "'Be Vietnam Pro', sans-serif",
    label: "'Archivo Narrow', 'Be Vietnam Pro', sans-serif",
    mono: "'JetBrains Mono', 'Space Mono', monospace",

    // Editorial scale (lowercase keys avoid duplicate with font families)
    hero: { size: '200px', weight: 400, lineHeight: '0.9' },     // Hero H1
    section: { size: '80px', weight: 400, lineHeight: '0.95' },  // Section headers
    h2: { size: '48px', weight: 400, lineHeight: '1.0' },        // Display H2
    title: { size: '24px', weight: 500, lineHeight: '1.2' },     // Event title
    bodyText: { size: '16px', weight: 400, lineHeight: '1.5' },  // Body
    small: { size: '14px', weight: 400, lineHeight: '1.4' },     // Small
    labelText: { size: '12px', weight: 600, lineHeight: '1.3' }, // Labels (uppercase)
    date: { size: '16px', weight: 400, lineHeight: '1.2' },      // Event date
  },

  // === SPACING ===
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '48px',
    xxl: '80px',
    xxxl: '120px',
  },

  // === BORDERS ===
  // Editorial = 0px corners everywhere (anti-AI)
  borderRadius: {
    none: '0',
  },

  borderWidth: {
    DEFAULT: '1px',
    hairline: '1px',
  },

  // === NO SHADOWS ===
  // Editorial has zero box-shadows, zero glows, zero drop shadows
  shadows: {},

  // === NO ANIMATIONS ===
  // Editorial is instant — no transitions, no springs, no easing
  spring: {},
  durations: {
    instant: '0ms',
  },
  easing: {
    none: 'linear',
  },

  // === BREAKPOINTS ===
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },

  // === TIME BUCKETS (Vietnamese) ===
  // Used by TimeBucket component for Editorial UI
  timeBuckets: {
    TONIGHT: 'TỐI NAY',
    WEEKEND: 'CUỐI TUẦN',
    ON_SALE: 'ĐANG MỞ BÁN',
  },

  // === CITIES (Vietnamese) ===
  cities: ['Hà Nội', 'Sài Gòn', 'Đà Nẵng'],

  // === Z-INDEX ===
  zIndex: {
    base: 0,
    nav: 100,
    overlay: 200,
    modal: 300,
  },
} as const;

// === TAILWIND CONFIG EXTENSION ===
export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        ink: EDITORIAL.colors.ink,
        'ink-2': EDITORIAL.colors.inkAlt,
        paper: EDITORIAL.colors.paper,
        coral: EDITORIAL.colors.coral,
        hairline: EDITORIAL.colors.hairline,
        muted: EDITORIAL.colors.muted,
      },
      fontFamily: {
        display: EDITORIAL.typography.display,
        body: EDITORIAL.typography.body,
        label: EDITORIAL.typography.label,
        mono: EDITORIAL.typography.mono,
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0',
      },
    },
  },
};

// === UTILITY FUNCTIONS ===
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateBucket = (startTime: string): 'TONIGHT' | 'WEEKEND' | 'ON_SALE' => {
  const date = new Date(startTime);
  const now = new Date();
  const hoursUntil = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil >= 0 && hoursUntil <= 24) return 'TONIGHT';
  if (date.getDay() === 0 || date.getDay() === 6) return 'WEEKEND';
  return 'ON_SALE';
};

export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDayOfWeek = (iso: string): string => {
  const d = new Date(iso);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[d.getDay()];
};

export const formatShortDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

export default EDITORIAL;
