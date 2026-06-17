# RADAR v2 — The Calm, Opinionated Layer on Top of the Firehose. With Memory.

> Source: multi-agent research + PM synthesis (5 research angles — builders, vibe coders, founders, competitors, save-patterns — run through jobs-to-be-done, proto-persona, and opportunity-solution-tree). Written as the product direction for Radar v2.

**The one sentence:** Every other product shows you *motion* (GitHub/PH velocity) or *volume* (newsletters) and then forgets you. Radar shows you *meaning* — a verdict, in your language, that you can save into a knowledge base that doesn't rot. That four-way intersection (calm curation + a verdict + a personal toolkit + "what shipped AND what people say") is **unowned**, and it's the whole game.

**The non-negotiable principle that ties all 7 threads together:** today every tap in `RadarClient.tsx` is an `<a target="_blank">` that *ejects the user out of Kapyn*. A discovery product whose dominant interaction throws you to GitHub and never brings you back cannot become a habit. **Fixing the tap is the keystone.** Everything below hangs off it.

---

## 1. In-App Open + Redirect — the detail sheet is the keystone

**Recommendation:** Tapping any tool/entity opens an **in-app `RadarDetailSheet` first**; "Open site" is demoted to the *last*, secondary action. Bottom sheet (not a route, not an inline accordion) — portaled to `#phone-overlay-root`, `position: absolute`, reusing the `BreakdownSheet` pattern already in the codebase.

**Why:** Competitor research names this exact white space — GitHub/HF "show motion but never meaning," and no one merges "what shipped + what people say." Founders face "choice paralysis among near-identical tools" and rebuild evaluation context (alternatives, momentum, what-it-replaces) by hand. The OST scores this **14/15** and calls it the keystone — until the tap resolves *in-app*, save/commentary/resurfacing have no surface to live on.

**Detail view content + layout (top → bottom):**
1. **Header** — `FaceMark` + name + entity type chip + traction/source-count chip (the trust signal: "12 sources," "rising").
2. **Value line** — what it does (already on `RadarTool.valueLine`).
3. **Kapyn's Verdict** (the moat, thread 6) — one calm line, lens-aware: *does it matter / what to ignore / who it's for.*
4. **Maturity / staying-power flag** — `Production` / `Worth a look` / `Thin wrapper` / `Now native`. Directly answers obsolescence anxiety ("revolutionary in January, gone by March").
5. **What it replaces / alternatives** — the founder's decision context.
6. **The conversation** — one distilled sentence from HN/Reddit/Show HN ("builders love the DX, worried about licensing"). *Phase 2 — needs a discussion-fetch step.*
7. **Actions, in this order:** `Save` (primary), `Copy`, then `Open site →` (last).

**Build sequence:** Now: sheet shell + items 1-5 + Save/Copy/Open (all data exists). Next: Verdict + maturity flag from the existing LLM pipeline. Later: distilled discussion (new fetch + summarize).

---

## 2. Radar as Its Own Space — swap the bottom nav in Radar mode

**Recommendation:** Entering `/radar` is "entering my space," not "glancing at a tab." Swap the global 5-tab `BottomNav` for a **3-item Radar-mode nav**:

| Item | Icon | What it is |
|---|---|---|
| **Today** | Radar | The finishable hero deck + curated sections (the daily ritual). |
| **Toolkit** | Bookmark | The category-organized saved knowledge base (thread 3). |
| **Browse** | Compass | Category entries reusing the *essentials* categories (AI coding / Inference / Data & RAG / Agents & automation / Models & chat), **not** the 9 news slugs. |

A persistent small "← Kapyn" affordance returns to the global app so the user is never trapped.

**Why:** OST enabling bet (11/15) — Toolkit, Browse, and resurfacing all require Radar to be a space with internal nav. Rejected adding them as new *global* tabs (dilutes the 5-tab nav).

**Build sequence:** Now: segmented in-space nav (client state in `RadarClient`); Today + Toolkit. Next: Browse → essentials categories (exist already). Later: per-category "what changed" pulse.

---

## 3. Save / Productivity Playground — a habit, not a graveyard

**Recommendation:** Ship the **smallest sticky loop**, not "a place to dump saves." The loop is: **one-tap capture (zero filing) → automatic category placement → resurfacing → export (copy/email) that pulls you back.**

**Spec:**
1. **One-tap Save** on every Row/RailCard/Hero + the detail sheet. Optimistic toggle, fill animation, toast ("Saved to AI coding"), haptic. **No category picker, no tag modal** — organizing at save time is the #1 habit-killer.
2. **Auto-category — free, no LLM.** Category already lives on the object: `RadarTool.meta` ("AI coding"…) and `RadarItem.entity.entityType`. Copy it to `auto_category` on save. (The MyMind "save everything, it files itself" move — costs nothing.)
3. **Toolkit view = category-grouped, collapsible** (reuse `Row`). Never a flat reverse-chron list (where saves die). Full-text filter across name + value line.
4. **One-tap Copy** — paste-ready block: `Cursor — AI-native editor with agent mode. https://cursor.com (via Kapyn Radar)`. Plus "Copy all in this category."
5. **Email my toolkit to myself** — outbound, no auth: categorized digest to an address stored once in localStorage. The email *is the return trigger* and drops into Notion/Obsidian.

**Anti-graveyard guarantee (resurfacing):** weekly, silent-when-empty "Toolkit check-in" surfaces 3-5 tools unopened ~14d (decaying recency on `lastOpenedAt`). Calm binary: **"Still useful? Keep / Archive."** No streaks, no guilt.

**Why:** "Saving is too easy; *using* what you saved is the unsolved problem" (one user: saved 427, read 40 — "a pretty graveyard"). The investment layer is what Inshorts/Artifact never built. OST **15/15** — highest leverage, cheapest build (no LLM, no auth, mirrors `saveStory` in `storage.ts`).

**Build sequence:** Now: Save + auto-category + Toolkit + Copy (new key `kapyn_radar_saved_tools`, on-device; row shape designed so a Supabase table is later additive). Next: self-email digest + weekly check-in. Later (needs accounts): inbound forward-to-library email, cross-device sync.

---

## 4. Swipeable Hero Cards — exactly 5 types, finishable, ending on "Caught up"

**Recommendation:** Replace the single static Hero with a **finite 3-5 card swipe deck that ENDS** (reuse `CardStack`/Framer + `useReducedMotion`). No infinite scroll; the reward is *closure*.

**The 5 card TYPES (each grounded in a pain, each lens-aware):**
1. **THE BIG MOVE** — the single highest-traction entity. "If it mattered, it's here." → kills FOMO.
2. **NEW & WORTH A LOOK** — freshest GitHub/PH launch *with a one-line verdict* + must-try / watch / skip triage.
3. **WATCH OUT / STAYING POWER** — the *Protect* card: deprecation flag OR durable-vs-thin-wrapper-vs-now-native. The reason to open on a quiet day.
4. **IN YOUR STACK / FOR YOU** — a lens-relevant pick with a "because you build with X" reason.
5. **CAUGHT UP (closer)** — "That's what moved in your world today. You're current." + Save-all / Email-me. **Converts FOMO into a win-state.**

On a quiet day, collapse to 2-3 cards but **always end on CAUGHT UP**. Never manufacture cards.

**Why:** OST **13/15**. The caught-up closer turns the dominant pain (fatigue/FOMO) into the reward (closure) — the Inshorts completion-screen effect that drives return.

**Build sequence:** Now: finite deck + types 1, 4, 5 (data exists). Next: types 2 & 3 once verdict + maturity ship. Later: "Save-all from caught-up."

---

## 5. Category / Lens Naming — Vibe Coder / Builder / Founder + Exploring default

**Recommendation — THREE lenses (2-3 max), in job-vocabulary, plus a skippable default:**

| id | Label | Tagline |
|---|---|---|
| `vibe` | **Vibe Coder** | "I build apps with AI" |
| `builder` | **Builder** | "I ship AI into production" |
| `founder` | **Founder** | "I run the product / business" |
| `curious` | **Just exploring** | the **default**, pre-selected, skippable — not a co-equal card |

**Net diff vs live code:** split today's single `builder` into **Vibe Coder** (the non-dev majority) + **Builder** (engineers); keep Founder; make Exploring the explicit default. Small edits to `HEADLINE`/`PILLS` + the `RadarLens` union.

**Does "Founder" stay? Yes — but demoted from a self-pick.** The Founder *value* is real (re-frame as implication/threat/opportunity), but the *self-identification behavior is weak*: founders satisfice to 2-3 sources, and many are founder+builder hybrids who resent a sticky lens lock. So keep the frame, **never gate on it** — default to Exploring, let `?lens=` free-switch, nudge from behavior.

**Why "Vibe Coder":** the 63%-non-developer "vibe coder" is the largest, fastest-growing, hardest-to-reach wedge and their *own* (Collins Word-of-the-Year) self-label — out-recognizes any corporate term. Reserve playful microcopy for empty-states, not the lens label (stay calm-not-hype).

**Build sequence:** Now: rename + add `vibe`; Exploring default. Next: lens *re-frames the verdict*, not just re-orders. Later: behavioral lens-nudge.

---

## 6. Deeper Curation + Commentary — credibly + cheaply on the existing pipeline

**Recommendation:** Add a **structured Kapyn Verdict layer** — one calm line per card: *what shipped + Kapyn's take (does it matter / what to ignore / who it's for)*. Make it **lens-aware** so the SAME entity reads differently (Vibe: "is this for me / worth switching?"; Builder: "capability + fit + will it bite me?"; Founder: "what your team ships with"). Pair every traction chip with a one-line "why it matters." For the GitHub-merge job, distill the linked HN/Reddit thread to one sentence.

**How, credibly + cheaply:** extend the existing `valueLinePrompt`/`parseValueLine` in `src/lib/radar.ts` with a lens/verdict variant, **reuse the hold-rules** (if mushy, hold it — never ship), on the daily ingestion pass. Trust lever no incumbent can pull: **"no affiliate links, no paid placement on Radar."**

**Why:** the opinion layer *is* the durable moat; a lens that only re-filters identical summaries reproduces the too-deep-or-too-noisy failure. OST **12/15** — lower feasibility (value-line quality risk), so it ships lens-by-lens behind the detail sheet, never blocking the keystone.

---

## 7. Competitive Positioning — the wedge

| Incumbent | What it lacks | Radar's answer |
|---|---|---|
| GitHub Trending / HF | meaning (motion, no "why") | verdict + maturity flag per velocity signal |
| Product Hunt | trust (gamed, "AI slop") | un-gameable: no vote-to-rank, no paid placement |
| Ben's Bites / TLDR | memory (ephemeral, ~80% duplicate) | persistent toolkit + de-duped canonical card |
| a16z / Bessemer | timeliness (6-month rear-view) | the daily early-signal layer |

**The ONE thing Radar owns:** **"The calm, opinionated layer on top of the firehose — with memory."** No one else sits at the intersection of *calm curation + a personal knowledge base + commentary on raw updates + what-shipped-AND-what-people-say.* Lens-translation is the structural moat on top.

**Positioning line to test:** *"We watch the firehose so you don't have to — the few things that matter, in your language, saved where you'll actually find them again."*

---

## PRIORITIZED ROADMAP — the 4 highest-leverage moves
1. **In-app Detail Sheet** (keystone, OST 14/15). Stops the eject-and-never-return leak; hosts everything else. No backend.
2. **One-tap Save → auto-category Toolkit + Copy** (OST 15/15). The investment/retention layer. No LLM, no auth.
3. **Radar-as-a-space sub-nav** (Today / Toolkit / Browse). The container Toolkit + resurfacing need. Near-zero cost.
4. **Finishable 5-type hero deck ending on "Caught up"** (OST 13/15). Turns FOMO into the daily ritual.

*Then:* lens-aware Verdict layer → self-email + weekly resurfacing. *Lens rename ships alongside #1 (one-line union edit).*

## THE SINGLE RISKIEST ASSUMPTION
**That the saved Toolkit becomes a living, *revisited* knowledge base — not a prettier graveyard.** Resurfacing + export are what create the habit, and that's the mechanic with the least precedent in Kapyn's data.
**Kill-criterion (instrument now via PostHog — add `save`/`copy`/`resurface`/`email_toolkit` events):** if Toolkit revisit + resurfacing Keep/Archive engagement stay near zero within 2-3 weeks, the knowledge-base thesis is wrong → fall back to copy/email-as-export as the primary loop. *Secondary watch:* does "Vibe Coder" draw the predicted share, and does "Founder" ever get self-picked (if <10-15%, lean on behavioral inference)?
