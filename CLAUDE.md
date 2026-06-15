@AGENTS.md

# Kapyn — Project Context for Claude Code

> **🚀 Starting a new session? Read in this order:**
> 1. This file + `AGENTS.md` (auto-loaded) — what Kapyn is + conventions.
> 2. **`docs/PROJECT-STATUS.md`** — current state, open PRs, and the immediate next action. **Always read first.**
> 3. **`docs/design-foundations.md`** — the product/design brief; read before any UI, product, or strategy work.
>
> Then say "continue from the status doc" and pick up where the last session left off.

## What Kapyn is
A mobile-first PWA delivering AI/tech news as swipeable 30-second dispatches — Inshorts-style — for engineers, founders, and operators who need to stay current without the noise.

## Mission
The calm intelligence layer for AI. Every story that matters, distilled to 30 seconds. No paywall, ever.

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| UI runtime | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS v4 + CSS Modules | ^4 |
| Animation | Framer Motion | ^12.38.0 |
| Icons | Lucide React | ^1.16.0 |
| UI primitives | Radix UI, shadcn | ^1.4.3 / ^4.7.0 |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js ^2.105.4 |
| AI — ingestion | Google Gemini 2.5 Flash Lite | @google/generative-ai ^0.24.1 |
| AI — fallback | OpenRouter (Gemini 2.0 Flash Lite free) | via fetch |
| Analytics | PostHog (client + server) | posthog-js ^1.375.0 |
| RSS parsing | rss-parser | ^3.13.0 |
| QR code | qrcode.react | ^4.2.0 |
| Deployment | Vercel (cron support) | — |

**Node runtime:** `nodejs` for ingestion route (300s maxDuration). Edge runtime not used.

---

## Architecture

```
src/
├── app/
│   ├── (app)/                    # App shell — bottom nav, phone frame
│   │   ├── layout.tsx            # 3-col desktop layout (left panel | phone | QR)
│   │   ├── layout.module.css     # Phone frame + side panel styles
│   │   ├── page.tsx              # / → HomeFeed
│   │   ├── trending/page.tsx     # /trending
│   │   ├── saved/page.tsx        # /saved (localStorage)
│   │   ├── profile/page.tsx      # /profile
│   │   ├── feed/page.tsx         # /feed (alias)
│   │   └── categories/page.tsx   # /categories
│   ├── home/                     # Landing page at /home
│   │   ├── page.tsx
│   │   └── landing.module.css
│   ├── story/[id]/               # Individual story (OG image, redirect)
│   ├── api/
│   │   ├── news/fetch/route.ts   # Main ingestion pipeline (GET, cron-triggered)
│   │   ├── news/trigger/route.ts # User-triggered refresh (POST, rate-limited)
│   │   └── breakdown/route.ts    # "Why it matters" AI explanation (POST)
│   ├── globals.css
│   └── layout.tsx                # Root layout (PostHog provider, fonts)
├── components/
│   ├── feed/
│   │   ├── HomeFeed.tsx          # Supabase fetch + fallback to mock
│   │   ├── CardStack.tsx         # Swipeable card stack (Framer Motion)
│   │   ├── NewsCard.tsx          # Individual card (title, summary, actions)
│   │   ├── CompletionCard.tsx    # End-of-feed screen with streak
│   │   ├── BreakdownSheet.tsx    # Bottom sheet — "Why it matters"
│   │   ├── CategoryTabs.tsx      # Horizontal scroll tab bar
│   │   └── SwipeHint.tsx         # First-time swipe hint overlay
│   ├── categories/               # CategoryGrid, CategoryCard
│   ├── landing/                  # QRCodeBlock
│   ├── layout/                   # BottomNav
│   └── pwa/                      # AddToHomeScreen banner
└── lib/
    ├── types.ts                  # NewsItem, Category, CategorySlug
    ├── categories.ts             # CATEGORIES array, CATEGORY_TABS, getCategoryBySlug
    ├── supabase.ts               # fetchNewsItems, fetchNewsItemById, dbToNewsItem
    ├── storage.ts                # localStorage: bookmarks, streak, pinned categories
    ├── mock-data.ts              # MOCK_STORIES fallback + formatTimeAgo
    ├── posthog-server.ts         # Server-side PostHog client
    ├── producthunt.ts            # Product Hunt GraphQL feed
    └── utils.ts                  # clsx/tw utilities
```

### Data flow

```
Vercel Cron (daily 00:00 UTC)
  → GET /api/news/fetch
    → Fetch 12 RSS feeds + Product Hunt GraphQL in parallel
    → For each item: fetchPageMeta (OG image, description)
    → classifyAndSummarize via Gemini 2.5 Flash Lite
      → fallback: OpenRouter Gemini 2.0 Flash Lite free
    → isBadSummary() filter (LOW_SIGNAL, prompt leaks, raw changelogs)
    → INSERT into Supabase news_items
    → DELETE items older than 48h
  → PostHog server event: news_fetch_completed

Client (HomeFeed / TrendingPage)
  → fetchNewsItems(categorySlug) → Supabase query (48h window)
    → fallback: MOCK_STORIES if Supabase returns empty
  → CardStack swipe → CompletionCard → onBackToTop resets to index 0
  → "Why it matters" → POST /api/breakdown → Gemini 2.5 Flash Lite
```

---

## Data model

### `news_items` (live table in Supabase)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | gen_random_uuid() |
| `title` | text NOT NULL | Original article title |
| `summary` | text NOT NULL | AI-generated, 2-3 sentences |
| `source_url` | text UNIQUE NOT NULL | Used for deduplication |
| `source_name` | text NOT NULL | Publisher display name |
| `category_slug` | text NOT NULL | One of 9 valid slugs (AI-classified) |
| `image_url` | text | OG image or RSS enclosure |
| `published_at` | timestamptz | Original article publish time |
| `created_at` | timestamptz | DEFAULT now() |

**Note:** `BACKEND_SCHEMA.md` in the repo describes an earlier design with `stories` + `sources` + `categories` tables. The live implementation uses the simpler `news_items` table above. The design doc is outdated.

**48h rolling window:** `fetchNewsItems` applies `.gte("published_at", cutoff)` — only last 48h shown. Ingestion pipeline also deletes items older than 48h.

### Client-side state (localStorage — no auth yet)

| Key | Contents |
|---|---|
| `ai_changelog_bookmarks` | Array of full `NewsItem` objects |
| `ai_changelog_pinned_categories` | Array of category slugs |
| `ai_changelog_streak_dates` | Array of YYYY-MM-DD date strings |
| `kapyn_last_visit` | Unix timestamp ms |

---

## Design system

### Color palette

```
Background:   #0a0a0a  (body/cards)
Outer shell:  #050505  (app outer)
Card surface: #111111
Foreground:   #f5f5f5  (primary text)
Warm white:   #E8E4DE  (headlines, emphasis)
Muted:        #737373
Border:       rgba(255,255,255,0.08)

Per-category accent colors (colorAccent / colorBg / colorLabel):
  ai-models:      #7c3aed / #1a0533 / #c4b5fd
  dev-tools:      #2563eb / #0d1f3c / #60a5fa
  open-source:    #ea580c / #2d1200 / #fb923c
  startups:       #16a34a / #0a2015 / #4ade80
  research:       #0891b2 / #001f2e / #22d3ee
  funding-ma:     #d97706 / #2d1a00 / #fbbf24
  big-tech:       #4f46e5 / #0f0f2d / #818cf8
  infrastructure: #0f766e / #001f1d / #2dd4bf
  policy:         #9333ea / #1e0a2e / #d8b4fe
```

### Typography

- **Body:** `-apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, Helvetica Neue, Arial, sans-serif`
- **Wordmark:** `var(--font-space-grotesk)` — Space Grotesk
- **Code:** `var(--font-geist-mono)` — Geist Mono
- `-webkit-font-smoothing: antialiased` applied globally

### Voice & tone

Calm, minimal, intelligent. Never hyped.
- Summaries read like a smart friend briefing you, not a tech blog headline
- No emojis in content
- No exclamation marks
- Present tense, active voice
- First sentence: core fact in 10-15 words. Then 2-3 sentences of context.

### UI principles

- Mobile-first: 430px max phone column, 100dvh height
- Desktop: phone frame centered in 3-column grid (info panel | phone | QR code)
- 30-second readability — generous whitespace, large type
- Swipe-native: vertical card stack, spring animations (Framer Motion stiffness 350-380, damping 28-34)
- Overlays portal to `#phone-overlay-root` inside phone column — keeps sheets inside phone frame on desktop
- `position: absolute` (not `fixed`) for BottomNav and overlays — scoped to phone column

---

## Categories (current — 9 total)

| Slug | Display name |
|---|---|
| `ai-models` | AI / Models |
| `dev-tools` | Dev Tools |
| `open-source` | Open Source |
| `startups` | Startups |
| `research` | Research |
| `funding-ma` | Funding & M&A |
| `big-tech` | Big Tech |
| `infrastructure` | Infrastructure |
| `policy` | Policy & Regulation |

`all` is a virtual filter — client-side only, no Supabase row.

---

## Environment variables

| Variable | Where used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server fallback | |
| `SUPABASE_SERVICE_ROLE_KEY` | Ingestion pipeline | JWT format. Falls back to anon key if missing |
| `GEMINI_API_KEY` | Ingestion + breakdown | Primary LLM |
| `OPENROUTER_API_KEY` | Ingestion fallback | Free tier Gemini 2.0 Flash Lite |
| `NEXT_PUBLIC_POSTHOG_KEY` | Client analytics | |
| `NEXT_PUBLIC_POSTHOG_HOST` | Client analytics | Routes through /ingest proxy |
| `CRON_SECRET` | Cron auth | Protects /api/news/fetch |
| `NEXT_PUBLIC_APP_URL` | Trigger route | Defaults to https://kapyn.vercel.app |
| `PRODUCTHUNT_API_TOKEN` | PH GraphQL feed | |

---

## Coding conventions

- **Styling:** Inline styles for component-level styling; CSS Modules for layout/page-level; Tailwind only in `globals.css` for global utilities. Do not add Tailwind classes to component JSX.
- **Client/server:** `"use client"` on all interactive components. API routes use `Response.json()` (newer pattern).
- **Imports:** Absolute imports via `@/`. Order: React → external libs → internal components → lib → types.
- **Exports:** Named exports for components. Default exports for pages and API routes.
- **TypeScript:** No `any`. Validate API request bodies at the boundary.
- **Error handling:** `try/catch` with graceful fallback. Never surface raw errors or LLM outputs to UI without filtering.
- **State:** React state + localStorage only. No Zustand, Redux, or similar.
- **Comments:** Minimal. Section dividers (─── Section ───) in long files. Inline only for non-obvious behavior.
- **No test files** present — manual testing only currently.

---

## What NOT to do

- Do not use `position: fixed` for elements inside the phone column — use `position: absolute`.
- Do not portal overlays to `document.body` — portal to `#phone-overlay-root`.
- Do not introduce new state management libraries.
- Do not break the mobile-first layout — always verify at 430px.
- Do not write summaries in marketing voice — calm, minimal, no hype.
- Do not show raw RSS content, changelog boilerplate, or unprocessed LLM output.
- Do not trust `BACKEND_SCHEMA.md` for the live schema — it is outdated. Live table is `news_items`.
- Do not add Tailwind classes directly to component JSX.
- Do not add features without a PM skill check first — use `prioritization-advisor` or `feature-investment-advisor`.

---

## Current priorities (May 2026)

1. **Ask Kapyn** — chat input querying news corpus via RAG (Supabase pgvector + Gemini). Highest retention value.
2. **Daily share card** — user-triggered "Top 3 today" image, one-tap share. Viral loop.
3. **Pulse tab** — velocity-based weekly dashboard. Requires 4+ weeks of historical data — collect entity signals now, build UI later.
4. **Push notifications** — Web Push for breaking news by category. Biggest daily retention driver.
5. **Admin dashboard** at `/admin` — content QA, summary editing, source management.
6. **Cron frequency** — currently once daily. Should be every 2-4 hours.

## Out of scope right now

- Multi-language summaries
- Comments / user-generated content
- Payment / monetization
- Native iOS/Android apps
- User authentication (saves are localStorage-only)

---

## Known issues

- `BACKEND_SCHEMA.md` is stale — describes `stories` table, live code uses `news_items`.
- Cron runs once daily — feed goes stale during the day.
- `categories.ts` has hardcoded `storyCount` and `lastUpdated` — not live from DB.
- No test suite.
- PostHog `distinctId` for cron events hardcoded as `"cron-job"` — not user-segmentable.

---

## Installed skills (use them before writing code)

### PM Skills — `.claude/skills/pm/`

| Skill | When to use |
|---|---|
| `prioritization-advisor` | Deciding what to build next |
| `feature-investment-advisor` | Evaluating effort vs value of a specific feature |
| `jobs-to-be-done` | Understanding what users hire Kapyn to do |
| `pol-probe` + `pol-probe-advisor` | Validating a problem hypothesis |
| `discovery-interview-prep` | Preparing user interviews |
| `positioning-statement` | Clarifying what Kapyn is and for whom |
| `acquisition-channel-advisor` | Choosing growth/promo channels |

### Engineering Skills — `.claude/skills/eng/`

| Skill | When to use |
|---|---|
| `llm-summary-eval` | Evaluating auto-generated summary quality |
| `dpdp-compliance` | Any feature collecting/storing user personal data (India DPDP 2023) |
| `integration-nextjs-app-router` | Next.js App Router patterns |

### Growth Skills — `.claude/skills/growth/`

| Skill | When to use |
|---|---|
| `nextjs-news-seo` | Adding SEO to news/article pages |
| `product-analytics` | Setting up or auditing PostHog event taxonomy |
