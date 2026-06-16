# Kapyn Radar — Feature Brief

*The definitive "what is this" document for Kapyn's flagship feature. Written so anyone — engineer, designer, investor, or a friend — can fully understand what the radar is, what it contains, how it works, and why it matters.*

> Status: spec / pre-build. The data engine it rides (the `entities` knowledge graph) already exists and is populated daily. The radar UI is the surface that turns that engine into value.

---

## 1. In one line

**Kapyn Radar is a personalized signal layer that watches the AI landscape for you and surfaces the new tools, models, and companies that actually matter to what you're building — framed by what they let you *do*, not by what merely *happened*.**

---

## 2. The 30-second version

Every day, dozens of new AI models, tools, agents, and open-source projects appear. Most builders cope by drowning: 40 browser tabs, 6 newsletters, 60 people followed on X — and they *still* feel behind, because all of that is noise, none of it is filtered to them, and none of it knows what they're actually building.

The radar replaces all of that. You tell it what you build with (once, in 30 seconds). From then on, it shows you a short, calm, ranked list of *what's new and moving in your corner of AI* — each item phrased as "here's what this lets you do / here's why it matters for your stack," with the dated sources one tap away so you can trust it. No hype, no doomscroll, no wall of text. The promise it delivers: **"you are not missing anything important, and when something matters for your work, you'll know — and you'll know what to do about it."**

---

## 3. The problem it kills

The pain is specific and recurring: *"There's a tool or model out there that would save me days of work or cut my bill in half — and I don't know it exists. I'm shipping on yesterday's stack and I'll find out too late."*

This isn't idle curiosity. For people who build with AI, staying current is part of the job, and falling behind has **real stakes**: wasted time reinventing something that already exists, paying for expensive inference when a cheaper model would do, or watching a competitor ship faster because they knew about a tool first. The field moves *weekly*, so the anxiety never resolves — it just accumulates.

The deepest driver is **fear of being behind**, and its inverse — the calm confidence of being on top of it — is exactly what the radar sells.

---

## 4. Who it's for

**The primary user is the operator/builder who ships with AI** — the engineer, the technical founder, the product person wiring LLMs into a real product. They have something *at risk* (their product, their costs, their competitive position), which is what makes staying current matter enough to form a daily habit.

- **The builder** needs to *use* the new thing — they care about "what does this let me do, and does it fit my stack."
- **The founder/operator** needs to *talk about* it credibly — "what's moving, who's shipping, what should I have an opinion on."
- (Secondary: the curious learner who wants to feel current — served, but not the core.)

The unifying trait: they're not browsing for entertainment. They have a stake, and the radar protects it.

---

## 5. The core idea — why it's different

Three structural advantages, each one a thing the obvious alternatives *can't* do:

1. **Value over coverage.** Most AI news tells you *what happened* ("OpenAI announced X"). That's a commodity — ChatGPT can summarize it too. The radar reframes every item around *what it lets you do*: not "vLLM released v0.7" but **"vLLM now serves 70B models on a single consumer GPU — cuts your inference cost."** The event is the input; the *value* is the product.

2. **Proactive, not reactive.** ChatGPT answers questions you already know to ask. The radar surfaces **the thing you didn't know to ask about** — the new tool you'd never have searched for. That's the entire reason it has a right to exist alongside AI chat.

3. **It knows your stack.** Generic news treats everyone the same. The radar knows you build with, say, Next.js + Supabase + a RAG pipeline, and filters the firehose down to **"what changed for *your* build."** That personalization is impossible for a static newsletter and irrelevant to a general chatbot.

Put together: the radar is **proactive + current + personal** — the exact three things AI chat is structurally not (it's reactive, often stale on this week's launches, and knows nothing about you).

**Positioning line:** *"Stop doomscrolling X for AI news. Kapyn watches what's new in the tools and models you build with — and tells you what actually matters for you."*

---

## 6. What you actually see — the page

The radar is its own surface (today a tab; eventually it opens as a full "world" via swipe-right). The content is arranged most-valuable-and-most-personal first, so the 3-second glance lands on something that matters.

**For a personalized user ("My Radar"):**

- **Header + the hook line** — "3 things moved in your world today." Personal, fresh, and varies every visit. This is the payoff that earns the open.
- **A "My world / All" toggle** — your filtered radar vs. everything moving in AI.
- **For your stack** — the killer section. New things relevant to what you declared you build with, each with a *relevance reason* ("because you build with vLLM").
- **New this week** — genuinely new entities (first seen in the last 7 days). The "what dropped today" discovery hit.
- **Used with your stack** — adjacency discovery: "people using vLLM are also using Ray, Ollama, HF TGI." How you find the next tool.

**For a brand-new user (cold start, no personalization yet):**

- Same engine, minus the "for your stack" section.
- A gentle, dismissible nudge at top: "Set your stack → get a radar tuned to you."
- Grouped fallback view: top **Models · Tools · Companies** by the same ranking, with "New" items always pinned so the page never feels static.
- Every row has a one-tap **follow**, so the very first session starts personalizing.

---

## 7. The card — the unit everything is built from

Every item on the radar is a card with a strict, calm structure:

```
  vLLM 0.7                          ● 9 sources     ← name + credibility chip
  Speculative decoding — cuts your
  inference bill ~40%                                ← VALUE LINE (what it does for you)
  ↳ because you build with vLLM                      ← relevance reason (only when personal)
  2d ago · 3 stories      ✓ tried  ♡ want  ﹢ follow ← recency · proof · the investment taps
        tap the card → the dated source stories (the trust layer)
```

The contract every card honors:
- **Line 1** = *what it is + how credible* (the source count is the trust signal AI answers omit).
- **Line 2** = *why you'd care* (verb-first, ≤14 words — the whole "value > coverage" idea lives here).
- **One tap down** = *the proof* (dated source stories, so it never feels like ungrounded AI slop).
- **The taps** (follow / tried / want / not-for-me) are how you invest, which is how it gets more yours.

---

## 8. How it decides what to show — the value-filtering funnel (plain English)

Behind the scenes, hundreds of mostly-junk entities get filtered down to a gaspable handful (5–12). Each stage strips noise:

1. **Gate** — only real, active models/tools/companies (drop spam and the concept glossary, which lives in `/learn`).
2. **Recency** — only things mentioned in the last ~2 weeks (so the radar is current but doesn't go empty between updates).
3. **Junk removal** — must be covered by at least 2 stories and have a clean, specific name (kills one-off hallucinations and mushy names like "a new AI tool").
4. **Credibility** — must be covered by at least 2 *distinct sources*, or be a first-party announcement (kills single-rumor pumps). This becomes the "● N sources" chip.
5. **Novelty & velocity** — flag what's genuinely new (first seen in 7 days) and what's accelerating ("everyone's suddenly talking about X"). This keeps the page fresh and surprising.
6. **Value-framing** — the moat: each item's blurb is rewritten into "what it does for you," and anything that comes out mushy is held back rather than shipped (a thin honest stub beats generated-feeling filler).
7. **Personal relevance** — boost the things you follow or that fit your declared stack.
8. **Cluster & rank & cap** — collapse duplicates of the same event into one card, rank by a blend of recency + traction + credibility + novelty + personal fit, and cap to a clean handful.

The output is the "pure thing of value" — a short list where every item is new, credible, relevant to you, and phrased around what you can *do* with it.

---

## 9. How it becomes yours — personalization

All of this runs **on your device** (no account needed yet — it uses the same local storage as your existing saved articles and feed preferences).

- **Onboarding (under 30 seconds, skippable):** one screen. Tap a preset — **Builder / Founder / Researcher** — which pre-selects a sensible set of follows, then optionally pick from a grid of tools or type in your own stack.
- **Two kinds of signal:**
  - **Follow** = "watch this" (OpenAI, Agents, a specific tool) — a strong, explicit signal.
  - **Stack** = "this is my context" (Next.js, Supabase, vLLM) — a broader signal that drives the "for your stack" and "used with" sections.
- **It learns quietly too:** what you read, save, and react to nudges future rankings — so it earns relevance even before you tell it much.
- **The calm guardrail:** personalization only *nudges* (a relevant item rises a few slots) — it never floats a stale item over a fresh one. If you've set nothing, it gracefully falls back to a clean "what's moving in AI" view. Never a blank screen.

Crucially, the more you use it, the more it's *yours* — which is what makes leaving costly and coming back natural.

---

## 10. Why you come back — the habit loop

The radar is deliberately built as a habit loop (Trigger → Action → Reward → Investment), but powered by **real value, not manipulation**:

- **Trigger** — a daily/weekly nudge ("3 things moved in your world today") *and* the internal itch every builder has: "am I missing something?" The radar becomes the reflexive answer to that itch.
- **Action** — open it, and value is on screen in under 3 seconds. No setup wall.
- **Variable reward** — you never know what you'll find: sometimes a tool that saves you a week (a jackpot), sometimes a quiet day. That genuine variability is what makes it a habit — but the prize is always *useful*, never dopamine junk.
- **Investment** — every follow, stack entry, and reaction makes tomorrow's radar sharper and raises the cost of switching away. **This is the layer that Inshorts and Artifact never built — and why they died as "sessions, not habits."**

A non-negotiable rule keeps it honest: *the only actions that store data are ones that make a future result better for you.* A follow that doesn't change tomorrow's radar is a vanity tap, and we don't ship those.

---

## 11. What it deliberately is NOT (the calm-brand guardrails)

The radar uses habit mechanics, so the guardrails are explicit and non-negotiable, even if breaking them would boost a metric:

- **No streak anxiety, guilt, or loss-aversion** (no Duolingo guilt-owl).
- **No empty or manufactured triggers** — if nothing in your world moved, you get *no* push (and a calm "quiet day in AI" actually builds trust).
- **No slot-machine randomness** — every "surprise" traces to a real signal.
- **No fake urgency or inflated numbers.**
- **No ungrounded claims** — every item traces to dated, named source stories.
- **No infinite-scroll / dwell-maximizing** — the reward is *closure* ("you're current"), not endless engagement.

The "wow" comes from value density and craft, not from tricks. This is "calm intelligence," not a casino.

---

## 12. What ships first vs. later (honest about what we have)

**Version 1 (buildable now, on data we already own):**
- The funnel + the value-framed blurbs (the one genuinely new piece — must be built and quality-checked first).
- The cards: **New this week**, **Gaining consensus** (the source-count credibility chip), **Used with**, **For your stack**, and a **This-week recap**.
- Follow + stack + reactions, all on-device.
- Tap-through to dated source stories.

**Later (needs data or history we don't have yet — and we will NOT fake it):**
- **Heating up / Rising** (velocity) — needs ~4 weeks of mention history to be real.
- **Personalized push notifications** — needs accounts (today's storage is per-device).
- **Cost-crossover alerts** ("Model X just got 40% cheaper — switch") — needs a pricing pipeline. The highest-value idea conceptually, but a wrong claim would hurt the exact user we serve, so it waits for real data.
- **Adoption signals** (GitHub stars, real usage) — needs new data sources; "number of sources covering it" is *coverage*, not adoption, and we won't pretend otherwise.

---

## 13. Why this matters for Kapyn (the strategic point)

The radar isn't just another tab. It's the **spine** of the product:

- It's the **retention engine** — the reason to return that isn't "there's new news today," which is what every news app dies on.
- It's the **personalization primitive** — once Kapyn knows what you follow and build with, *every* future feature gets personal: Ask Kapyn (a chat scoped to your stack), model comparison ("which model for X, cheapest stack"), a weekly "your stack" report, shareable cards. They all plug into the radar's follow/stack data.
- It's the concrete expression of Kapyn's strategic bet: **the trusted, no-paywall companion for people building with AI** — monetized eventually via audience and trust, never via fear or a paywall.

Build the radar well, and you've built the foundation everything else stands on.

---

## 14. The one risk

The radar's entire value *is* the underlying entity data. If the auto-generated value-lines read like "a powerful new AI tool," or names are malformed, or there simply aren't enough credible new entities per day to fill the page — then no amount of beautiful design saves it.

So the very first step is a cheap, honest gate: build only the value-line generator + the funnel as a headless query, dump ~30 entities to a plain list, and eyeball them across a week of real data. **Sharp names, useful value-first one-liners, interesting ranking, enough volume → build everything. Mushy → fix the data first.** This one check blocks the most expensive failure mode, and it's the live open decision before any UI work begins.
