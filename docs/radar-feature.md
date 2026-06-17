# Kapyn Radar — Feature Brief

*The definitive "what is this" document for Kapyn's flagship feature. Written so anyone — engineer, designer, investor, or a friend — can fully understand what the radar is, what it contains, how it works, and why it matters.*

> Status: spec / pre-build. The data engine it rides (the `entities` knowledge graph + the daily news pipeline) already exists and is populated daily. The radar is the **space** that turns those signals into value. A headless "gate" (`/api/radar-gate`) already dumps the raw entity feed so we can judge data quality before building UI — see §15.

---

## 1. In one line

**Kapyn Radar is the space a builder opens to stay ahead of AI — it watches the whole landscape for you and surfaces only the things that change what you can *do*: the new tool you should use, the unsafe code you're about to ship, the model you depend on that's being deprecated, the cheaper way to do what you already do.**

It is not a news feed of tools. It is **the filter between the firehose of AI and you.**

---

## 2. The 30-second version

Every day, the AI field moves: new models, new tools, new techniques, new risks, new prices. Most builders cope by drowning — 40 tabs, 6 newsletters, 60 people on X — and still feel behind, because none of it is filtered to *them* and none of it knows what they're actually building.

The radar replaces that. You tell it what you build with (once, in 30 seconds). From then on, opening the radar is opening **a calm, ranked space of everything that matters to your corner of AI** — what's new you can use, how to do it well, what to watch out for, what's getting cheaper — each item framed around *what it lets you do or protects you from*, with dated sources one tap away.

The promise: **"you are not unknowingly behind, exposed, or overpaying — and when something changes what you do, you'll know, and you'll know what to do about it."**

---

## 3. First principles — why these things, and why *all* of them

Strip the product to its core. A builder lives with a gap between **"the current best way to build with AI"** and **"how I'm building right now."** That gap silently widens every week. Falling into it has real stakes: wasted time, money burned on the wrong model, a security hole shipped, a competitor moving faster.

So the radar has exactly one job:

> **Surface every event that changes that gap — so the builder is never *unknowingly* behind, exposed, or overpaying.**

Derive every *kind* of event that changes the gap, and you get the complete content set — no more, no less. These are the **7 triggers**:

| # | Event that changes your gap | What it does for you |
|---|---|---|
| 1 | Something **new** you could use | A new capability narrows the gap if you adopt it |
| 2 | A **better way** to do what you already do | Know-how narrows the gap |
| 3 | A **risk** in how you build | You're unknowingly exposed — close it |
| 4 | A **cheaper** way | You're overpaying — switch |
| 5 | A **shift in consensus / direction** | You're drifting from where the field is going |
| 6 | Something you **depend on is changing** (deprecation / breakage) | Your ground is shifting — migrate before it breaks |
| 7 | A **fork where you must choose** | You might pick wrong — here's the current best call |

Everything the radar shows must be one of these seven. If a story isn't one of them, it's noise (the "smart fridge" news) and the radar suppresses it. This is what makes the radar *complete* without becoming a junk drawer.

---

## 4. The organizing principle — the actionability test

The single rule that keeps the space sharp, applied to every item before it ships:

> **"Can I act on this? Does it make my AI work better, safer, cheaper, or more current?"**

If yes → it earns a place. If it's merely *informative* ("OpenAI announced X") with nothing to do about it → it's coverage, not value, and it's held back. **Value over coverage** is the moat: ChatGPT and Google News tell you *what happened*; the radar tells you *what to do about it*.

And everything is filtered to **your stack** — so it's "all valuable things *for you*," not "all things in AI."

---

## 5. Who it's for

**The operator/builder who ships with AI** — the engineer, the technical founder, the product person wiring LLMs into a real product. They have something *at risk* (their product, costs, competitive position, the security of what they ship), which is what makes staying current matter enough to form a daily habit.

- **The builder** needs to *use* the new thing safely — "what does this let me do, does it fit my stack, and will it bite me."
- **The founder/operator** needs to *talk about* it credibly — "what's moving, what should I have an opinion on."
- (Secondary: the curious learner who wants to feel current — served, not core.)

The unifying trait: they're not browsing for entertainment. They have a stake, and the radar protects it.

---

## 6. What the space contains — the value buckets

The 7 triggers group into a handful of **verbs**. This is how the space is organized for the user:

- **Discover** *(triggers 1, 5)* — what's new you can use, and what's gaining consensus. The "I didn't know that existed" hit.
- **Protect** *(triggers 3, 6)* — security and correctness for what you ship, **and** deprecation/breakage of things you depend on. Don't get burned, don't get broken.
- **Decide** *(trigger 7)* — "which tool/model for your job, and the tradeoff." Decision support.
- **Learn** *(trigger 2)* — patterns, recipes, and how-to for doing it well.
- **Cheaper** *(trigger 4)* — cost and efficiency signals; "switch and halve your bill."

Concrete examples, one per verb:

| Verb | Example card |
|---|---|
| Discover | *"Cursor agent mode now edits across files — cut your refactor time."* |
| **Protect** ⭐ | *"Before you ship AI-generated code: 4 checks (leaked keys, injection, auth)."* · *"OpenAI is sunsetting model X in 30 days — your feature uses it, migrate."* |
| Decide | *"For RAG over PDFs, the current best stack is X — here's the tradeoff vs Y."* |
| Learn | *"Your retrieval returns garbage? Here's the chunking fix."* |
| Cheaper | *"Gemini Flash dropped 40% — for summarization, switch."* |

---

## 7. The distinctive bet — "Protect"

Of the five verbs, **Protect is the most distinctly Kapyn** and the strongest differentiator. No AI news app tells a vibe-coder: *"the code your AI just wrote probably leaks secrets — here's how to check,"* or *"the model you depend on is being sunset — migrate now."*

This is pure actionability tied to real stakes — it protects the user's product, costs, and reputation. It also spans both halves of "the gap silently widening":
- **Don't get burned** — security, correctness, evals, common failure modes in AI-generated code.
- **Don't get broken** — deprecations, breaking changes, model sunsets in things you already rely on.

Protect is the reason a builder opens the radar even on a quiet news day: not for novelty, but for the *safety check before they ship.* That's a habit news alone can't create.

---

## 8. What you actually see — the space

The radar is its own **full space** (opens via the tab today; eventually a swipe-right "world"). Content is arranged most-valuable-and-most-personal first, so the 3-second glance lands on something that matters.

**For a personalized user ("My Radar"):**
- **Header + the hook line** — "3 things changed in your world today." Personal, fresh, varies every visit.
- **A "My world / All" toggle** — your filtered radar vs. everything moving in AI.
- **For your stack** *(Discover)* — new things relevant to what you build with, each with a relevance reason ("because you build with vLLM").
- **Watch out** *(Protect)* — security checks and deprecations tied to your stack. The section nobody else has.
- **Worth knowing** *(Learn / Decide)* — a how-to or a "which-for-what" relevant to what you're doing.
- **Gaining consensus** *(Discover)* — what multiple sources are converging on this week.

**For a brand-new user (cold start, no personalization):**
- Same engine, minus the per-stack relevance.
- A gentle, dismissible nudge: "Set your stack → get a radar tuned to you."
- Grouped fallback: top **Models · Tools · Companies** + a couple of evergreen **Protect** cards (which need no personalization), so the page is valuable from session one.
- Every row has one-tap **follow**, so the first session starts personalizing.

---

## 9. The card — the unit everything is built from

Every item is a card with a strict, calm structure:

```
  Cursor 1.0                       ● 4 sources     ← name + how credible
  Agent mode now edits across
  files — cut your refactor time                   ← VALUE LINE (what it does for you)
  ↳ because you build with VS Code                 ← relevance reason (only when personal)
  2d ago · 3 stories      ﹢ follow                 ← recency · proof · the investment tap
        tap the card → the dated source stories (the trust layer)
```

The contract every card honors:
- **Line 1** = *what it is + how credible* (the source count is the trust signal AI answers omit).
- **Line 2** = *why you'd care* (verb-first, ≤14 words — the "value > coverage" idea lives here).
- **One tap down** = *the proof* (dated source stories, so it never feels like ungrounded AI slop).
- **The taps** (follow / tried / want / not-for-me) are how you invest, which is how it gets more yours.

Protect cards carry the same shape, with the value line phrased as the action: *"Rotate any keys committed by the AI — here's how."*

---

## 10. How it decides what to show — the value-filtering funnel

Behind the scenes, hundreds of mostly-junk signals get filtered to a gaspable handful (5–12). Each stage strips noise:

1. **Trigger gate** — the item must be one of the 7 triggers (§3). If it's not, it's coverage, not value — drop it.
2. **Entity gate** — only real, active models/tools/companies (drop spam and the concept glossary, which lives in `/learn`).
3. **Recency** — only things mentioned in the last ~2 weeks (current, but doesn't go empty between updates).
4. **Junk removal** — must be covered by ≥2 stories and have a clean, specific name (kills one-off hallucinations and mush like "a new AI tool" or "LLM").
5. **Credibility** — ≥2 *distinct sources*, or a first-party announcement (kills single-rumor pumps). Becomes the "● N sources" chip.
6. **Novelty & velocity** — flag what's genuinely new and what's accelerating. *(See §15 — this is currently unreliable and is suppressed until we have history.)*
7. **Value-framing** — the moat: each item's blurb is rewritten into "what it does for / protects you from," and anything mushy is held back rather than shipped.
8. **Personal relevance** — boost what you follow or what fits your declared stack.
9. **Cluster, rank & cap** — collapse duplicates of the same event into one card, rank by recency + traction + credibility + novelty + personal fit, cap to a clean handful.

---

## 11. How it becomes yours — personalization

All of this runs **on your device** (no account needed yet — same local storage as your saved articles and feed prefs).

- **Onboarding (under 30s, skippable):** one screen. Tap a preset — **Builder / Founder / Researcher** — which pre-selects sensible follows, then optionally pick tools or type your stack.
- **Two kinds of signal:**
  - **Follow** = "watch this" (OpenAI, Agents, a specific tool) — a strong explicit signal.
  - **Stack** = "this is my context" (Next.js, Supabase, vLLM) — drives "for your stack," "watch out," and "used with."
- **It learns quietly too:** what you read, save, and react to nudges future rankings.
- **The calm guardrail:** personalization only *nudges* — it never floats a stale item over a fresh one, and never shows a blank screen.

The more you use it, the more it's *yours* — which makes leaving costly and returning natural.

---

## 12. Why you come back — the habit loop

Built as a habit loop (Trigger → Action → Reward → Investment), powered by **real value, not manipulation**:

- **Trigger** — a daily/weekly nudge ("3 things changed in your world") *and* the internal itch: "am I missing something / about to ship something unsafe?" The radar becomes the reflexive answer.
- **Action** — open it, value on screen in under 3 seconds. No setup wall.
- **Variable reward** — sometimes a tool that saves a week, sometimes a safety catch, sometimes a quiet day. The prize is always *useful*, never dopamine junk.
- **Investment** — every follow, stack entry, and reaction sharpens tomorrow's radar and raises switching cost. **This is the layer Inshorts and Artifact never built — why they died as "sessions, not habits."**

Non-negotiable rule: *the only actions that store data are ones that make a future result better for you.* No vanity taps.

---

## 13. What it deliberately is NOT (the calm-brand guardrails)

- **No streak anxiety, guilt, or loss-aversion.**
- **No empty or manufactured triggers** — if nothing in your world changed, you get *no* push (a calm "quiet day in AI" builds trust).
- **No slot-machine randomness** — every "surprise" traces to a real signal.
- **No fake urgency or inflated numbers.**
- **No ungrounded claims** — every item traces to dated, named sources. (Especially for Protect: a wrong security/deprecation claim hurts the exact user we serve, so it waits for solid signal.)
- **No infinite-scroll** — the reward is *closure* ("you're current and safe"), not endless engagement.

The "wow" is value density and craft, not tricks. Calm intelligence, not a casino.

---

## 14. Where the content comes from — fresh signals + evergreen know-how

The space fuses two layers we already have the bones for:

- **Fresh signals** *(Discover, Consensus, Cheaper, Deprecation)* ← the **daily news pipeline** (`news_items` + `entities`). Detecting deprecation is cheap — flag "deprecat / sunset / end-of-life / breaking change" language in incoming stories.
- **Evergreen know-how** *(Learn, the security half of Protect)* ← a **curated knowledge layer** (`/learn` partly exists). This is hand-curated or generated *once* — **not** per-user, per-day — so it avoids the per-story cost problem that the news value-lines have.

This split matters for cost: the expensive part is value-framing fresh stories; the know-how layer is a one-time investment that keeps paying off.

---

## 15. What ships first vs. later — and the gate result

**The gate (already run).** `/api/radar-gate` dumps the raw entity feed so we judge data quality before building UI. First real read (40 entities, 21-day window):
- ✅ **Names mostly sharp** (Cursor, Claude Code, GitHub Copilot CLI, Sarvam AI, Fable 5) and **enough volume**, with a healthy model/tool/company mix.
- ⚠️ **`isNew` is unreliable** — `first_seen_at` tracks when *we* first ingested, not real launch, so everything reads "new." Suppress the New badge until the DB has ~4 weeks of history.
- ⚠️ **Value-line source is wrong ~20%** — "latest *mention*" ≠ "*about* it" (the "Anthropic" card showed a Sarvam story). Fix: prefer the story with the entity in its **headline**, fall back to latest.
- ⚠️ **Junk + fragments** — generic terms ("LLM", "AI Mode") and version fragments ("Fable" vs "Fable 5") need a denylist + merge.

**Verdict: conditional pass.** The entity layer is real and rich enough to build on; the three data fixes above are **₹0 (no new AI calls)** and make it shippable.

**Version 1 (sharpest, most distinctly Kapyn): Discover + Protect.**
- The funnel + value-framed blurbs (the genuinely new piece — quality-checked first).
- **Discover** cards: New, Gaining consensus (source-count chip), Used with, For your stack.
- **Protect** cards: an evergreen security/best-practice set (no personalization needed) + deprecation flags mined from the news pipeline.
- Follow + stack + reactions, all on-device. Tap-through to dated sources.

**Later (needs data or history we don't have — and we will NOT fake it):**
- **Decide** (which-for-what comparisons) — highest-value, hardest; needs structured comparison/curation.
- **Heating up / velocity** — needs ~4 weeks of mention history.
- **Cheaper / cost-crossover alerts** — needs a pricing pipeline. Conceptually top-tier, but a wrong claim hurts our user, so it waits for real data.
- **Push notifications** — needs accounts (storage is per-device today).
- **Adoption signals** (GitHub stars, real usage) — needs new sources; "number of sources" is *coverage*, not adoption, and we won't pretend otherwise.

---

## 16. Why this matters for Kapyn (the strategic point)

The radar isn't another tab — it's the **spine**:

- It's the **retention engine** — the reason to return that isn't "there's new news today," which is what every news app dies on. "Protect" especially gives a reason to open even on quiet days.
- It's the **personalization primitive** — once Kapyn knows your follows and stack, *every* future feature gets personal: Ask Kapyn (chat scoped to your stack), model comparison, a weekly "your stack" report, shareable cards. They all plug into the radar's follow/stack data.
- It's the concrete expression of Kapyn's bet: **the trusted, no-paywall companion for people building with AI** — monetized eventually via audience and trust, never via fear or a paywall.

Build the radar well, and you've built the foundation everything else stands on.

---

## 17. The risks

1. **Value-line quality (the big one).** The radar's entire value *is* the value line. If auto-generated lines read like "a powerful new AI tool," or describe the wrong thing, no design saves it. Mitigation: the gate (§15) + the headline-match fix + holding back mushy lines rather than shipping them.
2. **Scope creep.** "Pack all the valuable things" can dilute into an everything-bucket. Mitigation: the 7-trigger gate (§3) and the actionability test (§4) — if it's not one of the seven and you can't act on it, it doesn't ship. Plus a disciplined v1 (Discover + Protect only).
3. **Protect accuracy.** A wrong security or deprecation claim damages the exact user we serve. Mitigation: ground every Protect card in dated first-party sources; when unsure, don't ship it.

**The immediate next step** is the three ₹0 data fixes from §15, then a minimal Discover + Protect UI on the cleaned data.
