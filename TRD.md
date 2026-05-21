# Technical Requirements Document — Kapyn

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui (radix-nova) |
| Animations | framer-motion 12 |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (future) |
| Hosting | Vercel (Edge Network) |
| AI/Summarization | Anthropic Claude API (claude-haiku-4-5) |

## Architecture

### Frontend

```
src/
  app/                    # Next.js App Router pages
    layout.tsx            # Root layout: dark theme, BottomNav, PWA meta
    page.tsx              # Home feed
    categories/page.tsx   # Category grid
    trending/page.tsx     # Trending feed
    saved/page.tsx        # Saved stories
    profile/page.tsx      # User profile
  components/
    layout/               # Shared shell components
      BottomNav.tsx        # Persistent bottom navigation
    feed/                 # Feed-specific components
      CardStack.tsx        # Swipeable card container (framer-motion)
      NewsCard.tsx         # Single full-screen story card
      CategoryTabs.tsx     # Horizontal category filter tabs
      SwipeHint.tsx        # "Swipe for next story" indicator
    categories/           # Category page components
      CategoryGrid.tsx     # 2-column category grid
      CategoryCard.tsx     # Individual category tile
  hooks/
    useFeed.ts            # Feed state: index, direction, filter
    useSaved.ts           # localStorage saved stories
  lib/
    types.ts              # Shared TypeScript interfaces
    mock-data.ts          # Development fixture data
    categories.ts         # Category config: colors, icons, slugs
    utils.ts              # cn() and helpers
```

### Backend (Supabase)

- **stories** table: core news items
- **categories** table: category metadata
- **sources** table: RSS feed sources
- **pipeline** Edge Function: ingestion + summarization cron
- Full schema in BACKEND_SCHEMA.md

### Data Flow

1. Cron (every 15min) → Supabase Edge Function
2. Edge Function → fetch RSS feeds → parse items
3. Per item: check dedup hash → call Claude API for summary → insert to `stories`
4. Frontend: Next.js Server Component fetches from Supabase → passes to CardStack client component
5. Swipe gestures handled entirely client-side by framer-motion

## Key Technical Decisions

### framer-motion for Swipe
- `AnimatePresence` with `mode="wait"` for clean card transitions
- `drag="y"` on motion.div → `onDragEnd` detects swipe direction
- Threshold: 80px offset OR 500px/s velocity
- Spring animation: stiffness=300, damping=30

### Tailwind v4 Config
- No `tailwind.config.js` — all config in `globals.css` via `@theme`
- Category colors defined as CSS custom properties, applied via inline styles
- Dark mode: `dark` class on `<html>` + `@custom-variant dark`

### Next.js 16 Specifics
- `params` is a Promise in dynamic routes → must `await params`
- Server Components by default; only interactive components marked `"use client"`
- PWA meta tags in root `layout.tsx` `<head>` via `metadata` export

### Image Strategy (MVP)
- No external image domains needed in v1
- Cards use CSS gradient backgrounds per category
- Production: add `remotePatterns` to `next.config.ts` for CDN images

## Performance Budget

| Metric | Target |
|---|---|
| JS bundle (initial) | < 150kb gzip |
| Time to Interactive | < 2s on 4G |
| Card transition | 60fps, < 300ms |
| Lighthouse (mobile) | > 90 |
