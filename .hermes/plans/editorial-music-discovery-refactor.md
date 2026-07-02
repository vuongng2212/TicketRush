# Implementation Plan: Editorial Music Discovery UI Refactor

**Date:** 2026-06-30
**Branch:** `feature/editorial-music-discovery` (new, off `dev`)
**Design source:** Stitch project `3067586500820552975`, base screen `7f7a8d39153c402896406e1a6e97b2d5` (2560×7388)
**Goal:** Replace Electric Pulse design (cyan/magenta/lime, glow, rounded) with Editorial Music Discovery (dark #0A0A0A, coral #F24726, Bebas Neue, asymmetric 2-col, full-bleed photography)

---

## Phase 0: Pre-flight (Hermes does alone, ~5 min)

1. Create branch: `git checkout -b feature/editorial-music-discovery` from `dev`
2. Read this plan + `/tmp/concept2_base.json` for HTML reference
3. Confirm Docker is up: `docker compose ps` (DB needed for backend tests later)

**Why alone:** mechanical ops, no decisions.

---

## Phase 1: Backend compatibility (spawn 1 leaf agent, ~30 min)

**Why agent:** Spring Boot GraphQL field additions are well-scoped, agent can write + run `./mvnw test` + report which existing tests broke. Hermes reviews diff after.

**Agent task brief:**
- Read `server/src/main/resources/graphql/schema.graphqls`
- Add to `ConcertSummary`: `city: String!` (extracted from `venue` if possible, or new entity field), `ticketStatus: TicketStatus!` enum (`ON_SALE` | `SOLD_OUT` | `COMING_SOON`), `artist: String!` (split from `title` if title is "Artist - Event")
- Update `ConcertSummaryResponse.java` DTO and `ConcertGraphQLController.java` query
- Update `Concert.java` entity if `city`/`artist`/`ticketStatus` aren't already there
- Update `ConcertSeederService.java` to populate new fields
- Run `./mvnw test` and report exit code + which tests broke
- Return: diff summary + test results + list of any conflicts

**Hermes verifies after:** `./mvnw test` exit 0, schema change matches design intent.

---

## Phase 2: Design tokens (Hermes alone, ~15 min)

**Files to modify:**

### `client/tailwind.config.ts`
- Remove all Electric palette (`electric-blue`, `electric-cyan`, `hot-magenta`, etc.)
- Add Editorial palette:
  - `ink`: `#0A0A0A` (base bg)
  - `ink-2`: `#111111` (alt surface)
  - `coral`: `#F24726` (primary accent, hot)
  - `paper`: `#FFFFFF` (text on dark)
  - `hairline`: `#333333` (1px dividers)
- Replace font families: `display: ['Bebas Neue', 'system-ui', 'sans-serif']`, `body: ['Be Vietnam Pro', 'system-ui', 'sans-serif']`, `label: ['Archivo Narrow', 'system-ui', 'sans-serif']`
- Remove all glow shadows + animations
- Add minimal keyframes only if needed (no `pulse-glow`, `float`, `scramble` — Editorial has NO motion)

### `client/app/globals.css`
- Remove: `.crt-scanlines`, `.glass-electric`, `.glass-magenta`, `.neon-glow-*`, `.gradient-stroke`, `.shimmer`, `.energy-pulse`, `.ticket-stub-edge`
- Update `:root` CSS variables: `--coral: #F24726`, `--ink: #0A0A0A`, `--paper: #FFFFFF`, `--hairline: #333333`
- Add Google Fonts import for Bebas Neue, Be Vietnam Pro, Archivo Narrow
- Update body font: `font-family: 'Be Vietnam Pro', system-ui, sans-serif`
- Keep grain texture (subtle, anti-AI) but reduce opacity from 0.035 → 0.015

### `client/lib/design-tokens.ts`
- Rename `ELECTRIC_RUSH` → `EDITORIAL`
- Replace palette (4 colors: ink/coral/paper/hairline)
- Replace typography: display=Bebas Neue (200px hero), body=Be Vietnam Pro, label=Archivo Narrow
- Remove all shadows/animations
- Keep `tailwindConfig` export for theme extension

---

## Phase 3: Component refactor (Hermes alone, ~60-90 min)

**Decision tree: DELETE vs REWRITE vs KEEP**

### DELETE (Electric Pulse-specific)
- `client/components/NeonPulseButton.tsx` — no neon, no pulse
- `client/components/ElectricInput.tsx` — no electric field treatment
- `client/components/LoadingSpinner.tsx` — Editorial has no spinner, use text "ĐANG TẢI..." 
- `client/components/ElectricRushComponents.tsx` — bulk file of EP components
- `client/app/components/AnimatedCard.tsx` — framer-motion, Editorial = no motion
- `client/app/components/EventCarousel.tsx` (duplicate of components/)

### REWRITE (new Editorial components)
- `client/components/HeroSection.tsx` (delete the `app/components/HeroSection.tsx` duplicate)
  - 200px H1 "ÂM NHẠC SÀI GÒN" in coral Bebas Neue
  - Right column: full-bleed photo placeholder
  - Time bucket label "TỐI NAY" 32px
- `client/components/EventRow.tsx` (NEW)
  - Text row, NO card chrome, NO shadow
  - Date 16px Bebas left, title 24px, venue 14px, price right
  - 1px hairline divider between rows
  - Hover: full invert (black bg, white text) instant
- `client/components/TimeBucket.tsx` (NEW)
  - 80px section header "TỐI NAY" / "CUỐI TUẦN" / "ĐANG MỞ BÁN"
  - Maps `Concert[]` → `EventRow[]` with bucket filter
- `client/components/CityFilter.tsx` (NEW)
  - "Hà Nội / Sài Gòn / Đà Nẵng" with underline active state
  - Updates GraphQL query `getConcerts(city: $city)` if backend added it
- `client/components/Footer.tsx` (NEW)
  - Massive "TICKETRUSH" wordmark 300px coral
  - Newsletter signup: 1px border input
- `client/components/EventCarousel.tsx` (replace)
  - 4-col grid where each card is JUST a photo (matches Editorial 2B direction) OR keep simple row layout
  - User's choice: keep horizontal scroll but rows, not cards

### KEEP + UPDATE styling only
- `client/components/Navbar.tsx` → remove glow, sharp corners, coral underline for active
- `client/components/MobileMenu.tsx` → remove neon, full-screen black panel
- `client/components/EventCard.tsx` → simplify to text row
- `client/app/components/EventDetail.tsx` → keep structure, restyle
- `client/app/components/CheckoutFlow.tsx` → keep structure, restyle
- `client/app/components/Navigation.tsx` → merge with Navbar
- `client/app/components/AlertManager.tsx` → restyle alerts as editorial callouts

### DUPLICATES — delete the unused one
- `app/components/HeroSection.tsx` — DELETE (page.tsx uses `@/components/HeroSection`)
- `app/components/EventCarousel.tsx` — DELETE (page.tsx uses `@/components/EventCarousel`)
- `app/components/EventDetail.tsx` — KEEP (referenced in page.tsx import)
- `app/components/CheckoutFlow.tsx` — KEEP
- `app/components/AlertManager.tsx` — KEEP
- `app/components/Navigation.tsx` — DELETE (page.tsx uses Navbar from components/)
- `app/components/AnimatedCard.tsx` — DELETE (not used)

---

## Phase 4: Page restructure (Hermes alone, ~30 min)

### `client/app/page.tsx` (currently 759 lines, must split)
- Move all logic to custom hooks: `useAuth`, `useConcerts`, `useSeatHold`, `usePayment`
- Reduce page.tsx to: `<EditorialHome />` that composes new components
- Remove `MOCK_EVENTS` (use real GraphQL `getConcerts`)
- Remove `MOCK_CONCERT_ID` from here (move to event detail route)
- Keep auth flow but inline as `<AuthPanel />` component

### `client/app/globals.css` font import
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Archivo+Narrow:wght@400;500;600;700&display=swap');
```

---

## Phase 5: Verify (Hermes alone, ~10 min)

1. `pnpm lint` exit 0
2. `pnpm build` exit 0
3. `pnpm dev` → screenshot homepage with Playwright
4. Visual check against Editorial design intent:
   - H1 is 200px Bebas Neue coral
   - NO rounded buttons (check all 0px radius)
   - NO drop shadows anywhere
   - NO glow effects
   - Time buckets as sections
   - Photos are full-bleed, no chrome
5. Mobile responsive check (375px width)
6. Vietnamese diacritics render correctly

---

## Phase 6: Clean unused files (Hermes alone, ~5 min)

After verification passes:
```bash
# List deletions with reasoning
git rm client/components/NeonPulseButton.tsx           # Electric-only
git rm client/components/ElectricInput.tsx              # Electric-only
git rm client/components/LoadingSpinner.tsx            # No spinners in Editorial
git rm client/components/ElectricRushComponents.tsx     # Bulk EP file
git rm client/app/components/AnimatedCard.tsx           # No motion
git rm client/app/components/HeroSection.tsx            # Duplicate
git rm client/app/components/EventCarousel.tsx          # Duplicate
git rm client/app/components/Navigation.tsx             # Duplicate
```

Update `client/app/components/index.ts` to remove re-exports of deleted files.

---

## Phase 7: Commit + PR (Hermes alone, ~5 min)

```bash
git add -A
git commit -m "feat(client): refactor to Editorial Music Discovery UI

- Replace Electric Pulse design (cyan/magenta/lime) with Editorial (coral #F24726, dark #0A0A0A, Bebas Neue)
- Add backend fields: city, ticketStatus, artist to ConcertSummary
- Rewrite HeroSection with 200px H1 + full-bleed photo
- Add EventRow, TimeBucket, CityFilter, Footer components
- Remove Electric Pulse artifacts (NeonPulseButton, AnimatedCard, etc.)
- Update design tokens (EDITORIAL replaces ELECTRIC_RUSH)
- Delete duplicate components in app/components/
- Verified: pnpm lint, pnpm build, visual review

Closes #[issue]"

git push -u origin feature/editorial-music-discovery
```

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Backend agent adds fields but breaks seeder | Agent must run `./mvnw test` before reporting done |
| Bebas Neue + Vietnamese diacritics look wrong | Fallback: use Archivo Black for Vietnamese H1, Bebas for English |
| Tailwind v4 syntax differs from training data | Read `node_modules/next/dist/docs/` per AGENTS.md notice |
| Design system incomplete → 1-2 visual regressions | Visual check Phase 5 catches this, fix before commit |
| Mobile breaks (Editorial is desktop-first) | 1-day mobile pass if needed (out of scope) |

---

## Estimated total time

- Phase 0: 5 min
- Phase 1 (agent): 30 min
- Phase 2: 15 min
- Phase 3: 60-90 min
- Phase 4: 30 min
- Phase 5: 10 min
- Phase 6: 5 min
- Phase 7: 5 min

**Total: ~3-4 hours** with agent in parallel for Phase 1.

---

## Tier (per Hermes orchestration rules)

- Phase 0, 2, 4, 5, 6, 7: **Tier 0** (Hermes alone, mechanical)
- Phase 1: **Tier 1** (1 leaf agent, well-scoped, evidence-based verify)
- Phase 3: **Tier 0** (high-stakes creative, cannot delegate — agent can't judge design intent)

Per memory: Hermes = pure orchestrator, never implements code. **EXCEPTION: Tier 0 work is acceptable for mechanical ops.** For Phase 3, I will write components directly because the design judgment (does this H1 "look editorial enough?") cannot be delegated to a subagent.
