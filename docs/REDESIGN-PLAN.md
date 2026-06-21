# Kapyn Revamp Plan — Discover, Track, Build

*The calm map of AI. One face, one gold, no hype. Discovery is the headline; the feed is the live signal.*

---

## 1. Executive summary

**The new positioning, in three lines:**
Kapyn is the calm map of the AI worth using — agents, models, tools, MCP servers, and skills — curated, kept current by a daily signal, and never behind a paywall. We elevate **Radar (discover + collect)** from a hidden second product to *the* headline, reframe the 30-second feed as the live signal that keeps the map honest, and make **search + answer-engine citation** the primary growth channel.

**The big bets:**
1. **Own discovery, not news.** Reposition around "Find the AI worth using" — a curated, current, *yours* map. News supports it; it is not the headline.
2. **Become the cited source.** Win Tier-1 head terms ("best AI agents", "best MCP servers") and Tier-2 definitional queries ("what is MCP") through programmatic SEO + AEO over the durable corpus. This is how a no-paywall product grows without spend.
3. **One brand face.** Unify everything on the Radar identity — gold `#D9B27C`, Space Grotesk, warm near-black `#0c0b0a`. Retire the landing's blue + Geist grayscale entirely.
4. **A self-feeding content↔product loop.** The blog turns the corpus into indexable authority; every post deposits readers into Radar + Loadout, where retention lives.
5. **Retention via "what's new in my world."** Follow + Loadout replaces streak-chasing as the moat.

---

## 2. New positioning & messaging

**Positioning statement:** Kapyn is where you discover, understand, and track the AI worth using — agents, models, tools, MCP servers, and skills — kept current by a calm daily signal, never behind a paywall. *(Internal short form: the calm map of the AI that matters.)*

**Tagline — the pick:** **"Find the AI worth using."** (primary — verb-first, search-intent-shaped). Supporting: "The calm map of AI." Sub-claim kept alive, never as headline: *"Every story that matters, distilled to 30 seconds. No paywall, ever."*

**Value props (the 4, compressed to 3 verbs on-page — Discover · Track · Build):**
1. **A curated map, not a search box.** ~130 tools, ~45 MCP servers, ~31 skills, the OSS canon — filed, not scraped. Surfaces the thing you didn't know to ask for. (Answers the "just ask an AI" objection.)
2. **Current by default.** The feed is the live signal keeping the map honest — launches, better-ways, deprecations. GitHub last-48h, PH launches, traction ranking.
3. **Your toolkit, not just ours.** Save any agent/model/MCP/skill into a named **Loadout**. The map becomes *your* map — the retention moat.
4. **Calm, source-grounded, free forever.** No hype, no exclamation marks, no paywall, no signup wall. Every claim links to its source. *(Future 5th, once Protect ships: "It tells you when your stack breaks.")*

**Segments + jobs:** Primary = **The Builder** (engineer/vibe-coder/PM/founder building *with* AI; India explicitly courted). Secondary = **The Creator** (AI-content makers) and **The Curious/Operator** (highest LTV, learner path). The feed acquires all three; Radar + Loadout convert and retain the Builder first.

**Category to own:** **"AI ecosystem intelligence"** — externally *"where you discover and track the AI that matters."* Own the words **map** / **radar** and the phrase **the AI that matters**. Avoid "directory" and "news app."

**The searches/questions to own (3 tiers):**
- **Tier 1 — head terms (catalog/hub pages):** `best AI agents`, `best AI coding agents`, `best AI agent frameworks`, `best MCP servers`, `MCP servers list`, `best AI tools for [developers/RAG/video/voice/design]`, `open source AI tools`.
- **Tier 2 — definitional/AEO (explainer pages, the format LLMs cite verbatim):** `what is MCP`, `Model Context Protocol`, `MCP vs function calling`, `what are AI skills`, `what is a Claude Skill`, `what is an AI agent`, `agent vs workflow`, `what does [tool] do`.
- **Tier 3 — job-shaped long-tail (Loadout/lens-aligned, highest conversion):** `AI skills for [writing/research/marketing/data]`, `best AI stack for [RAG/hackathon/building an agent]`, `[tool] alternatives`, `[A] vs [B]`, `AI hackathons [2026/India/online]` (near-zero competition — own it now).

**Keep (hard constants):** calm no-hype voice; no paywall / no signup wall; source-grounded trust; builder-first; the 30-second feed (demoted to top-of-funnel). **Evolve:** headline → "Discover, track, and collect the AI worth using"; brand → unify on gold Radar system; landing → rebuild around Radar with real catalog data; metadata → "Kapyn — Discover the AI worth using: agents, models, tools, MCP servers & skills"; retention → Follow + Loadout over streaks.

---

## 3. Homepage redesign

**Build target:** rewrite `src/app/home/page.tsx` (→ async server component, `export const revalidate = 1800`) + `src/app/home/landing.module.css`. Swap `Geist` import for `--font-space-grotesk`. Reuse Radar tokens verbatim: `GOLD #D9B27C`, `CANVAS #0c0b0a`, `SURFACE #1b1a17`, `SURFACE_RAISED #24221d`, `HAIRLINE rgba(255,255,255,0.09)`, text ramp `#f6f4f0 / #cbc7bf / #a29d94`. Content column max-width **1200px**; hero + trust band full-bleed.

### ASCII wireframe (top → bottom)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ░ STICKY TOP NAV (h64, blur, hairline-bottom, CANVAS/85)                                │
│  kapyn   Feed  Radar  Tools & Agents  Skills  MCP  Hackathons  Blog        [ Open ↗ ]   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ HERO (full-bleed, 7fr copy / 5fr live catalog wall)                                  │
│  ● the calm map of AI · updated 6m ago         │  LIVE RADAR WALL (real favicons,      │
│  Find the AI worth using.  ("worth using"=gold)│   2-row auto-scroll marquee, ~16       │
│  Agents, models, tools, MCP servers and skills │   real tools/mcp/skills/oss cards)     │
│  — curated, current, kept honest by a calm     │  ───────────────────────────────       │
│  daily signal. No paywall, ever.               │  132 tools · 45 MCP · 31 skills        │
│  [ Open the Radar → ]   [ Today's feed ]       │  kept current · last 48h               │
│  ░ STAT STRIP: 132 tools · 45 MCP · 31 skills · ~40 stories / 48h (hairline framed)     │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ THE MAP — 6-card ecosystem grid (3×2): Agents&Tools · Models&Chat · MCP ·            │
│            Skills · Open Source · Hackathons  (icon·title·line·live count·3 chips·→)     │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ MOVING NOW — "What changed this week" (3 live cols)                                   │
│   Trending on GitHub (48h)  │  New on the Radar  │  Top stories today    + see-all links │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ THE THREE JOBS — Discover · Track · Build (value props as verbs, 1 internal link each)│
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ LOADOUT SHOWCASE — "Make the map your map." (copy left / faux-loadout tabs right)     │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ LEARN / AEO — explainer grid (3×2) → /learn/[slug], question-shaped, 40-word answers  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ CATEGORIES — 9-chip topical link row → /categories/[slug]                             │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ TRUST BAND — "Calm, source-grounded, free forever. No hype. No paywall. No signup."   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ GET THE APP — QR (demoted from hero) + "best on mobile"                               │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ░ FOOTER — 4-col sitemap (Discover / Learn / Stay current / Kapyn) + wordmark           │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Section list (12 bands)

| # | Section | Purpose | Key links / live source |
|---|---|---|---|
| 0 | Top nav | Wayfinding, de-orphan MCP/Skills/Hackathons | see nav spec |
| 1 | **Hero** | New positioning + real catalog proof (kills fake GPT-5 demo). H1 "Find the AI worth using" | `/radar` (primary), `/` (ghost). Marquee from `CURATED_ESSENTIALS` + `MCP_SERVERS` + `AI_SKILLS` + `getRadarTools()`; timestamp from freshest `news_items.created_at` |
| 2 | **Stat strip** | Scale + freshness as extractable facts | live `.length` of 3 catalogs + 48h `news_items` count |
| 3 | **The Map** (6-card grid) | Showcase full ecosystem; 6 anchored internal links | `/radar/browse`, `/radar/mcp`, `/radar/hackathons` |
| 4 | **Moving Now** | Curiosity loop + freshness, high crawl-frequency | `getRadarTools()` (GitHub 48h), created<48h + PH, `fetchNewsItems()` |
| 5 | **Three Jobs** | Value props as Discover/Track/Build | `/radar`, `/radar/browse`, `/radar/toolkit` |
| 6 | **Loadout showcase** | Retention hook ("what's new in my world") | `/radar/toolkit` |
| 7 | **Learn / AEO** | Tier-2 definitional intent; FAQPage JSON-LD wraps this | `/learn/[slug]`, `/explore` |
| 8 | **Categories** | Topical crawl depth | `/categories/[slug]` ×9 |
| 9 | **Trust band** | Brand constant — calm, free | `/` |
| 10 | **Get the app** | PWA path, demoted | `QRCodeBlock`, env `NEXT_PUBLIC_APP_URL` (fix domain) |
| 11 | **Footer sitemap** | Sitewide link hub; surfaces orphans | `/radar/mcp`, `/feed.xml`, `/llms.txt`, `/okf` |

### Top-nav spec

| Tab | Destination | Note |
|---|---|---|
| `kapyn` wordmark | `/home` | Space Grotesk, gold on hover |
| Feed | `/` | live signal |
| Radar | `/radar` | flagship |
| Tools & Agents | `/radar/browse` | Tier-1 anchor |
| Skills | `/radar/mcp?tab=skills` | de-orphan; pass hash for toggle |
| MCP | `/radar/mcp` | de-orphan; Tier-1 |
| Hackathons | `/radar/hackathons` | Tier-3, low competition |
| Blog | `/blog` once it ships (`/explore` as interim alias — flag to founder) | editorial hub |
| `[ Open ↗ ]` | `/` | trailing gold pill |

**Behavior:** `position: sticky; top:0; z-index:50`, `rgba(12,11,10,0.85)` + `backdrop-filter: blur(12px)`, hairline bottom, optional shadow after ~24px scroll. Active/hover = 2px gold underline + text `#a29d94 → #f6f4f0`, active via `usePathname()`. **Mobile <720px:** wordmark + `[Open]` inline; tabs collapse to hamburger → slide-down sheet (`position: absolute`, not `fixed` — this is the standalone `/home` doc, outside the phone-column rule). Closes on tap/outside/Esc.

**On-brand enforcement:** retire all blue; gold only for wayfinding (active underline, H1 accent word, CTA fills, dots, kickers). Space Grotesk for wordmark/headings/nav/kickers (drop Geist); SF Pro/system for body; negative tracking `-0.02em` on display. Calm verbs only ("Open the Radar", "Read", "Browse"). Reuse Radar motion + `prefers-reduced-motion` kill-switch; marquee auto-scrolls slowly, pauses on hover.

**SEO/AEO scaffolding (closes the landing's gap):** `export const metadata` (title `Kapyn — Discover the AI worth using: agents, models, tools, MCP servers & skills`, matching description, `alternates.canonical`, OG image); server-rendered JSON-LD (`WebSite` + `SiteNavigationElement` for the 7 tabs, `ItemList` for hero wall + stats, `FAQPage` for Learn block, `Organization`); internal links via plain `next/link` (no `_blank`) so crawl equity flows.

---

## 4. Blog / content engine

The blog introduces a second content unit alongside per-entity explainers: a **synthesized article** spanning multiple stories and entities — dated, long-form, markdown-bodied, source-cited, author = Kapyn. It reuses the durable corpus (`story_archive` + `entity_mentions` + `entities` + `entity_explainers`), the quality machinery (self-critique + publish/hold gate), and the `/learn` editorial design language. It supersedes the dead `digests` table.

### Strategy — 5 article types

| # | Type | Corpus query | Intent | Retention role |
|---|---|---|---|---|
| 1 | **The Brief** (weekly roundup) | `story_archive` last 7d, grouped by `category_slug` + shared mentions | Tier-3 freshness | Recurring habit → Loadout follows |
| 2 | **Deep-dive / synthesis** | trend cluster co-mentioned over 2-6 wks | Tier-2/3 thought-leadership | Backlink magnet, credibility |
| 3 | **Tool / skill roundup** | `entities` ranked by `mention_count` + recency, by lens | **Tier-1 head terms** (the prize) | Direct funnel → Radar + Toolkit |
| 4 | **Long-form "What is X" explainer** | one entity + full mention history + explainer seed | **Tier-2 AEO** | Top-of-funnel from search |
| 5 | **Trend / timeline analysis** | entity mention timeline bucketed by week | Tier-2/3 evergreen | Showcases unique longitudinal data |

Types 1 & 5 = freshness engines; type 3 = commercial SEO; types 2 & 4 = authority/AEO. Voice enforced in every prompt + gate: calm, present tense, core fact in 10-15 words, no emojis/exclamations/marketing adjectives, every non-obvious claim cited.

### Generation pipeline

- **Stage A — Clustering & topic selection (deterministic, in-code — never trust the LLM for topic choice).** Pull candidate window (7d Brief / 14-42d deep-dive); build co-mention clusters via `entity_mentions`; score `cluster_score = (#distinct stories) × (Σ entity mention_count) × recency_weight`; route by type (≥5 stories/1 category/7d → Brief; ≥6 stories/≥2wks/multi-lab → deep-dive; ≥6 ranked tool/model entities → roundup; single-entity spike → trend/explainer). **De-dup** against `blog_posts` via `topic_key` (hash of post_type + sorted top-3 entity slugs) with Jaccard `source_story_ids` overlap > 0.5 inside a cooldown (7d Brief / 30d deep-dive / 60d explainer). Budget ≤3 posts/run.
- **Stage B — Synthesis** (new `src/lib/blog-prompt.ts`, labeled-section line-parse like `buildExplainerPrompt`, producing a markdown body). Stories passed numbered; model cites `[n]` inline. Server **re-derives the slug deterministically** (never from LLM), maps `[n]` → `sources` JSON, computes `reading_time_min`, intersects `tags` with known entity slugs (drops hallucinations).
- **Stage C — Quality gating.** Deterministic `isBadBlogPost` (modeled on `isBadSummary`): reject body < 350 words, < 2 `##` headers, exclamation marks, marketing leaks, **any `[n]` referencing a story outside the cluster = hard fail (hallucinated citation)**, fewer than `ceil(stories/3)` distinct citations used, prompt-leak markers. Then **self-critique LLM pass** (extend `buildCritiquePrompt`): score 0-100 on accuracy, grounding, specificity, calm-voice, thesis clarity. **≥75 → `status='review'` (NOT auto-published)**, 60-74 → `held`, <60 → one stricter retry then `held`. Higher bar than the 70 explainer threshold.
- **Stage D — Cadence (`vercel.json`):** `/api/blog/generate` `0 4 * * *` (after the 03:00 explainer cron, budget 3); `/api/blog/generate-brief` `0 5 * * 1` (Mondays). `CRON_SECRET` + `SUPABASE_SERVICE_ROLE_KEY`.
- **Stage E — Human-in-the-loop (mandatory).** The blog **never auto-publishes.** Posts land in `status='review'`; `/admin/blog` renders markdown + cited sources side-by-side, editor verifies citations, flips to `published` (sets `published_at`, triggers `revalidatePath('/blog')` + `[slug]` + sitemap). `held`/`unpublished` invisible to anon via RLS.

### Data model — `blog_posts` (migration `0002_blog_posts.sql`)

```sql
-- Kapyn Blog — schema migration 0002. Synthesized long-form articles from the durable corpus.
-- Durable (never touched by 48h news_items delete). RLS: anon SELECT published-only; writes service-role.
create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),
  -- identity & routing
  slug              text not null unique,            -- server-derived, never from LLM
  post_type         text not null
                      check (post_type in ('brief','deep_dive','roundup','explainer','trend')),
  topic_key         text not null,                   -- dedup hash: post_type + top entity slugs
  -- content
  title             text not null,
  deck              text,                            -- one-sentence standfirst / og description
  body_md           text not null,                   -- markdown body (no H1)
  reading_time_min  int not null default 1,
  category_slug     text,                            -- reuses the 9 slugs
  -- provenance / citations
  source_story_ids  uuid[] not null default '{}',
  sources           jsonb not null default '[]',     -- [{n,story_id,title,source_name,source_url}]
  entity_slugs      text[] not null default '{}',    -- entities to internal-link
  -- SEO / AEO
  seo_title         text,
  seo_description   text,
  og_image_url      text,
  canonical_url     text,
  faq               jsonb not null default '[]',     -- [{q,a}] → FAQPage JSON-LD
  -- lifecycle / quality
  status            text not null default 'draft'
                      check (status in ('draft','review','published','held','unpublished')),
  quality_score     int,
  model_used        text,
  author_name       text not null default 'Kapyn',
  published_at      timestamptz,
  generated_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists blog_posts_status_published_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_type_idx           on public.blog_posts (post_type, published_at desc);
create index if not exists blog_posts_category_idx        on public.blog_posts (category_slug, published_at desc);
create unique index if not exists blog_posts_topic_recent_idx
  on public.blog_posts (topic_key, (published_at::date));   -- one post per topic per day
create index if not exists blog_posts_entity_slugs_gin   on public.blog_posts using gin (entity_slugs);

alter table public.blog_posts enable row level security;
drop policy if exists blog_posts_anon_read on public.blog_posts;
create policy blog_posts_anon_read on public.blog_posts
  for select to anon using (status = 'published');
-- No insert/update/delete policy → only service_role writes (matches 0001 contract).
```

`digests` is left deprecated — `post_type='brief'` supersedes it.

### Blog UX (full-width `(web)` shell, gold/Space Grotesk, extends `learn.module.css`)

- **`/blog`** (`src/app/(web)/blog/page.tsx`, ISR ~1800s): eyebrow "The Kapyn Blog" + standfirst; one **featured** post (latest deep-dive, hero OG); reverse-chron card feed (post_type chip in category accent, title, deck, date, reading time, top source logos); filter chips by `post_type` + `category_slug`; real `<a href>` links; pagination that degrades to indexable links.
- **`/blog/[slug]`** (`generateStaticParams` + ISR + `generateMetadata`): eyebrow (type + category) · big title · deck · byline "By Kapyn · {date} · {reading_time} min read" · accent hairline; **auto-built TOC** from `##` headers (sticky, scroll-spy); **markdown renderer** (`react-markdown` + `remark-gfm`, sanitized) with custom renderers for inline `[n]` citation chips, embedded `:::story{id}` NewsCard blocks → `/story/[id]`, and entity chips auto-linked to `/radar/...` or `/learn/...`; **visible "Sources"** list from `sources` JSON + provenance footer ("Synthesized by Kapyn from N sources"); author = Kapyn with an honest "Auto-generated, human-reviewed" tooltip (no fabricated byline); **related posts** by shared `entity_slugs`/`category_slug` (GIN index) + related radar entities + related `/learn` explainers; share + `opengraph-image.tsx`.

**The product loop:** Search/answer-engine → `/blog/[slug]` → entity links → `/radar/...` entity → **Save → Loadout** (retention) → `source_story_ids` → `/story/[id]` + live feed (daily habit). Reverse: "Related reading" chips on `/learn` and radar entity pages (powered by `entity_slugs` GIN) point back into the blog — finally connecting the KB to the product.

**Build order:** migration → `blog-prompt.ts` + `blog.ts` → `/api/blog/generate` + `vercel.json` → renderer/routes/OG/JSON-LD → `/admin/blog` → wire loop (sitemap/llms.txt/robots/nav/related chips).

---

## 5. SEO / AEO strategy

> **The one thing that gates everything (PRIORITY 0):** `/radar`, `/radar/mcp`, `/radar/browse`, `/trending` fetch data server-side then hand it to client components — the HTML a crawler or AI fetcher (GPTBot, ClaudeBot, PerplexityBot — most don't run JS) receives has **no tool names, no descriptions, nothing**. Until list content is server-rendered, Kapyn is structurally incapable of ranking or being cited for any target query. This is the highest-impact item in the entire plan and blocks everything below.

### HIGH priority

- **P0.1 — SSR the radar/MCP/trending list content.** Keep the client component for interactivity, but server-render a real `<ul>`/`<article>` block (names, 1-line descriptions, `<a href>`) — pattern proven on `/categories/[slug]`. Files: `(radar)/radar/{page.tsx,mcp/page.tsx,browse/page.tsx,McpMarketClient.tsx,RadarClient.tsx}`, `(app)/trending/page.tsx`.
- **P0.3 / §3 — Build canonical `/tools`, `/mcp`, `/skills` hubs + `[slug]` detail pages** (kills the `entities.ts` 404). Hub = `ItemList` + editorial intro; detail = H1 + **40-word extractable answer** + at-a-glance facts (stars, last-pushed, license, "new this week") + Why-it-matters/How-it-works/What's-happening (reuse `entity_explainers` 4-field machinery) + "In the news" live mentions + Alternatives/Related + provenance footer + `SoftwareApplication`+`FAQPage`+`BreadcrumbList`. **Widen the explainer generator's `entity_type IN ('technique','concept')` filter (`generate/route.ts:76`) to include `model`/`tool`/`company`** — the single change unlocking the most pages.
- **`Organization` + `WebSite` + `SearchAction` `@graph` in root `layout.tsx`** (entity identity, sitelinks search box, `sameAs`) + **`title.template: "%s | Kapyn"`** (strip child suffixes). Cheap, sitewide.
- **`ItemList` + `CollectionPage` JSON-LD** on `/radar/mcp`, `/tools`, `/skills`, `/explore`, `/categories[/slug]`, `/trending`, `/radar/browse` — the core AEO unlock for Tier-1 head terms.
- **`FAQPage` JSON-LD** (question-phrased: "What is the Model Context Protocol?") on `/learn/[slug]`, `/tools/[slug]`, `/mcp` — single strongest schema for AI-Overview/Perplexity verbatim extraction.
- **`SoftwareApplication`** per item on `/tools`, `/radar/mcp`, detail pages (`applicationCategory: "DeveloperApplication"`, `offers: {price: 0}`).
- **Sitemap: add radar + AEO routes** (`/radar`, `/radar/browse`, `/radar/mcp`, `/radar/hackathons`, `/tools`, `/feed.xml`, `/llms.txt`, programmatic pages); extend to published `blog_posts`. **robots.ts:** explicit AI-crawler allow block (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot, cohere-ai), allow `/okf/`, `/llms.txt`, `/feed.xml`.
- **Expand `/llms.txt`** to link `/feed.xml`, `/trending`, `/categories`, `/radar`, `/radar/mcp`, `/tools`, `/mcp` + high-value tool/explainer pages.
- **40-word extractable answer block** at the top of every explainer/tool/MCP page; **surface freshness signals** ("Updated [date]", "New this week", live stars) in visible HTML.
- **Internal linking:** homepage top-nav (§3), surface orphaned `/radar/mcp` in both radar navs, bidirectional entity↔story↔concept links.

### MEDIUM priority

- Dedicated **`/news-sitemap.xml`** with `<news:news>` tags (last 48h `news_items`, hand-built XML — `MetadataRoute` can't emit the namespace) for Google News Top Stories.
- Per-page **metadata + canonical + OG/Twitter** on orphan pages (`/`, `/radar`, `/radar/mcp`, `/radar/hackathons`, `/radar/browse`, `/trending`, `/categories`); **OG images** via `opengraph-image.tsx` for `/explore`, `/radar`, `/radar/mcp`, `/categories/[slug]`, `/trending`.
- **`/best/[query-slug]` curated comparison pages** (5-15, hand-curated with a real POV + comparison table — *not* auto-spun per permutation) for Tier-1/3 intent.
- `BreadcrumbList` on `/story`, `/learn`, `/categories`, `/tools`, `/mcp` detail; `Article`/`NewsArticle` split for blog (`NewsArticle` for brief/trend, `Article` for evergreen).
- **`llms-full.txt`** (full-content variant inlining top explainers + current digest); extend OKF/RSS to news with question framing.
- Fix `/story/[id]` redirect for non-JS fetchers (make it a real readable destination or gate the redirect behind a gesture).

### LOW priority

- `twitter.site`/`creator: "@kapynapp"`; RSS auto-discovery `<link rel="alternate">` in root.
- `noindex` `/saved`, `/profile`, `/feed` (thin/personal/duplicate — `/feed` duplicates `/`).
- Align `NEXT_PUBLIC_APP_URL` fallback `kapyn.vercel.app → kapyn.app`.
- Footer hub set on every page; phone-app "Learn more" entity chips into the KB.

**Programmatic-SEO duplicate-content firewall:** only index pages that pass the existing self-critique gate; no page without ≥1 unique data point (else `noindex`); differentiate hub (`ItemList`) vs detail (explainer) — never two pages on one query; stagger publication as explainers pass (steady fresh growth, not a 200-page dump).

**Measurement:** submit `sitemap.xml` + `news-sitemap.xml` in GSC (token already present); PostHog server events on crawler hits to `/okf/*`, `/llms.txt`, `/feed.xml` (parse UA — also fixes the hardcoded `"cron-job"` distinctId); track Tier-1/2/3 queries in GSC; monthly manual citation probes of ChatGPT/Perplexity/AI Overviews.

---

## 6. GTM

### The explicit decision on the YouTube auto-comment bot: **DECLINED.**

**Do not build the YouTube mass-comment bot.** It violates YouTube ToS (automated comment posting is prohibited spam) — realistic outcomes are shadow-removal within minutes, account ban, and `kapyn.vercel.app` flagged as a spam domain, which leaks into Google Safe Browsing / Gmail / Reddit-Discord auto-removal lists. That would **poison the exact SEO/AEO channel that is the entire growth thesis.** It also destroys the trust that *is* the product (a drive-by bot comment is the precise hype-spam signal builders are trained to spot), and it doesn't scale value (a bot has zero context).

**The principle:** *Automate the work. Never automate the authenticity.* Automate generation, scheduling, research, analytics, and the *drafting* of outreach — never the act of a human appearing where they aren't.

**The better alternative, stated plainly:** **templated-but-personal MANUAL creator outreach tracked in a CRM.** Build a list of 50-100 AI YouTubers/newsletter writers/Twitter builders whose audience = your ICP. **AI drafts the template; you watch 3 minutes and inject one specific, true, useful reference, then send.** This is 5x faster than fully-manual and 100% authentic. The offer is *value, not ask*: "I built a free, no-paywall catalog of MCP servers — here's a Loadout of the 6 you'd probably like for your agent workflow. No signup. Useful?" Plus occasional *genuine* human comments where you have something real to add (one thoughtful comment referencing the actual video = worth more than 10,000 bot comments, zero ban risk).

### Channels (ranked for a calm, no-hype product)

- **Tier 1 — SEO/AEO + the blog (owned, durable, #1 bet).** Current, source-grounded catalog pages beat stale listicle farms on the axis Google now rewards: freshness + genuine expertise. Must-dos = the §5 JSON-LD + answer blocks + freshness signals + one templated landing per Loadout/lens/long-tail job. The blog is the owned hub of all of it.
- **Tier 2 — Genuine creator/community engagement** (the legitimate version of the YouTube instinct — the CRM outreach above).
- **Tier 3 — Reddit / HN / Discords** where builders already are: r/vibecoding (~559k/wk), r/LocalLLaMA, r/ChatGPTCoding, r/MachineLearning — be a helpful member (9 helpful comments : 1 link). **Show HN** for the Radar (calm title, "no paywall + builder-first + anti-hype" — HN's exact register). AI builder Discords.
- **Tier 4 — Launch spikes:** Product Hunt (launch the *Radar*, not the feed), Show HN, directory listings (There's An AI For That, Futurepedia, awesome-mcp-servers).
- **De-prioritize:** paid ads (no-paywall payback math pre-PMF), TikTok/short-form (wrong register), influencer payments.

### Growth + retention loops (priority order)

- **Loop A — Content Loop (blog ↔ feed ↔ radar), the core engine:** live data → auto-drafted post → ranks/cited → reader → internal links into Radar/explainers → Loadout save → returns for "what's new in my world" → usage generates fresh signal → next post. Solo-founder-friendly (drafting automatable, you edit for voice).
- **Loop B — Share loops (artifacts that travel):** shareable **Loadout OG cards** (gold/Space-Grotesk, "My RAG Stack — 8 tools, via Kapyn Radar"); **"Top 3 in AI today" share card** (one-tap, branded); per-entity/explainer OG images. The *user* shares (authentic); the *artifact* carries the brand — the opposite of a bot.
- **Loop C — Referral (lightweight, no auth):** shared Loadouts *are* the referral pre-auth; never a paywall-gated referral.
- **Loop D — Push / email re-engagement:** Web Push by category/follow ("a tool in your Loadout shipped a major update") — highest retention lever; calm cadence, opt-in, push the *signal* not a nag. Email: calm daily/weekly digest once a capture point exists.

### Habit formation (calm, never guilt-based)

No Duolingo guilt-gamification. Habits = value on a predictable cadence. The daily dispatch (fix cron to 2-4h so the ritual is never stale); Follow + Loadouts = "what's new in my world" (surface "new since you last looked"); tasteful streaks only as a reflection of value, never a threat. Hook: Trigger (push) → Action (open) → Variable reward (what's new) → Investment (save another tool).

### 30 / 60 / 90-day sequence

- **0-30 — Foundation:** ship SEO/AEO scaffolding (JSON-LD + answer blocks + canonical/metadata + internal linking) — *single highest-leverage 30-day task*; fix cron to 2-4h; launch the blog (4-6 data-driven posts); build outreach CRM + seed 50 creators; start genuine r/vibecoding/r/LocalLLaMA/Discord engagement; ship shareable Loadout OG cards; get listed in 5-10 directories + awesome-mcp lists.
- **31-60 — Loops + first spike:** Show HN for the Radar → Product Hunt; ship "Top 3 today" card + Web Push (opt-in); begin templated-personal outreach (5-10 quality touches/wk); content loop running; stand up email capture.
- **61-90 — Compound:** audit PostHog (which loop drives return visits? which pages convert to Loadout saves?) → double down on the winner; scale the winning content format; deepen responsive creator relationships (custom Loadouts, genuine collabs); ship Loadout "new since last visit"; scope Protect/deprecation-alerts v1 if feasible (the differentiator no competitor has).

**Automate vs. never:** Automate content generation (edit for voice — never publish raw LLM output), scheduling, analytics, outreach *drafting*, internal data ops, research. **Never** automate mass/scripted comments, bot DMs, fake reviews/sockpuppet votes, auto-following, or scraped-and-blasted email (watch DPDP for Indian user data). **The test:** *did a real human engage with this specific thing, and would I be comfortable if the recipient knew exactly how it was produced?*

---

## 7. Phased build roadmap

### Phase 1 — Homepage redesign + unify brand to gold (THE PRIORITY)

*Goal: one brand face, real positioning live, crawlable landing. Resolves the audit's two-design-languages gap and gives every later phase a linkable home.*

| Task | Effort | Files / routes | Deps |
|---|---|---|---|
| Rewrite `home/page.tsx` → async server component (`revalidate=1800`); swap Geist → `--font-space-grotesk` | M | `src/app/home/page.tsx` | — |
| Rewrite `landing.module.css` against Radar tokens; delete blue oklch vars; build real ghost CTA | M | `src/app/home/landing.module.css` | — |
| Build all 12 sections (hero w/ live marquee, stat strip, Map grid, Moving Now, Three Jobs, Loadout showcase, Learn grid, categories, trust band, QR, footer) | L | `home/page.tsx`, `landing/QRCodeBlock.tsx` | live data fns |
| Wire live data: 48h count, catalog `.length`, marquee, Moving Now, timestamp | M | `lib/supabase.ts`, `radar-essentials.ts`, `radar-mcp.ts`, `radar-skills.ts`, `getRadarTools` | — |
| Build sticky top-nav component (`usePathname`, gold underline, mobile hamburger sheet) | M | new nav in `home/` (reuse `(web)/layout.tsx` pattern) | — |
| Page metadata + JSON-LD (`WebSite`, `SiteNavigationElement`, `ItemList`, `FAQPage`, `Organization`) | S | `home/page.tsx` | — |
| **`title.template` + `Organization`/`WebSite`/`SearchAction` in root** (sitewide, do here — cheap) | S | `app/layout.tsx` | — |
| Fix `NEXT_PUBLIC_APP_URL` fallback → `kapyn.app` | S | `api/news/trigger/route.ts` | — |
| Surface orphaned `/radar/mcp` in both radar navs | S | `(radar)/_RadarNav.tsx`, `components/layout/BottomNav.tsx` | — |

*Dependencies: none external — this phase unblocks the brand for everything after. "Blog" nav tab points to `/explore` until Phase 2 ships `/blog`.*

### Phase 2 — Blog engine

*Goal: the owned content hub + the content↔product loop. Depends on the gold identity (Phase 1) for consistent `(web)` styling.*

| Task | Effort | Files / routes | Deps |
|---|---|---|---|
| Migration `0002_blog_posts.sql` (table + RLS + indexes) | S | `supabase/migrations/0002_blog_posts.sql` | — |
| `blog-prompt.ts` (synthesis + extended critique) + `blog.ts` (clustering, `isBadBlogPost`, slug, `topic_key` dedup, citation mapping) | L | `src/lib/blog-prompt.ts`, `src/lib/blog.ts` | corpus tables |
| `/api/blog/generate` + `/api/blog/generate-brief` crons (CRON_SECRET, service-role, budget 3, status=review) | M | `api/blog/generate/route.ts`, `generate-brief/route.ts`, `vercel.json` | prompt/lib |
| `/blog` index + `/blog/[slug]` (markdown renderer, TOC, citation chips, story/entity embeds, sources, related) | L | `(web)/blog/page.tsx`, `[slug]/page.tsx`, `blog.module.css` | renderer libs |
| `opengraph-image.tsx` + JSON-LD (`Article`/`NewsArticle`, `FAQPage`, `ItemList`, `BreadcrumbList`) + `generateMetadata` | M | `(web)/blog/[slug]/opengraph-image.tsx` | — |
| `/admin/blog` review/publish editor (human gate) | M | `(web)/admin/blog/page.tsx` | migration |
| Wire loop: sitemap + llms.txt + robots; nav from `(web)` header + phone app; related-reading chips on `/learn` + radar entities | M | `sitemap.ts`, `robots.ts`, `llms.txt/route.ts`, `(web)/layout.tsx`, `learn/[slug]/page.tsx` | routes live |

*Dependencies: durable corpus (`story_archive`/`entity_mentions`/`entities`) must be populated; repoint homepage "Blog" nav tab `/explore → /blog`.*

### Phase 3 — Programmatic SEO / AEO at scale

*Goal: own the head terms + definitional queries. **Gated by P0 SSR fix** — do that first within this phase.*

| Task | Effort | Files / routes | Deps |
|---|---|---|---|
| **P0: SSR list content** on `/radar`, `/radar/mcp`, `/radar/browse`, `/trending` | M | `(radar)/radar/{page,mcp/page,browse/page,McpMarketClient,RadarClient}.tsx`, `(app)/trending/page.tsx` | — |
| Build `/tools`, `/mcp`, `/skills` hubs + `[slug]` detail pages (40-word answer, facts, explainer, mentions, alternatives, schema) | L | new `(web)/{tools,mcp,skills}/{page,[slug]/page}.tsx` | SSR fix |
| Widen explainer generator to `model`/`tool`/`company` | S | `api/knowledge/generate/route.ts:76`, `lib/entities.ts:22` | hubs exist |
| `ItemList`/`SoftwareApplication`/`FAQPage`/`BreadcrumbList` JSON-LD across catalog + explainer + detail | M | per-page | hubs exist |
| Sitemap + `news-sitemap.xml` + robots AI-crawler rules + llms.txt expansion + `llms-full.txt` | M | `sitemap.ts`, new `news-sitemap.xml/route.ts`, `robots.ts`, `llms.txt/route.ts` | — |
| 40-word answer blocks + freshness signals + OG images + `noindex` thin/personal pages | M | per-page, `opengraph-image.tsx` | — |
| Fix `/story/[id]` for non-JS fetchers | M | `story/[id]/page.tsx` | — |
| 5-15 hand-curated `/best/[slug]` comparison pages | M | new `(web)/best/[slug]/page.tsx` | hubs |
| Bidirectional entity↔story↔concept internal links | M | `learn/[slug]`, `tools/[slug]`, `story/[id]` | hubs |

*Dependencies: SSR fix gates ranking; explainer-generator widening gates detail-page content.*

### Phase 4 — GTM systems

*Goal: turn the surfaces into compounding growth. Depends on Phases 1-3 having shipped the linkable, indexable, shareable surfaces.*

| Task | Effort | Files / routes | Deps |
|---|---|---|---|
| Fix cron frequency to every 2-4h (kill the stale-ritual habit-breaker) | S | `vercel.json` | — |
| Shareable Loadout OG cards (gold/Space Grotesk) | M | new `opengraph-image` for `/radar/toolkit` shares | Phase 1 brand |
| "Top 3 today" one-tap share card | M | new share route/component | feed data |
| Web Push by category/follow (opt-in, calm cadence) | L | new push infra (`PushNotification`), `push_subscriptions` table (exists) | follow model |
| Loadout "new since last visit" return-moment | M | `(radar)/radar/toolkit` | — |
| Email capture + calm digest | M | new capture + send (DPDP check for IN users) | — |
| PostHog: crawler-hit events, loop attribution, fix `"cron-job"` distinctId | S | `lib/posthog-server.ts`, crawler routes | — |
| Outreach CRM (Airtable/Notion) + 50-creator seed; directory listings; Show HN + PH launch | M | external | surfaces live |

*Dependencies: brand (P1), blog + content loop (P2), indexable/shareable surfaces (P3).*

---

## 8. The top 3 things to do FIRST

1. **Phase 1 — Homepage redesign + unify the brand to gold.** Rewrite `/home` around the Radar with real catalog data, retire all blue + Geist, ship the sticky gold top-nav. This is the named priority: it gives Kapyn one face and a linkable, on-brand home that every later phase points into. Fold in the two cheap sitewide wins while you're in `layout.tsx` (`title.template` + `Organization`/`WebSite`/`SearchAction` JSON-LD).

2. **SSR the radar/MCP/trending list content (Phase 3, P0).** Nothing in the SEO/AEO thesis works until crawlers and AI fetchers receive real tool names and descriptions in the HTML. This single fix is the gate on the entire growth strategy — start it in parallel with the homepage since it touches different files.

3. **Stand up the blog engine spine (Phase 2): migration `0002_blog_posts.sql` + `blog.ts`/`blog-prompt.ts` + `/api/blog/generate` with the human-review gate.** This turns the existing durable corpus into the compounding content↔product loop — the core growth engine — and gives the homepage's "Blog" nav tab a real destination instead of the `/explore` alias.

*Deliberately NOT first: the YouTube auto-comment bot (declined — it poisons the SEO/AEO channel that is the whole thesis; replace with templated-but-personal CRM outreach).*


<!-- ===== DETAILED SPECIALIST OUTPUTS (appendices) ===== -->


---

# Appendix — Positioning (full)

I have everything I need. The product reality and landing audit are comprehensive. Here is the positioning.

---

# Kapyn — New Positioning

## 1. One-line positioning statement

**Kapyn is where you discover, understand, and track the AI worth using — agents, models, tools, MCP servers, and skills — kept current by a calm daily signal, never behind a paywall.**

(Internal short form: *the calm map of the AI that matters.*)

---

## 2. Tagline options

1. **"Find the AI worth using."** — sharpest, search-intent-shaped, verb-first. Recommended primary.
2. **"The calm map of AI."** — owns the category word (map) and the brand constant (calm) in four words.
3. **"Discover, track, build."** — the three jobs in order; pairs with the Radar's Discover · Protect · Decide thesis.

Keep the old line alive as a sub-claim, not the headline: *"Every story that matters, distilled to 30 seconds. No paywall, ever."*

---

## 3. Core value props (4)

1. **A curated map, not a search box.** ~130 hand-picked tools/models, ~45 MCP servers, ~30 AI skills, the open-source canon, and live trending — filed, not scraped. This is the answer to the "just ask an AI" objection: Kapyn surfaces *the thing you didn't know to ask for*, with a point of view. Chat answers questions; Kapyn shows you the field.

2. **Current by default.** The news feed is the live signal that keeps the map honest — new launches, better-ways, deprecations. You're not reading a listicle from last year; the Radar moves when the field moves (GitHub last-48h, Product Hunt launches, traction ranking).

3. **Your toolkit, not just ours.** Save any agent, model, MCP server, or skill into a personal **Loadout** — named collections (a RAG stack, a hackathon kit) that file themselves by category. The map becomes *your* map. This is the retention moat: "what's new in my world."

4. **Calm, source-grounded, free forever.** No hype, no exclamation marks, no fear-selling, no paywall, no signup wall. Every claim links to its source; every concept links to an evergreen explainer. Trust is the product.

*(Optional 5th, once Protect ships: **It tells you when your stack breaks.** Deprecation and risk alerts for what you build with — the layer no AI-news app has.)*

---

## 4. Target segments + jobs

**Primary — The Builder** (engineer, vibe coder, PM, founder building *with* AI; r/vibecoding-scale demand, India explicitly courted).
- **Hires Kapyn to:** *"Find the best AI tool/agent/MCP for what I'm building right now — and trust it's current — without wading through Twitter threads and SEO sludge."*
- The Radar Builder lens, Loadouts, and MCP/skills catalog are built for this person. Highest pain, sharpest wedge.

**Secondary A — The Creator** (video/voice/image/marketing-content maker with AI).
- **Hires Kapyn to:** *"Show me the AI tools that make what I make — and keep me on the new ones as they drop."*

**Secondary B — The Curious / Operator** (founder, operator, student staying broadly current).
- **Hires Kapyn to:** *"Keep me fluent enough to decide and to talk about AI credibly — in 30 seconds a day, not 30 tabs."*
- Highest lifetime value (the learner path via Knowledge Base); served by the feed + explainers as top-of-funnel.

The feed acquires all three; the Radar + Loadout convert and retain the Builder first.

---

## 5. Category to own

**"AI ecosystem intelligence"** — externally phrased as **"where you discover and track the AI that matters."**

Kapyn is not a news app and not a tool directory — it's the **map + the live signal that keeps the map current + your personal collection on top of it.** Directories go stale; news scrolls away; chat has no memory of the field. Kapyn is the one place that is *curated, current, and yours.*

Own the word **map** (or **radar**) and the phrase **the AI that matters**. Avoid "directory" (commodity, SEO-spam connotation) and "news app" (under-describes by ~60%, and Inshorts/Artifact died there).

---

## 6. SEO / AEO intent map — the searches we must own

The strategic prize: be the **cited source answer engines reach for** when someone asks "what's the best AI agent for X." That requires owning structured, current, head-and-long-tail intent. Three tiers:

**Tier 1 — High-volume head terms (the Browse/Essentials catalog pages must rank here):**
- `best AI agents` / `best AI coding agents` / `best AI agent frameworks`
- `best MCP servers` / `MCP servers list`
- `best AI tools for [developers / RAG / video / voice / design]`
- `open source AI tools` / `best open source LLM tools`

**Tier 2 — Definitional / AEO ("answer engine") questions (the Knowledge Base / explainer pages own these — the format LLMs cite verbatim):**
- `what is MCP` / `what is the Model Context Protocol` / `MCP vs function calling`
- `what are AI skills` / `what is a Claude Skill` / `custom GPT vs Gemini Gem`
- `what is an AI agent` / `agent vs workflow`
- `what does [tool/model] do` — one grounded explainer per entity

**Tier 3 — Job-shaped long-tail (Loadout-/lens-aligned, highest conversion intent):**
- `AI skills for [writing / research / marketing / data]`
- `best AI stack for [building an agent / RAG app / a hackathon]`
- `[tool] alternatives` / `[tool A] vs [tool B]`
- `AI hackathons [2026 / India / online / with prizes]` — the Hackathons surface owns this with near-zero competition.

**AEO requirements to actually win citation** (currently missing per the landing audit — gaps #8, structured data):
- JSON-LD on every catalog and explainer page (`ItemList`, `SoftwareApplication`, `FAQPage`, `DefinedTerm`).
- Self-contained, extractable answer blocks ("MCP is …" in the first 40 words).
- Freshness signals surfaced (last-updated, "new this week") — answer engines privilege current sources.
- Each Loadout/lens becomes a templated landing page; each explainer a canonical definition.

This is the commercial heart of the new positioning: **discovery via search + citation by answer engines** is how a no-paywall product grows without spend.

---

## 7. Keep vs. Evolve

**KEEP (hard constants — these survive the repositioning):**
- **Calm, no-hype voice.** No emojis, no exclamation marks, present tense, source-grounded. "Calm is the product, not a skin." This is the differentiator *against* the hype-driven AI-tool-directory space — lean into it harder.
- **No paywall, ever. No signup wall.** Monetize via audience/brand, never fear. Keep "Always free, always open."
- **Source-grounded trust.** Every claim links out; every concept has an explainer.
- **Builder-first.** The sharpest ICP stays the center of gravity.
- **30-second feed** — but **demoted from headline to top-of-funnel.** It's the live signal, not the whole product.

**EVOLVE:**
- **Headline:** from *"AI news in 30 seconds"* → *"Discover, track, and collect the AI worth using."* The mission line must name the Radar. Lead with discovery; let news support it.
- **Mission rewrite:** from *"the calm intelligence layer for AI / every story that matters, distilled to 30 seconds"* → *"the calm map of the AI that matters — discover the agents, models, and tools worth using, and stay current as the field moves."*
- **Brand identity:** unify on the **Radar system as the master brand** — gold `#D9B27C`, Space Grotesk, warm near-black `#0c0b0a`. **Retire the landing's blue + Geist neutral-grayscale** (audit gaps #1, #7). One product, one face. The gold/Space Grotesk system is the newer, more owned identity and should be the canonical surface.
- **Landing page:** rebuild around the Radar, not the feed. Replace the fake "Why it matters / GPT-5" demo (audit gap #2) with a real slice of the live catalog — *"130 tools, 45 MCP servers, 30 skills, kept current."* Add the SEO/AEO scaffolding the page entirely lacks (gap #8): per-page metadata, JSON-LD, canonical, internal links into `/radar/browse`, `/radar/mcp`, `/radar/hackathons`, and explainer pages.
- **Metadata:** from `"Kapyn — What happened in AI today"` → `"Kapyn — Discover the AI worth using: agents, models, tools, MCP servers & skills."`
- **Retention bet:** from streak/swipe-sessions → **Follow + Loadout** ("what's new in my world"). Make the Loadout the thing you come back for.

---

**The move in one sentence:** keep the calm, free, trustworthy, builder-first soul exactly as-is — and elevate **Radar (discover + collect AI agents, tools, MCP servers, and skills)** from a hidden second product to *the* headline, with the 30-second feed reframed as the live signal that keeps the map current and search/answer-engines as the primary growth channel.


---

# Appendix — Homepage design (full)

I have everything I need. Here is the complete redesign spec.

---

# KAPYN /home — COMPLETE DESKTOP HOMEPAGE REDESIGN

**Build target:** `src/app/home/page.tsx` + `src/app/home/landing.module.css` (rewrite both). Swap `Geist` font import for the existing Space Grotesk var (`--font-space-grotesk` from root). Tokens reused verbatim from `radar-shared.tsx`: `GOLD #D9B27C`, `CANVAS #0c0b0a`, `SURFACE #1b1a17`, `SURFACE_RAISED #24221d`, `HAIRLINE rgba(255,255,255,0.09)`, text ramp `#f6f4f0 / #cbc7bf / #a29d94`.

---

## (1) FULL DESKTOP WIREFRAME (top → bottom)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ░ STICKY TOP NAV (h64, blur, hairline-bottom, CANVAS/85)                                │
│ ┌────────────────────────────────────────────────────────────────────────────────┐    │
│ │ kapyn          Feed   Radar   Tools & Agents   Skills   MCP   Hackathons   Blog  │    │
│ │ (Space Grotesk)  ───── tab links (gold underline on active/hover) ─────  [Open ↗]│    │
│ └────────────────────────────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ HERO — full-bleed, 2 columns (7fr copy / 5fr live catalog wall)                      │
│ ┌─────────────────────────────────────────────┐ ┌──────────────────────────────────┐ │
│ │ ● the calm map of AI · updated 6m ago        │ │  LIVE RADAR WALL (real data)     │ │
│ │                                              │ │ ┌────┐┌────┐┌────┐┌────┐         │ │
│ │  Find the AI                                 │ │ │tool││tool││ mcp ││skil│  …     │ │
│ │  worth using.                                │ │ └────┘└────┘└────┘└────┘         │ │
│ │  (72px Space Grotesk, "worth using" in gold) │ │ ┌────┐┌────┐┌────┐┌────┐         │ │
│ │                                              │ │ │ a/g││tool││ os ││ mcp │  …     │ │
│ │  Agents, models, tools, MCP servers and      │ │ └────┘└────┘└────┘└────┘         │ │
│ │  skills — curated, current, and kept honest  │ │   (auto-scroll marquee, 2 rows,  │ │
│ │  by a calm daily signal. No paywall, ever.   │ │    real favicons via /api/favicon)│ │
│ │                                              │ │ ─────────────────────────────── │ │
│ │  [ Open the Radar → ]   [ Today's feed ]     │ │ 132 tools · 45 MCP · 31 skills   │ │
│ │   (gold solid)          (ghost, gold border) │ │ kept current · last 48h          │ │
│ └─────────────────────────────────────────────┘ └──────────────────────────────────┘ │
│  ░ STAT STRIP (4 live counters, hairline-top/bottom, full width)                       │
│   132 curated tools  ·  45 MCP servers  ·  31 AI skills  ·  ~40 stories / 48h          │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ THE MAP — "Everything in one place" · 6-card ecosystem grid (3×2), fills canvas      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                                                 │
│ │ AGENTS & │ │  MODELS  │ │   MCP    │   each card: icon · title · 1-line · live count │
│ │  TOOLS   │ │ & CHAT   │ │ SERVERS  │   · 3 sample chips · "Browse →" → real route    │
│ └──────────┘ └──────────┘ └──────────┘                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                                                 │
│ │  SKILLS  │ │  OPEN    │ │HACKATHONS│                                                 │
│ │          │ │  SOURCE  │ │          │                                                 │
│ └──────────┘ └──────────┘ └──────────┘                                                 │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ MOVING NOW — "What changed this week" · live trending strip (the curiosity loop)     │
│ ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│ │ TRENDING ON GITHUB (48h)        │  NEW ON THE RADAR        │  TOP STORIES TODAY     │  │
│ │ 1. repo  ↑ stars                │  • tool — launched       │  • dispatch headline   │  │
│ │ 2. repo  ↑ stars                │  • mcp  — new            │  • dispatch headline   │  │
│ │ 3. repo  ↑ stars                │  • skill— added          │  • dispatch headline   │  │
│ │ See all on the Radar →          │  See Browse →            │  See the feed →        │  │
│ └──────────────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ THE THREE JOBS — "Discover · Track · Build" (3 columns, the value props as verbs)    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                     │
│ │  DISCOVER    │ │   TRACK      │ │   BUILD      │  icon · headline · 2-line body ·    │
│ │ a curated    │ │ current by   │ │ your toolkit │  one internal link each            │
│ │ map, not a   │ │ default      │ │ not just     │                                     │
│ │ search box   │ │              │ │ ours         │                                     │
│ └──────────────┘ └──────────────┘ └──────────────┘                                     │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ LOADOUT SHOWCASE — split: copy left, faux-loadout visual right (the retention hook)  │
│ ┌─────────────────────────────────┐ ┌──────────────────────────────────────────────┐  │
│ │ Make the map your map.          │ │  ▢ My RAG stack          ▢ Hackathon kit     │  │
│ │ Save any agent, model, MCP or   │ │  ┌──┐ tool   ┌──┐ tool   (named collections, │  │
│ │ skill into a named Loadout…     │ │  ┌──┐ mcp    ┌──┐ skill   auto-filed)          │  │
│ │ [ Start your Loadout → ]        │ │  ┌──┐ model                                    │  │
│ └─────────────────────────────────┘ └──────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ LEARN / AEO — "Understand it, not just find it" · explainer grid (3×2) → /learn/*    │
│ ┌────────┐┌────────┐┌────────┐  What is MCP? · What is an AI agent? · Agent vs        │
│ ┌────────┐┌────────┐┌────────┐  workflow · What are AI skills? · MCP vs function      │
│   each → /learn/[slug] · question-shaped title · 1-line answer · "Read →"              │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▓ CATEGORIES — 9-chip topical link row → /categories/[slug] (crawl depth)              │
│  AI/Models · Dev Tools · Open Source · Startups · Research · Funding · Big Tech · …     │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ TRUST BAND — calm manifesto strip (no-paywall promise), centered, gold hairline      │
│   "Calm, source-grounded, free forever. No hype. No paywall. No signup wall."          │
│   [ Open Kapyn → ]                                                                      │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ▒ MOBILE / GET-THE-APP — QR + "best on mobile" (demoted from hero to here)             │
│  ┌─────┐  Take the map with you. Scan to open Kapyn on your phone. kapyn.app           │
│  │ QR  │                                                                                │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ░ FOOTER — 4-column sitemap (Discover / Learn / Company / Stay current) + wordmark     │
│  kapyn   | Radar  Browse  | Explore  Blog | About  llms.txt | RSS  Newsletter           │
│  the calm map of AI · © 2026 · Always free, always open                                │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

Page max-width: **1200px** content column, centered, with hero and trust band full-bleed background. No empty void — every band fills the horizontal canvas and stacks vertically into a long, crawlable document.

---

## (2) SECTION-BY-SECTION SPEC

### Section 0 — Top Nav (full spec in §3)

---

### Section 1 — HERO
- **Purpose:** State the new positioning in one breath; prove it instantly with *real* catalog data (kills audit gap #2 — the fake GPT-5 demo). Two primary actions: discover (Radar) vs. the live signal (Feed).
- **Content:** Eyebrow with live gold dot + relative timestamp ("updated 6m ago", computed from the freshest `news_items.created_at`). H1. Sub-paragraph. Two CTAs. Right column = **live Radar wall**: a 2-row auto-scrolling marquee of ~16 real catalog items (mix of tools, MCP, skills, OSS) each as a small card with real favicon (`/api/favicon`) + name + type tag; logo-less items render no mark (per design rule). Footer line under the wall = live counts.
- **Copy (calm voice):**
  - Eyebrow: `the calm map of AI · updated 6m ago`
  - H1: `Find the AI` / `worth using.` ("worth using" in gold `#D9B27C`)
  - Sub: `Agents, models, tools, MCP servers, and skills — curated, current, and kept honest by a calm daily signal. No paywall, ever.`
  - CTA primary: `Open the Radar →` → `/radar`
  - CTA ghost: `Today's feed` → `/`
  - Wall footer: `132 tools · 45 MCP servers · 31 skills · kept current, last 48h`
- **Links:** `/radar` (primary), `/` (feed). Wall cards deep-link to `/radar/browse` (or their detail). 
- **SEO value:** H1 carries the head term "AI worth using" + names all five entity types (agents/models/tools/MCP/skills) — direct match to Tier-1 intent. Real anchor text into `/radar`. Live timestamp = freshness signal answer engines privilege.

### Section 2 — STAT STRIP
- **Purpose:** Immediate scale + freshness proof; replaces vague "9 categories" with concrete, live numbers.
- **Content:** 4 inline counters, hairline top/bottom, mono-feel via Space Grotesk tabular.
- **Copy:** `132 curated tools` · `45 MCP servers` · `31 AI skills` · `~40 stories in the last 48h`
- **Links:** none (or each counter links to its surface — optional).
- **SEO value:** Numeric, extractable facts ("Kapyn lists 132 curated AI tools…") — the kind of self-contained statement answer engines lift verbatim. Counts pulled live from `CURATED_ESSENTIALS.length`, `MCP_SERVERS.length`, `AI_SKILLS.length`, and a `news_items` 48h count.

### Section 3 — THE MAP (6-card ecosystem grid)
- **Purpose:** Showcase the *full ecosystem*, not the feed — the core "showcase, not thin hero" requirement. Each card is a doorway to a real surface.
- **Content:** 6 cards (3×2). Each: Lucide icon, title, one calm line, live count, 3 sample entity chips (real names from the catalogs), `Browse →` link.
- **Copy + links:**
  | Card | Line | Sample chips | → |
  |---|---|---|---|
  | **Agents & Tools** | `The agents and tools worth building with.` | LangGraph · Cursor · n8n | `/radar/browse` |
  | **Models & Chat** | `Every model that matters, filed not scraped.` | Claude · Gemini · Llama | `/radar/browse` |
  | **MCP Servers** | `The connector layer for agents.` | Filesystem · Postgres · Playwright | `/radar/mcp` |
  | **AI Skills** | `Claude Skills, custom GPTs, Gemini Gems.` | Writing · Research · Data | `/radar/mcp` |
  | **Open Source** | `The canon — most-starred, kept current.` | (live OSS names) | `/radar/browse` |
  | **Hackathons** | `Where to go build, with prizes.` | Gemini XPRIZE · Smart India | `/radar/hackathons` |
- **SEO value:** Six richly-anchored internal links covering Tier-1 head terms ("best AI agents", "best MCP servers", "open source AI tools") with descriptive anchor text. This is the internal-linking spine the audit flagged as missing (gap, no internal links today).

### Section 4 — MOVING NOW (live trending strip)
- **Purpose:** Curiosity loop + freshness. Proves "current by default" with live data; gives a reason to return.
- **Content:** 3 columns of live lists. (a) Trending on GitHub 48h (from `radar_tools`/GitHub query), (b) New on the Radar (created <48h + PH launches), (c) Top stories today (from `fetchNewsItems` / trending rank).
- **Copy:**
  - Kicker: `MOVING NOW` / Title: `What changed this week`
  - Column heads: `Trending on GitHub` · `New on the Radar` · `Top stories today`
  - Footers: `See all on the Radar →` `/radar` · `See Browse →` `/radar/browse` · `See the feed →` `/`
- **SEO value:** Page content changes on every crawl → high crawl-frequency signal. Real, current entity names = fresh indexable text. Internal links to `/radar`, `/radar/browse`, `/`.

### Section 5 — THE THREE JOBS (Discover · Track · Build)
- **Purpose:** The 4 value props compressed into the 3 verbs (Discover · Track · Build), answering the "just ask an AI" objection in-copy.
- **Content:** 3 equal columns, icon + headline + 2 lines + one link.
- **Copy:**
  - **Discover** — `A curated map, not a search box.` / `~130 hand-picked tools, 45 MCP servers, 31 skills — filed, not scraped. Kapyn surfaces the thing you didn't know to ask for.` → `/radar`
  - **Track** — `Current by default.` / `New launches, better ways, deprecations. The Radar moves when the field moves — GitHub last-48h, Product Hunt, traction ranking.` → `/radar/browse`
  - **Build** — `Your toolkit, not just ours.` / `Save any agent, model, or MCP into a named Loadout. The map becomes your map.` → `/radar/toolkit`
- **SEO value:** Long-form, keyword-dense prose blocks (extractable answer text). Anchors into three radar surfaces.

### Section 6 — LOADOUT SHOWCASE
- **Purpose:** The retention hook ("what's new in my world"). Make the Loadout the thing you come back for.
- **Content:** Split. Left: copy + CTA. Right: faux-loadout visual — two named collection tabs ("My RAG stack", "Hackathon kit") with stacked tool rows (real favicons, auto-filed by category).
- **Copy:**
  - Title: `Make the map your map.`
  - Body: `Save any agent, model, MCP server, or skill into a named Loadout — a RAG stack, a hackathon kit — and it files itself by category. Come back for what's new in your world.`
  - CTA: `Start your Loadout →` → `/radar/toolkit`
- **SEO value:** Lower (personal/localStorage feature) — primarily conversion + habit framing. Still adds indexable feature description and a `/radar/toolkit` link.

### Section 7 — LEARN / AEO (explainer grid)
- **Purpose:** Own Tier-2 definitional/AEO intent — the format LLMs cite verbatim. Top-of-funnel for the Curious segment.
- **Content:** 6 cards (3×2), each a real `/learn/[slug]` explainer. Question-shaped title + first-40-words answer + `Read →`.
- **Copy (answer-first):**
  - `What is MCP?` — `The Model Context Protocol is an open standard that lets AI models call external tools and data through a common interface.` → `/learn/model-context-protocol`
  - `What is an AI agent?` — `An AI agent is a model that plans and takes actions in a loop — calling tools, observing results, and deciding the next step.` → `/learn/ai-agent`
  - `Agent vs workflow?` · `What are AI skills?` · `MCP vs function calling?` · `RAG, explained`
  - Section CTA: `Explore the glossary →` → `/explore`
- **SEO value:** Highest AEO value on the page. Question-shaped H3s + self-contained answer blocks in the first 40 words = exactly what answer engines extract. Links fan into `/learn/*` + `/explore`. JSON-LD `FAQPage` should wrap this block.

### Section 8 — CATEGORIES (9-chip link row)
- **Purpose:** Topical crawl depth into the 9 `/categories/[slug]` SEO pages.
- **Content:** 9 chips, each → its category page.
- **Copy:** `AI / Models` · `Dev Tools` · `Open Source` · `Startups` · `Research` · `Funding & M&A` · `Big Tech` · `Infrastructure` · `Policy & Regulation`
- **Links:** `/categories/ai-models` … `/categories/policy` (from `CATEGORIES`).
- **SEO value:** 9 descriptive internal links — best single block for crawl coverage breadth.

### Section 9 — TRUST BAND
- **Purpose:** The hard brand constant — calm, free, source-grounded. The differentiator against the hype-driven directory space.
- **Content:** Centered manifesto line, gold hairline framing, one CTA.
- **Copy:** `Calm, source-grounded, free forever.` / `No hype. No paywall. No signup wall. Every claim links to its source; every concept to an explainer.` / CTA `Open Kapyn →` → `/`
- **SEO value:** Reinforces "free / no paywall" — distinguishing brand text; low link value, high trust signal.

### Section 10 — GET THE APP (QR, demoted)
- **Purpose:** Keep the PWA/mobile path without letting it dominate the hero (audit: QR was hero-level, over-weighted).
- **Content:** QR (`QRCodeBlock`, env-driven `NEXT_PUBLIC_APP_URL`), short copy.
- **Copy:** `Take the map with you.` / `Scan to open Kapyn on your phone. Best experienced on mobile.` / `kapyn.app`
- **SEO value:** Low; UX completeness.

### Section 11 — FOOTER (sitemap)
- **Purpose:** Crawlable site map + brand close.
- **Content:** 4 link columns + wordmark + tagline.
  - **Discover:** Radar · Browse · Tools & Agents · MCP Servers · Skills · Hackathons
  - **Learn:** Explore (glossary) · What is MCP · What is an AI agent · Blog
  - **Stay current:** Today's feed · Trending · Categories · RSS (`/feed.xml`)
  - **Kapyn:** About · llms.txt (`/llms.txt`) · OKF (`/okf`)
- **Copy:** `kapyn` / `the calm map of AI` / `Always free, always open · © 2026`
- **SEO value:** Sitewide internal-link hub on the most-linked page; surfaces orphaned routes (`/radar/mcp`, `/feed.xml`, `/llms.txt`, `/okf`).

---

## (3) TOP-NAV SPEC

**Tabs (left→right), with destinations:**

| Tab | Destination | Rationale |
|---|---|---|
| `kapyn` (wordmark) | `/home` | Space Grotesk, gold on hover. |
| **Feed** | `/` | The live signal / 30-sec dispatches. |
| **Radar** | `/radar` | Flagship discovery surface. |
| **Tools & Agents** | `/radar/browse` | Tier-1 head term anchor. |
| **Skills** | `/radar/mcp` (Skills toggle) | De-orphans skills; Tier-2/3 intent. |
| **MCP** | `/radar/mcp` | De-orphans MCP; Tier-1 "best MCP servers". |
| **Hackathons** | `/radar/hackathons` | Near-zero-competition Tier-3 term. |
| **Blog** | `/explore` (until a dedicated `/blog` exists; alias acceptable) | Editorial/glossary hub; high internal-link fan-out. |
| **[ Open ↗ ]** | `/` | Trailing gold pill CTA. |

> Note for build: "Blog" currently maps to `/explore` (the glossary/editorial hub) since no `/blog` route exists yet — flag to founder; trivially repointed when `/blog` ships. "Skills" and "MCP" both resolve to `/radar/mcp`; pass a hash/query (`?tab=skills`) so the page opens the right toggle.

**Behavior:**
- **Sticky:** `position: sticky; top: 0; z-index: 50`. Background `rgba(12,11,10,0.85)` + `backdrop-filter: blur(12px)`, hairline bottom. (`sticky`, not `fixed` — this is a full-page scroll surface, outside the phone-column rule, so `fixed`-on-phone convention doesn't apply.)
- **Active/hover state:** 2px gold underline (`#D9B27C`) animating in under the active tab; text shifts `#a29d94 → #f6f4f0`. Active determined by `usePathname()` (component is `"use client"`).
- **Scroll:** nav stays; subtle shadow appears after ~24px scroll (optional `scrolled` state).

**Mobile collapse (<720px):**
- Wordmark + `[ Open ]` pill remain inline; tab list collapses into a **hamburger** → slide-down sheet (full-width, CANVAS, hairline rows) listing all 7 tabs vertically, gold left-border on the row matching current path. Sheet closes on link tap / outside tap / Esc. Implemented as a sibling `<nav>` panel toggled by state; `position: absolute` under the bar (this is the standalone `/home` doc, not the phone column).

---

## (4) ON-BRAND ENFORCEMENT (gold · calm · Space Grotesk)

- **Color:** Retire all blue. Single accent = gold `#D9B27C` used *only* for wayfinding — active nav underline, H1 accent word, CTA fills, live dots, section kickers, hairline framing on hero/trust bands. Category chips may use the 9 per-category hues for marks only (matching `accentFor`), never gold-as-data. Canvas `#0c0b0a`, surfaces `#1b1a17` / `#24221d`, hairlines `rgba(255,255,255,0.09)` — identical tokens to Radar so landing and product read as one face (fixes audit gap #1 / #7, two design languages).
- **Type:** Space Grotesk for wordmark, H1/H2, kickers, nav, all titles (drop Geist entirely). Body = SF Pro/system. Code/counters can lean on Space Grotesk tabular. Big headings get negative tracking (`-0.02em`) per the KB reading craft; weight contrast (400 body → 700/800 display).
- **Voice:** Present tense, no exclamation marks, no emojis in content, source-grounded. Every CTA is a calm verb ("Open the Radar", "Read", "Browse"), never "Get started free!!". "No paywall, ever." stays as the trust constant. Headlines state facts, not hype ("What changed this week", not "🔥 Trending now").
- **Motion:** Reuse Radar feel — spring/ease, `prefers-reduced-motion` kill-switch (keep the existing one). Hero marquee auto-scrolls slowly; pauses on hover. Restraint: one accent per context.

---

## (5) REAL / DYNAMIC CONTENT TO SURFACE (fresh + crawlable)

Make `/home` a **server component** (it currently is, but static) and fetch at request/ISR time (`export const revalidate = 1800`):

| Section | Live source | Function/file |
|---|---|---|
| Hero timestamp + stat strip "stories/48h" | `news_items` 48h | `fetchNewsItems()` / count query in `lib/supabase.ts` |
| Hero marquee wall | mix of essentials + MCP + skills + trending | `CURATED_ESSENTIALS` (`radar-essentials.ts`), `MCP_SERVERS` (`radar-mcp.ts`), `AI_SKILLS` (`radar-skills.ts`), `getRadarTools()` |
| Stat strip counts | `.length` of the three catalogs (live, accurate) | same files |
| Moving Now · Trending GitHub | `radar_tools` / GitHub 48h | `getRadarTools()` / `api/radar/tools` |
| Moving Now · New on Radar | created <48h + PH launches | `getRadarTools()` filtered |
| Moving Now · Top stories | trending rank | `fetchNewsItems()` / trending query |
| Loadout showcase chips | static curated sample (real names) | `radar-essentials.ts` |
| Learn grid | seed explainers | `/learn/[slug]` seed slugs, `knowledge.ts` |
| Categories row | `CATEGORIES` | `lib/categories.ts` |
| QR | `NEXT_PUBLIC_APP_URL` (fix hardcoded domain) | `QRCodeBlock` |

**SEO/AEO scaffolding to add (closes audit gap #8):**
- `export const metadata`: title `Kapyn — Discover the AI worth using: agents, models, tools, MCP servers & skills`, matching description, `alternates.canonical`, per-page OG image.
- **JSON-LD** (`<script type="application/ld+json">`): `WebSite` + `SiteNavigationElement` (the 7 nav tabs), `ItemList` for the hero catalog wall + stat counts, `FAQPage` wrapping the Learn section's question/answer pairs, `Organization` for Kapyn.
- `rel="noopener noreferrer"` on any `target="_blank"`; internal links use plain `next/link` (no `_blank`) so crawl equity flows.

---

## (6) MOBILE FALLBACK (brief)

Single-column stack, full-width bands, 16–20px gutters. Top nav → wordmark + `[Open]` + hamburger sheet (§3). Hero: copy first, H1 ~40px, CTAs full-width stacked; the marquee wall becomes a single auto-scroll row (or static 4-item grid) below the copy. Stat strip wraps to 2×2. The Map grid → 1 column (or 2-up). Moving Now → vertical accordion / stacked columns. Three Jobs → stacked. Loadout visual → below copy. Learn grid → 1-up. Categories → horizontal scroll chip rail (reuse Radar chip pattern). QR section retains its "best on mobile" line. Everything stays `position: absolute/static` (no `fixed`), `100dvh` not assumed (this is a scrolling document, not the phone frame).

---

**Build note:** rewrite `landing.module.css` against the Radar tokens (delete blue oklch vars, dead `.btnGhost` becomes the real ghost CTA), swap the `Geist` import in `page.tsx` for the root `--font-space-grotesk`, convert the page to an async server component with the fetches above, and add the metadata + JSON-LD exports. Relevant files: `/home/rahul/projects/ai-changelog/src/app/home/page.tsx`, `/home/rahul/projects/ai-changelog/src/app/home/landing.module.css`, `/home/rahul/projects/ai-changelog/src/components/landing/QRCodeBlock.tsx`, tokens from `/home/rahul/projects/ai-changelog/src/app/(radar)/radar/radar-shared.tsx`, data from `/home/rahul/projects/ai-changelog/src/lib/radar-essentials.ts`, `radar-mcp.ts`, `radar-skills.ts`, `supabase.ts`, `categories.ts`, and `getRadarTools` in the radar lib.


---

# Appendix — Blog / content engine (full)

I have the exact schema, RLS pattern, and prompt/critique machinery. I have everything needed to make this concrete and buildable. Here is the complete design.

---

# Kapyn Blog / Content Engine — Build Spec

The unit of content today is a *per-entity glossary explainer*. The blog introduces a second, complementary unit: a **synthesized article** about an event, theme, or trend that spans multiple stories and entities — dated, long-form, markdown-bodied, source-cited. It reuses the durable corpus (`story_archive` + `entity_mentions` + `entities`), the quality machinery (self-critique + publish/hold gate), and the editorial design language already proven on `/learn`. It revives the dead `digests` table's *intent* but supersedes it with a richer `blog_posts` table.

---

## 1. Content strategy — article types

Five types, each mapped to a corpus query, an SEO/AEO intent tier (from the positioning intent map), and a retention role. All share one voice: calm, smart, present tense, no hype, no exclamation marks, source-grounded, author = Kapyn.

| # | Type | What it is | Corpus query | SEO/AEO intent | Retention role |
|---|---|---|---|---|---|
| 1 | **The Brief** (weekly roundup) | "What moved in [AI agents / open source / funding] this week" — 5-9 clustered stories under one thesis sentence, with a "why it matters" close. One per active category-cluster per week. | Stories from `story_archive` in the last 7d, grouped by `category_slug` + shared `entity_mentions`. | Tier-3 long-tail freshness ("AI agents news this week", "what happened in AI [June 2026]"). AEO loves dated, current digests. | The recurring habit. "What's new in my world" → ties to Loadout follows. |
| 2 | **Deep-dive / synthesis** | N stories → one thesis. "Why every model lab shipped an agent framework this quarter." Takes a cluster of 6-15 related archived stories and argues a single original point of view, grounded in every story. | A trend cluster: entities co-mentioned across many stories over 2-6 weeks. | Tier-2/3 thought-leadership; the pieces answer engines cite for "why is X happening". Highest backlink magnet. | Depth signal → credibility → return visits + shares. |
| 3 | **Tool / skill roundup** | "The 8 MCP servers worth knowing in June 2026", "Best AI coding agents right now". An `ItemList`-shaped article built from radar entities + their explainers + recent mentions. | `entities` of type `tool`/`model`/`company` ranked by `mention_count` + recent `last_mentioned_at`, filtered by a lens/category. | **Tier-1 head terms** — the commercial prize ("best AI agents", "best MCP servers", "best AI tools for X"). | Direct funnel into `/radar` + Toolkit. Each item links to its radar entity → Save → Loadout. |
| 4 | **"What is X" explainer (long-form)** | The *upgraded* version of today's `/learn` page — but for the interesting subjects (models/tools/companies/events), with a markdown body, sections, and a FAQ. Distinct from the thin glossary entry; this is the canonical definition. | One entity + its full `entity_mentions` history + `entity_explainers` row as a seed. | **Tier-2 AEO** ("what is MCP", "what is an AI agent", "what does [tool] do") — verbatim-extractable answers. | Top-of-funnel from search → into the field map. |
| 5 | **Trend / timeline analysis** | "The 18-month arc of context windows" — a dated narrative built from the entity's mention timeline. Velocity, inflection points, what changed. (Aligns with the Pulse roadmap item — same entity-signal substrate.) | `entity_mentions.created_at` timeline for a hot entity, bucketed by week. | Tier-2/3 evergreen ("history of X", "[entity] timeline"). | Showcases Kapyn's unique longitudinal data — the thing chat and directories cannot do. |

**Why each drives SEO/AEO + retention:**
- Types 1 & 5 are **freshness engines** — dated, current, the signal answer engines privilege for "latest" queries and that bring readers back weekly.
- Type 3 is the **commercial SEO play** — it owns the Tier-1 head terms the positioning identifies as the growth heart, and it's the cleanest loop into Radar/Toolkit.
- Types 2 & 4 are **authority/AEO** — self-contained extractable answers + thesis pieces that earn citations and links, which lift the whole domain.

**Editorial voice (enforced in every prompt + gate):** calm, minimal, intelligent; present tense, active voice; first sentence states the core fact in 10-15 words; no emojis, no exclamation marks, no marketing adjectives ("revolutionary", "game-changing", "powerful"); every non-obvious claim traces to a cited source; thesis stated, never hyped. This is the existing summary voice, extended to long form.

---

## 2. Generation pipeline

A new cron (`/api/blog/generate`, suggested `0 4 * * *` daily, after the 03:00 explainer cron so entities/explainers are fresh) plus a weekly tick for The Brief (`0 5 * * 1`, Mondays). Reuses `story_archive`, `entity_mentions`, `entities`, `entity_explainers`, and the Gemini 2.5 Flash Lite + critique pattern verbatim.

### Stage A — Clustering & topic selection

The blog's hard problem is *picking what to write*, not writing it. Do it deterministically in-code (mirroring the `entities.ts` "never trust the LLM for slugs" discipline), then let the LLM only write prose over a fixed cluster.

1. **Pull the candidate window** — for The Brief: `story_archive` last 7d; for deep-dives/trends: last 14-42d.
2. **Build co-mention clusters** — group stories by shared entities via `entity_mentions`. A cluster = a set of stories sharing ≥1 entity with `mention_count` above a floor, plus the same/adjacent `category_slug`. Score each cluster:
   `cluster_score = (#distinct stories) × (sum of entity mention_count) × recency_weight`.
3. **Topic-type routing:**
   - Cluster with ≥5 stories, single category, last 7d → **The Brief**.
   - Cluster with ≥6 stories spanning ≥2 weeks, multiple labs/tools → **Deep-dive**.
   - A category/lens with ≥6 ranked `tool`/`model` entities → **Tool roundup**.
   - A single entity whose weekly mention timeline shows a spike or sustained climb → **Trend analysis** or **long-form explainer**.
4. **De-duplication against published posts** — before generating, check `blog_posts`: skip a topic if a post of the same `post_type` covering an overlapping `source_story_ids` set (Jaccard overlap > 0.5) was published in the last `cooldown` window (7d for Brief, 30d for deep-dive, 60d for explainer). Store `topic_key` (a deterministic hash of post_type + sorted top-3 entity slugs) on each post and unique-filter on it within the cooldown. This is the analogue of `news_items.source_url` dedup, lifted to the topic level.
5. **Budget** — generate at most N posts/run (e.g. 3) to cap LLM spend and keep a human review queue manageable.

### Stage B — Synthesis (the prompt approach)

Same labeled-section, line-parse approach as `buildExplainerPrompt` (more robust than JSON prose), but producing a **markdown body** rather than four fixed fields. The cluster's stories are passed as numbered context; the model must cite `[n]` inline, and the parser maps `[n]` → `source_story_ids[n]` for the citation JSON.

Prompt skeleton (new `src/lib/blog-prompt.ts`):

```
You are the editor of Kapyn, a calm, source-grounded AI knowledge base.
Write an in-depth article of type {POST_TYPE} on the topic "{TOPIC_TITLE}".

SOURCES — Kapyn's own archived reporting. Ground EVERY factual claim in these and
cite inline by [number]. Do not introduce facts, numbers, dates, product names, or
companies that are not in the SOURCES or uncontroversial common knowledge.
[1] {title} — {summary}  (source: {source_name})
[2] ...

ENTITIES in play (link these when you mention them): {entity_name → /radar or /learn slug}

Rules:
- Calm, present tense, active voice. No hype, no marketing adjectives, no emojis,
  no exclamation marks. State the thesis plainly; never sell it.
- Open with the core fact/thesis in 10-15 words.
- Markdown body: ## section headers, short paragraphs, at most one bulleted list.
  No H1 (the title is rendered separately). No images.
- Every claim that isn't common knowledge carries a [n] citation.
- {type-specific instruction: e.g. roundup → one ## per tool with a one-line verdict
   and its citations; deep-dive → state a single thesis and defend it across sections.}

Respond in EXACTLY this labeled format:
TITLE: <≤70 chars, plain, no clickbait>
DECK: <one-sentence standfirst, ≤140 chars>
SLUG: <kebab-case, ≤60 chars>   (advisory only — server re-slugs deterministically)
TAGS: <up to 5 entity slugs already in ENTITIES, comma-separated>
BODY:
<markdown article, 500-1200 words>
```

The server: parses sections; **re-derives the slug deterministically** (slugify TITLE + collision suffix — never trust the model, same rule as `entities.ts`); maps inline `[n]` to a `sources` JSON array `[{n, story_id, title, source_name, source_url}]`; computes `reading_time_min` from word count; extracts `tags` ∩ known entity slugs (drops hallucinated ones).

### Stage C — Quality gating (reuse the `isBadSummary` spirit + critique pass)

Two gates, both already proven in the repo:

1. **Deterministic gate** (`isBadBlogPost`, modeled on `isBadSummary`): reject if body < 350 words; if any `## ` count < 2; if it contains marketing-leak phrases or exclamation marks; if **any inline `[n]` references a story not in the cluster** (hallucinated citation — hard fail); if fewer than `ceil(stories/3)` distinct citations are actually used (ungrounded); if it contains prompt-leak markers (`As an AI`, `TITLE:`, `BODY:` echoes).
2. **Self-critique LLM pass** (reuse `buildCritiquePrompt`, extended): score 0-100 on factual accuracy, grounding (every claim cited), specificity, calm-voice adherence, and thesis clarity. Threshold mirrors the explainer cron: **≥75 → `status='review'`** (NOT auto-`published` — see human-in-loop), 60-74 → `held`, <60 → one stricter retry then `held`. Higher bar than the 70 explainer bar because these are longer and more load-bearing.

### Stage D — Cadence (cron, in `vercel.json`)

```
/api/news/fetch        0 0 * * *    (existing — entity extraction + archive)
/api/knowledge/generate 0 3 * * *   (existing — explainers)
/api/blog/generate      0 4 * * *   (new — deep-dives, roundups, explainers, trends; budget 3/run)
/api/blog/generate-brief 0 5 * * 1  (new — weekly Brief per active cluster)
```

All protected by `CRON_SECRET` (same `Authorization: Bearer` check as the existing crons). Writes use `SUPABASE_SERVICE_ROLE_KEY` and bypass RLS.

### Stage E — Human-in-the-loop

Critical brand rule: **the blog never auto-publishes.** Generated posts land in `status='review'`. A lightweight `/admin/blog` editor (ships with the planned `/admin` dashboard) lists review-queue posts, renders the markdown + the cited sources side by side, and lets the editor: edit the body inline, verify each citation, then flip `status='published'` (which sets `published_at` and triggers `revalidatePath('/blog')` + `revalidatePath('/blog/[slug]')` + sitemap). `held`/`unpublished` stay invisible to anon via RLS. This is the same publish-gate discipline as explainers, with a mandatory human gate added because long-form fabrication risk is higher.

---

## 3. Data model — `blog_posts` SQL

New migration `supabase/migrations/0002_blog_posts.sql`, consistent with the 0001 conventions (anon read published-only, all writes service-role, idempotent, indexed).

```sql
-- ============================================================================
-- Kapyn Blog — schema migration 0002
-- Synthesized long-form articles generated from the durable KB corpus.
-- Durable; never touched by the 48h news_items delete. Distinct from
-- entity_explainers (per-entity glossary) — a post spans many stories+entities.
-- RLS: anon SELECT only on status='published'; all writes service-role.
-- ============================================================================

create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),

  -- ── identity & routing ──
  slug              text not null unique,          -- server-derived, never from LLM
  post_type         text not null
                      check (post_type in ('brief','deep_dive','roundup','explainer','trend')),
  topic_key         text not null,                 -- dedup hash: post_type + top entity slugs

  -- ── content ──
  title             text not null,
  deck              text,                          -- one-sentence standfirst / og description
  body_md           text not null,                 -- markdown article body (no H1)
  reading_time_min  int not null default 1,
  category_slug     text,                          -- primary category (reuses the 9 slugs)

  -- ── provenance / citations (the trust contract) ──
  source_story_ids  uuid[] not null default '{}',  -- archived stories grounding this post
  sources           jsonb not null default '[]',   -- [{n,story_id,title,source_name,source_url}]
  entity_slugs      text[] not null default '{}',  -- entities to internal-link (radar/learn)

  -- ── SEO / AEO ──
  seo_title         text,                          -- ≤60 chars; falls back to title
  seo_description   text,                          -- ≤155 chars; falls back to deck
  og_image_url      text,                          -- null → dynamic opengraph-image
  canonical_url     text,                          -- null → https://kapyn.app/blog/{slug}
  faq               jsonb not null default '[]',   -- [{q,a}] → FAQPage JSON-LD (AEO)

  -- ── lifecycle / quality ──
  status            text not null default 'draft'
                      check (status in ('draft','review','published','held','unpublished')),
  quality_score     int,
  model_used        text,
  author_name       text not null default 'Kapyn',
  published_at      timestamptz,                   -- set on publish; ordering key
  generated_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_type_idx        on public.blog_posts (post_type, published_at desc);
create index if not exists blog_posts_category_idx     on public.blog_posts (category_slug, published_at desc);
create unique index if not exists blog_posts_topic_recent_idx
  on public.blog_posts (topic_key, (published_at::date));  -- one post per topic per day
create index if not exists blog_posts_entity_slugs_gin  on public.blog_posts using gin (entity_slugs);

-- ── RLS — anon reads published only; all writes service-role (matches 0001) ──
alter table public.blog_posts enable row level security;
drop policy if exists blog_posts_anon_read on public.blog_posts;
create policy blog_posts_anon_read on public.blog_posts
  for select to anon using (status = 'published');
-- No insert/update/delete policy → only service_role (which bypasses RLS) writes.
```

**RLS note (consistent with the repo's pattern):** identical to `entity_explainers`/`digests` in `0001` — anon gets `SELECT` gated on `status = 'published'`; there is intentionally **no** insert/update/delete policy, so the only writer is the cron/admin using `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. Review-queue (`draft`/`review`/`held`/`unpublished`) rows are invisible to the public client. This is exactly the "anon read, service-role write" contract the codebase already enforces, and it satisfies the security posture from the recent RLS migration on the current branch.

(`digests` can be left as-is/deprecated — `blog_posts` with `post_type='brief'` supersedes its intent.)

---

## 4. Blog UX — "reads and looks like a real blog"

New route group additions inside the existing `(web)` shell (full-width reading layout, gold/Space Grotesk Radar identity, not the phone frame). Extend `learn.module.css`'s editorial language — do not start fresh.

**`/blog` — index** (`src/app/(web)/blog/page.tsx`, server-rendered, ISR ~1800s):
- Header eyebrow "The Kapyn Blog" + one-line standfirst.
- A **featured** post (most recent deep-dive) with hero/OG image.
- Below: a reverse-chronological feed of post cards — each with `post_type` chip (color from the category accent palette), title, deck, date, reading time, top source logos. Filter chips by `post_type` and `category_slug`.
- Real `<a href="/blog/[slug]">` links (crawlable). Pagination or "load more" that degrades to indexable links.

**`/blog/[slug]` — post page** (`src/app/(web)/blog/[slug]/page.tsx`, server, `generateStaticParams` + ISR, `generateMetadata`):
- Eyebrow (post_type + category) · big title · deck · byline row: **"By Kapyn · {date} · {reading_time} min read"** · accent hairline (the `/learn` signature).
- **Table of contents** auto-built from `## ` headers in `body_md` (parse headings, render a sticky-on-desktop TOC with anchor links + scroll-spy).
- **Markdown body renderer** — this is the missing primitive. Render `body_md` with a markdown lib (e.g. `react-markdown` + `remark-gfm`) into the editorial CSS, with custom renderers for: inline `[n]` citation chips (superscript, link to the source in the references list), embedded **story cards** (a `:::story{id}` directive → a NewsCard-style block linking to `/story/[id]`), and **entity chips** (entity mentions auto-linked to `/radar/...` or `/learn/...`). Sanitize output (no raw HTML from the LLM).
- **Visibly cited sources** — a "Sources" section listing the `sources` JSON: `[n] {title} — {source_name}` linking to `source_url`, plus the provenance footer already on `/learn`: "Synthesized by Kapyn from {N} sources in its news stream." This is the trust contract made visible.
- **Reading time** from `reading_time_min`; **author = Kapyn** (with a small "Auto-generated, human-reviewed" tooltip for honesty — no fabricated human byline).
- **Related posts** — by shared `entity_slugs` / `category_slug` (GIN index supports this); plus **related radar entities** chips and **related `/learn` explainers**.
- **Share** — native share + copy-link + the existing per-page OG image (new `opengraph-image.tsx` mirroring `/learn`'s).

**Typography:** reuse `/learn`'s Bringhurst measure (~66ch), weight-contrast hierarchy, Space Grotesk wordmark/headers, warm near-black `#0c0b0a`, gold `#D9B27C` accents — the canonical Radar identity from the positioning. No emojis, generous whitespace.

---

## 5. SEO / AEO structure

Per post (`generateMetadata` + server-rendered JSON-LD, mirroring `/story` and `/learn`):

- **`Article` / `NewsArticle` JSON-LD** — `headline`, `description` (deck), `datePublished`/`dateModified`, `author` (`{@type:'Organization', name:'Kapyn'}`), `publisher` Organization, `image` (OG), `articleSection` (category), `inLanguage`, `isAccessibleForFree:true`, `mainEntityOfPage`. Use `NewsArticle` for `brief`/`trend` (Google News eligibility), `Article` for evergreen explainers/roundups.
- **`FAQPage` JSON-LD** from the `faq` JSON — the highest-leverage AEO schema (verbatim AI-Overview/Perplexity extraction), exactly the gap the SEO audit flags as missing.
- **`ItemList` JSON-LD** on `roundup` posts — each tool as a `ListItem` with `SoftwareApplication` — this is what wins the Tier-1 "best AI agents / MCP servers / tools" head terms the positioning targets.
- **`BreadcrumbList`** (Home › Blog › {title}) — fills the audit's missing-breadcrumb gap.
- **Canonical** `https://kapyn.app/blog/[slug]` (`canonical_url` override supported). **OG + Twitter** card blocks (Twitter was missing on `/explore` — include here).
- **Internal links**: body auto-links entity mentions to `/radar/...` and `/learn/...`; "related radar entities" chips; the source list links out (trust) while entity/related links keep crawl equity inside Kapyn.
- **Sitemap**: extend `src/app/sitemap.ts` to query published `blog_posts` and emit `/blog` + each `/blog/[slug]` with `lastmod = updated_at`. Add `/blog` to robots and to `/llms.txt` (and ideally a `<news:news>` entry in a future news-sitemap for `brief` posts).
- **`/llms.txt` + OKF**: add a `## Blog` section listing published posts (title + deck + URL), and optionally an `/okf/blog` bundle (markdown) so answer engines ingest the synthesized analysis, not just raw stories. Title-template (`%s | Kapyn`) at root covers the per-post titles.
- **Freshness signals** surfaced in markup (`dateModified`, "Updated {date}") — answer engines privilege current sources.

---

## 6. The product loop — blog → feed → radar → toolkit

The blog closes the discovery loop the positioning calls for ("discover, understand, track"). It is the **top-of-funnel SEO/AEO surface** that pours search traffic into the retained core:

1. **Search / answer-engine → Blog.** A roundup ranks for "best MCP servers"; an explainer gets cited for "what is MCP". Reader lands on `/blog/[slug]` cold from Google/Perplexity.
2. **Blog → Radar.** Every tool/model/entity named in a post is an internal link to its **radar entity** page (`/radar/...`). The roundup type is literally a curated path into the catalog. CTA in-post: "See this in the live Radar."
3. **Radar → Toolkit (Loadout).** From the radar entity the user Saves into a **Loadout** — the retention moat. The blog's roundup → radar → save flow is the cleanest acquisition→activation path the product has.
4. **Blog → Feed.** Each post's `source_story_ids` link to `/story/[id]` and the live `/` feed — "this analysis is built on today's stream; here's the live signal" → installs the daily 30-second habit. The Brief explicitly ends with "Follow {category} to get these in your feed."
5. **Feed/Radar → Blog (reverse).** The app surfaces (today an SEO island) get a nav entry: a "Read" / "Briefs" link from the phone app and the `(web)` header into `/blog`, plus "Related reading" chips on `/learn` and radar entity pages pointing to posts that mention that entity (the `entity_slugs` GIN index powers this). This finally connects the KB to the product, fixing audit gap #7.

Net: the blog turns Kapyn's existing, deduped, entity-linked durable corpus into indexable authority that search and answer engines surface for free — and every post is engineered to deposit the reader into Radar + Toolkit, where retention lives. No fabrication (every claim cited, hallucinated citations hard-fail the gate), sources always visible, voice always calm.

---

## Build order (smallest shippable increments)

1. **Migration** `0002_blog_posts.sql` (above) — table + RLS + indexes.
2. **`src/lib/blog-prompt.ts`** (synthesis + extended critique prompts/parsers) and **`src/lib/blog.ts`** (clustering, `isBadBlogPost`, slug derivation, dedup by `topic_key`, citation mapping). Mirror `knowledge-prompt.ts` / `entities.ts`.
3. **`/api/blog/generate`** route (cron, `CRON_SECRET`, service-role, budget 3, status='review') + `vercel.json` entries.
4. **Renderer + routes**: `/blog` index, `/blog/[slug]` (markdown renderer, TOC, citations, related), `opengraph-image.tsx`, JSON-LD, `generateMetadata`; extend `learn.module.css`.
5. **`/admin/blog`** review/publish editor (human-in-the-loop gate).
6. **Wire the loop**: sitemap + `/llms.txt` + robots; nav entries from `(web)` header and phone app; "Related reading" chips on `/learn` and radar entity pages.

**Key files to create:** `supabase/migrations/0002_blog_posts.sql`, `src/lib/blog-prompt.ts`, `src/lib/blog.ts`, `src/app/api/blog/generate/route.ts`, `src/app/api/blog/generate-brief/route.ts`, `src/app/(web)/blog/page.tsx`, `src/app/(web)/blog/[slug]/page.tsx`, `src/app/(web)/blog/[slug]/opengraph-image.tsx`, `src/app/(web)/blog/blog.module.css`, `src/app/(web)/admin/blog/page.tsx`.
**Key files to edit:** `vercel.json` (2 cron entries), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts`, `(web)/layout.tsx` (header nav), `(web)/learn/[slug]/page.tsx` (related-reading chips).
**Reused verbatim:** `story_archive` + `entity_mentions` + `entities` (clustering source), `buildCritiquePrompt` pattern, the `isBadSummary` gating spirit, the 0001 RLS "anon read published / service-role write" contract, and the `/learn` editorial CSS + JSON-LD + ISR-revalidate-on-publish scaffolding.


---

# Appendix — SEO / AEO (full)

I have everything I need. The audits are comprehensive and I've confirmed the skill content and current code shape. Here is the strategy.

---

# Kapyn SEO + AEO Strategy — Prioritized & Buildable

The skill (`nextjs-news-seo/SKILL.md`) is news-article-only — it covers `NewsArticle`/sitemap/robots/OG but has **zero** guidance for the tool/MCP/`ItemList`/FAQ/AEO surfaces that the in-scope queries ("best AI agents", "MCP servers", "AI tools") actually need. This strategy follows the skill where it applies (Steps 1–6) and extends it for everything it omits.

## The one thing that gates everything

**Server-render the radar list content.** `/radar/mcp` (`mcp/page.tsx:38`), `/radar`, `/radar/browse`, `/trending` all fetch data server-side then hand it to a client component (`McpMarketClient`, `RadarClient`, etc.). The HTML a crawler or an AI fetcher (GPTBot, ClaudeBot, PerplexityBot — most don't execute JS) receives contains **no tool names, no descriptions, nothing**. Until this is fixed, Kapyn is structurally incapable of ranking or being cited for any of the four target queries — every other recommendation is downstream of it. This is the highest-impact item in the entire plan.

---

## PRIORITY 0 — Unblock crawlability (do first, nothing else matters without it)

| # | Action | Impact / Effort |
|---|---|---|
| 0.1 | **Emit list content in server HTML on `/radar/mcp`, `/radar`, `/radar/browse`, `/trending`.** Keep the client component for interactivity, but server-render a real `<ul>`/`<article>` block (names, 1-line descriptions, `<a href>` to source + to the entity page) above/behind it — a `<noscript>`-safe SSR layer. Pattern already proven on `/categories/[slug]:151` which emits real `<a href="/story/...">`. | **High / Med** |
| 0.2 | **Fix the `/story/[id]` redirect for non-JS fetchers.** OKF `story-page` links point here; JS-less AI fetchers execute the redirect and land on the empty client home. Either (a) gate the `ClientRedirect` behind a real interaction / keep full readable content server-rendered and only redirect on a user gesture, or (b) make `/story/[id]` a genuine readable destination (see Programmatic SEO §3 — this doubles as your blog fix). | **High / Med** |
| 0.3 | **Build the canonical `/tools` and `/mcp` HTML landing pages** the sitemap already anticipates (`sitemap.ts:35` comment "M2 adds /tools"; `entityHref` 404s today, `entities.ts:22`). These are the indexable head-term pages — fully server-rendered, `ItemList` schema, descriptive copy. (Details in §3.) | **High / High** |

---

## 1. Technical SEO fixes

| # | Action | File | Impact / Effort |
|---|---|---|---|
| 1.1 | **Add `title.template: "%s \| Kapyn"`** to root metadata, then strip the manual `— Kapyn` suffixes from child pages. Skill `SKILL.md:182`. | `app/layout.tsx:16` | High / Low |
| 1.2 | **Add `twitter.site`/`creator: "@kapynapp"`** to root. | `app/layout.tsx` | Low / Low |
| 1.3 | **Add metadata + canonical to the orphan pages:** `/` home, `/radar`, `/radar/mcp` (add OG/Twitter/canonical — currently title+desc only), `/radar/hackathons`, `/radar/browse`, `/trending`, `/categories` index. Use the target keywords in titles (per positioning §6: "Best MCP servers & AI skills — Kapyn", "Discover the AI worth using"). | per-page | High / Med |
| 1.4 | **Sitemap: add radar + AEO routes.** Currently missing `/radar`, `/radar/browse`, `/radar/mcp`, `/radar/hackathons`, `/tools` (once built), `/feed.xml`, `/llms.txt`, and the new programmatic pages (§3). Remove dead `/okf/*` HTML entries from the *human* sitemap if they're agent-only (keep them in robots/llms.txt instead). | `app/sitemap.ts` | High / Low |
| 1.5 | **Split out a dedicated `/news-sitemap.xml`** with `<news:news>` tags (publication name, language, `publication_date`, title) for Google News Top Stories. The skill's checklist (`SKILL.md:197`) is only partially met. Add a second `app/news-sitemap.xml/route.ts` (the `sitemap.ts` MetadataRoute API can't emit the news namespace — hand-build the XML). Scope to last 48h of `news_items`. | new route | Med / Med |
| 1.6 | **robots.ts:** add explicit AI-crawler allow block (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `OAI-SearchBot`, `cohere-ai`) and add `sitemap` entries for `news-sitemap.xml`. Consider `Host` line. Keep `/api/` disallowed but **allow `/okf/`, `/llms.txt`, `/feed.xml` explicitly**. | `app/robots.ts` | Med / Low |
| 1.7 | **`noindex` `/saved`, `/profile`, `/feed`** (thin/personal/duplicate) via `robots: { index: false }` in their metadata — focuses crawl budget. `/feed` is a literal duplicate of `/`. | per-page | Med / Low |
| 1.8 | **Surface `<link rel="alternate" type="application/rss+xml" href="/feed.xml">`** in `<head>` via root `metadata.alternates.types`. Also add `application/ld+json` discovery isn't needed but RSS auto-discovery is. | `app/layout.tsx` | Low / Low |
| 1.9 | **Add OG images** for `/explore`, `/radar`, `/radar/mcp`, `/categories/[slug]`, `/trending` via `opengraph-image.tsx` (pattern already exists for story/learn). Category OG can be templated from accent color. | new files | Med / Med |
| 1.10 | **Align `NEXT_PUBLIC_APP_URL` fallback** from `kapyn.vercel.app` → `kapyn.app` (`api/news/trigger/route.ts:25`). Harmless but removes a stray non-canonical domain. | 1 line | Low / Low |

---

## 2. Structured data (JSON-LD) plan — exact types & placement

All JSON-LD must be **server-rendered** (skill pitfall: never in a client component). Inject as `<script type="application/ld+json" dangerouslySetInnerHTML>` in server page JSX.

| Schema | Where | What it wins | Impact / Effort |
|---|---|---|---|
| **`Organization` + `WebSite` + `SearchAction`** | Root `app/layout.tsx` (one `@graph` block) | Entity identity for all answer engines + sitelinks search box. Include `sameAs` (X, GitHub, LinkedIn), `logo`, `WebSite.potentialAction → SearchAction` with `target: https://kapyn.app/explore?q={search_term_string}`. | **High / Low** |
| **`ItemList` + `CollectionPage`** | `/radar/mcp`, `/tools`, `/explore`, `/categories`, `/categories/[slug]`, `/trending`, `/radar/browse` | The schema answer engines cite for "best X" / "MCP servers list". Each `ListItem` → `position` + `url` + `name`. This is the core AEO unlock for Tier-1 head terms. | **High / Med** |
| **`SoftwareApplication`** | Each item on `/tools`, `/radar/mcp` (and `/tools/[slug]`, `/mcp/[slug]` detail pages) | Tool-comparison citation eligibility; `applicationCategory: "DeveloperApplication"`, `operatingSystem`, `offers: { price: 0 }` for free/OSS, `aggregateRating` if available. | **High / Med** |
| **`FAQPage`** (question-phrased) | `/learn/[slug]` (per concept), `/tools/[slug]`, `/mcp` ("What is MCP?", "What are AI skills?") | **Single strongest schema for AI Overview / Perplexity verbatim extraction.** Generate 3–5 Q&As per page from the explainer fields. | **High / Med** |
| **`BreadcrumbList`** | `/story/[id]`, `/learn/[slug]`, `/categories/[slug]`, `/tools/[slug]`, `/mcp/[slug]` | SERP breadcrumb display + crawl hierarchy. | Med / Low |
| **`Article`/`BlogPosting`** | New blog/digest pages (§3) | Rich results + Discover. | Med / Med (depends on blog) |
| Keep existing | `NewsArticle` (`/story`), `DefinedTerm`/`DefinedTermSet` (`/learn`) | Already well-formed. **Improve:** make `NewsArticle.publisher` clearly Kapyn (`NewsMediaOrganization`) while `author` stays the source — Google News wants a clear publisher. | Low / Low |

---

## 3. Programmatic SEO — turn the radar corpus into indexable pages at scale

The durable knowledge graph (`entities`, `story_archive`, `entity_mentions`, `entity_explainers`) is clustering-ready, deduped, entity-linked source material that survives the 48h rotation. This is the asset. Build four page families:

### URL structure
```
/tools                      → ItemList hub: all ~130 tools/models/agents/frameworks
/tools/[slug]               → per-entity page (model/tool/company/agent) — kills the entities.ts:22 404
/mcp                        → ItemList hub: ~45 MCP servers (canonical /radar/mcp content, SSR)
/mcp/[slug]                 → per-MCP-server page (SoftwareApplication + FAQ)
/skills                     → ItemList hub: ~30 AI skills
/skills/[slug]              → per-skill page
/learn/[slug]               → already exists (techniques/concepts) — KEEP
/best/[query-slug]          → curated comparison landing (e.g. /best/ai-coding-agents,
                              /best/mcp-servers-for-rag) — Tier-1 + Tier-3 intent
/categories/[slug]          → already exists — KEEP
```

### Page template (each `/tools/[slug]`, `/mcp/[slug]`, `/skills/[slug]`)
A genuinely valuable page, not a stub:
1. **H1 + 40-word extractable answer** ("X is a … that …") — AEO requirement, first 40 words.
2. **At-a-glance facts** — stars, last-pushed date, license, category, "new this week" badge (freshness signal answer engines privilege).
3. **Why it matters / How it works / What's happening now** — reuse the `entity_explainers` 4-field machinery; **widen the generator's `entity_type IN ('technique','concept')` filter (`generate/route.ts:76`) to include `model`/`tool`/`company`** now that `/tools/[slug]` exists. This is the single change that unlocks the most pages.
4. **"In the news"** — live `entity_mentions` → linked story cards (internal links, freshness).
5. **Alternatives / Related** — link to sibling entities (`[tool] vs [tool]`, `[tool] alternatives` — Tier-3 long-tail).
6. **Provenance footer** — "grounded in N sources" (`learn/[slug]:175`) — the trust signal answer engines reward.
7. **Schema:** `SoftwareApplication` + `FAQPage` + `BreadcrumbList`.

### Avoiding thin/duplicate content (this is what makes or breaks programmatic SEO)
- **Reuse the existing quality gate.** The self-critique 0–100 scorer + publish/hold/retry gate (`generate/route.ts:24,189`) and the thin-content guard (≥2 source stories for non-seed, `:182`) already exist. **Only index pages that pass.** Unpublished/held entities get `noindex` until they have real content. This is your duplicate-content firewall.
- **No page without ≥1 unique data point** — a tool page with only the name is noindex'd until it has stars/date/description/≥1 mention.
- **Differentiate hub vs. detail** — `/tools` is `ItemList` + editorial intro; `/tools/[slug]` is the explainer. Never let two pages target the same query.
- **`/best/[slug]` pages are hand-curated, not auto-spun** — a handful (5–15) of high-intent comparison pages, each with a real point of view + comparison table, not a generated page per permutation. Quality over volume here.
- **Stagger publication** — release as explainers pass the gate, so Google sees steady fresh growth, not a 200-page dump (spam signal).

---

## 4. AEO specifics — becoming a citable source

| # | Action | Impact / Effort |
|---|---|---|
| 4.1 | **Expand `/llms.txt`** to link `/feed.xml`, `/trending`, `/categories`, `/radar`, `/radar/mcp`, `/tools`, `/mcp`, and individual high-value tool/explainer pages — answer engines crawling llms.txt currently miss the freshest signals (audit AEO gap). | High / Low |
| 4.2 | **Add `llms-full.txt`** (full-content variant) — inline the top explainers + current digest so crawlers that prefer it get everything in one fetch. | Med / Low |
| 4.3 | **40-word extractable answer block at the top of every explainer/tool/MCP page** — "MCP is …" / "The best AI coding agents are …" in the first 40 words. This is the literal text AI Overviews/Perplexity lift. | High / Med |
| 4.4 | **`FAQPage` question-phrased blocks** (see §2) — the format AI engines extract verbatim. Phrase headers as the actual Tier-2 queries: "What is the Model Context Protocol?", "What are AI skills?", "MCP vs function calling". | High / Med |
| 4.5 | **Extend OKF/RSS to news stories with question framing.** `/feed.xml` covers only the 60-entity glossary, not the fresh news answer engines want for "latest AI news". Add a news RSS feed + extend `/okf/stories` framing. | Med / Med |
| 4.6 | **Surface freshness signals in visible HTML** — "Updated [date]", "New this week", last-pushed dates (already fetched from GitHub for MCP). Answer engines privilege current sources; make currency machine-visible, not just implied. | High / Low |
| 4.7 | **Visible source citations** — keep/extend the "grounded in N sources" provenance line onto every programmatic page; link each claim to its source. Citability = visible sourcing. | Med / Low |
| 4.8 | **AI-crawler allow rules in robots** (see 1.6) — make the opt-in explicit rather than relying on the `*` wildcard. | Med / Low |

---

## 5. Internal-linking architecture

Today: three siloed nav systems (`(app)` BottomNav, radar nav, `(web)` header); `/home` links nowhere internally; `/radar/mcp` is orphaned (no nav entry); the phone app never links into `/explore`/`/learn`. The KB is an SEO island. Fix the link graph:

```
/home (landing)  ──top-nav──►  /radar · /explore · /trending · /categories · /radar/mcp · /radar/hackathons · Open App
       │
   hero links ──►  /tools · /mcp · /skills  (the head-term hubs)

/radar  ◄──►  /radar/mcp, /radar/browse, /radar/hackathons, /radar/toolkit   (+ surface MCP in radar nav — it's orphaned)
   │
   └──►  /tools/[slug], /mcp/[slug]  (each radar card deep-links to the indexable detail page)

/tools (hub)  ──►  /tools/[slug]  ──►  "In the news" ──►  /story/[id]
                                  ──►  Related/Alternatives ──►  sibling /tools/[slug]
                                  ──►  underlying concept ──►  /learn/[slug]

/explore  ──►  /learn/[slug]  ──►  "In the news" /story/[id]  +  Related concepts  +  related /tools/[slug]

/categories  ──►  /categories/[slug]  ──►  /story/[id]  +  relevant /tools & /mcp for that category

/story/[id]  ──►  entity chips ──►  /tools/[slug] · /learn/[slug]   (turn the redirect shim into a real hub — §0.2)
```

Concrete actions:
1. **Add a homepage top-nav** to `src/app/home/page.tsx` (lines 14–26) — reuse the `(web)/layout.tsx` header pattern. Destinations ranked by the nav audit: Radar → Explore → Trending → Categories → MCP & skills → Hackathons → Open App. **High / Med.** Fixes the landing-silo + orphan-MCP + crawl-depth gap in one move.
2. **Surface `/radar/mcp` in both radar navs** (`_RadarNav.tsx` + bottom-nav radar mode) — it's currently reachable only via in-content pills. **Med / Low.**
3. **Bidirectional entity↔story↔concept links** — every `/tools/[slug]` links to its `/learn/[slug]` concept and its `entity_mentions` stories; every `/learn` and `/story` links back to relevant tools. The `entity_mentions` join already has this data. **High / Med.**
4. **Link the phone app into the KB** — a "Learn more" / entity chip on cards that deep-links to `/learn` or `/tools` detail. Breaks the SEO-island problem. **Med / Med.**
5. **Footer with the full hub set** on every `(web)` and landing page (Tools, MCP, Skills, Explore, Categories, Trending, Hackathons) — flat crawl access to all hubs from anywhere. **Med / Low.**

---

## 6. Measurement

**Setup**
- GSC verification token already present (`layout.tsx:18`). **Submit `sitemap.xml` + `news-sitemap.xml`** in Search Console. (Med / Low)
- Enable **GSC → AI/Search Generative** views as they roll out; track impressions in AI Overviews where available.
- Add **PostHog server events** for crawler hits on `/okf/*`, `/llms.txt`, `/feed.xml` (parse UA for GPTBot/ClaudeBot/PerplexityBot) — direct signal of AEO crawler interest. Fixes the hardcoded `"cron-job"` distinctId issue while you're in there.

**Queries to track in GSC (by tier from positioning §6):**
- *Tier 1 (head):* `best ai agents`, `best ai coding agents`, `best mcp servers`, `mcp servers list`, `best ai tools for developers`, `open source ai tools`.
- *Tier 2 (AEO/definitional):* `what is mcp`, `model context protocol`, `mcp vs function calling`, `what are ai skills`, `what is an ai agent`, `what is rag`.
- *Tier 3 (long-tail/conversion):* `ai skills for [task]`, `best ai stack for [rag/hackathon]`, `[tool] alternatives`, `[tool a] vs [tool b]`, `ai hackathons 2026 / india / online`.

**Leading indicators (weekly):** indexed-page count (target: programmatic pages getting indexed without thin-content soft-404s), `/tools/*` + `/mcp/*` + `/learn/*` impressions, click-through on FAQ-rich pages. **Citation tracking:** manually probe ChatGPT/Perplexity/Google AI Overviews monthly for the Tier-1/Tier-2 queries and log whether kapyn.app is cited (no clean API for this yet — manual is the standard).

---

## Build order (sequenced by impact × dependency)

1. **§0.1 SSR the radar/MCP/trending list content** — unblocks everything. *High/Med.*
2. **§2 Organization + WebSite + SearchAction in root** + **§1.1 title.template** — cheap, site-wide. *High/Low.*
3. **§3 Build `/tools`, `/mcp`, `/skills` hubs + `[slug]` detail pages** with `ItemList`/`SoftwareApplication`/`FAQPage`; **widen the explainer generator to model/tool/company** (`generate/route.ts:76`). *High/High — the core programmatic unlock.*
4. **§1.4–1.6 sitemap (incl. news-sitemap) + robots AI rules** + **§4.1 llms.txt expansion**. *High–Med/Low.*
5. **§5 internal linking — homepage top-nav, surface MCP, entity↔story↔concept links**. *High/Med.*
6. **§0.2 fix `/story/[id]` for non-JS fetchers** (or make it a real destination). *High/Med.*
7. **§4 AEO polish — 40-word answer blocks, FAQ generation, freshness signals, OG images, noindex thin pages**. *Med/Low–Med.*

Key files to touch: `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts` (+ new `news-sitemap.xml/route.ts`), `src/app/(radar)/radar/{page.tsx,mcp/page.tsx,browse/page.tsx,McpMarketClient.tsx,RadarClient.tsx}`, `src/app/(app)/trending/page.tsx`, new `src/app/(web)/{tools,mcp,skills}/{page.tsx,[slug]/page.tsx}`, `src/app/api/knowledge/generate/route.ts:76`, `src/lib/entities.ts:22`, `src/app/llms.txt/route.ts`, `src/app/home/page.tsx`, `src/app/(radar)/_RadarNav.tsx`, `src/components/layout/BottomNav.tsx`, `src/app/story/[id]/page.tsx`.


---

# Appendix — GTM (full)

This is a strategy question, not a coding task. The positioning and product reality are already comprehensive, so I'll deliver the GTM directly. No tools needed.

# Kapyn GTM: Loops, Habits, and Honest Word-of-Mouth

## 1. The auto-comment bot: why it's the wrong move (and the principle)

I'm going to be direct because this one matters: **don't build the YouTube mass-comment bot.** Here's the honest reasoning, not a lecture.

**It violates YouTube's ToS.** Automated/scripted comment posting is explicitly prohibited spam. The realistic outcomes, in order of likelihood: comments shadow-removed within minutes (you'll think it's working, it isn't), the account banned, and — worst — `kapyn.vercel.app` flagged as a spam domain. A flagged domain leaks into Google Safe Browsing, Gmail spam filters, and Reddit/Discord auto-removal lists. You would be poisoning the exact SEO/AEO channel that is your whole growth thesis. One automated tactic could quietly kneecap the durable one.

**It's the inauthentic signal that destroys word-of-mouth.** Kapyn's entire moat is *trust* — "calm, source-grounded, no hype." A drive-by bot comment ("Check out Kapyn!") under an AI YouTuber's video is the precise opposite signal. It reads as hype-spam to the one audience trained to spot it (builders). You'd be spending brand equity to buy negative brand equity. Even if it "worked" mechanically, it converts the wrong way: the people who click a spam comment are not the people who form a daily habit.

**It doesn't even scale value.** A bot comment has zero context — it can't reference what the video actually said. The thing that *does* convert ("at 8:30 you mentioned wanting an MCP for X — there are ~45 catalogued here, including 3 that do exactly that") is by definition not botted, because it requires watching the video.

**The principle to hold onto:**
> **Automate the work. Never automate the authenticity.**
> Automate generation, scheduling, research, analytics, and the *drafting* of personalized outreach. Never automate the act of a human appearing where they aren't — that's spam, and spam is a withdrawal from the trust account that *is* the product.

You're a solo founder using AI assistance — that's an advantage here. AI lets you produce genuinely personalized, high-context outreach at 5x speed *without faking presence.* That's the legitimate version of the same instinct, and it actually works.

---

## 2. Channel strategy (fit for a calm, no-hype AI product)

Ranked by leverage for *this specific* product. The ordering matters: own the durable channel first.

### Tier 1 — SEO / AEO + the blog (the OWNED, durable channel) — your #1 bet

This is the channel that compounds, costs no ad spend, and exactly fits a no-paywall product. Your positioning doc already maps the intent tiers; the GTM job is to *ship the surfaces that capture them* and wire them into loops.

**The catalog pages are your unfair advantage.** You have ~130 tools, ~45 MCP servers, ~30 skills, the OSS canon — already curated, already current. Most "best AI tools" SERPs are owned by stale, low-trust listicle farms. A *current, source-grounded, opinionated* catalog page beats them on the one axis Google now rewards: freshness + genuine expertise.

Concrete must-dos (these are the commercial heart):
- **JSON-LD on every catalog + explainer page** — `ItemList`, `SoftwareApplication`, `FAQPage`, `DefinedTerm`. This is what gets you *cited by answer engines*, which is how a no-paywall product grows for free.
- **Self-contained answer blocks** — "MCP is …" in the first 40 words of every explainer. LLMs (and Google's AI Overviews) lift these verbatim. Being the cited source is the prize.
- **Surface freshness signals** — "last updated," "new this week," live GitHub stars. Answer engines and Google both privilege current sources, and current is the one thing your stale competitors structurally can't be.
- **One templated landing page per Loadout/lens and per long-tail job** — `best AI stack for RAG`, `AI skills for marketing`, `AI hackathons India 2026` (near-zero competition on that last one — own it now).

**The blog is the OWNED hub of all of it.** Not a marketing blog — an extension of the Knowledge Base voice. Each post is a durable asset that ranks, gets cited, and links *into the product*. Topics write themselves from your data: "What actually trended on GitHub this week in AI," "5 MCP servers worth adding to your stack," "The agent frameworks builders are actually using." The blog is where the content loop (below) lives.

### Tier 2 — Genuine creator/community engagement, scaled the RIGHT way

This is the legitimate version of the YouTube instinct. The mechanism is **templated-but-personal MANUAL outreach tracked in a CRM** — never a bot.

**How it actually works:**
- Build a list of 50–100 AI YouTubers/newsletter writers/Twitter builders whose audience = your ICP (builders, vibe coders). A simple Airtable/Notion CRM: name, channel, audience, last-touch, status, personal hook.
- **AI drafts, you personalize and send.** Use AI to draft an outreach template, then *you* watch 3 min of the video / read the post and inject one specific, true, useful reference. The template handles structure; the human handles authenticity. This is 5x faster than fully-manual and 100% authentic.
- The offer is *value, not ask*: "I built a free, no-paywall catalog of MCP servers — here's a Loadout I made of the 6 you'd probably like for your agent workflow. No signup. Curious if it's useful." You're giving them a shareable artifact (a Loadout link), not begging for a shoutout.
- **Comment like a human, occasionally, where you have something real to add.** One thoughtful comment referencing the actual video content, from a real account, is worth more than 10,000 bot comments and carries zero ban risk. This is fine. Mass-scripting it is not. The line is: *did a human actually engage with this specific thing?*

### Tier 3 — Reddit / HN / Discords (where builders already are)

- **r/vibecoding (~559k weekly), r/LocalLLaMA, r/ChatGPTCoding, r/MachineLearning** — be a *member who occasionally shares*, not a marketer. The currency is being genuinely helpful in threads ("someone asks 'best MCP for Postgres' → you answer the question properly *and* link the catalog page"). 9 helpful comments : 1 link is the ratio that survives.
- **Hacker News** — a "Show HN" for the Radar, timed and titled calmly ("Show HN: A current, source-grounded catalog of AI agents, MCP servers, and skills — no paywall"). HN loves no-paywall + builder-first + anti-hype. This audience is your exact ICP and they *reward* calm. One good Show HN can seed the whole flywheel.
- **AI builder Discords** (framework communities, hackathon servers) — same posture: helpful member, not poster.

### Tier 4 — Launch surfaces (one-time spikes that seed loops)

- **Product Hunt** (you already pull PH data — you know the audience). Launch the *Radar*, not the feed. Calm copy.
- **Hacker News Show HN** (above).
- Directory listings: There's An AI For That, Futurepedia, awesome-mcp-servers GitHub lists, etc. — get Kapyn *listed* (these rank, and they're where ICP browses).
- These give traffic spikes; the loops below are what retain that traffic.

**What to de-prioritize:** paid ads (no paywall = hard payback math pre-PMF), TikTok/short-form (wrong register for a calm product, high effort), influencer payments (inauthentic, ban-adjacent in spirit). Earn attention; don't rent it.

---

## 3. Growth + retention LOOPS

A channel sends a spike; a loop compounds. Four loops, in priority order.

### Loop A — The Content Loop (blog ↔ feed ↔ radar) — your core engine

```
Feed/Radar data (live GitHub trends, PH launches, new tools)
   → auto-drafted blog post / explainer ("what trended this week")
   → ranks in Google + cited by answer engines
   → reader lands on blog
   → internal links pull them into /radar/browse, /radar/mcp, explainers
   → they discover the live feed + catalog (the product)
   → some save a Loadout (retention) → return for "what's new in my world"
   → their return + usage generates fresh signal
   → feeds the next post
```
This is the flywheel. The product *generates its own SEO content*, which acquires users, who generate more signal. Solo-founder-friendly because the drafting is automatable (you edit for voice).

### Loop B — Share loops (the artifacts that travel)

Your Loadout/Toolkit is already a share primitive — make it *great*, not just text.
- **Shareable Loadout cards** — a beautiful gold/Space-Grotesk OG image of a named loadout ("My RAG Stack — 8 tools, via Kapyn Radar") with a link. A builder sharing their stack in a Discord = free, authentic, in-context distribution by the exact right person. This is word-of-mouth as a *product feature*.
- **"Top 3 in AI today" share card** — one-tap, user-triggered, branded OG image. The daily share loop (already on your roadmap — prioritize it).
- **Per-entity / per-explainer OG images** — when someone shares an MCP server or explainer link, it renders a clean card. Every share is a billboard.
- The mechanic: the *user* shares (authentic), the *artifact* carries the brand (durable). Opposite of a bot.

### Loop C — Referral (lightweight, value-native, no auth)

Pre-auth, keep it simple: shared Loadouts *are* the referral. When auth eventually lands, a "you and a friend both get [a saved-sync / early Protect access]" — but **never a paywall-gated referral** (off-brand). Keep referral as "share the useful thing," not "earn credits."

### Loop D — Push / email re-engagement (the daily-return driver)

- **Web Push by category/follow** — "3 new MCP servers in your stack's category," "a tool in your Loadout shipped a major update." This is the highest-leverage retention lever you have and it's on your roadmap. *Calm cadence* — at most daily, opt-in, genuinely useful. No guilt, no "you haven't visited!" Push the *signal*, not a nag.
- **Email** (once you have a capture point — the daily share card or a "get the dispatch" opt-in) — a calm daily/weekly digest. Email is owned, durable, and survives algorithm changes. Even 200 engaged email subs is a real asset.

---

## 4. Habit formation (calm, never guilt-based)

The hard constraint: **no Duolingo guilt-gamification.** Habits come from *value delivered on a predictable cadence*, not anxiety.

- **The daily dispatch** — the feed's job is to be a *trustworthy daily ritual*: open Kapyn, 30 seconds, you're current. Cadence creates the habit (fix the cron to every 2–4h so it's never stale — a stale daily ritual breaks the habit fast).
- **Follow + Loadouts = "what's new in my world"** — this is the retention moat, not streaks. Once a builder has a Loadout, "did anything in my stack change?" is a *reason to return* that compounds with use. Make the return moment deliver: surface "new since you last looked" in the Loadout.
- **Tasteful streaks only** — a quiet "current 5 days running" is fine as a *reflection of value*, never a threat. No "don't lose your streak!" The streak observes the habit; it doesn't manufacture it.
- **The hook**: Trigger (push: "a tool in your stack updated") → Action (open) → Variable reward (what's new in my world) → Investment (save another tool to the Loadout, deepening the personalized signal). Each loop makes the next return more valuable. That's a habit built on value, on-brand.

---

## 5. 30 / 60 / 90-day GTM sequence

**Days 0–30 — Foundation (own the durable channel + seed):**
- Ship SEO/AEO scaffolding: JSON-LD on all catalog + explainer pages, answer-block formatting, canonical/metadata, internal linking into `/radar/*`. *This is the single highest-leverage 30-day task.*
- Fix cron to every 2–4h (kills the "stale ritual" habit-breaker).
- Launch the blog; publish 4–6 data-driven posts ("what trended this week," top MCP servers, etc.).
- Build the outreach CRM; seed 50 creators/communities. Start *genuine* engagement in r/vibecoding, r/LocalLLaMA, relevant Discords (helpful member mode).
- Ship shareable Loadout OG cards (the cheapest high-leverage share primitive).
- Get listed in 5–10 AI directories + awesome-mcp lists.

**Days 31–60 — Loops + first launch spike:**
- **Show HN** for the Radar (your ICP's home turf, rewards calm/no-paywall). Then **Product Hunt**.
- Ship "Top 3 today" share card + Web Push (opt-in, by follow/category).
- Begin templated-but-personal creator outreach (AI-drafted, human-personalized) — 5–10 quality touches/week, tracked in CRM.
- Content loop running: each week's data → blog post → internal links. Measure which catalog pages start ranking.
- Stand up email capture (calm digest opt-in).

**Days 61–90 — Compound + double down:**
- Audit PostHog: which loop drives return visits? Which SEO pages convert to Loadout saves? **Double down on the one working loop.**
- Scale the winning content format (if "best MCP for X" pages rank → mass-produce the templated long-tail set).
- Deepen creator relationships that responded (offer custom Loadouts, co-created content — *genuine* collabs, the legit version of the bot dream).
- Ship the Loadout "new since last visit" return-moment.
- If Protect/deprecation alerts are feasible, scope v1 — it's the differentiator no competitor has and a strong push/retention hook.

---

## 6. Automate vs. never automate

**LEGITIMATELY automate (do all of this — solo-founder force multipliers):**
- **Content generation** — AI-draft blog posts/explainers from your live feed data (you edit for the calm voice; never publish raw LLM output — your own rule).
- **Scheduling** — blog/social post scheduling, cron ingestion cadence.
- **Analytics** — PostHog dashboards, loop-attribution, ranking tracking, "which page converts" reports.
- **Outreach *drafting*** — AI drafts the personalized template; the CRM tracks status/cadence. (The *send* is human, the *personalization* is human.)
- **Internal data ops** — SEO audits, broken-link checks, JSON-LD generation, OG-image generation, freshness updates.
- **Research** — summarizing a creator's recent content so your manual outreach is fast *and* genuinely informed.

**NEVER automate (platform-ToS-violating / inauthentic spam):**
- ❌ Mass/scripted comment-posting on YouTube, Reddit, Twitter, anywhere (ToS violation, ban + domain-flag risk, brand-destroying).
- ❌ Bot DMs / cold-DM blasts.
- ❌ Fake reviews, sockpuppet upvotes, vote manipulation on PH/HN/Reddit (instant ban, reputational ruin).
- ❌ Auto-following / engagement pods / any "appear where a human isn't" tactic.
- ❌ Scraped-and-blasted email without consent (and watch DPDP if you collect Indian user data — you have a skill for this).

**The test for any tactic:** *Did a real human actually engage with this specific thing, and would I be comfortable if the recipient knew exactly how it was produced?* If yes → automate the prep, send it. If no → it's spam, and spam is a withdrawal from the trust account that is your entire moat.

---

**The one-sentence GTM:** Win by *owning search and answer-engine citation* with a current, source-grounded catalog (the durable free channel), wrap it in a self-feeding content↔product loop and shareable Loadout artifacts, retain with "what's new in my world" push and personalized collections — and grow the human channels by *automating the work, never the authenticity.* The bot is a shortcut that bypasses the exact trust that makes Kapyn worth building; the slower, real path is also the faster one.
