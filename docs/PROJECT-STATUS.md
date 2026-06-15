# Kapyn — Project Status & Log

> **Living doc.** Single source of truth for "where are we and what's next." Update as steps complete.
> **Last updated:** 2026-06-15
>
> **New-session read order:** (1) `CLAUDE.md` + `AGENTS.md` → (2) **this doc** → (3) `docs/design-foundations.md` before any UI/product work.

---

## 👉 RIGHT NOW — the next action

**M1 is SHIPPED to production** (PRs #3 + #4 merged, 2026-06-15). `/learn/*` + `/explore` are now live on www.kapyn.app.

Next, in order:
1. **Submit the sitemap to Google Search Console** *(founder action — the gate for ALL SEO/LLM visibility; nothing gets indexed until this is done).* search.google.com/search-console → add/verify property `kapyn.app` → Sitemaps → submit `sitemap.xml`.
2. **SEO / LLM-visibility build:** `llms.txt` + RSS feed + a syndication-draft generator (auto-produce Medium/Substack/dev.to posts from each explainer, with `rel=canonical` back to Kapyn).
3. **Quick-win user feedback** (see "User feedback" below): source+model attribution on AI summaries; tap summary → open the full source article.

**Housekeeping (not urgent):** rotate the temporary `CRON_SECRET` (`kapyntest123`) to a strong value (`openssl rand -hex 32`); verify the daily cron authenticates (routes check `x-cron-secret`/`?secret` — confirm Vercel's cron requests match).

---

## Active workstreams (branches & PRs)

| Branch | PR | What | Status |
|---|---|---|---|
| `main` | — | Production → www.kapyn.app | Live |
| `feat/knowledge-base-m1` | [#3](https://github.com/RahulUpadhyay3432/ai-changelog/pull/3) | Knowledge base M1 + design craft pass | ✅ **Merged** 2026-06-15 |
| `fix/api-rate-limiting` | [#4](https://github.com/RahulUpadhyay3432/ai-changelog/pull/4) | API rate limiting (Upstash) + input cap | ✅ **Merged** 2026-06-15 |

**Live:** `/learn/*` + `/explore` are on production → e.g. `https://www.kapyn.app/explore`, `https://www.kapyn.app/learn/rag`.

---

## ✅ Done

### Knowledge base M1 (PR #3 — merged)
- 5 durable Supabase tables (`entities`, `story_archive`, `entity_mentions`, `entity_explainers`, `digests`) + RLS + atomic upsert RPC — see `supabase/migrations/0001_knowledge_base.sql`.
- Entity extraction piggybacked on the existing ingestion LLM call (zero extra cost).
- Auto-generation route with self-critique + publish gating (`/api/knowledge/generate`, daily cron).
- Public reading pages: `/learn/[slug]` (concept explainers) + `/explore` (glossary hub), SSG/ISR, SEO + `DefinedTerm` JSON-LD.
- Sitemap + `/story/[id]` now read the durable `story_archive` (survives the 48h news rotation).
- Gemini adversarial review — 5 of 6 findings applied.

### Design foundations + craft pass (PR #3 — merged)
- `docs/design-foundations.md` — first-principles brief (16-platform teardown): the news→concept→comprehension white space, the literacy-map retention thesis, 7 design principles, implementation-ready craft spec.
- `/learn` + `/explore` elevated to that spec (typography, rhythm, hover craft, provenance trust line).

### API hardening (PR #4 — merged)
- `src/lib/ratelimit.ts` — shared Upstash sliding-window limiter (graceful in-memory fallback until env vars set).
- `/api/breakdown` + `/api/news/trigger` moved onto it; breakdown input size capped.

### Milestones completed
- ✅ Ran the SQL migration in Supabase (2026-06-15).
- ✅ Ran KB generation — all 15 seed concept pages published with explainers (2026-06-15).
- ✅ Merged PR #3 + #4 to production — `/learn` + `/explore` live on www.kapyn.app (2026-06-15).

---

## ⏳ Pending — dashboard actions (only the founder can do these)

- [ ] **Submit sitemap to Google Search Console** (gates all indexing — do this).
- [ ] Set Upstash env vars `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in Vercel (until then rate limiting uses the weak in-memory fallback). Free DB at console.upstash.com, or Vercel Marketplace integration.
- [ ] Set a **Gemini billing cap + budget alert** (Google Cloud Console) — the denial-of-wallet backstop.
- [ ] Rotate `CRON_SECRET` from `kapyntest123` to a strong value.
- [ ] (Optional) Enable Vercel Firewall.

---

## ▶️ Immediate next steps (ordered)

1. **Submit sitemap to GSC** (founder; gates SEO/LLM visibility).
2. **Build `llms.txt` + RSS feed** (helps GEO + syndication).
3. **Build the syndication-draft generator** (Medium/Substack/dev.to from explainers).
4. **Ship the two quick-win feedback items** (summary attribution; tap-to-open-source).
5. Wire Upstash + Gemini billing cap so rate limiting bites in prod.

---

## 🗣️ User feedback (early users — 2026-06-15)

From friends who used the app a few days ("pretty good… good app to read during transport" — a real qualitative retention signal). Triaged by effort:

**Quick wins (low effort, high alignment):**
- **Tag AI summaries with source + model** ("generated from this source using this model"). Aligns with the design-foundations "grounded, never generated-feeling" principle; we already do this on `/learn` pages (provenance line) — extend to feed summaries / breakdown.
- **Tap the summary → open the full source article.** Currently the card doesn't link out to `source_url`; add it.

**Medium bets (personalization / retention):**
- **Search** the news/corpus (relates to Ask Kapyn).
- **Read history** (relates directly to the literacy-map retention mechanic in design-foundations §4).
- **More topics + mute topics** (topic granularity + filtering).

**Strategic decision needed:**
- **Account sync / cross-device** — explicitly requested; would make it "a good app to read during transport." Requires auth, which is currently out of scope (localStorage only). Recurring ask → worth a real prioritization decision.

---

## 🗺️ Roadmap / backlog

- **Personal AI-literacy map** — highest-leverage retention mechanic (design-foundations §4). Collect which concepts a user reads (localStorage) before building UI. (Overlaps with "read history" feedback.)
- **M2** — `/tools/[slug]` pages (models/companies) + in-feed entity chips.
- **M3** — daily digest archive at `/digest/[date]` (the dated "blog" format; only the empty `digests` table exists today).
- **M4** — light `/admin` for content QA (publish/unpublish/edit explainers).
- **Ask Kapyn** (RAG chat) — high value; reintroduces per-request LLM cost/DoS → needs full rate-limit + billing-cap treatment first.

---

## 🔐 Security posture (quick reference)

- **The blog / knowledge base is inherently safe** — static (SSG/ISR), CDN-cached, cron-generated. Hammering `/learn/*` hits the cache, not the DB/LLM. Keep it static; do NOT add per-request dynamic/LLM endpoints to it.
- **LLM endpoints** (`/api/breakdown`) are the denial-of-wallet surface → rate-limited (PR #4) + input-capped. Billing cap is the backstop (pending).
- **On Vercel, DoS = denial-of-wallet + downstream exhaustion**, not a crashed server (it auto-scales).
- **Public anon key** lets anyone read public Supabase tables directly — cheap reads of public data; relevant when Ask Kapyn ships.

---

## 📎 Key files & references

- `docs/design-foundations.md` — the design/product brief (read before any UI work).
- `supabase/migrations/0001_knowledge_base.sql` — the KB schema (already run).
- `CLAUDE.md` / `AGENTS.md` — project conventions (Next.js 16 has breaking changes — read its docs before writing Next code).
- `outreach/linkedin-outreach.md` — LinkedIn outreach drafts.
- Repo: `RahulUpadhyay3432/ai-changelog`. Deploy: Vercel. Project dir: `/tmp/ai-changelog`.
