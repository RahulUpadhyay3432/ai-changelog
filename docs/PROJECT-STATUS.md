# Kapyn — Project Status & Log

> **Living doc.** Single source of truth for "where are we and what's next." Update as steps complete.
> **Last updated:** 2026-06-15

---

## 👉 RIGHT NOW — the next action

**Run knowledge-base generation, then verify the `/learn` pages look good, then merge.**

```
GET  https://<preview-url>/api/knowledge/generate?secret=YOUR_CRON_SECRET
```
This fills the seed concept pages with real explainers (definition / why it matters / how it works). Requires `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (route hard-fails without it).

After it runs → open `/learn/rag`, `/learn/embeddings`, `/learn/agents` on the preview and confirm the sections + provenance line render. Then proceed to merging (see Immediate Next Steps).

---

## Active workstreams (branches & PRs)

| Branch | PR | What | Status |
|---|---|---|---|
| `main` | — | Production → www.kapyn.app | Live |
| `feat/knowledge-base-m1` | [#3](https://github.com/RahulUpadhyay3432/ai-changelog/pull/3) | Knowledge base M1 + design craft pass | **Open**, preview green, not merged |
| `fix/api-rate-limiting` | [#4](https://github.com/RahulUpadhyay3432/ai-changelog/pull/4) | API rate limiting (Upstash) + input cap | **Open**, ready to merge |

**Preview URL (branch `feat/knowledge-base-m1`):**
`https://ai-changelog-git-feat-89ae9f-rahul-upadhyays-projects-8dd82149.vercel.app`
*(`/learn/*` and `/explore` only exist on this branch — not on production yet.)*

---

## ✅ Done

### Knowledge base M1 (PR #3)
- 5 durable Supabase tables (`entities`, `story_archive`, `entity_mentions`, `entity_explainers`, `digests`) + RLS + atomic upsert RPC — see `supabase/migrations/0001_knowledge_base.sql`.
- Entity extraction piggybacked on the existing ingestion LLM call (zero extra cost).
- Auto-generation route with self-critique + publish gating (`/api/knowledge/generate`, daily cron).
- Public reading pages: `/learn/[slug]` (concept explainers) + `/explore` (glossary hub), SSG/ISR, SEO + `DefinedTerm` JSON-LD.
- Sitemap + `/story/[id]` now read the durable `story_archive` (survives the 48h news rotation).
- Gemini adversarial review — 5 of 6 findings applied.

### Design foundations + craft pass (PR #3)
- `docs/design-foundations.md` — first-principles brief (16-platform teardown): the news→concept→comprehension white space, the literacy-map retention thesis, 7 design principles, implementation-ready craft spec.
- `/learn` + `/explore` elevated to that spec (typography, rhythm, hover craft, provenance trust line).

### API hardening (PR #4)
- `src/lib/ratelimit.ts` — shared Upstash sliding-window limiter (graceful in-memory fallback until env vars set).
- `/api/breakdown` + `/api/news/trigger` moved onto it; breakdown input size capped.

### User actions completed
- ✅ Ran the SQL migration in Supabase (2026-06-15).

---

## ⏳ Pending — dashboard actions (only the founder can do these)

- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (needed for generation).
- [ ] Run generation (see "Right Now" above) to populate `/learn` pages.
- [ ] Set Upstash env vars `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in Vercel (until then rate limiting uses the weak in-memory fallback). Free DB at console.upstash.com, or Vercel Marketplace integration.
- [ ] Set a **Gemini billing cap + budget alert** (Google Cloud Console) — the denial-of-wallet backstop.
- [ ] (Optional) Enable Vercel Firewall.

---

## ▶️ Immediate next steps (ordered)

1. **Run generation** → verify `/learn/*` pages are populated and look right on the preview.
2. **Merge PR #4** (rate limiting) → `main`. Independent and safe; can go anytime.
3. **Merge PR #3** (KB + craft) → `main` once `/learn` looks good populated → goes live on www.kapyn.app. Submit sitemap to Google Search Console after.
4. **Wire Upstash + Gemini billing cap** so the rate limiting actually bites in prod.

---

## 🗺️ Roadmap / backlog (after M1 ships)

- **Personal AI-literacy map** — the highest-leverage retention mechanic (see design-foundations §4). Start by collecting which concepts a user has read (localStorage) before building the UI.
- **M2** — `/tools/[slug]` pages (models/companies) + in-feed entity chips (`EntityChips.tsx` + `NewsCard`).
- **M3** — daily digest archive (the "blog" index) at `/digest/[date]`.
- **M4** — light `/admin` for content QA (publish/unpublish/edit explainers).
- **Ask Kapyn** (RAG chat over the news) — high value, but reintroduces the per-request LLM cost/DoS threat → needs the full rate-limit + billing-cap treatment first.

---

## 🔐 Security posture (quick reference)

- **The blog / knowledge base is inherently safe** — static (SSG/ISR), CDN-cached, cron-generated. Hammering `/learn/*` hits the cache, not the DB/LLM. Keep it static; do NOT add per-request dynamic/LLM endpoints to it.
- **LLM endpoints** (`/api/breakdown`) are the denial-of-wallet surface → rate-limited (PR #4) + input-capped. Billing cap is the backstop (pending).
- **On Vercel, DoS = denial-of-wallet + downstream exhaustion**, not a crashed server (it auto-scales).
- **Public anon key** lets anyone read public Supabase tables directly (bypassing the rate-limited API) — cheap reads of public data, acceptable; relevant when Ask Kapyn ships.

---

## 📎 Key files & references

- `docs/design-foundations.md` — the design/product brief (read before any UI work).
- `supabase/migrations/0001_knowledge_base.sql` — the KB schema (already run).
- `CLAUDE.md` / `AGENTS.md` — project conventions (note: Next.js 16 has breaking changes — read its docs before writing Next code).
- `outreach/linkedin-outreach.md` — LinkedIn outreach drafts.
- Repo: `RahulUpadhyay3432/ai-changelog`. Deploy: Vercel. Project dir: `/tmp/ai-changelog`.
