# Kapyn — Project Status & Log

> **Living doc.** Single source of truth for "where are we and what's next." Update as steps complete.
> **Last updated:** 2026-09-04 — *September content pass: the model data, comparison verdicts and catalogs brought back to true after GPT-6 Astra and Claude Fable 5.1, the Windsurf-to-Devin-Desktop rename swept, four new posts, and `npm run check:freshness` added so the next lapse fails CI instead of sitting there.*
>
> **New-session read order:** (1) `CLAUDE.md` + `AGENTS.md` → (2) **this doc** → (3) `docs/design-foundations.md` before any product/UI work.

---

## 👉 RIGHT NOW — the one problem that matters

**Retention. Not features.**

PostHog (2026-07-23) puts week-1 retention at **~1–2%** on the large recent cohorts (May 31–Jun 6, n=219 → 1.4%; Jul 12–18, n=171 → 1.2%; Jul 5–11, n=122 → 0%). The "Mean" row in the dashboard reads ~10% only because tiny early cohorts inflate it. Acquisition is no longer the binding constraint — **Reddit works** (≈75 referrals, the #1 real channel) — but nobody comes back.

**Do not default to building new surface.** The product is broad and polished; the leak is downstream of that.

### The diagnosis fork (measure before fixing)
Is it **activation** (first-timers bounce on the opening cards) or a **return trigger** problem (they engage but have no reason to come back)? Different fixes, and we now have the instrumentation to tell them apart.

`feed_session_ended` shipped in **PR #45** ([CardStack.tsx](../src/components/feed/CardStack.tsx)) — carries `max_depth`, `reached_completion`, `is_returning`, `is_first_session`. It pairs with the pre-existing `feed_viewed`, `story_swiped`, `story_breakdown_opened`, `feed_completed`.

**Pending — dashboard work only, no code:**
1. Filter internal + bot traffic (the "1000 users" figure is inflated by datacenter hits and our own testing — Bengaluru showed 382 visitors → 2905 views).
2. Funnel: `feed_viewed` → `feed_session_ended max_depth≥2` → `reached_completion`, broken down by `is_first_session`.
3. Depth histogram, and retention cohortised by `max_depth≥2` vs `<2`.

### Fix sequence (ICE-ordered, only after the data lands)
1. **Feed opener** — lead with the best stories, not the newest. Partly shipped (`composeAllFeed` in [supabase.ts](../src/lib/supabase.ts), A/B-gated on the PostHog flag `feed-opener-ranking`). Build further only if the data shows shallow first-session bounce.
2. **"What you missed since last visit"** — cheap return reward, uses `kapyn_last_visit`, no auth. The "New" badge (PR #34) is the first half of this.
3. **Web Push** — the real return trigger, but opt-in friction is high on a no-auth PWA and it cannot fix a weak opener. Needs VAPID keys.

---

## 🔴 Blocked on the founder (not code)

- [ ] **Gemini credits** — prepaid credits depleted → 429 `RESOURCE_EXHAUSTED` → summarisation fails → the feed cannot ingest. Top up at ai.studio and confirm the *same* key is in Vercel prod.
- [ ] **PostHog** — create the `feed-opener-ranking` boolean flag at 50% so the opener A/B actually records; enable session replay.
- [ ] **VAPID keys** — required before web push can be switched on.
- [ ] **Rotate `CRON_SECRET`** — still the weak `kapyntest123`, in *both* Vercel env and the GitHub repo secret.
- [ ] **Gemini billing cap** — ingestion now runs 12×/day; set a denial-of-wallet backstop.
- [ ] **`sameAs: []` in layout.tsx** — fill with real X/IG/LinkedIn URLs; strongest signal against the "kapyn → kyn" Google autocorrect.

---

## ✅ Shipped & live (production = kapyn.app)

**The app.** Swipeable 30-second feed, categories, trending, saved, profile. Desktop visitors to `/` are rewritten to the `/home` landing via [middleware.ts](../src/middleware.ts); phones and the installed PWA get the app.

**The Radar** — the discovery surface and the real retention bet: Today, Browse, Toolkit, Packs, Pulse, Hackathons, MCP market. Lives in the `(radar)` route group with its own layout.

**SEO/AEO surface** — `/mcp` + `/mcp/[slug]`, `/skills` + `/skills/[slug]`, `/tools` + `/tools/[slug]`, `/compare` + `/compare/[a]-vs-[b]`, `/blog` (59 posts), `/learn`, `/explore`, `/search`, `llms.txt`, `feed.xml`, sitemap.

**Ingestion** — GitHub Actions cron every 2h ([fetch-news.yml](../.github/workflows/fetch-news.yml)) plus Vercel crons for the radar/knowledge/email jobs. A retry workflow (PR #46) re-runs the fetch when GitHub fails to allocate a runner.

### Recent merges
| PR | What |
|---|---|
| — | **Sep 2026 content pass**: models.ts + `/compare` brought current (GPT-6 Astra, Fable 5.1, GLM, Muse Glimmer); Windsurf→Devin Desktop swept across catalogs and 6 posts; two ended hackathons removed; fabricated category counts deleted; 4 new posts; `check:freshness` added |
| #56 | Keep tools-registry free of the database |
| #55 | Indexable pages for discovered tools, behind a quality gate |
| #54 | Security: SSRF bypass, open redirect, content poisoning, XSS sinks |
| #53 | Real depth and attributed images for the India posts |
| #51–52 | India vertical, city hubs, 254 alternatives pages, MCP config reference |
| #46 | Auto-recover from runner-acquisition failures in the news cron |
| #45 | `feed_session_ended` — the activation-vs-trigger diagnostic |
| #42–44 | Packs + weekly recap surfaced; grid Pulse; denser Today tiles |
| #41 | MCP directory made far richer and self-updating |
| #39–40 | Starter packs + verdict badges |
| #38 | "Caught up this week" anti-FOMO share card |
| #37 | Judgment layer — honest verdicts on the tool canon |
| #36 | Push opt-in moved to slot 5 so people actually see it |
| #34 | Return hook ("New" badge, "N new" pill) + first-run landing fixes |

---

## 🧭 Strategic position (resolved — do not relitigate)

The old "Option A vs Option B" decision in this doc is **closed**. Kapyn is **the calm map of the AI worth using** — discovery first, news as the live signal. The Radar is the headline; the 30-second feed feeds it.

Two things worth keeping in view:

- **AI news alone is a commodity** — a vitamin, not a painkiller. Value is everywhere (X, Reddit, TLDR, just asking a chatbot). Artifact had beautiful UX, push, and Instagram's founders, and still shut down. **News UX does not produce retention.** The habit-forming version is *"what's new in my world"* — which is what the Radar and follow are for.
- **The "just ask AI" objection** is the central risk. Kapyn's value cannot be "look up answers" — chat owns that. It has to be *the question you didn't know to ask*, a curated point of view, and trust that it is current.

---

## 📅 Content freshness (new — this is now a recurring job)

Catalogs and model data go stale fast and quietly. The August 2026 audit found `/compare` still presenting **GPT-4o as frontier**, two generations behind, and **24 dead links** across the MCP and skills directories.

**Single source of truth:** [models.ts](../src/lib/models.ts) — `name` is the family, `currentVersion` is the release it points at. Updating a model family should be a one-field edit plus `LAST_UPDATED`. Never put a minor version in `name`; that is exactly how it went stale.

**This is now enforced, not just recommended.** `npm run check:freshness`
([scripts/check-freshness.mjs](../scripts/check-freshness.mjs)) fails when `models.ts` is
older than 45 days, when a MODELS entry has no `currentVersion`, when a retired model name
appears in a live blog post or a `/compare` verdict, when a post's `updated` predates its
`date`, or when a curated hackathon's `openState` contradicts its own dates. Dated
`Roundup` posts are exempt: they are records of their month, not live pages.
[content-freshness.yml](../.github/workflows/content-freshness.yml) runs it on PRs touching
the content files, and weekly with `--links` for the dead-link sweep.

**Still a human job, monthly:**
1. Re-check `LAST_UPDATED` in `models.ts` against the current frontier. The check tells you
   it is stale; only you can tell it what is true.
2. Read the `--links` failures. Upstream repos get archived and renamed constantly
   (`modelcontextprotocol/servers` moved seven reference servers to `servers-archived`).
3. Re-read the tool verdicts in `radar-tool-depth.ts`. Nothing automated can notice that
   "the best AI editor today" stopped being true, or that a product was renamed.

---

## 🗺️ Backlog

- **Ask Kapyn** — RAG over the corpus. Needs rate limiting + a billing cap first.
- **Blog engine (Phase 2)** — auto-synthesise posts from the corpus with a human-review gate; the hand-authored seed in [blog-content.ts](../src/lib/blog-content.ts) swaps out behind the existing routes.
- **`radar_tools` schema debt** — the live table has no `description` or `image_url` column; reads and writes both degrade via a lean-retry. Adding the two columns makes that a no-op.
- **Admin dashboard** at `/admin` for content QA.
- Parked: search, account sync (needs auth), personal AI-literacy map.

**Stale PR:** [#6](https://github.com/RahulUpadhyay3432/ai-changelog/pull/6) (`feat/desktop-layout`) has been open since 2026-06-15 and was superseded by the desktop front door (#27/#28). Close it.

---

## ⚙️ Working notes

- **Local `next build` OOMs this machine.** Verify with `npx tsc --noEmit` + `eslint`, and rely on the Vercel build gate.
- **Local `npm run dev` does not load `.env.local`** when started from Claude — DB pages 500. Verify on the Vercel preview instead.
- **Screenshots work**: `google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=430,2400 --virtual-time-budget=17000 --screenshot=<out> <url>`. The `--virtual-time-budget` is load-bearing (client fetch needs ~15s). Chrome is the snap build — it can only write to `/home/rahul/snap/chromium/common/`.
- **Verify every UI change at 430px and 1280px**, before and after.
- **Pushing `.github/workflows/*` needs the `workflow` OAuth scope** on the gh token (`gh auth refresh -h github.com -s workflow`).

---

## 📎 Key files

- [design-foundations.md](design-foundations.md) — design/product brief; read before UI work.
- [market-research.md](market-research.md) — competitive landscape (June 2026; the "security scanner SaaS is a trap" verdict still holds).
- [models.ts](../src/lib/models.ts) · [model-pairs.ts](../src/lib/model-pairs.ts) — model data and curated comparisons.
- [radar-essentials.ts](../src/lib/radar-essentials.ts) · [radar-mcp.ts](../src/lib/radar-mcp.ts) · [radar-skills.ts](../src/lib/radar-skills.ts) — the curated catalogs.
- [design-tokens.ts](../src/lib/design-tokens.ts) — single brand source. The export is still *named* `GOLD` but holds blue `#3b82f6`; renaming would touch ~110 sites.
- Repo: `RahulUpadhyay3432/ai-changelog` · Deploy: Vercel · Working clone: `/home/rahul/projects/ai-changelog`.
