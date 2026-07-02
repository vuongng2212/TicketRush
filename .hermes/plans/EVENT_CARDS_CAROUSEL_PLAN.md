# Implementation Plan: EventCard + EventCarousel (Days 3-4)

## 🎯 Objective
Build production-ready EventCard and EventCarousel components for the TicketRush Electric Pulse UI/UX redesign, following the established design system.

## 📦 Project Context
- **Project:** `/home/vuongnguyen/Projects/TicketRush/`
- **Frontend:** Next.js 16.2.9 (App Router) + React 19.2.4 + TypeScript
- **Styling:** Tailwind CSS + custom design tokens
- **Animation:** Framer Motion 10.16.4 (spring physics)
- **Existing design system:** `client/lib/design-tokens.ts` (Electric Pulse palette)
- **Reference components:** `client/components/HeroSection.tsx`, `ElectricRushComponents.tsx`

## 🎨 Design Tokens (from design-tokens.ts)
- **Primary Colors:** electricBlue #00d4ff, hotMagenta #ff2d7b, limeRush #39ff14, acidYellow #eaff00, electricPurple #c91dff
- **Gradients:** buttonPrimary (lime→cyan), cardBorder (cyan→magenta→lime), heroMesh
- **Springs:** kinetic (stiffness 300, damping 20), smooth (stiffness 200, damping 25), bouncy (stiffness 400, damping 15)
- **Spacing:** xs(4px), sm(8px), md(12px), lg(16px), xl(24px), xxl(32px), xxxl(48px)
- **Border radius:** sm(4px), md(8px), lg(16px), xl(24px), full(9999px)

## 📋 Task 1: EventCard Component

### File: `client/components/EventCard.tsx`
**Target:** ~350 lines, production-ready

### Requirements:
1. **Visual Design:**
   - Glassmorphic card with `backdrop-blur` and `bg-white/5` dark overlay
   - Electric border gradient (cyan→magenta→lime conic gradient)
   - Rounded corners (borderRadius.lg = 16px)
   - Padding: spacing.xl (24px)
   - Subtle shadow on hover

2. **Layout Structure:**
   ```
   ┌─────────────────────────────┐
   │  [Image with gradient]     │
   │  ─────────────────────     │
   │  Title (bold, electricBlue) │
   │  Venue (secondary text)     │
   │  ─────────────────────     │
   │  📅 Date  💰 Price          │
   │  ⭐ Rating  🎫 Available    │
   │  ─────────────────────     │
   │  [GET TICKETS Button]       │
   └─────────────────────────────┘
   ```

3. **Props Interface:**
   ```typescript
   interface EventCardProps {
     event: {
       id: string;
       title: string;
       venue: string;
       date: string;
       price: number;
       rating: number;
       reviewsCount: number;
       ticketsAvailable: number;
       imageUrl: string;
       category: 'concert' | 'festival' | 'comedy' | 'sports';
     };
     onSelect?: (eventId: string) => void;
     onWishlist?: (eventId: string) => void;
     variant?: 'default' | 'featured' | 'compact';
   }
   ```

4. **Animations (Framer Motion):**
   - **Entry:** Stagger animation with parent variants (delay: index * 0.1)
   - **Hover:** Scale to 1.03, shadow intensifies, border glow pulses
   - **Tap:** Scale to 0.98 (button only)
   - **Image:** Subtle zoom on hover (scale 1.05)
   - **Spring physics:** Use kinetic preset (stiffness 300, damping 20)

5. **Accessibility:**
   - Semantic `<article>` with proper heading hierarchy
   - ARIA labels: `aria-label="Event: {title} at {venue}"`
   - Focus visible ring with electric blue
   - Keyboard navigation (Enter to select)
   - Reduced motion support (`useReducedMotion`)
   - WCAG AA contrast ratios (text on dark background ≥ 4.5:1)

6. **Responsive:**
   - Mobile (320px): Single column, compact layout
   - Tablet (768px): 2 columns
   - Desktop (1440px): 3-4 columns

## 📋 Task 2: EventCarousel Component

### File: `client/components/EventCarousel.tsx`
**Target:** ~280 lines, production-ready

### Requirements:
1. **Layout:**
   - Horizontal scrollable container
   - Snap-to-card scrolling (`scroll-snap-type: x mandatory`)
   - Hide scrollbar but allow scroll (`-ms-overflow-style: none`, `scrollbar-width: none`)
   - Gap between cards: spacing.xl (24px)

2. **Navigation:**
   - Previous/Next buttons (absolute positioned, electric styling)
   - Buttons: circular, glassmorphic, with electric arrow icons
   - Disable buttons at start/end of scroll
   - Touch swipe support (native, via CSS scroll-snap)

3. **Header:**
   - Section title (e.g., "🔥 Trending Events")
   - Optional filter pills (All, Today, This Week, This Month)
   - View all link (electric blue with arrow)

4. **Props Interface:**
   ```typescript
   interface EventCarouselProps {
     title?: string;
     events: EventCardProps['event'][];
     onEventSelect?: (eventId: string) => void;
     onEventWishlist?: (eventId: string) => void;
     showFilters?: boolean;
   }
   ```

5. **Animations:**
   - **Cards entry:** Staggered animation on mount (delay: index * 0.08)
   - **Buttons hover:** Scale to 1.1, electric glow
   - **Button disabled:** Opacity 0.3, no pointer events
   - **Section title:** Fade-in from left on mount
   - **Filter pills:** Smooth color transition on selection

6. **State Management:**
   - `canScrollLeft: boolean`
   - `canScrollRight: boolean`
   - `activeFilter: string | null`
   - Update on scroll (debounced)

7. **Responsive:**
   - Mobile: Show 1.2 cards at a time (peek next card)
   - Tablet: Show 2.5 cards
   - Desktop: Show 3.5 cards

## 📋 Task 3: Integration

### File: `client/app/page.tsx` (modify)
**Replace existing EventCarousel with new one**

### Mock Events Data:
```typescript
const MOCK_EVENTS = [
  {
    id: 'evt-001',
    title: 'BlackPink World Tour',
    venue: 'Ho Chi Minh City Arena',
    date: '2026-08-15',
    price: 1200000,
    rating: 4.9,
    reviewsCount: 2847,
    ticketsAvailable: 42,
    imageUrl: '/images/events/blackpink.jpg',
    category: 'concert',
  },
  // ... 5-7 more events
];
```

## 📋 Task 4: Quality Gates (MUST PASS)

### Build Verification:
```bash
cd /home/vuongnguyen/Projects/TicketRush/client
pnpm build  # Must complete with 0 errors
pnpm lint   # Must pass with 0 errors
```

### Dev Server Test:
```bash
pnpm dev  # Check http://localhost:3000 renders without console errors
```

### Performance:
- 60fps desktop, 30fps mobile (no jank)
- Lazy load images
- Memoize components if needed

### Code Quality:
- TypeScript strict mode (no `any`)
- Proper type definitions
- ESLint compliance
- Accessible markup
- Reduced motion support

## 🚀 Execution Approach

1. **Read existing components** (HeroSection.tsx, ElectricRushComponents.tsx, design-tokens.ts) to understand patterns
2. **Build EventCard.tsx** with full implementation
3. **Build EventCarousel.tsx** with full implementation
4. **Integrate into page.tsx** (replace existing carousel)
5. **Verify build** (`pnpm build`, `pnpm lint`)
6. **Test in browser** (check rendering, animations)
7. **Fix any issues** found

## 📊 Success Criteria

✅ Both components compile without errors
✅ Build passes (`pnpm build`)
✅ Lint passes (`pnpm lint`)
✅ Dev server shows events without console errors
✅ Cards display correctly on mobile, tablet, desktop
✅ Hover/click animations work smoothly (60fps)
✅ Carousel scroll/swipe works
✅ Accessibility checks pass
✅ Code follows existing patterns from HeroSection.tsx

## ⚠️ Constraints
- Use `'use client'` directive (animations are client-side)
- Import from `@/lib/design-tokens` (path alias)
- Follow Framer Motion patterns from HeroSection.tsx
- Match Tailwind utility patterns from existing components
- No external libraries beyond what's already in package.json
- Do NOT modify design-tokens.ts or HeroSection.tsx
- Do NOT modify server-side files