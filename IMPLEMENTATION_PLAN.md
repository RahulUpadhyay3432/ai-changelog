# Implementation Plan — Kapyn

Build sequence for an AI agent. Each step is self-contained and testable.

---

## Phase 1: Foundation (Current)

### Step 1.1 — Types & Mock Data
Files: `src/lib/types.ts`, `src/lib/mock-data.ts`, `src/lib/categories.ts`
- Define `NewsItem`, `Category`, `Source` TypeScript interfaces
- Create 12 mock AI news stories covering all categories
- Export category config with colors, icons, slugs

### Step 1.2 — Design System
Files: `src/app/globals.css`, `src/app/layout.tsx`
- Dark theme CSS variables in `@layer base`
- SF Pro font stack on `<html>`
- PWA manifest meta tags
- `dark` class applied to `<html>` element
- Root layout: max-width container, flex column, overflow-hidden

### Step 1.3 — Shell Components
Files: `src/components/layout/BottomNav.tsx`
- Bottom navigation: Home, Categories, Trending, Saved, Profile
- Uses `usePathname()` for active state
- `position: fixed`, backdrop blur, safe-area padding

### Step 1.4 — Feed Components
Files:
- `src/components/feed/CategoryTabs.tsx` — horizontal scrollable tabs
- `src/components/feed/NewsCard.tsx` — full-screen card with gradient bg
- `src/components/feed/CardStack.tsx` — framer-motion swipeable stack

CardStack implementation:
```
useSwipeState hook → [[index, direction], paginate()]
AnimatePresence mode="wait"
motion.div: drag="y", dragConstraints, dragElastic=0.1
onDragEnd: check offset.y + velocity.y thresholds
variants: enter/center/exit with y translation
```

### Step 1.5 — Category Components
Files:
- `src/components/categories/CategoryCard.tsx`
- `src/components/categories/CategoryGrid.tsx`
- Light theme, 2-column grid, bookmark toggle per card

### Step 1.6 — Pages
Files:
- `src/app/page.tsx` — Home: TopBar + CategoryTabs + CardStack
- `src/app/categories/page.tsx` — Categories: header + grid
- `src/app/trending/page.tsx` — same CardStack, trending-sorted mock data
- `src/app/saved/page.tsx` — reads localStorage, empty state
- `src/app/profile/page.tsx` — static settings UI

---

## Phase 2: Backend

### Step 2.1 — Supabase Project Setup
- Create project via Supabase dashboard
- Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`
- Install `@supabase/supabase-js`
- Create `src/lib/supabase.ts` — browser and server clients

### Step 2.2 — Database Migrations
Apply in order via Supabase dashboard or CLI:
```
supabase/migrations/
  001_categories.sql
  002_sources.sql
  003_stories.sql
  004_rls_policies.sql
  005_seed_categories.sql
  006_seed_sources.sql
```

### Step 2.3 — Replace Mock Data with Supabase Queries
- `src/lib/queries.ts` — typed query functions
  - `getStories(categorySlug?, limit?)` → `NewsItem[]`
  - `getCategories()` → `Category[]`
  - `getTrendingStories(limit?)` → `NewsItem[]`
- Update Home, Trending pages to use server-side data fetching

### Step 2.4 — Saved Stories Persistence
- Move from localStorage → `saved_stories` table (requires auth)
- v1: keep localStorage with `useSaved` hook

---

## Phase 3: News Pipeline

### Step 3.1 — Supabase Edge Function
File: `supabase/functions/ingest-pipeline/index.ts`
- Parse RSS with `fast-xml-parser`
- Dedup via `content_hash`
- Claude API summarization (Haiku model for cost efficiency)
- Category classification prompt
- Batch inserts with conflict handling

### Step 3.2 — Cron Trigger
- Supabase cron job: `*/15 * * * *` → invoke `ingest-pipeline`
- Alternatively: Vercel Cron (if Supabase cron unavailable on free tier)

### Step 3.3 — Image Handling
- Extract `og:image` from article HTML (fetch + parse)
- Store in Supabase Storage (optional) or store external URL
- Update `next.config.ts` `remotePatterns` with CDN domains

---

## Phase 4: Polish

### Step 4.1 — PWA
- `public/manifest.json` — icons, name, display: standalone
- `public/sw.js` — service worker for offline support
- Meta tags: theme-color, apple-mobile-web-app-capable

### Step 4.2 — Animations Polish
- Swipe hint animation: subtle bounce loop
- Category tab transition: smooth scroll-into-view on change
- Card enter: slight scale (0.96 → 1) on entry for depth

### Step 4.3 — Error & Loading States
- Skeleton loaders for card stack (pulse animation)
- Error boundaries per route
- Retry button on network errors

### Step 4.4 — Performance
- `React.memo` on NewsCard (prevents re-render on parent state change)
- Image `priority` on first card
- Route prefetching for /categories via `<Link prefetch>`

---

## Testing Checklist (per phase)

- [ ] Card swipe: up = next, down = prev, edge cases (first/last card)
- [ ] Category filter: tap changes feed, counter resets
- [ ] Bookmark: saves to localStorage, icon fills, persists on reload
- [ ] Share: opens native share sheet or clipboard copy
- [ ] BottomNav: active state matches route, transitions are clean
- [ ] Categories grid: tap navigates to filtered home feed
- [ ] Responsive: works on 375px (iPhone SE) through 430px (iPhone 14 Pro Max)
- [ ] Keyboard navigation: Tab + Enter works for accessibility
