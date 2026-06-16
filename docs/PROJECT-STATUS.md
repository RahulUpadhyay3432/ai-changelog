# Kapyn — Project Status & Log

> **Living doc.** Single source of truth for "where are we and what's next." Update as steps complete.
> **Last updated:** 2026-06-16
>
> **New-session read order:** (1) `CLAUDE.md` + `AGENTS.md` → (2) **this doc** → (3) `docs/design-foundations.md` + `docs/market-research.md` before any product/UI work.

---

## 👉 RIGHT NOW — the ONE open decision (everything hinges on this)

**Decide Kapyn's strategic direction**, because it gates almost everything below:

- **Option A — stay the calm AI-news app** (current live product: swipeable 30s news + the `/learn` knowledge base).
- **Option B — pivot to "the trusted companion for people building with AI" (vibe coders / AI builders).** Sharper, higher-pain, more differentiated. See `docs/market-research.md` for the full landscape.

**Where we landed (not yet committed):** the *problem* in Option B is real and huge (quantified in market research). The naive "build a vibe-coding security scanner SaaS" is a **trap** (lane filling fast + the "Ignorance-Risk Paradox" = people won't pay to prevent risks they don't perceive). The **viable** version for Kapyn is the **content/trust/no-paywall companion** that proactively surfaces *"what you didn't know to ask"* (security, cost, orchestration, what-changed) — sitting on Kapyn's existing DNA. **But validate with ~5 real builders before committing** (do they return to a destination, or just ask AI / run a $9 scanner?).

**Recommended next action:** run that validation (5 builder conversations), then commit to A or B. *Don't build more product surface until this is decided* — the design, the right-swipe space, and the big feedback items all change shape based on it.

---

## Active workstreams (branches & PRs)

| Branch | PR | What | Status |
|---|---|---|---|
| `main` | — | Production → www.kapyn.app | Live |
| `feat/knowledge-base-m1` | [#3](https://github.com/RahulUpadhyay3432/ai-changelog/pull/3) | KB M1 + craft pass | ✅ Merged |
| `fix/api-rate-limiting` | [#4](https://github.com/RahulUpadhyay3432/ai-changelog/pull/4) | Rate limiting (Upstash) + input cap | ✅ Merged |
| `feat/seo-llms-rss` | [#5](https://github.com/RahulUpadhyay3432/ai-changelog/pull/5) | `/llms.txt` + `/feed.xml` | ✅ Merged |
| `fix/remove-feed-cards` | [#7](https://github.com/RahulUpadhyay3432/ai-changelog/pull/7) | Removed notification + Elon/insight cards from feed | ✅ Merged |
| `fix/feedback-quickwins` | [#8](https://github.com/RahulUpadhyay3432/ai-changelog/pull/8) | Tap-summary→source + model attribution | ✅ Merged |
| `feat/desktop-layout` | [#6](https://github.com/RahulUpadhyay3432/ai-changelog/pull/6) | Desktop 3-col `/learn` + `/explore` + AppCta + **editorial-serif redesign** | ⚠️ **OPEN, NOT merged — design rejected by founder, needs reference-driven redo (see Design status)** |

---

## ✅ Shipped & live (production = www.kapyn.app)
- **Knowledge base M1**: `/learn/[slug]` + `/explore`, 5 durable Supabase tables, auto-generation cron with self-critique gating, sitemap + JSON-LD. All 15 seed concepts published. Migration run.
- **SEO/LLM discovery**: `/llms.txt` + `/feed.xml` live; sitemap confirmed in Google Search Console (Success, 208 pages).
- **API hardening**: Upstash rate limiting + input cap on `/api/breakdown` + `/api/news/trigger` (`src/lib/ratelimit.ts`).
- **Feed cleanup**: removed the notification-prompt card + the Elon/insight card; feed is now news-only.
- **Feedback quick wins**: tap summary → opens source article; card footer shows "AI summary · Gemini 2.5 Flash Lite" + source.

---

## 🧭 Strategic context (the thinking behind the open decision)

- **Value > UI.** UI is copyable; value is not. We spent hours polishing chrome on *commodity* content ("what is RAG" = available everywhere). That, not the visuals, is the real "I won't come back" problem.
- **The "just ask AI" objection (the central risk):** AI chat owns *answers*. So Kapyn's value cannot be "look up answers." It must be **the question you didn't know to ask + trust it's right/current + a curated POV + proactive** — things AI chat structurally can't be (it's reactive, non-committal, ephemeral, sometimes confidently wrong). AI's proliferation is the *tailwind* (more builders shipping with hidden risks).
- **Market research verdict (`docs/market-research.md`):** "partially taken." Security-scanner lane filling (UNPWNED, Vibe App Scanner, GitGuardian/Codacy). The *trusted content/companion* position is open. Demand is massive (r/vibecoding ~559k weekly; 65% of vibe-coded apps have security defects; $12k surprise bills; CVE-2025-48757). But the **Ignorance-Risk Paradox** kills a paid-prevention SaaS → Kapyn's edge is a **content/brand/no-paywall** play, monetized via audience, not fear-insurance.

---

## 🎨 Design status (IMPORTANT — read before any UI work)
- **The `/learn` + `/explore` redesign on PR #6 was rejected** — looked "fine but generic / wouldn't return." Root cause: **I designed from text descriptions, not visual references** (web search was blocked during research, so I worked from specs, not screenshots). Lesson: **never design without real reference images.**
- **There IS a full design-skill library at `.agents/skills/`** (`high-end-visual-design`, `impeccable` [craft/polish/typography refs], `web-design-guidelines`, `design-taste-frontend`) + `.continue/skills/ui-ux-pro-max` (has a `scripts/search.py --design-system` generator). **USE THESE.** They were missed initially.
- **Reference screenshots saved to `/home/rahul/kapyn-design-references/`** (7 PNGs: linear, anthropic, every, vercel, stripe-docs, brilliant; stripe-press blank). **Lesson: those were the WRONG adjacency** (SaaS/product/docs sites). The right references are **exploration/understanding destinations** (where people go to learn/explore/solve): AI newsletters, Wikipedia/Investopedia, Perplexity, etc. — NOT product landing pages.
- **Screenshot capability exists:** `/snap/bin/chromium --headless=new --screenshot=...` works (write to `/home/rahul/...`, NOT `/tmp` — snap has a private `/tmp`). Use `dangerouslyDisableSandbox` for network.
- **Next design step:** founder sends (or we capture) references from the *right adjacency*, then redesign `/learn`+`/explore` to MATCH a chosen reference — and run it through the `.agents` design skills. Don't guess.

---

## 🔁 Retention plan (value-first)
Honest principle: **retention follows value, not mechanics** (Inshorts/Artifact had push+streaks+great UX and died on commodity value). The 3 direction-independent, cheap moves to do meanwhile:
1. **Measure** — set up a PostHog retention report (D1/D7/D30, return cadence). Currently flying blind (~2–20 DAU).
2. **A trigger** — an owned re-engagement channel: daily/weekly **email brief** (durable; works regardless of pivot) or activate the dormant **push** (built; needs VAPID + a new opt-in spot since the in-feed prompt was removed).
3. **Investment** — start logging **read-history** in localStorage → foundation for the **personal literacy/learning map** (the durable retention mechanic; also a friend's request).
- **Do NOT** build guilt-gamification (off-brand for "calm intelligence").

---

## 🗺️ Backlog / ideas
- **Right-swipe space** (gesture currently unused): make it the **"understand & grow / Your AI"** surface — your literacy map + explore + saved + (later) Ask Kapyn; optionally contextual (swipe-right-on-story → the concept behind it). **Do NOT copy Inshorts' cluttered tab-soup + word game.** Direction-dependent (becomes "your builds" if Option B).
- **Parked feedback (direction-dependent):** search, more/mute topics, **account sync** (= auth + backend — don't build until strategy decided).
- **Personal AI-literacy map** — highest-leverage retention mechanic (design-foundations §4).
- **M2** `/tools/[slug]` + in-feed entity chips · **M3** `/digest/[date]` · **M4** light `/admin` · **Ask Kapyn** (RAG; needs rate-limit + billing cap first).

---

## ⏳ Pending — founder dashboard actions
- [ ] Set **`kapyn.app` as PRIMARY domain** in Vercel (apex 307-redirects to www; canonicals use apex).
- [ ] Set Upstash env vars (`UPSTASH_REDIS_REST_URL` + `_TOKEN`) — else rate limiting uses weak in-memory fallback.
- [ ] Set a **Gemini billing cap** (Google Cloud) — denial-of-wallet backstop.
- [ ] Rotate `CRON_SECRET` from `kapyntest123` to a strong value.

---

## ⚙️ Working notes (cost + tooling)
- **Model tiering** to control cost: **Sonnet** for routine coding/edits; **Opus** (plain, not `[1m]`) only for planning/architecture/review/hard judgment. Drop `[1m]` unless huge context needed.
- **Offload to GPT/Gemini Deep Research:** market research, content drafts, isolated/well-specified tasks. **Keep in Claude:** repo-aware build, integration, review, taste.
- Local `next build` **OOMs** this machine (closes the editor) — rely on the Vercel build gate; use `tsc --noEmit` / `eslint <file>` for local checks.

---

## 🔐 Security posture (quick reference)
- The KB/blog is inherently safe — static (SSG/ISR), CDN-cached, cron-generated. Keep it static.
- LLM endpoints (`/api/breakdown`) are the denial-of-wallet surface → rate-limited + capped; billing cap pending.
- Public anon key allows direct reads of public Supabase tables — acceptable (public data).

---

## 📎 Key files & references
- `docs/design-foundations.md` — design/product brief (read before UI).
- `docs/market-research.md` — vibe-coder/AI-builder competitive landscape + synthesis.
- `/home/rahul/kapyn-design-references/` — saved reference screenshots (note: wrong adjacency — recapture exploration destinations).
- `.agents/skills/` + `.continue/skills/ui-ux-pro-max` — design skills (USE THEM).
- `supabase/migrations/0001_knowledge_base.sql` — KB schema (run).
- Repo: `RahulUpadhyay3432/ai-changelog`. Deploy: Vercel. Dir: `/tmp/ai-changelog` (⚠️ `/tmp` wipes on reboot — everything important is pushed to GitHub).
