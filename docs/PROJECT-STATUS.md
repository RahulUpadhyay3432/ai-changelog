# Kapyn — Project Status & Log

> **Living doc.** Single source of truth for "where are we and what's next." Update as steps complete.
> **Last updated:** 2026-06-19 — *Radar redesign **shipped to production** (PR #10 merged → main, merge commit `7105ceb`, Vercel prod green): bento browse, spotlight trending, colour foundation, real logos, MCP-and-skills catalog with a Skills tab, logo-less marks dropped. The entity-radar probe has graduated into the live radar surface.*
>
> **New-session read order:** (1) `CLAUDE.md` + `AGENTS.md` → (2) **this doc** → (3) `docs/design-foundations.md` + `docs/market-research.md` before any product/UI work.

---

## 👉 RIGHT NOW — the ONE open decision (everything hinges on this)

**Decide Kapyn's strategic direction**, because it gates almost everything below:

- **Option A — stay the calm AI-news app** (current live product: swipeable 30s news + the `/learn` knowledge base).
- **Option B — pivot to "the trusted companion for people building with AI" (vibe coders / AI builders).** Sharper, higher-pain, more differentiated. See `docs/market-research.md` for the full landscape.

**Where we landed (not yet committed):** the *problem* in Option B is real and huge (quantified in market research). The naive "build a vibe-coding security scanner SaaS" is a **trap** (lane filling fast + the "Ignorance-Risk Paradox" = people won't pay to prevent risks they don't perceive). The **viable** version for Kapyn is the **content/trust/no-paywall companion** that proactively surfaces *"what you didn't know to ask"* (security, cost, orchestration, what-changed) — sitting on Kapyn's existing DNA. **But validate with ~5 real builders before committing** (do they return to a destination, or just ask AI / run a $9 scanner?).

**Recommended next action:** run that validation (5 builder conversations), then commit to A or B. *Don't build more product surface until this is decided* — the design, the right-swipe space, and the big feedback items all change shape based on it.

### 📍 Movement (2026-06-17 session) — 4/5 builders → B; radar vision expanded + de-risked
- **4 of ~5 builder validations now in, all converging on the same axis: actionability** ("does this news let me *do* something / is it useful," not "what happened"). The 4th builder (Instagram) explicitly named story *curation/actionability* as the biggest differentiation opportunity — same point the other three made in different words. **One more conversation to formally commit, but the signal is now strong.**
- **Radar vision expanded from "entity radar" → a full *space* that packs all valuable things for an AI builder.** Derived from first principles: a builder lives with a *gap* between "best way to build with AI" and "how I build now"; the radar surfaces every event that changes that gap — the **7 triggers** (new / better-way / risk / cheaper / consensus / **deprecation** / **decision**). Two were missing from the old brief (deprecation + decision support) and are now added. Organized as verbs: **Discover · Protect · Decide · Learn · Cheaper.** The distinctive bet is **Protect** (vibe-coding security + deprecation alerts — the layer no AI news app has). **`docs/radar-feature.md` fully rewritten around this.** Sharpest v1 = **Discover + Protect.**
- **Radar gate run** (`/api/radar-gate`, headless, ₹0): 40 entities, names mostly sharp, good volume/mix → **conditional pass.** Three ₹0 data fixes identified before UI: suppress the broken `isNew` badge (first_seen_at = ingestion date, not launch), headline-match the value-line story (~20% currently describe the wrong entity), denylist junk + merge version fragments. **Next concrete step.**
- **Shipped this session:** breakdown ("why it matters") **cost fix** (missing `news_items.breakdown` column added → DB cache now works, near-zero LLM cost after warmup; prefetch trimmed 3→2) + **builder UI feedback** (tappable "Why it matters" w/ Sparkles icon, all Unicode arrows → Lucide SVG, iOS `100dvh` viewport fix). All on `main`, build green.

### 📍 Movement (2026-06-16 session) — leaning B, now with evidence + a live probe
- **2 of ~5 builder validations are in, both pointing at B** (unsolicited Instagram feedback — see Strategic context). One asked, unprompted, to *"follow OpenAI, Anthropic, Agents, Open Source"* + personalization + weekly recap. The other validated the concept and will share Kapyn to a dev broadcast channel. **Still need ~3 more conversations** before formally committing — and these are enthusiasm + idea-lists, *soft* signal, not proven willingness-to-return.
- **We shipped a deliberate, low-cost probe of B: the entity radar** (see Built this session). It rides Kapyn's *existing* entity-extraction rails, needs no auth, and is the cheapest way to test whether builders return to a destination. **This is the test, not a commitment.**
- **The compounding/retention thesis sharpened:** the durable "why come back" is **follow topics/players** ("what's new in *my* world that I'd miss"), not the read-history "reflection" idea — see Retention plan.
- **Immediate open call: the radar data-quality go/no-go** (below). Judge the live preview's entity names / one-liners / traction / volume → then either build follow + tap-through + design pass, or do an extraction/taxonomy sharpening pass first.

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
| `feat/radar-screen` | [#10](https://github.com/RahulUpadhyay3432/ai-changelog/pull/10) | **Radar redesign** — bento browse, spotlight trending, colour foundation, real logos, **MCP-and-skills catalog** (curated MCP servers + AI skills, segmented view), logo-less marks dropped | ✅ **Merged to main 2026-06-19** (merge commit `7105ceb`, Vercel prod green). The radar surface is now live. |
| `feat/entity-radar` | — (no PR) | **"On the radar"** entity-discovery surface — original Radar tab listing models/tools/companies by traction (`getRadarEntities()` mirrors `getLearnEntities()`) | ⤴️ **Superseded** — graduated into `feat/radar-screen` (the shipped redesign). Branch can be retired. |
| `feat/your-ai-read-history` | — (no PR yet) | localStorage read-history logging (`recordRead` on swipe) + "Your AI" Profile block (top areas, count, quietest-area nudge) | 🟠 **Pushed (`0dfb0c2`), no PR.** Logging is a fine cheap foundation; the *displayed reflection block* was reconsidered (founder: low value) — **superseded by the radar's "follow" as the retention mechanic.** Keep logging, reconsider the UI. |
| `feat/india-sources` | [#9](https://github.com/RahulUpadhyay3432/ai-changelog/pull/9) | Added Indian AI sources to ingestion: **India AI** (Google News AI+India query — the "miss nothing" net, catches AIM/NDTV/Forbes India), **ET CIO** (AI-scoped enterprise), **Inc42** (startups/funding, capped 8) | ✅ **Merged to main 2026-06-16.** Root cause of "no Indian AI news": feed had 20+ sources, zero Indian. Takes effect after production deploy + ingestion run. |

---

## ✅ Shipped & live (production = www.kapyn.app)
- **Radar redesign** (PR #10, merged 2026-06-19): the radar is now a full discovery surface — **bento browse** grid, **spotlight trending**, a calm colour/gold foundation, **real brand logos** (via same-origin `/api/favicon` proxy), per-category accents, and the **"MCP and skills"** catalog at `/radar/mcp` (curated MCP servers enriched with live GitHub stars + a curated AI-skills catalog grouped by use-case, behind a `[MCP servers] [Skills]` segmented toggle). Logo-less marks render nothing (no first-letter boxes). Static curated `.ts` catalogs — no new DB/ingestion.
- **Knowledge base M1**: `/learn/[slug]` + `/explore`, 5 durable Supabase tables, auto-generation cron with self-critique gating, sitemap + JSON-LD. All 15 seed concepts published. Migration run.
- **SEO/LLM discovery**: `/llms.txt` + `/feed.xml` live; sitemap confirmed in Google Search Console (Success, 208 pages).
- **API hardening**: Upstash rate limiting + input cap on `/api/breakdown` + `/api/news/trigger` (`src/lib/ratelimit.ts`).
- **Feed cleanup**: removed the notification-prompt card + the Elon/insight card; feed is now news-only.
- **Feedback quick wins**: tap summary → opens source article; card footer shows "AI summary · Gemini 2.5 Flash Lite" + source.

---

## 🆕 Built this session (2026-06-16, on branches — NOT yet merged/live)

### `feat/entity-radar` — "On the radar" (the lead build)
- **What:** a new **Radar** bottom-nav tab (server-rendered `src/app/(app)/radar/page.tsx`) that surfaces the named **models / tools / companies** moving in AI now, grouped by type and ranked by recency + `mention_count` (how many sources cover it = traction).
- **Key insight that made it cheap:** ingestion *already* extracts these entities daily into the Supabase `entities` table (`/api/news/fetch` → up to 6 named entities per story); **nothing rendered the model/tool/company types.** Added `getRadarEntities()` to `src/lib/knowledge.ts` — a direct mirror of the existing `getLearnEntities()` (which serves the concept/technique glossary). No new pipeline, no auth, no migration.
- **👉 OPEN — data-quality go/no-go (the immediate decision):** look at the live preview on phone and judge: are entity **names sharp**, **one-liners useful**, **ranking interesting**, **volume enough**?
  - **Sharp →** add **tap-through to source stories** + **follow** (OpenAI / Anthropic / Agents / Open Source — localStorage like feed prefs; the compounding retention hook), then a news-app-referenced **design pass**.
  - **Mushy →** **sharpen extraction/taxonomy first** before more UI.
- **Known gap:** the `entity_type` enum is `model/tool/company/technique/concept` — so **"Agents" and "Open Source" are NOT first-class types; they're buried inside `tool`.** The two lenses builders most want need a sharpening pass (extend taxonomy or derive from source/description).
- **Provisional choices:** it's a nav **tab** (not the eventual swipe-right panel) and rows aren't tappable yet — both deliberate, to get real data in hand fast.

### `feat/your-ai-read-history` — read-history + "Your AI" block
- `recordRead()`/`getReadHistory()` in `src/lib/storage.ts` (capped, deduped, SSR-safe — mirrors the streak pattern), fired in `CardStack` on swipe; a "Your AI" section on Profile (top areas + count + quietest-area nudge).
- **Reconsidered:** founder feels a *reflection* surface ("you read N, here are your topics") doesn't add real value — people know what they know. **Logging stays as a cheap foundation; the displayed block is parked.** The radar's **follow** replaces it as the retention bet.

### Side outputs (not code)
- Drafted a **LinkedIn post** + DM about Nelson Lee's "Concentric Circles of AI" Substack note (a model-choice framework: be only as close to the frontier as your closest competitor; upgrade on cost-crossover). Nelson is a potential contributor for the eventual "which model / cost-effective stack" comparison layer.

---

## 🧭 Strategic context (the thinking behind the open decision)

- **Value > UI.** UI is copyable; value is not. We spent hours polishing chrome on *commodity* content ("what is RAG" = available everywhere). That, not the visuals, is the real "I won't come back" problem.
- **The "just ask AI" objection (the central risk):** AI chat owns *answers*. So Kapyn's value cannot be "look up answers." It must be **the question you didn't know to ask + trust it's right/current + a curated POV + proactive** — things AI chat structurally can't be (it's reactive, non-committal, ephemeral, sometimes confidently wrong). AI's proliferation is the *tailwind* (more builders shipping with hidden risks).
- **Market research verdict (`docs/market-research.md`):** "partially taken." Security-scanner lane filling (UNPWNED, Vibe App Scanner, GitGuardian/Codacy). The *trusted content/companion* position is open. Demand is massive (r/vibecoding ~559k weekly; 65% of vibe-coded apps have security defects; $12k surprise bills; CVE-2025-48757). But the **Ignorance-Risk Paradox** kills a paid-prevention SaaS → Kapyn's edge is a **content/brand/no-paywall** play, monetized via audience, not fear-insurance.
- **Builder validation in progress (2/~5, both → B):** unsolicited Instagram feedback.
  - **Person 2** (real builder): *"swipeable format + Why it matters make AI news easy to consume."* Asked for **personalized feeds (Builder/Founder/Researcher), follow topics (OpenAI / Anthropic / Agents / Open Source), source-credibility labels, more practical Why-it-matters, weekly recap.** Said **personalization is the next feature**; will **share Kapyn in his dev broadcast channel** (real distribution signal). → 3 of his 5 ideas collapse into the **entity radar**.
  - **Person 1 (Nelson Lee):** *"like the content"* but **the UX looks generic ("Claude UI")** — suggested **Mobbin + news-app references** to give it identity. (Diagnoses the same problem that got PR #6 rejected; names the *right adjacency* — see Design status.) Also wrote a sharp model-choice framework ("Concentric Circles of AI").
  - **Discipline note:** treat Person 2's 5 ideas as **2 jobs** (personalized discovery + better breakdowns), not 5 features — avoid Artifact-style feature creep. These are *soft* signals (friendly enthusiasm), still need ~3 more + a willingness-to-return read.

---

## 🎨 Design status (IMPORTANT — read before any UI work)
- **The `/learn` + `/explore` redesign on PR #6 was rejected** — looked "fine but generic / wouldn't return." Root cause: **I designed from text descriptions, not visual references** (web search was blocked during research, so I worked from specs, not screenshots). Lesson: **never design without real reference images.**
- **There IS a full design-skill library at `.agents/skills/`** (`high-end-visual-design`, `impeccable` [craft/polish/typography refs], `web-design-guidelines`, `design-taste-frontend`) + `.continue/skills/ui-ux-pro-max` (has a `scripts/search.py --design-system` generator). **USE THESE.** They were missed initially.
- **Reference screenshots saved to `/home/rahul/kapyn-design-references/`** (7 PNGs: linear, anthropic, every, vercel, stripe-docs, brilliant; stripe-press blank). **Lesson: those were the WRONG adjacency** (SaaS/product/docs sites). The right references are **exploration/understanding destinations** (where people go to learn/explore/solve): AI newsletters, Wikipedia/Investopedia, Perplexity, etc. — NOT product landing pages.
- **Screenshot capability exists:** `/snap/bin/chromium --headless=new --screenshot=...` works (write to `/home/rahul/...`, NOT `/tmp` — snap has a private `/tmp`). Use `dangerouslyDisableSandbox` for network.
- **Next design step:** founder sends (or we capture) references from the *right adjacency*, then redesign `/learn`+`/explore` to MATCH a chosen reference — and run it through the `.agents` design skills. Don't guess.
- **🆕 Builder-named reference source (2026-06-16):** Nelson Lee independently flagged the app as looking like generic **"Claude UI"** and suggested **[Mobbin](https://mobbin.com)** (real-app screenshot library) filtered to **news apps** — i.e. capture *news-app* references and design against them. This is the right adjacency, concretely sourced. **Applies to both the PR #6 redo AND the new radar surface's eventual design pass** (build the radar's value first, polish with references second — do not front-load chrome).

---

## 🔁 Retention plan (value-first)
Honest principle: **retention follows value, not mechanics** (Inshorts/Artifact had push+streaks+great UX and died on commodity value). The 3 direction-independent, cheap moves to do meanwhile:
1. **Measure** — set up a PostHog retention report (D1/D7/D30, return cadence). Currently flying blind (~2–20 DAU).
2. **A trigger** — an owned re-engagement channel: daily/weekly **email brief** (durable; works regardless of pivot) or activate the dormant **push** (built; needs VAPID + a new opt-in spot since the in-feed prompt was removed).
3. **Investment** — ~~start logging **read-history**~~ **DONE this session** (`feat/your-ai-read-history`). But the leading investment/retention bet has shifted from a *literacy map* to **follow topics/players** (the radar's "follow") — "what's new in my world" pulls returns harder than "reflect on what you read." Read-history logging still useful as a cheap signal; the displayed map is parked.
- **Do NOT** build guilt-gamification (off-brand for "calm intelligence").

---

## 🗺️ Backlog / ideas
- **Right-swipe space** (gesture currently unused): the **entity radar** (`feat/entity-radar`) is the concrete first instantiation — currently a nav tab, intended to graduate into the swipe-right panel once its content proves out. Eventual surface = radar + follow + explore + saved + (later) Ask Kapyn; optionally contextual (swipe-right-on-story → the entity/concept behind it). **Do NOT copy Inshorts' cluttered tab-soup + word game.**
- **M2 entity work is now in flight** via the radar (reads the `entities` graph). Remaining M2: `/tools/[slug]` deep pages + in-feed entity chips + radar tap-through + **follow**.
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
- Repo: `RahulUpadhyay3432/ai-changelog`. Deploy: Vercel. **Main working clone: `/home/rahul/projects/ai-changelog`** (persistent). ⚠️ A throwaway `/tmp/ai-changelog` checkout was used earlier this session and got wiped on reboot — **always work in the `/home/rahul/projects` clone**; everything important is pushed to GitHub regardless.
